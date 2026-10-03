// EGCH2230 research report: Kuwait's oil and gas industry. Run: node build_doc.js [pages.json]
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, Header, Footer, PageNumber, NumberFormat,
  LevelFormat, PageBreak, BorderStyle,
} = require("docx");
const L = require("./doc_lib");
const { P, H1, H2, bullets, figure, table, note, tocLines, TOC, FIGS, TABS, CW, COL } = L;

const FIG = (f) => path.join(__dirname, "assets", "doc", f);
const PAGES = process.argv[2] && fs.existsSync(process.argv[2]) ? JSON.parse(fs.readFileSync(process.argv[2])) : {};
const C = AlignmentType.CENTER, R = AlignmentType.RIGHT;

async function bodyContent() {
  const b = [];
  const add = (...x) => x.flat().forEach((y) => b.push(y));

  // ------------------------------------------------------------------ 1
  add(H1("1. Introduction"));
  add(P("The State of Kuwait is a small country of 17,818 km² at the north-western head of the Arabian Gulf, bordered by Iraq to the north and west and by Saudi Arabia to the south (Central Intelligence Agency [CIA], 2025). Since crude oil was first exported in 1946, petroleum has transformed it from a pearling and trading port into one of the world's leading oil exporters. Fuels still make up more than 90% of Kuwait's merchandise exports (World Bank, 2026), and petroleum provides most of the state's revenue (Encyclopaedia Britannica, n.d.-b)."));
  add(P("For a course on petroleum and petrochemical processing, Kuwait is a useful case study. It contains one of the largest conventional oil fields in the world, produces mainly medium, sour crude that must be hydrotreated, has to import liquefied natural gas (LNG) despite large hydrocarbon reserves, and has recently commissioned one of the largest refineries in the Middle East. This report addresses five tasks:"));
  add(bullets([
    "describe the history of Kuwait's oil and gas industry and the types of crude oil and natural gas it produces (Section 2);",
    "compile data on the country's oil and gas resources and industrial growth (Section 3);",
    "identify the locations of its oil and gas reservoirs (Section 4);",
    "analyse the distribution of its export markets and the cost and price of its oil and gas (Section 5); and",
    "list the references used (References).",
  ]));
  add(P("**Method and data.** The report is a desk study. Priority was given to primary and official sources: Kuwait Oil Company (KOC), Kuwait Petroleum Corporation (KPC), Kuwait National Petroleum Company (KNPC) and Kuwait Integrated Petroleum Industries Company (KIPIC) publications; international statistical datasets, mainly the Energy Institute *Statistical Review of World Energy 2025* (Energy Institute, 2025), the Joint Organisations Data Initiative oil database (JODI, 2026), U.S. Energy Information Administration (EIA) price data and the World Bank's *World Development Indicators*; publications of the Organization of the Petroleum Exporting Countries (OPEC); and peer-reviewed geological literature. Figures were cross-checked where possible; when reputable sources disagree, both values are reported. Data for 2026 are preliminary. Appendix A explains how each type of figure was obtained and which values are estimates."));
  add(P("**Units.** b/d = barrels per day; kb/d = thousand b/d; mb/d = million b/d; bcm = billion cubic metres; Tcf = trillion cubic feet; Mt = million tonnes; MMBtu = million British thermal units; °API = API gravity."));

  // ------------------------------------------------------------------ 2
  add(H1("2. History and Types of Kuwait's Oil and Gas"));
  add(H2("2.1 Early exploration and the 1934 concession"));
  add(P("Before oil, Kuwait's economy depended on pearling, boat-building and sea trade (Encyclopaedia Britannica, n.d.-a). Oil seepages at Bahra and Burgan were examined by geologists in 1914 and 1917, and the New Zealand-born Major Frank Holmes played a central role in securing interest in exploration (Kuwait Oil Company, n.d.-c). In 1933 the Anglo-Persian Oil Company (later BP) and the U.S. Gulf Oil Corporation stopped competing for a concession and formed a 50/50 joint venture, the Kuwait Oil Company (Kuwait Oil Company, n.d.-a). On 23 December 1934 the Ruler, Sheikh Ahmad Al-Jaber Al-Sabah, signed Kuwait's first oil concession with KOC (Kuwait Petroleum Corporation, n.d.-b). It ran for 75 years and covered the whole territory except the Neutral Zone shared with Saudi Arabia (Encyclopaedia Britannica, n.d.-b)."));
  add(P("KOC's first exploration well, drilled at Bahra in 1936, found only minor oil shows (GeoExpro, n.d.; Kuwait Oil Company, n.d.-a). The company then moved to Burgan, where gravity, magnetic and seismic surveys had outlined a large structure, and spudded Burgan No. 1 on 16 October 1936 (GeoExpro, n.d.)."));
  add(H2("2.2 The Burgan discovery and the first exports (1938–1959)"));
  add(P("Burgan No. 1 struck high-pressure oil on 23 February 1938 at about 1,120 m in the Middle Cretaceous Wara sandstone. Some sources give 22 February; the depth (3,672 ft) is the same in both accounts (GeoExpro, n.d.; Kuwait Petroleum Corporation, n.d.-b). The 32° API oil flowed at more than 4,000 b/d and the well was completed on 14 May 1938 (GeoExpro, n.d.). Eight more wells drilled between 1938 and 1942 were all productive, but operations were suspended during the Second World War (GeoExpro, n.d.)."));
  add(P("Commercial production began after the war. On 30 June 1946 Sheikh Ahmad turned a silver wheel to start Kuwait's first crude export (Kuwait Petroleum Corporation, n.d.-b); secondary accounts name the tanker as the *British Fusilier* (GeoExpro, n.d.). Output grew very quickly, from about 5.9 million barrels in 1946 to 125.7 million barrels (≈344 kb/d) in 1950 (Kuwait Petroleum Corporation, n.d.-b). In 1951 the concession was revised to give Kuwait 50% of profits, applying the \"fifty-fifty\" principle that had first been used in Venezuela (U.S. Department of State, n.d.)."));
  add(P("New fields followed: Magwa (1950–1951), Ahmadi (1952), Raudhatain (1955), Sabriya (1956–1957) and Minagish (1959). Some company histories give 1955 for Minagish, but the first commercial well, MN-1, was completed in May 1959 (Naqi et al., 2023). In the Neutral Zone, Kuwait granted its undivided half-interest onshore to the American Independent Oil Company (Aminoil) on 28 June 1948, and Saudi Arabia granted its half to Pacific Western (later Getty Oil) in 1949. The two concessionaires discovered the Wafra field in 1953 (Horn, 2014; *Government of the State of Kuwait v. American Independent Oil Company*, 1982). Offshore rights were awarded to the Japanese Arabian Oil Company, which discovered the giant Khafji field in 1959–1960 (Horn, 2014). Kuwait also founded its own tanker company, the Kuwait Oil Tanker Company (KOTC), in April 1957 (Kuwait Oil Tanker Company, n.d.)."));
  add(H2("2.3 OPEC, independence and nationalisation (1960–1980)"));
  add(P("In September 1960 Kuwait joined Iran, Iraq, Saudi Arabia and Venezuela in founding OPEC in Baghdad (Encyclopedia.com, n.d.). The same year it created the Kuwait National Petroleum Company to manage refining, gas processing and local distribution (Kuwait National Petroleum Company, n.d.-a). Kuwait became independent on 19 June 1961 (Encyclopaedia Britannica, n.d.-a). The Petrochemical Industries Company (PIC), the region's first petrochemical and fertiliser producer, was founded in 1963 (Petrochemical Industries Company, n.d.), and the state-owned Shuaiba refinery was inaugurated in 1968 (Kuwait National Petroleum Company, n.d.-a). Oil production reached its all-time peak of 3.34 mb/d in 1972 (Energy Institute, 2025)."));
  add(P("Nationalisation came in two steps. Under a participation agreement of 29 January 1974, ratified by Law No. 9 of 1974, the state acquired 60% of KOC. In December 1975 it agreed to buy the remaining 40% from BP and Gulf, approved by Law No. 10 of 1976, so that KOC became wholly state-owned (Kuwait Petroleum Corporation, n.d.-c; Encyclopaedia Britannica, n.d.-c). Aminoil's Neutral Zone concession was ended by Decree-Law No. 124 of 19 September 1977; an international tribunal later awarded the company about US$180 million in compensation (*Government of the State of Kuwait v. American Independent Oil Company*, 1982). In January 1980 the government created the Kuwait Petroleum Corporation as the holding company for KOC, KNPC, KOTC, PIC and the other national oil companies (Kuwait Petroleum Corporation, n.d.-c). During the early 1980s KPC added international arms for exploration abroad and for refining and marketing in Europe under the Q8 brand (Encyclopedia.com, n.d.)."));
  add(H2("2.4 The 1990–1991 invasion and the oil-well fires"));
  add(P("Iraq invaded Kuwait on 2 August 1990. Between August 1990 and February 1991 about 80% of KOC's producing wells, installations and facilities were destroyed (Kuwait Oil Company, n.d.-b). When Iraqi forces withdrew in February 1991 they set more than 700 wells on fire; the U.S. Department of Defense counted over 750 of Kuwait's 943 wells as ignited or damaged, with the number of fires peaking on 22–24 February 1991 (Kuwait Oil Company, n.d.-b; Office of the Special Assistant for Gulf War Illnesses, 1998). At the peak an estimated 4–6 million barrels of oil and 70–100 million m³ of gas were burning every day, and more than one billion barrels of crude were lost; spilled oil formed more than 100 oil lakes over about 19 km² of desert (Office of the Special Assistant for Gulf War Illnesses, 1998, 2000)."));
  add(P("Twenty-seven international firefighting teams took part, together with Kuwait's own Kuwait Wild Well Killers team, formed on 9 September 1991, which capped 41 wells in 54 days. The last burning well, Burgan 118, was capped on 6 November 1991 (Kuwait Oil Company, n.d.-b). Production, which had fallen to only 185 kb/d in 1991, recovered to pre-invasion levels within about four years (Energy Institute, 2025; U.S. Energy Information Administration [EIA], 2011b)."));
  add(H2("2.5 The modern industry (1992–2026)"));
  add(P("After reconstruction, output climbed back above 3 mb/d in the 2010s (Energy Institute, 2025). Production from the Partitioned (formerly Neutral) Zone was shut in during 2014–2015 because of an operating dispute and resumed in early 2020 after a Saudi–Kuwaiti agreement at the end of 2019 (EIA, 2023a). Because gas demand grew faster than supply, Kuwait received its first LNG cargo in August 2009 at a floating regasification terminal at Mina Al-Ahmadi (EIA, 2011a). In January 2018 Kuwait began producing light oil and sour gas from the deep Jurassic reservoirs of North Kuwait (S&P Global Commodity Insights, 2018a), and in July 2018 it exported its first cargo of the new Kuwait Super Light Crude (Kuwait News Agency [KUNA], 2018)."));
  add(P("The largest recent change is in refining. KNPC's Clean Fuels Project upgraded the Mina Al-Ahmadi and Mina Abdullah refineries, and KIPIC built the 615,000 b/d Al-Zour refinery, whose three crude units started between November 2022 and July 2023 (EIA, 2023b; S&P Global Commodity Insights, 2024). Al-Zour first ran at full capacity on 4 February 2024 and its full operation was formally inaugurated on 29 May 2024 (S&P Global Commodity Insights, 2024; Kuwait Integrated Petroleum Industries Company, 2024). Offshore exploration has also produced new discoveries: Al-Nokhatha (announced July 2024, about 3.2 billion barrels of oil equivalent), Al-Jlaiaa (January 2025) and the Al-Jazah gas-condensate field (October 2025) (KUNA, 2024; Offshore Engineer, 2025; World Oil, 2025). Table 1 summarises the main milestones."));
  add(table("Timeline of Key Milestones in Kuwait's Oil and Gas Industry", ["Year", "Milestone", "Source"], [
    ["1934", "23 Dec: first oil concession signed with Kuwait Oil Company (APOC/BP and Gulf Oil, 50/50)", "KPC (n.d.-b)"],
    ["1938", "23 Feb: oil discovered at Burgan No. 1 in the Wara sandstone (≈1,120 m)", "GeoExpro (n.d.)"],
    ["1946", "30 Jun: first crude oil export", "KPC (n.d.-b)"],
    ["1951", "50/50 profit-sharing revision of the KOC concession", "U.S. Dept. of State (n.d.)"],
    ["1953", "Wafra field discovered in the Neutral Zone", "Horn (2014)"],
    ["1957", "Kuwait Oil Tanker Company founded", "KOTC (n.d.)"],
    ["1960", "Kuwait co-founds OPEC; KNPC established; Khafji discovered offshore", "Encyclopedia.com (n.d.); KNPC (n.d.-a)"],
    ["1961", "19 Jun: independence", "Britannica (n.d.-a)"],
    ["1963", "Petrochemical Industries Company founded", "PIC (n.d.)"],
    ["1972", "All-time production peak, 3.34 mb/d", "Energy Institute (2025)"],
    ["1974–75", "State takes 60%, then 100%, of KOC", "KPC (n.d.-c)"],
    ["1980", "Kuwait Petroleum Corporation formed", "KPC (n.d.-c)"],
    ["1990–91", "Iraqi invasion; more than 700 wells set on fire; last fire capped 6 Nov 1991", "KOC (n.d.-b)"],
    ["2009", "First LNG imports (Mina Al-Ahmadi)", "EIA (2011a)"],
    ["2018", "Jurassic light oil and gas production; first Kuwait Super Light export", "S&P Global (2018a); KUNA (2018)"],
    ["2020", "Partitioned Zone production restarts", "EIA (2023a)"],
    ["2024", "Al-Zour refinery at full 615 kb/d; Al-Nokhatha offshore discovery", "S&P Global (2024); KUNA (2024)"],
    ["2026", "Strait of Hormuz disruption; KPC declares force majeure (7 Mar)", "CNBC (2026)"],
  ], [1.0, 5.6, 2.4], "Compiled by the author from the sources shown."));

  add(H2("2.6 Types of crude oil"));
  add(P("Crude oils are classified mainly by density, expressed as API gravity (°API = 141.5/SG − 131.5, where SG is specific gravity at 60 °F), and by sulfur content. By the usual convention, oils above about 31.1° API are light, 22.3–31.1° API medium and below 22.3° API heavy; crudes with less than about 0.5 wt% sulfur are called sweet and those above it sour. Kuwait produces several distinct grades (Table 2, Figure 1)."));
  add(P("**Kuwait Export Crude (KEC)** is the main export blend. It is a medium, sour crude of about 30.5° API and 2.5% sulfur, produced mostly from the Cretaceous reservoirs of Greater Burgan (Mehdi, 2021; EIA, 2023a). It is one of the crudes in the OPEC Reference Basket (OPEC, 2025a). **Kuwait Super Light Crude (KSLC)** has been exported since 2018 from the deep Jurassic fields of North Kuwait; at about 48° API and only about 0.4% sulfur it is a very light, nearly sweet grade (Energy Intelligence, n.d.; S&P Global Commodity Insights, 2018b). **Kuwait Export Heavy** is a heavy, very sour grade of about 16° API and 4.9% sulfur (Energy Intelligence, n.d.). Heavy oil of roughly 11–17° API is also produced with steam from the shallow Lower Fars sands at Ratqa in North Kuwait (Middle East Economic Survey [MEES], 2025a). **Khafji** crude from the offshore Partitioned Zone is a medium-sour oil of about 28.5° API and 2.85% sulfur (S&P Global Commodity Insights, 2020)."));
  add(table("Main Kuwaiti Crude Oil Grades", ["Grade", "API gravity (°)", "Sulfur (wt%)", "Class", "Origin"], [
    ["Kuwait Export Crude (KEC)", "30.5", "2.5", "Medium, sour", "Cretaceous reservoirs, mainly Greater Burgan"],
    ["Kuwait Super Light (KSLC)", "48", "0.38", "Light, nearly sweet", "Jurassic reservoirs, North Kuwait"],
    ["Kuwait Export Heavy", "16", "4.93", "Heavy, very sour", "Heavy-oil blend"],
    ["Lower Fars heavy oil", "≈11–17", "n/a", "Heavy", "Miocene Lower Fars sands, Ratqa"],
    ["Khafji", "28.5", "2.85", "Medium, sour", "Partitioned Zone, offshore"],
    ["KEC atmospheric residue", "12.9", "4.6", "Heavy residue", "Refinery feed for residue desulfurisation"],
  ], [2.6, 1.2, 1.1, 1.6, 3.0], "Values from Mehdi (2021), Energy Intelligence (n.d.), S&P Global Commodity Insights (2018b, 2020) and MEES (2025a). The KEC residue values are from a hydrodesulfurisation study (“Change in the Apparent Order,” 2020). Assays vary slightly between sources and over time.", { align: [null, C, C, null, null] }));
  add(await figure(FIG("fig_api.png"), "Kuwaiti Crude Grades on the API Gravity Scale", "Prepared by the author from the values in Table 2. Classification boundaries at 22.3° and 31.1° API."));
  add(P("These properties matter for processing. Because KEC and the heavier grades are sour, Kuwaiti refineries need large hydrotreating and residue-upgrading capacity. The KEC atmospheric residue has an API gravity of 12.9° and 4.6% sulfur (“Change in the Apparent Order,” 2020), and the Al-Zour refinery includes six atmospheric residue desulfurisation (ARDS) units (S&P Global Commodity Insights, 2024). Light, low-sulfur KSLC, in contrast, yields more naphtha and middle distillates and needs much less desulfurisation."));
  add(H2("2.7 Types of natural gas"));
  add(P("Kuwait's natural gas falls into three groups. The first and largest is **associated gas**, which is released from crude oil when it is produced; about 70% of Kuwait's gas production in 2021 was associated gas, so gas output rises and falls with oil output and OPEC+ quotas (EIA, 2023a). The second is **non-associated gas** from the deep Jurassic reservoirs of North Kuwait. This gas is deep, high-pressure and sour (rich in hydrogen sulfide), and it is produced together with light oil and condensate at the Jurassic Production Facilities (S&P Global Commodity Insights, 2018a). The third is **imported LNG**, which Kuwait has bought since 2009 (EIA, 2011a). Kuwait also shares the offshore **Dorra (Al-Durra)** gas field with Saudi Arabia, estimated to contain 10–11 Tcf of gas and about 300 million barrels of oil; Iran, which calls the field Arash, claims part of it, and development has not yet started (Reuters, 2020)."));
  add(P("Kuwait's proven gas reserves are about 63 Tcf (1.78 trillion m³), less than 1% of the world total (EIA, 2023a; OPEC, 2025b). Associated gas is also the source of Kuwait's liquefied petroleum gas (LPG): Kuwait exported about 190 kb/d of LPG in 2024 (JODI, 2026)."));

  // ------------------------------------------------------------------ 3
  add(H1("3. Oil and Gas Resources and Industrial Growth"));
  add(H2("3.1 Proven reserves"));
  add(P("OPEC's 2025 and 2026 statistical bulletins both put Kuwait's proven crude oil reserves at 101.5 billion barrels at the end of 2024 and 2025 (OPEC, 2025b, 2026a). Against world reserves of 1,567–1,572 billion barrels, this is about 6.5% of the world total; the EIA ranks Kuwait seventh in the world and fifth in the Middle East (EIA, 2023a). The figure includes Kuwait's half of the reserves of the Partitioned Zone. Official reserves rose sharply between 1980 and 1990 and have remained at 101.5 billion barrels since about 2010, meaning that reported additions have exactly replaced the roughly one billion barrels produced each year (Table 3). In 2020, bp calculated a reserves-to-production (R/P) ratio of 103 years (bp, 2021)."));
  add(table("Kuwait's Proven Crude Oil Reserves, 1980–2025", ["End of year", "Reserves (billion bbl)", "Source"], [
    ["1980", "67.9", "bp (2021)"], ["1990", "97.0", "bp (2021)"], ["2000", "96.5", "bp (2021)"],
    ["2010", "101.5", "bp (2021)"], ["2020", "101.5", "bp (2021)"], ["2024", "101.5", "OPEC (2025b)"], ["2025", "101.5", "OPEC (2026a)"],
  ], [2, 2.5, 4.5], "Includes half of the Saudi–Kuwaiti Partitioned Zone.", { align: [C, C, null] }));
  add(H2("3.2 Crude oil production"));
  add(P("Figure 2 shows eight decades of production. Output rose rapidly from 16 kb/d in 1946 to an all-time peak of 3.34 mb/d in 1972. It then fell after nationalisation, a conservation policy and the collapse of oil prices in the 1980s, reaching about 1.1 mb/d in 1985. The 1990–1991 invasion reduced output to only 185 kb/d in 1991. After reconstruction, production returned to 2.1 mb/d by 1995 and reached 3.15 mb/d (including natural gas liquids) in 2016 (Energy Institute, 2025). Since 2017 Kuwait's output has been governed by OPEC+ agreements: crude oil production alone averaged 2.41 mb/d in 2024 (JODI, 2026), and Kuwait's OPEC+ required production for September and October 2026 was 2,676 kb/d (OPEC, 2026b). The oil minister put Kuwait's production capacity at 3.2 mb/d in September 2025 (MEES, 2025b)."));
  add(await figure(FIG("fig_production.png"), "Kuwait's Oil Production, 1946–2024", "Total oil including natural gas liquids, Energy Institute (2025). Values for years not quoted directly by the Energy Institute were derived from its energy-content data; 1946–1955 values are from company records (KPC, n.d.-b). 2024 is an estimate (≈2.73 mb/d)."));
  add(table("Selected Production Statistics", ["Year", "Total oil (kb/d)", "Note"], [
    ["1946", "16", "First exports (company records)"], ["1950", "344", "Company records"], ["1972", "3,339", "All-time peak"],
    ["1980", "1,757", "After nationalisation"], ["1985", "1,127", "1980s price collapse"], ["1991", "185", "Invasion and well fires"],
    ["1995", "2,130", "Post-war recovery"], ["2016", "3,150", "Post-war high"], ["2020", "2,721", "COVID-19, OPEC+ cuts"],
    ["2023", "2,910", ""], ["2024", "≈2,730", "Estimate; crude only = 2,411 kb/d (JODI)"],
  ], [1.4, 2.0, 5.6], "Energy Institute (2025) unless stated.", { align: [C, C, null] }));
  add(H2("3.3 Natural gas production, consumption and LNG imports"));
  add(P("Until 2008 Kuwait consumed exactly the gas it produced. Demand for power generation and water desalination then outgrew supply, and since 2009 the gap has been filled with LNG imports (Figure 3). In 2024 Kuwait produced 14.9 bcm of gas, consumed 24.6 bcm and imported 9.7 bcm of LNG, so about 40% of the gas it used was imported (Energy Institute, 2025). Imported gas has allowed Kuwait to burn less crude and fuel oil in its power stations: the share of natural gas in electricity generation rose from 33% in 2000 to 62% in 2024, while the share of oil fell from 67% to 36% (Our World in Data, 2025)."));
  add(await figure(FIG("fig_gas.png"), "Natural Gas Supply in Kuwait, 2000–2024", "Energy Institute (2025) via Our World in Data (2025); converted at 10 TWh ≈ 1 bcm. Net imports equal consumption minus production; Kuwait does not export gas."));
  add(H2("3.4 Refining"));
  add(P("Kuwait's first refinery was built at Mina Al-Ahmadi in 1949; Aminoil built the Mina Abdullah refinery in 1958, which KNPC took over in 1978, and the state-built Shuaiba refinery opened in 1968 (Kuwait National Petroleum Company, n.d.-a; Kuwait Petroleum Corporation, n.d.-b). Shuaiba has since been retired (see Appendix A), and KNPC's Clean Fuels Project rebuilt Mina Al-Ahmadi and Mina Abdullah into an integrated complex producing cleaner, low-sulfur fuels. Together with the new Al-Zour refinery, the EIA reports that Kuwait's refining capacity rose from about 0.6 mb/d in January 2021 to about 1.4 mb/d in July 2023 (EIA, 2023b). Table 5 lists the operating refineries."));
  add(table("Kuwait's Operating Crude Oil Refineries", ["Refinery", "Operator", "Start-up", "Crude capacity (kb/d)", "Notes"], [
    ["Mina Al-Ahmadi", "KNPC", "1949", "346", "Upgraded under the Clean Fuels Project"],
    ["Mina Abdullah", "KNPC", "1958", "454", "Built by Aminoil; Clean Fuels Project"],
    ["Al-Zour", "KIPIC", "2022–2023", "615", "3 crude units of ≈205 kb/d; 6 ARDS units; full capacity Feb 2024"],
    ["Total", "", "", "≈1,415", "EIA: ≈1.4 mb/d (2023); Energy Institute: 1,430 kb/d (2024)"],
  ], [1.7, 1.0, 1.1, 1.5, 3.7], "Kuwait National Petroleum Company (n.d.-b, n.d.-c); Kuwait Integrated Petroleum Industries Company (n.d.); S&P Global Commodity Insights (2024); EIA (2023b); Energy Institute (2025).", { align: [null, null, C, C, null] }));
  add(P("Kuwait also refines abroad through Kuwait Petroleum International, which markets fuel under the Q8 brand in Europe. Of particular interest to Omani readers, KPI is the partner of OQ in the 230,000 b/d Duqm refinery in Oman, which was designed to run mainly on Kuwaiti crude (see Appendix A)."));
  add(H2("3.5 Petrochemicals"));
  add(P("Petrochemicals are Kuwait's main route for adding value to its gas and naphtha. The Petrochemical Industries Company, founded by Amiri decree in 1963, was the first chemical company in the Gulf region and initially produced ammonia and urea fertiliser (Petrochemical Industries Company, n.d.). Today PIC's main business is through joint ventures, especially the EQUATE group with The Dow Chemical Company, which produces ethylene-based products such as polyethylene and ethylene glycol at the Shuaiba industrial area south of Kuwait City (Petrochemical Industries Company, n.d.). Because most of Kuwait's ethane comes from associated gas, the gas shortage described in Section 3.3 also limits the growth of the petrochemical industry."));
  add(H2("3.6 Industrial structure"));
  add(P("Since 1980 the whole value chain has been owned by the state through KPC. The structure resembles that of an integrated international oil company: upstream exploration and production, shipping, refining, petrochemicals and international marketing are carried out by separate subsidiaries under one holding company (Table 6; Kuwait Petroleum Corporation, n.d.-c)."));
  add(table("Main Subsidiaries of Kuwait Petroleum Corporation", ["Company", "Founded", "Role"], [
    ["Kuwait Oil Company (KOC)", "1934", "Exploration and production in Kuwait, onshore and offshore"],
    ["Kuwait Gulf Oil Company (KGOC)", "—", "Kuwait's share of Partitioned Zone operations (Wafra and Khafji joint operations with Saudi partners)"],
    ["Kuwait Foreign Petroleum Exploration Company (KUFPEC)", "—", "Upstream investments outside Kuwait"],
    ["Kuwait Oil Tanker Company (KOTC)", "1957", "Shipping of crude oil, products and LPG"],
    ["Kuwait National Petroleum Company (KNPC)", "1960", "Mina Al-Ahmadi and Mina Abdullah refineries, gas processing, local fuel marketing"],
    ["Kuwait Integrated Petroleum Industries Company (KIPIC)", "—", "Al-Zour refinery and LNG import facilities"],
    ["Petrochemical Industries Company (PIC)", "1963", "Petrochemicals and fertilisers; joint ventures including EQUATE"],
    ["Kuwait Petroleum International (KPI)", "—", "International refining and marketing (Q8)"],
  ], [3.6, 1.0, 4.4], "Kuwait Petroleum Corporation (n.d.-c); Kuwait Oil Company (n.d.-a); Kuwait Oil Tanker Company (n.d.); Kuwait National Petroleum Company (n.d.-a); Petrochemical Industries Company (n.d.). Founding years are shown only where confirmed by the company.", { align: [null, C, null] }));
  add(H2("3.7 Economic importance"));
  add(P("Oil dominates the economy (Table 7). World Bank data show that fuels accounted for between 90.7% and 96.0% of Kuwait's merchandise exports every year from 2015 to 2024, and that natural-resource rents were equal to between 29% and 54% of GDP during 2014–2020 (World Bank, 2026). The value of fuel exports therefore follows the oil price closely: it fell to about US$37 billion in 2020 and rose to about US$96 billion in 2022."));
  add(table("Kuwait's Merchandise and Fuel Exports, 2015–2024", ["Year", "Merchandise exports (US$ bn)", "Fuels (% of merchandise)", "Implied fuel exports (US$ bn)"], [
    ["2015", "54.1", "92.5", "50.1"], ["2016", "46.3", "92.7", "42.9"], ["2017", "55.0", "93.6", "51.5"], ["2018", "71.9", "90.9", "65.4"],
    ["2019", "64.5", "94.4", "60.9"], ["2020", "40.1", "92.9", "37.3"], ["2021", "63.1", "94.6", "59.7"], ["2022", "100.0", "96.0", "96.0"],
    ["2023", "84.0", "95.5", "80.2"], ["2024", "75.2", "90.7", "68.2"],
  ], [1.2, 2.6, 2.6, 2.6], "World Bank (2026). Implied fuel exports = merchandise exports × fuel share (author's calculation).", { align: [C, C, C, C] }));
  add(H2("3.8 Strategy and outlook"));
  add(P("KPC's long-term strategy aims to raise crude production capacity to 4 mb/d by 2035 and sustain it to 2040, with total investment of about US$410 billion (Journal of Petroleum Technology [JPT], n.d.). The plan relies on enhanced recovery in mature fields such as Burgan, the development of heavy oil (Ratqa produced more than 90 kb/d by late 2024; MEES, 2025a), the deep Jurassic oil and gas of North Kuwait, and the new offshore discoveries. Expanding non-associated gas output is a priority because it would reduce the need for imported LNG."));

  // ------------------------------------------------------------------ 4
  add(H1("4. Locations of Oil and Gas Reservoirs"));
  add(H2("4.1 Geological setting"));
  add(P("Kuwait lies on the stable Arabian Platform at the edge of the Mesopotamian foreland basin, which extends from the Arabian Shield in the west to the Zagros fold belt in the east (Youash, 1989). During the Cretaceous the area formed a large anticlinal high (Youash, 1989), and most of Kuwait's fields are gentle anticlines or domes on broad regional structural highs (Naqi et al., 2023). Most production comes from Cretaceous sandstones and carbonates; deeper Jurassic carbonates hold light oil and sour gas, and shallow Miocene sands hold heavy oil (Naqi et al., 2023)."));
  add(H2("4.2 Producing areas and fields"));
  add(P("KOC manages its fields in three asset areas, and the Partitioned Zone and offshore areas form a fourth group (Figure 4, Table 8)."));
  add(bullets([
    "**South and East Kuwait** is dominated by **Greater Burgan** (Burgan, Magwa and Ahmadi), which covers roughly 800 km² south of Kuwait City on the KOC field map (Kuwait Petroleum Corporation, n.d.-a). It is the world's second-largest oil field after Ghawar in Saudi Arabia (Youash, 1989). In 1990 it supplied about two-thirds of KOC's output, and in 2013 it still produced about half of Kuwait's oil (Office of the Special Assistant for Gulf War Illnesses, 2000; EIA, 2013).",
    "**North Kuwait** contains the supergiant **Raudhatain** and **Sabriya** fields, together with Bahra, Abdali and Umm Niqa. The deep Jurassic gas and light-oil play is developed here, and heavy oil is produced from the shallow Lower Fars reservoir at **Ratqa** near the Iraqi border (Naqi et al., 2023; MEES, 2025a).",
    "**West Kuwait** includes **Minagish** and **Umm Gudair**, which produce 22–26° API oil from the Minagish Oolite, and the smaller Abduliyah, Dharif and Kra Al-Maru fields (EIA, 2013; Naqi et al., 2023).",
    "**The Partitioned Zone and offshore.** The 5,770 km² zone between Kuwait and Saudi Arabia is shared 50:50 (Reuters, 2019). Its onshore Wafra field is operated with Saudi Arabian Chevron and its offshore Khafji and Hout fields with Aramco Gulf Operations; the Dorra gas field lies offshore. KOC's new offshore discoveries, including Al-Nokhatha east of Failaka Island and Al-Jlaiaa, lie in Kuwaiti waters (KUNA, 2024; Offshore Engineer, 2025).",
  ]));
  add(await figure(FIG("fig_map.png"), "Location of Kuwait's Main Oil and Gas Fields and Facilities", "Prepared by the author. Field positions are approximate centres taken from the KOC Exploration Group field map (Kuwait Petroleum Corporation, n.d.-a) and the giant-field database of Horn (2014); positions of the 2024–2025 offshore discoveries are approximate. Borders: Natural Earth (n.d.).", 5.8));
  add(table("Major Oil and Gas Fields of Kuwait", ["Field", "Area", "Lat (°N)", "Lon (°E)", "Discovered", "Main reservoirs / fluid"], [
    ["Greater Burgan", "South & East", "29.02", "47.96", "1938", "Burgan and Wara sandstones; medium oil"],
    ["Raudhatain", "North", "29.89", "47.75", "1955", "Ratawi, Zubair, Burgan, Mauddud; Jurassic gas below"],
    ["Sabriya", "North", "29.82", "47.87", "1956–57", "Mauddud, Burgan; deep Marrat gas"],
    ["Bahra", "North", "29.64", "47.94", "1956", "Mauddud, Zubair"],
    ["Ratqa", "North", "29.88", "47.43", "1977–80", "Lower Fars sands; heavy oil (steam)"],
    ["Abdali", "North", "30.04", "47.80", "1990", "Oil"],
    ["Minagish", "West", "29.02", "47.53", "1959", "Minagish Oolite; 22–26° API oil"],
    ["Umm Gudair", "West", "28.87", "47.69", "1962", "Minagish Oolite, Ratawi"],
    ["Kra Al-Maru", "West", "29.38", "47.32", "1995", "Ratawi; Jurassic light oil"],
    ["Wafra", "Partitioned Zone", "28.59", "47.89", "1953", "Eocene and Cretaceous; oil"],
    ["Khafji", "Partitioned Zone (offshore)", "28.53", "48.92", "1959–60", "Cretaceous; medium-sour oil"],
    ["Hout", "Partitioned Zone (offshore)", "28.83", "48.92", "1963", "Oil"],
    ["Dorra", "Offshore (shared)", "28.95", "49.12", "1967", "Non-associated gas and oil"],
    ["Al-Nokhatha", "Offshore Kuwait", "≈29.42", "≈48.70", "2024", "Minagish Fm; light oil and gas"],
  ], [1.6, 1.8, 0.9, 0.9, 1.0, 3.0], "Coordinates are approximate field centres (±3 km for onshore fields; less certain offshore). Sources: Kuwait Petroleum Corporation (n.d.-a); Horn (2014); Naqi et al. (2023); EIA (2013); KUNA (2024). Where sources give different discovery years, both are shown.", { align: [null, null, C, C, C, null] }));
  add(H2("4.3 Reservoir formations"));
  add(P("Kuwait's oil is held in a stack of reservoirs at different depths (Figure 5). The **Burgan Formation**, a Middle Cretaceous (Albian) sandstone, is the most important reservoir in the country, and most production comes from it (Naqi et al., 2023). The overlying **Wara** sandstone was the discovery reservoir of Burgan No. 1 (GeoExpro, n.d.). The **Mauddud** carbonate is the main reservoir at Raudhatain and Sabriya, while the Early Cretaceous **Minagish Oolite** is the main reservoir of Minagish and Umm Gudair, where a tar mat at the base of the oil column affects water injection (Naqi et al., 2023). **Zubair**, **Ratawi** and **Mishrif** are additional Cretaceous reservoirs. The deep Jurassic **Marrat**, **Najmah** and **Sargelu** carbonates of North Kuwait contain the light oil and sour, high-pressure gas exported as Kuwait Super Light crude (S&P Global Commodity Insights, 2018b). Near the surface, the Miocene **Lower Fars** sands contain heavy oil that is produced with cyclic steam stimulation (MEES, 2025a)."));
  add(await figure(FIG("fig_strata.png"), "Simplified Reservoir Stratigraphy of Kuwait", "Prepared by the author from Naqi et al. (2023), S&P Global Commodity Insights (2018b) and MEES (2025a). Not to scale; non-reservoir units are omitted."));
  add(H2("4.4 Export infrastructure"));
  add(P("All of Kuwait's refineries and export terminals are on its Gulf coast south of Kuwait City. Mina Al-Ahmadi, about 45 km south of the capital, has both the oldest refinery (1949) and the main crude-loading piers; Mina Abdullah has a refinery and an offshore Sea Island loading point; the Shuaiba industrial area contains the petrochemical plants; and Al-Zour, near the Saudi border, has the new refinery and the LNG import terminal (Kuwait National Petroleum Company, n.d.-b, n.d.-c; Kuwait Integrated Petroleum Industries Company, n.d.). Kuwait has no pipeline that bypasses the Gulf, so every export cargo must pass through the Strait of Hormuz, a weakness that became visible in 2026 (Section 5.7)."));

  // ------------------------------------------------------------------ 5
  add(H1("5. Export Markets and the Cost of Oil and Gas"));
  add(H2("5.1 Export volumes and the shift to refined products"));
  add(P("Kuwait exported about 2.0 mb/d of crude oil in 2017–2019 (Table 9, Figure 6). As Al-Zour and the Clean Fuels Project came on line, more crude was refined at home: crude exports fell to 1.57 mb/d in 2023 and 1.18 mb/d in 2024, while exports of refined products, mainly diesel, jet fuel, naphtha and very-low-sulfur fuel oil, rose to a record 1.20 mb/d (JODI, 2026). 2024 was the first year in which Kuwait exported more refined products than crude oil (MEES, 2026). In 2025 the balance moved back towards crude, partly because of an outage at Al-Zour in October 2025 (MEES, 2026)."));
  add(table("Kuwait's Oil Exports, 2017–2025 (kb/d)", ["Year", "Crude oil", "Refined products (incl. LPG)", "of which LPG", "Crude share of oil exports"], [
    ["2017", "2,009", "636", "202", "76%"], ["2018", "2,053", "626", "205", "77%"], ["2019", "1,998", "585", "169", "77%"],
    ["2020", "1,816", "527", "147", "78%"], ["2021", "1,744", "604", "152", "74%"], ["2022", "1,879", "711", "164", "73%"],
    ["2023", "1,568", "964", "175", "62%"], ["2024", "1,176", "1,196", "191", "50%"], ["2025", "1,330", "1,071", "189", "55%"],
  ], [1.2, 1.6, 2.4, 1.6, 2.2], "Annual averages of monthly data reported to the JODI-Oil World Database (JODI, 2026). Other publishers use different definitions: the Energy Institute (2025) gives 1,203 kb/d of crude exports for 2024.", { align: [C, C, C, C, C] }));
  add(await figure(FIG("fig_exports.png"), "Crude Oil and Refined Product Exports, 2017–2025", "JODI (2026)."));
  add(H2("5.2 Distribution of export markets"));
  add(P("Kuwait's crude is sold almost entirely to Asia (Table 10, Figure 7). By volume, 93.1% of its 2024 crude exports went to the Asia-Pacific region: China took 26.6%, Japan 13.5%, India 10.0% and the rest of Asia-Pacific, mainly South Korea and Taiwan, 43.0% (Energy Institute, 2025). Trade-value data give the same picture: of US$28.8 billion of crude exports recorded in 2024, China received 33.4%, South Korea 23.1%, Japan 16.9%, Taiwan 10.8% and India 10.7% (Observatory of Economic Complexity [OEC], n.d.). Kuwait is far more dependent on Asia than OPEC as a whole, which sent 71.9% of its crude to Asia in 2024 (OPEC, 2025b). China's share of Kuwaiti crude rose from 9% in 2013 to 31% in 2022 (EIA, 2023a). Refined products are more diversified: in 2024 Europe took 33.2% and Asia-Pacific 44.2% (Energy Institute, 2025)."));
  add(table("Destinations of Kuwait's Crude Oil Exports, 2024", ["Destination", "Share by volume (%)", "Destination", "Share by value (%)"], [
    ["China", "26.6", "China", "33.4"], ["Japan", "13.5", "South Korea", "23.1"], ["India", "10.0", "Japan", "16.9"],
    ["Other Asia-Pacific", "43.0", "Taiwan", "10.8"], ["Middle East", "4.6", "India", "10.7"], ["United States", "1.8", "Others", "5.2"],
    ["Europe and Africa", "0.6", "", ""], ["Asia-Pacific total", "93.1", "Top five (all Asian)", "94.8"],
  ], [2.4, 2.1, 2.4, 2.1], "Volume shares: Energy Institute (2025), inter-area crude movements (total 60.1 Mt). Value shares: OEC (n.d.), based on importers' customs data (total US$28.8 billion).", { align: [null, C, null, C] }));
  add(await figure(FIG("fig_destinations.png"), "Kuwait's Crude Oil Export Markets, 2024", "OEC (n.d.) and Energy Institute (2025)."));
  add(P("Kuwait's place in world trade is significant but smaller than its reserves suggest. Using Energy Institute data, Kuwait supplied about 2.8% of world crude exports and 3.0% of total world oil trade in 2024 (author's calculation from Energy Institute, 2025)."));
  add(H2("5.3 Oil prices"));
  add(P("Kuwait sells its crude through KPC, which sets an official selling price each month for each grade relative to regional benchmark prices (S&P Global Commodity Insights, 2020). Because KEC is a medium-sour grade, its price normally follows the Middle East benchmarks closely: KEC averaged US$84.26/bbl in 2023 and US$80.65/bbl in 2024, compared with US$82.95 and US$79.89 for the OPEC Reference Basket (OPEC, 2025a). Figure 8 shows the international Brent benchmark since 2000, and Table 11 lists the major price shocks that have affected Kuwait's income."));
  add(await figure(FIG("fig_prices.png"), "Brent Crude Price and Kuwait Export Crude, 2000–2025", "Brent: annual average of EIA daily spot prices (EIA, 2026). Kuwait Export Crude: OPEC (2025a)."));
  add(table("Major Oil Price Events Affecting Kuwait", ["Event", "Price evidence (US$/bbl)", "Source"], [
    ["1973–74 Arab oil embargo", "Annual average 3.29 (1973) → 11.58 (1974)", "Energy Institute (2025)"],
    ["1979–80 Iranian Revolution", "14.02 (1978) → 36.83 (1980)", "Energy Institute (2025)"],
    ["1986 price collapse", "27.56 (1985) → 14.43 (1986)", "Energy Institute (2025)"],
    ["1990 Iraqi invasion of Kuwait", "Brent 14.98 (9 Jul) → 41.45 (27 Sep 1990)", "EIA (2026)"],
    ["2008 peak and crash", "Brent 143.95 (3 Jul) → 33.73 (26 Dec 2008)", "EIA (2026)"],
    ["2014–2016 crash", "Brent 115.19 (Jun 2014) → 26.01 (Jan 2016)", "EIA (2026)"],
    ["2020 COVID-19", "Brent annual average 41.96", "EIA (2026)"],
    ["2022 war in Ukraine", "Brent 133.18 (8 Mar 2022); annual average 100.93", "EIA (2026)"],
    ["2026 Hormuz disruption", "Brent 71.32 (27 Feb) → 138.21 (7 Apr 2026)", "EIA (2026)"],
  ], [2.8, 4.0, 2.2], "Annual averages before 1984 are Arabian Light posted prices; later values are Brent.", {}));
  add(H2("5.4 Cost of producing oil"));
  add(P("Kuwaiti oil is among the cheapest in the world to produce, because its reservoirs are large, shallow to moderately deep, onshore and close to the coast. Rystad Energy data published by the *Wall Street Journal* estimated Kuwait's total cost of production, including capital and operating spending, at about US$8.50 per barrel, the lowest of the countries compared, against about US$44 per barrel in the UK North Sea (Wall Street Journal, 2016). With KEC selling at an average of US$80.65 in 2024 (OPEC, 2025a), the gross margin was about US$72 per barrel before taxes and other government take (author's calculation). The main constraint on Kuwait is therefore not its production cost but its dependence on oil revenue: because oil finances most public spending, the oil price needed to balance the state budget is many times higher than the cost of producing a barrel."));
  add(H2("5.5 Cost of natural gas and LNG imports"));
  add(P("Gas is a cost rather than a source of revenue for Kuwait. In 2024 it imported 9.73 bcm of LNG, equal to about 7.15 Mt, or 1.8% of world LNG imports. Qatar supplied 61.4%, Nigeria 16.6%, the United States 9.5%, Angola 3.7%, Oman 3.0% and Russia 3.0% (Table 12, Figure 9; Energy Institute, 2025). LNG is bought at international prices, which are very volatile: the Asian spot benchmark JKM averaged US$33.98/MMBtu in 2022 but US$11.91/MMBtu in 2024 (Table 13; Energy Institute, 2025). Kuwait's contract prices are not published; valuing the 2024 volume at the JKM price gives an illustrative import bill of about US$4 billion (7.15 Mt × 46.4 million MMBtu/Mt × US$11.91; author's calculation)."));
  add(table("Kuwait's LNG Imports by Supplier, 2024", ["Supplier", "Volume (bcm)", "Share (%)"], [
    ["Qatar", "5.97", "61.4"], ["Nigeria", "1.61", "16.6"], ["United States", "0.93", "9.5"], ["Angola", "0.36", "3.7"],
    ["Oman", "0.29", "3.0"], ["Russia", "0.29", "3.0"], ["Others", "0.28", "2.9"], ["Total", "9.73", "100"],
  ], [3, 3, 3], "Energy Institute (2025).", { align: [null, C, C] }));
  add(await figure(FIG("fig_lng.png"), "Suppliers of Kuwait's LNG Imports, 2024", "Energy Institute (2025)."));
  add(table("Asian LNG Spot Price (JKM), US$/MMBtu", ["2019", "2020", "2021", "2022", "2023", "2024"], [
    ["5.49", "4.39", "18.60", "33.98", "13.77", "11.91"],
  ], [1, 1, 1, 1, 1, 1], "Platts JKM annual averages as reported by the Energy Institute (2025).", { align: [C, C, C, C, C, C] }));
  add(H2("5.6 Export revenue"));
  add(P("Using the World Bank figures in Table 7, Kuwait's fuel exports were worth about US$68 billion in 2024, down from about US$96 billion in 2022, the high point of the recent price cycle (World Bank, 2026). Multiplying the 2024 JODI crude export volume by the average KEC price gives a crude-only export value of about US$35 billion (author's calculation); the difference is made up of refined products and LPG, whose importance has grown with Al-Zour."));
  add(H2("5.7 The 2026 Strait of Hormuz disruption"));
  add(P("Events in 2026 showed how exposed Kuwait's export model is. During the U.S.–Iran conflict in early 2026, tanker traffic through the Strait of Hormuz stopped, and on 7 March 2026 KPC declared force majeure and began cutting production (CNBC, 2026). Official JODI data show Kuwait's crude exports falling from 1,213 kb/d in February to 41 kb/d in April and 24 kb/d in May 2026, a fall of about 98%, while crude production fell from 2.58 mb/d to about 0.56 mb/d (Table 14, Figure 10; JODI, 2026). Brent rose from US$71 at the end of February to a peak of US$138.21 on 7 April 2026 (EIA, 2026). Exports recovered to about 1.1 mb/d by July as shipping resumed, and production reached about 1.97 mb/d (JODI, 2026; Zawya, 2026)."));
  add(table("Kuwait's Oil Exports and Brent Prices, January–July 2026", ["Month", "Crude production (kb/d)", "Crude exports (kb/d)", "Product exports (kb/d)", "Brent (US$/bbl)"], [
    ["Jan", "2,580", "1,254", "1,547", "66.60"], ["Feb", "2,580", "1,213", "1,399", "70.89"], ["Mar", "1,200", "500", "384", "103.13"],
    ["Apr", "562", "41", "184", "117.29"], ["May", "578", "24", "383", "107.14"], ["Jun", "1,650", "1,060", "667", "85.40"], ["Jul", "1,971", "1,129", "1,106", "83.76"],
  ], [1.2, 2.2, 2.0, 2.0, 1.6], "JODI (2026), preliminary monthly data; Brent monthly averages calculated from EIA (2026) daily prices.", { align: [C, C, C, C, C] }));
  add(await figure(FIG("fig_2026.png"), "Kuwait's Crude Oil Exports and the Brent Price in 2026", "JODI (2026); EIA (2026). Red bars mark the months of the Hormuz disruption."));

  // ------------------------------------------------------------------ 6
  add(H1("6. Discussion and Conclusion"));
  add(P("This report has traced Kuwait's oil and gas industry from the 1934 concession to 2026. Four conclusions stand out."));
  add(bullets([
    "**A vast, low-cost resource.** Kuwait holds 101.5 billion barrels of proven crude reserves, about 6.5% of the world total, much of it in Greater Burgan, the world's second-largest oil field. Production costs of around US$8.50 per barrel are among the lowest anywhere.",
    "**A gas deficit.** Because about 70% of its gas is associated with oil, gas supply depends on oil quotas. Kuwait imported about 40% of the gas it used in 2024 as LNG, mainly from Qatar, which makes the development of non-associated Jurassic gas and the shared Dorra field strategically important.",
    "**From crude exporter to refiner.** The Clean Fuels Project and the 615,000 b/d Al-Zour refinery raised refining capacity to about 1.4 mb/d. With large hydrotreating and residue-desulfurisation capacity suited to sour Kuwaiti crude, Kuwait became, in 2024, a larger exporter of refined products than of crude oil.",
    "**Concentrated markets and one route.** About 93% of Kuwait's crude goes to Asia, and every export cargo must pass through the Strait of Hormuz. The 2026 disruption, when crude exports fell by about 98% in two months, showed the cost of this concentration.",
  ]));
  add(P("From a processing point of view, Kuwait illustrates how crude quality shapes refinery design (sour medium crude requires hydrotreating and residue desulfurisation), how associated-gas supply links upstream oil policy to petrochemical and power-sector feedstock, and how refining integration can change a country's export profile. KPC's plans to reach 4 mb/d of capacity by 2035, develop offshore discoveries and expand non-associated gas will determine whether Kuwait can turn its reserves into secure long-term revenue while diversifying its economy."));
  return b;
}

