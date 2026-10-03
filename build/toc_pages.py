"""Second pass for the report: find the page of every heading/figure/table in the rendered PDF."""
import json, re, subprocess, sys

pdf, index, out = sys.argv[1:4]
idx = json.load(open(index))
n = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
norm = lambda s: re.sub(r"\s+", " ", s.replace("–", "-").replace("—", "-").replace("’", "'")).strip().lower()
pages = [norm(subprocess.run(["pdftotext", "-f", str(i), "-l", str(i), "-layout", pdf, "-"], capture_output=True, text=True).stdout)
         for i in range(1, n + 1)]

def last_page(text):
    key = norm(text)[:60]
    hits = [i for i, p in enumerate(pages) if key in p]
    return hits[-1] if hits else None

body0 = last_page("1. Introduction")
def label(i):
    if i is None: return ""
    if i >= body0: return str(i - body0 + 1)
    roman = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"]
    return roman[i - 1] if i >= 1 else ""

res, missing = {}, []
for t in idx["toc"]:
    p = last_page(t); res[t] = label(p); missing += [t] if p is None else []
for full, title in zip(idx["figs"], idx["figTitles"]):
    p = last_page(title); res[full] = label(p); missing += [full] if p is None else []
for full, title in zip(idx["tabs"], idx["tabTitles"]):
    p = last_page(title); res[full] = label(p); missing += [full] if p is None else []
json.dump(res, open(out, "w"), indent=1)
print("body starts at pdf page", body0 + 1, "| missing:", missing)
