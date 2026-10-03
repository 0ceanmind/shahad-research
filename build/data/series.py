"""Numeric series used by both the report charts and the deck (single source of truth).
Writes data/series.json."""
import csv
import json
import os

HERE = os.path.dirname(__file__)

# Energy Institute Statistical Review (total oil incl. NGLs, kb/d) values quoted from the EI/bp series.
EI_KBD = {1972: 3339, 1975: 2132, 1980: 1757, 1985: 1127, 1990: 964, 1991: 185, 1992: 1077, 1995: 2130,
          2000: 2244, 2005: 2669, 2010: 2564, 2014: 3106, 2015: 3069, 2016: 3150, 2017: 3009, 2018: 3050,
          2019: 2976, 2020: 2721, 2021: 2707, 2022: 3023, 2023: 2910}
# Early output from company records (annual barrels / 365)
EARLY = {1946: 16, 1950: 344, 1955: 1096}
# Crude only (IMF series, matches OPEC direct communication), kb/d
CRUDE_KBD = {2005: 2573, 2010: 2312, 2015: 2859, 2016: 2954, 2018: 2737, 2019: 2678, 2020: 2437,
             2021: 2415, 2022: 2707, 2023: 2591, 2024: 2419}

owid = {int(r["year"]): r for r in csv.DictReader(open(os.path.join(HERE, "owid_kuwait.csv")))
        if r["country"] == "Kuwait"}


def f(r, k):
    return float(r[k]) if r.get(k) else None


twh = {y: f(r, "oil_production") for y, r in owid.items() if y >= 1965 and f(r, "oil_production")}
# kb/d per TWh ratio at anchor years, interpolated in between (EI energy data -> volume)
anchors = sorted(EI_KBD)
ratio = {y: EI_KBD[y] / twh[y] for y in anchors}


def r_at(y):
    if y <= anchors[0]:
        return ratio[anchors[0]]
    if y >= anchors[-1]:
        return ratio[anchors[-1]]
    lo = max(a for a in anchors if a <= y)
    hi = min(a for a in anchors if a >= y)
    if lo == hi:
        return ratio[lo]
    t = (y - lo) / (hi - lo)
    return ratio[lo] * (1 - t) + ratio[hi] * t


oil_kbd = {}
for y in range(1965, 2025):
    oil_kbd[y] = EI_KBD.get(y, round(twh[y] * r_at(y)))
production = {**EARLY, **oil_kbd}

gas = {y: dict(prod_twh=f(owid[y], "gas_production"), cons_twh=f(owid[y], "gas_consumption"))
       for y in range(1965, 2025)}
for y, g in gas.items():  # EI approx: 1 bcm natural gas ~ 0.036 EJ = 10.0 TWh
    g["prod_bcm"] = round(g["prod_twh"] / 10.0, 1)
    g["cons_bcm"] = round(g["cons_twh"] / 10.0, 1)
    g["import_bcm"] = round(max(0.0, g["cons_twh"] - g["prod_twh"]) / 10.0, 1)

power = {y: dict(gen_twh=f(owid[y], "electricity_generation"), oil_share=f(owid[y], "oil_share_elec"),
                 gas_share=f(owid[y], "gas_share_elec")) for y in (2000, 2010, 2024)}

out = dict(production_kbd=production, production_estimated=[y for y in oil_kbd if y not in EI_KBD],
           crude_kbd=CRUDE_KBD, gas=gas, power=power)
json.dump(out, open(os.path.join(HERE, "series.json"), "w"), indent=1)
if __name__ == "__main__":
    print({y: production[y] for y in (1946, 1950, 1955, 1965, 1970, 1972, 1979, 1982, 1989, 1990, 1991, 1993, 2024)})
    print({y: (gas[y]["prod_bcm"], gas[y]["cons_bcm"], gas[y]["import_bcm"]) for y in (2008, 2009, 2015, 2020, 2024)})
    print(power)