// ------------------------------------------------------------------ references (APA 7)
const REFS = [
  [["Change in the apparent order at different temperatures and catalyst volumes: Hydrodesulfurization of Kuwait Export Crude atmospheric residue. (2020). "], ["PubMed Central", 1], [" (PMC7758987). https://pmc.ncbi.nlm.nih.gov/articles/PMC7758987"]],
  [["bp. (2021). "], ["Statistical review of world energy 2021: Oil", 1], [" (70th ed.). https://www.bp.com/content/dam/bp/business-sites/en/global/corporate/pdfs/energy-economics/statistical-review/bp-stats-review-2021-oil.pdf"]],
  [["Central Intelligence Agency. (2025). Kuwait. In "], ["The world factbook", 1], [". https://www.cia.gov/the-world-factbook/countries/kuwait/"]],
  [["CNBC. (2026, March 7). "], ["Kuwait cuts oil production as Strait of Hormuz closure disrupts global energy market", 1], [" [Reuters report]. https://www.cnbc.com/2026/03/07/kuwait-oil-cut-iran-war-strait-hormuz.html"]],
  [["Encyclopaedia Britannica. (n.d.-a). "], ["Kuwait: History", 1], [". Retrieved October 3, 2026, from https://www.britannica.com/place/Kuwait/History"]],
  [["Encyclopaedia Britannica. (n.d.-b). "], ["Kuwait: Resources and power", 1], [". Retrieved October 3, 2026, from https://www.britannica.com/place/Kuwait/Resources-and-power"]],
  [["Encyclopaedia Britannica. (n.d.-c). "], ["Kuwait Oil Company", 1], [". Retrieved October 3, 2026, from https://www.britannica.com/topic/Kuwait-Oil-Company"]],
  [["Encyclopedia.com. (n.d.). Kuwait Petroleum Corp. In "], ["International directory of company histories", 1], [". Retrieved October 3, 2026, from https://www.encyclopedia.com/social-sciences-and-law/economics-business-and-labor/businesses-and-occupations/kuwait-petroleum-corp"]],
  [["Energy Institute. (2025). "], ["Statistical review of world energy 2025", 1], [" (74th ed.) [Data set]. https://www.energyinst.org/statistical-review"]],
  [["Energy Intelligence. (n.d.). "], ["Kuwait Super Light; Kuwait Export Heavy", 1], [" [Crude oil profiles]. Retrieved October 3, 2026, from https://www.energyintel.com/wcod/crude-profile/kuwait-super-light"]],
  [["GeoExpro. (n.d.). "], ["The Great Burgan field, Kuwait", 1], [". Retrieved October 3, 2026, from https://geoexpro.com/the-great-burgan-field-kuwait/"]],
  [["Government of the State of Kuwait v. American Independent Oil Company (AMINOIL), Final Award (Ad hoc arbitral tribunal, March 24, 1982). Jus Mundi. https://jusmundi.com/en/document/decision/en-the-american-independent-oil-company-v-the-government-of-the-state-of-kuwait-final-award-wednesday-24th-march-1982"]],
  [["Horn, M. K. (2014). "], ["Giant oil and gas fields of the world", 1], [" [Data set]. AAPG Datapages. https://www.datapages.com"]],
  [["Joint Organisations Data Initiative. (2026). "], ["JODI-Oil world database", 1], [" [Data set]. https://www.jodidata.org/oil/database/data-downloads.aspx"]],
  [["Journal of Petroleum Technology. (n.d.). "], ["Kuwait Petroleum to boost oil production capacity 33% by 2040", 1], [". Society of Petroleum Engineers. https://jpt.spe.org/kuwait-petroleum-to-boost-oil-production-capacity-33-by-2040"]],
  [["Kuwait Integrated Petroleum Industries Company. (n.d.). "], ["Al Zour refinery", 1], [". Retrieved October 3, 2026, from https://kipic.com.kw/al-zour-refinery/"]],
  [["Kuwait Integrated Petroleum Industries Company. (2024). "], ["His Highness the Amir of Kuwait inaugurates full operation of Al-Zour Refinery", 1], [" [Press release]. https://kipic.com.kw/blog/press-release/his-highness-the-amir-of-kuwait-inaugurates-full-operation-of-al-zour-refinery/"]],
  [["Kuwait National Petroleum Company. (n.d.-a). "], ["KNPC timeline", 1], [". Retrieved October 3, 2026, from https://www.knpc.com/en/about-us/knpc-timeline"]],
  [["Kuwait National Petroleum Company. (n.d.-b). "], ["Mina Abdullah refinery", 1], [". Retrieved October 3, 2026, from https://www.knpc.com/en/our-business/oil-refining/mina-abdullah-refinery"]],
  [["Kuwait National Petroleum Company. (n.d.-c). "], ["Mina Al-Ahmadi refinery", 1], [". Retrieved October 3, 2026, from https://www.knpc.com/en/our-business/oil-refining/mina-al-ahmadi-refinery"]],
  [["Kuwait News Agency. (2018, July 2). "], ["Kuwait exports first light crude high-quality oil – minister", 1], [". https://www.kuna.net.kw/ArticleDetails.aspx?id=2735330&language=en"]],
  [["Kuwait News Agency. (2024, July 14). "], ["KOC discovers giant oil reserves in Al-Nokhatha offshore field", 1], [". https://www.kuna.net.kw/ArticleDetails.aspx?id=3164957&language=en"]],
  [["Kuwait Oil Company. (n.d.-a). "], ["Brief history of KOC", 1], [". Retrieved October 3, 2026, from https://www.kockw.com/sites/EN/Pages/Profile/whoAreWe/KOC-History.aspx"]],
  [["Kuwait Oil Company. (n.d.-b). "], ["Oil fires", 1], [". Retrieved October 3, 2026, from https://www.kockw.com/sites/EN/Pages/Profile/whoAreWe/OurHistory/OilFire.aspx"]],
  [["Kuwait Oil Company. (n.d.-c). "], ["Progress and prosperity", 1], [" [Historical publication]. https://www.kockw.com/sites/EN/Other%20Publications/Historical/Progress%20and%20Prosperity.pdf"]],
  [["Kuwait Oil Tanker Company. (n.d.). "], ["History", 1], [". Retrieved October 3, 2026, from https://www.kotc.com.kw/AboutUs/pages/history.aspx"]],
  [["Kuwait Petroleum Corporation. (n.d.-a). "], ["Kuwaiti oil fields", 1], [" [Map by KOC Exploration Group]. Retrieved October 3, 2026, from https://www.kpc.com.kw/InformationCenter/Pages/Kuwaiti-Oil-Fields.aspx"]],
  [["Kuwait Petroleum Corporation. (n.d.-b). "], ["Oil history", 1], [". Retrieved October 3, 2026, from https://www.kpc.com.kw/OilHistory"]],
  [["Kuwait Petroleum Corporation. (n.d.-c). "], ["The KPC story", 1], [". Retrieved October 3, 2026, from https://mobile.kpc.com.kw/KPC_story.html"]],
  [["Mehdi, A. (2021). "], ["The second split: Basrah Medium and the challenge of Iraqi crude quality", 1], [" (OIES Energy Comment). Oxford Institute for Energy Studies. https://www.oxfordenergy.org/wpcms/wp-content/uploads/2021/04/The-second-split-Basrah-Medium-and-the-challenge-of-Iraqi-crude-quality.pdf"]],
  [["Middle East Economic Survey. (2025a, January 3). "], ["Kuwait heavy oil output hits 90,000 b/d milestone", 1], [". https://www.mees.com/2025/1/3/oil-gas/kuwait-heavy-oil-output-hits-90000-bd-milestone/79855c70-c9d3-11ef-ae78-f7032f196f38"]],
  [["Middle East Economic Survey. (2025b, September 26). "], ["Kuwait crude oil capacity rises to 14-year high", 1], [". https://www.mees.com/2025/9/26/corporate/kuwait-crude-oil-capacity-rises-to-14-year-high/b4077330-9ad9-11f0-bf79-f7c74e8e397c"]],
  [["Middle East Economic Survey. (2026, January 16). "], ["Kuwait's oil exports swing back to crude", 1], [". https://www.mees.com/2026/1/16/selected-data/kuwaits-oil-exports-swing-back-to-crude/9eee99a0-f2e9-11f0-a194-3f75e65af03a"]],
  [["Naqi, M., Alsalem, O., & Qabazard, S. (2023). Petroleum geology of Kuwait. In A. K. Abd el-aal, J. M. Al-Awadhi, & A. Al-Dousari (Eds.), "], ["The geology of Kuwait", 1], [". Springer. https://doi.org/10.1007/978-3-031-16727-0_6"]],
  [["Natural Earth. (n.d.). "], ["Admin 0 – countries, 1:10m cultural vectors", 1], [" [Data set]. Public domain. https://www.naturalearthdata.com/"]],
  [["Observatory of Economic Complexity. (n.d.). "], ["Crude petroleum in Kuwait trade", 1], [" [2024 data]. Retrieved October 3, 2026, from https://oec.world/en/profile/bilateral-product/crude-petroleum/reporter/kwt"]],
  [["Office of the Special Assistant for Gulf War Illnesses. (1998). "], ["Environmental exposure report: Oil well fires", 1], [". U.S. Department of Defense, GulfLINK. https://gulflink.health.mil/oil_well_fires/oil_well_fires_sec03.htm"]],
  [["Office of the Special Assistant for Gulf War Illnesses. (2000). "], ["Environmental exposure report: Oil well fires (updated final report)", 1], [". U.S. Department of Defense, GulfLINK. https://gulflink.health.mil/owf_ii/owf_ii_s03.htm"]],
  [["Offshore Engineer. (2025, January). "], ["Kuwait strikes oil and gas at Al-Jlaiaa offshore field", 1], [". https://www.oedigital.com/news/521409-kuwait-strikes-oil-and-gas-at-al-jlaiaa-offshore-field"]],
  [["Organization of the Petroleum Exporting Countries. (2025a). "], ["Annual report 2024", 1], [". https://www.opec.org/assets/assetdb/annual-report-2024.pdf"]],
  [["Organization of the Petroleum Exporting Countries. (2025b). "], ["Annual statistical bulletin 2025", 1], [" (60th ed.). https://asb.opec.org/"]],
  [["Organization of the Petroleum Exporting Countries. (2026a). "], ["Annual statistical bulletin 2026", 1], [" (61st ed.). https://asb.opec.org/"]],
  [["Organization of the Petroleum Exporting Countries. (2026b, September 6). "], ["Seven OPEC+ countries maintain September 2026 required production for October 2026", 1], [" [Press release]. https://www.opec.org/pr-detail/613-6-september-2026.html"]],
  [["Our World in Data. (2025). "], ["Energy dataset", 1], [" [Data set, based on the Energy Institute Statistical Review of World Energy 2025]. https://github.com/owid/energy-data"]],
  [["Petrochemical Industries Company. (n.d.). "], ["Who we are", 1], [". Retrieved October 3, 2026, from https://www.pic.com.kw/Who"]],
  [["Reuters. (2019, July 24). "], ["[Saudi and Kuwaiti officials discuss resuming oil output from the Neutral Zone]", 0], [". https://www.reuters.com/"]],
  [["Reuters. (2020, January 7). "], ["[Saudi Arabia and Kuwait ask consultant to study Dorra gas field development plan]", 0], [". https://www.reuters.com/"]],
  [["S&P Global Commodity Insights. (2018a, January 29). "], ["Kuwait starts light oil, gas production from West al-Rawdatain field", 1], [". https://www.spglobal.com/commodityinsights/en/market-insights/latest-news/oil/012918-kuwait-starts-light-oil-gas-production-from-west-al-rawdatain-field"]],
  [["S&P Global Commodity Insights. (2018b, July 20). "], ["Kuwait's Super Light crude oil finds home in Japan and South Korea as Iran alternative", 1], [". https://www.spglobal.com/commodity-insights/en/market-insights/latest-news/oil/072018-kuwaits-super-light-crude-oil-finds-home-in-japan-and-south-korea-as-iran-alternative"]],
  [["S&P Global Commodity Insights. (2020, May 11). "], ["Kuwait's KPC issues Khafji crude OSP differential after many years, hikes all June OSPs", 1], [". https://www.spglobal.com/commodityinsights/en/market-insights/latest-news/oil/051120-kuwaits-kpc-issues-khafji-crude-osp-differential-after-many-years-hikes-all-june-osps"]],
  [["S&P Global Commodity Insights. (2024, February 4). "], ["Kuwait's Al-Zour refinery hits full capacity for first time", 1], [". https://www.spglobal.com/energy/en/news-research/latest-news/crude-oil/020424-kuwaits-al-zour-refinery-hits-full-capacity-for-first-time"]],
  [["U.S. Department of State, Office of the Historian. (n.d.). "], ["Foreign relations of the United States, 1951, Volume V, The Near East and Africa", 1], [" (Document 591). https://history.state.gov/historicaldocuments/frus1951v05/d591"]],
  [["U.S. Energy Information Administration. (2011a). "], ["Kuwait, a leading oil exporter, relies on imports of liquefied natural gas", 1], [" (Today in Energy). https://www.eia.gov/todayinenergy/detail.php?id=2310"]],
  [["U.S. Energy Information Administration. (2011b). "], ["Effects of crude oil supply disruptions: How long can they last?", 1], [" (Today in Energy). https://www.eia.gov/todayinenergy/detail.php?id=730"]],
  [["U.S. Energy Information Administration. (2013). "], ["Kuwait: Country analysis brief", 1], [". https://www.europarl.europa.eu/meetdocs/2009_2014/documents/darp/dv/darp20140213_11_/darp20140213_11_en.pdf"]],
  [["U.S. Energy Information Administration. (2023a). "], ["Country analysis brief: Kuwait", 1], [". https://www.eia.gov/international/content/analysis/countries_long/kuwait/kuwait.pdf"]],
  [["U.S. Energy Information Administration. (2023b). "], ["Kuwait's oil exports shift from crude oil to petroleum products", 1], [" (Today in Energy). https://www.eia.gov/todayinenergy/detail.php?id=60482"]],
  [["U.S. Energy Information Administration. (2026). "], ["Europe Brent spot price FOB", 1], [" [Data set]. https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm"]],
  [["Wall Street Journal. (2016, April 15). "], ["Barrel breakdown", 1], [" [Interactive graphic based on Rystad Energy data]. https://graphics.wsj.com/oil-barrel-breakdown/"]],
  [["World Bank. (2026). "], ["World development indicators", 1], [" [Data set]. https://databank.worldbank.org/source/world-development-indicators"]],
  [["World Oil. (2025, October 13). "], ["Kuwait strikes major offshore gas discovery in Persian Gulf", 1], [". https://worldoil.com/news/2025/10/13/kuwait-strikes-major-offshore-gas-discovery-in-persian-gulf/"]],
  [["Youash, Y. Y. (1989). Greater Burgan of Kuwait: World's second largest oil field [Abstract]. "], ["AAPG Bulletin, 73", 1], ["(3). https://www.osti.gov/biblio/5798208"]],
  [["Zawya. (2026, August). "], ["Kuwait raises crude oil output to near 2mln bpd in July, source says", 1], [" [Reuters report]. https://www.zawya.com/en/business/commodities/kuwait-raises-crude-oil-output-to-near-2mln-bpd-in-july-source-says-418040"]],
];

