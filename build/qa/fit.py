"""Show how a string wraps: python qa/fit.py WIDTH_IN SIZE_PT [b] "text" ..."""
import sys
sys.path.insert(0, __file__.rsplit("/", 1)[0])
from qa_check import layout_text
w, pt = float(sys.argv[1]), float(sys.argv[2])
bold = sys.argv[3] == "b"
for t in sys.argv[4 if bold else 3:]:
    paras = [{"algn": "l", "runs": [(t, bold, pt, 0)], "aft": 0, "bef": 0, "ln": 1.0, "endsz": pt}]
    lines, h, mw = layout_text(paras, w)
    print(f"{len(lines)} lines | " + " / ".join("".join(x[0] for x in ln[4]) for ln in lines))
