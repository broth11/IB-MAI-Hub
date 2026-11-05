"""Save emulator captures from computer_app_zoom results (run in the cloud workspace).
Each zoom of the LCD region [30,140,302,300] at scale 1 is saved by the harness as
<tool-results>/<blob>.jpg (544x320; its path is printed under the image). This copies it to
OUT/raw/<name>.jpg and writes the 576x324 LCD crop to OUT/lcd/<name>.jpg (crop 8,16,536,316).
Usage: python3 cap.py OUT TOOL_RESULTS_DIR s03_0=<blob> s03_1=<blob> ...
Then zip OUT/raw and OUT/lcd, commit the zip to gdc-decks/D<k>/ and unzip it there.
Verified on D6, 23/10/2026."""
import os, shutil, sys
from PIL import Image

out, src = sys.argv[1], sys.argv[2]
for d in ("raw", "lcd"):
    os.makedirs(os.path.join(out, d), exist_ok=True)
for pair in sys.argv[3:]:
    name, blob = pair.split("=")
    f = os.path.join(src, blob if blob.endswith(".jpg") else blob + ".jpg")
    im = Image.open(f)
    assert im.size == (544, 320), f"{name}: {im.size}, zoom again at scale 1"
    shutil.copy(f, os.path.join(out, "raw", name + ".jpg"))
    im.crop((8, 16, 536, 316)).resize((576, 324), Image.LANCZOS).convert("RGB").save(
        os.path.join(out, "lcd", name + ".jpg"), quality=92)
    print(name, "ok")