function refParas() {
  return REFS.map((parts) => new Paragraph({
    indent: { left: 720, hanging: 720 }, spacing: { line: 300, after: 120 }, alignment: AlignmentType.LEFT,
    children: parts.map(([t, it]) => new TextRun({ text: t, italics: !!it })),
  }));
}

function appendix() {
  return [
    H1("Appendix A. Data Notes"),
    P("Network restrictions during the preparation of this report meant that some publisher websites could not be opened directly. To keep the figures as reliable as possible, the following rules were applied:"),
    ...bullets([
      "**Datasets opened in full.** Production, gas, trade, LNG and price statistics were taken from complete official datasets: the Energy Institute *Statistical Review of World Energy 2025* (including its Our World in Data mirror), the JODI-Oil World Database (monthly data to July 2026), EIA daily Brent prices (to 29 September 2026) and the World Bank's *World Development Indicators*.",
      "**Derived values.** Some annual oil-production values in Figure 2 were derived from the Energy Institute's energy-content data using the barrels-to-energy ratio of neighbouring years; the 2024 total-oil value (≈2.73 mb/d) is such an estimate. Implied fuel-export values, the gross margin per barrel, the crude export value and the LNG import bill are the author's calculations, with the method stated in the text.",
      "**Published figures checked through secondary reporting.** Several figures from company websites, OPEC publications, MEES and S&P Global were confirmed through the publishers' indexed summaries rather than the full documents. These include Kuwait Export Crude prices for 2023–2024, the OPEC+ quota for 2026 and the capacity figures for individual refineries.",
      "**Dated estimates.** The production cost of US$8.50 per barrel comes from a 2016 study (Wall Street Journal, 2016) and should be read as an order of magnitude.",
      "**Preliminary data.** All 2026 figures (JODI monthly data, Brent prices and reports of the Hormuz disruption) are preliminary and may be revised.",
      "**General knowledge.** Three statements are given from general industry knowledge and should be confirmed before being quoted: the capacity (230,000 b/d) and ownership (OQ and Kuwait Petroleum International) of the Duqm refinery in Oman; the retirement of the Shuaiba refinery; and the description of PIC's joint venture with Dow (EQUATE).",
      "**Conflicting sources.** Where sources disagreed (for example, the date of the Burgan discovery, the number of wells set on fire in 1991 and some discovery years), the conflicting values are reported in the text and tables.",
    ]),
  ];
}

// ------------------------------------------------------------------ document
async function main() {
  const content = await bodyContent();
  const refs = [H1("References"), ...refParas()];
  const app = appendix();

  // cover
  const logoFile = fs.existsSync(path.join(__dirname, "assets", "utas_logo.png")) ? path.join(__dirname, "assets", "utas_logo.png")
    : path.join(__dirname, "assets", "logo_placeholder.png");
  const sharp = require("sharp");
  const lm = await sharp(logoFile).metadata();
  const lh = 1.45 * 96, lw = lh * lm.width / lm.height;
  const coverLine = (t, size, o = {}) => new Paragraph({ alignment: C, spacing: { after: o.after ?? 120, before: o.before ?? 0 },
    children: [new TextRun({ text: t, size, font: "Arial", bold: !!o.bold, color: o.color || COL.ink, italics: !!o.italics })] });
  const rule = new Paragraph({ alignment: C, spacing: { before: 200, after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COL.accent, space: 1 } }, children: [] });
  const cover = [
    new Paragraph({ alignment: C, spacing: { before: 400, after: 300 }, children: [new ImageRun({ type: "png", data: fs.readFileSync(logoFile),
      transformation: { width: Math.round(lw), height: Math.round(lh) }, altText: { title: "UTAS logo", description: "University logo", name: "logo" } })] }),
    coverLine("University of Technology and Applied Sciences", 30, { bold: true, after: 80 }),
    coverLine("EGCH2230 – Petroleum and Petrochemical Processing", 24, { color: COL.muted, after: 600 }),
    coverLine("RESEARCH REPORT", 22, { bold: true, color: COL.accent, after: 200 }),
    coverLine("Kuwait's Oil and Gas Industry", 48, { bold: true, after: 120 }),
    coverLine("History, Resources, Reservoir Locations, Export Markets and Costs", 28, { color: COL.muted, after: 200 }),
    rule,
    coverLine("Prepared by", 22, { color: COL.muted, before: 600, after: 60 }),
    coverLine("Shahad Issa Obaid Alghriabi", 32, { bold: true, after: 600 }),
    coverLine("October 2026", 22, { color: COL.muted }),
  ];

  // front matter
  const abstract = [
    H1("Abstract"),
    P("This report examines the oil and gas industry of the State of Kuwait from the first oil concession in 1934 to the Strait of Hormuz disruption of 2026. It describes the history of exploration, discovery, nationalisation and post-war reconstruction and the main types of Kuwaiti crude oil and natural gas; compiles data on reserves, production, refining, petrochemicals and the structure of the state-owned industry; locates the principal oil and gas fields and reservoir formations; and analyses export destinations, prices, production costs and the cost of imported gas. Data were drawn from official company sources, international statistical datasets (Energy Institute, JODI-Oil, EIA, OPEC and the World Bank) and peer-reviewed geological literature. Kuwait holds 101.5 billion barrels of proven crude reserves (about 6.5% of the world total) and about 63 Tcf of gas; much of its oil lies in the Greater Burgan field, the second-largest oil field in the world. Its oil is among the cheapest in the world to produce, and about 93% of its crude exports go to Asia. However, because most of its gas is associated with oil, Kuwait imported about 40% of its gas as LNG in 2024. The 615,000 b/d Al-Zour refinery and the Clean Fuels Project raised refining capacity to about 1.4 mb/d, and in 2024 refined products overtook crude oil as Kuwait's largest oil export for the first time. The 2026 Hormuz disruption, which cut crude exports by about 98%, showed the risk of depending on a single export route."),
    new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: "Keywords: ", italics: true }), new TextRun("Kuwait; crude oil; natural gas; Burgan; API gravity; refining; LNG; OPEC; Strait of Hormuz")] }),
  ];
  const tocHead = (t) => new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: t, bold: true, font: "Arial", size: 32, color: COL.accent })] });
  const tocEntries = TOC.filter((e) => e.text !== "Abstract");
  const front = [
    ...abstract,
    new Paragraph({ children: [new PageBreak()] }), tocHead("Contents"), ...tocLines(tocEntries, PAGES, "toc"),
    new Paragraph({ children: [new PageBreak()] }), tocHead("List of Figures"), ...tocLines(FIGS, PAGES, "Figure"),
    new Paragraph({ spacing: { before: 400 }, children: [] }), tocHead("List of Tables"), ...tocLines(TABS, PAGES, "Table"),
  ];

  const header = new Header({ children: [new Paragraph({ alignment: R, children: [new TextRun({ text: "EGCH2230  ·  Kuwait's Oil and Gas Industry", size: 18, color: COL.muted, font: "Arial" })] })] });
  const footer = new Footer({ children: [new Paragraph({ alignment: C, children: [new TextRun({ children: [PageNumber.CURRENT], size: 20, font: "Arial", color: COL.muted })] })] });
  const page = { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } };

  const doc = new Document({
    creator: "Shahad Issa Obaid Alghriabi", title: "Kuwait's Oil and Gas Industry", description: "EGCH2230 research report",
    styles: {
      default: { document: { run: { font: "Times New Roman", size: 24, color: COL.ink } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: "Arial", size: 30, bold: true, color: COL.accent }, paragraph: { spacing: { before: 360, after: 180 }, keepNext: true, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: "Arial", size: 25, bold: true, color: COL.ink }, paragraph: { spacing: { before: 260, after: 120 }, keepNext: true, outlineLevel: 1 } },
      ],
    },
    numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
    features: { updateFields: false },
    sections: [
      { properties: { page }, children: cover },
      { properties: { page: { ...page, pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN } } }, headers: { default: header }, footers: { default: footer }, children: front },
      { properties: { page: { ...page, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } } }, headers: { default: header }, footers: { default: footer },
        children: [...content, new Paragraph({ children: [new PageBreak()] }), ...refs, new Paragraph({ children: [new PageBreak()] }), ...app] },
    ],
  });
  const out = path.join(__dirname, "out", "report.docx");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, await Packer.toBuffer(doc));
  // index for the page-number pass
  fs.writeFileSync(path.join(__dirname, "out", "toc_index.json"), JSON.stringify({
    toc: tocEntries.map((e) => e.text), figs: FIGS.map((f) => `Figure ${f.n}. ${f.title}`), tabs: TABS.map((t) => `Table ${t.n}. ${t.title}`),
    figTitles: FIGS.map((f) => f.title), tabTitles: TABS.map((t) => t.title),
  }, null, 1));
  console.log("written", out, "figs", FIGS.length, "tables", TABS.length, "headings", TOC.length);
}
main().catch((e) => { console.error(e); process.exit(1); });
