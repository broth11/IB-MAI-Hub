#!/usr/bin/env python3
"""Load lesson pages in a headless browser and check what students will see.

    python3 check_pages.py <repo> 13 36          # one or more playlist numbers
    python3 check_pages.py <repo> 13 --shots out/ # also save screenshots

Needs Python Playwright with Chromium. Checks, with every section expanded:
  - no page errors and no error box
  - no math expression split across lines
  - every <tex-text> rendered: no raw $ left, no .katex-error, and no raw LaTeX (\\hat, \\frac, ...) in visible text
  - explorer: fits a 1440x900 screen, and the result values in its stat row share one top edge
  - title card: title and intro each span the full width
  - at 390px wide: no horizontal scroll

If the KaTeX CDN is unreachable (common in cloud workspaces), it serves KaTeX
from a local npm install (`npm i katex@0.16.11` in a scratch folder) and routes
the CDN URL there. Set KATEX_DIR to that folder's node_modules/katex/dist.
"""
import asyncio
import functools
import http.server
import os
import socketserver
import sys
import threading
from pathlib import Path

from playwright.async_api import async_playwright

KATEX_CDN = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/**"


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve(root):
    handler = functools.partial(Quiet, directory=str(root))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, httpd.server_address[1]


async def check(repo, nums, shots):
    httpd, port = serve(Path(repo) / "docs")
    base = f"http://127.0.0.1:{port}"
    kdir = os.environ.get("KATEX_DIR")
    problems = []
    async with async_playwright() as p:
        exe = "/usr/bin/google-chrome" if Path("/usr/bin/google-chrome").exists() else None
        b = await p.chromium.launch(executable_path=exe, args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1440, "height": 900})
        if kdir:
            async def kat(route):
                path = route.request.url.split("/dist/", 1)[1].split("?")[0]
                ct = "text/css" if path.endswith(".css") else "application/javascript" if path.endswith(".js") else "font/woff2"
                await route.fulfill(path=str(Path(kdir) / path), content_type=ct)
            await pg.route(KATEX_CDN, kat)
        for n in nums:
            errs = []
            pg.on("pageerror", lambda e, errs=errs: errs.append(str(e)))
            await pg.goto(f"{base}/lesson.html?v={n}")
            await pg.wait_for_timeout(1200)
            bad = []
            if await pg.locator(".error").count():
                bad.append("error box: " + await pg.inner_text(".error"))
            else:
                await pg.click("[data-toggle-all]")
                await pg.wait_for_timeout(1500)
                raw = await pg.evaluate("""[...document.querySelectorAll('tex-text')]
                    .filter(e => /\\$/.test(e.textContent)).map(e => e.textContent.slice(0, 70))""")
                if raw:
                    bad.append(f"{len(raw)} unrendered math: {raw[:3]}" + ("" if kdir else " (KaTeX CDN may be blocked; set KATEX_DIR)"))
                kerr = await pg.locator(".katex-error").count()
                if kerr:
                    bad.append(f"{kerr} KaTeX errors")
                leak = await pg.evaluate(r"""(() => { const t = document.body.innerText;
                    const m = t.match(/\$[^$\n]{1,40}\$|\\(hat|frac|dfrac|sqrt|binom|le|ge|ne|alpha|mu|sigma|text)\b/g); return m ? m.slice(0, 4) : []; })()""")
                if leak:
                    bad.append(f"raw LaTeX in visible text: {leak}")
                head = await pg.evaluate("""(() => { const h = document.querySelector('.lesson-head');
                    const w = h.getBoundingClientRect().width; const t = document.querySelector('.lesson-head h1').getBoundingClientRect().width;
                    const i = document.querySelector('.lesson-head .intro').getBoundingClientRect().width; return [w, t, i]; })()""")
                if min(head[1], head[2]) < head[0] - 2:
                    bad.append(f"title card not full width: {head}")
                broken = await pg.evaluate("""[...document.querySelectorAll('.katex-html')].filter(k => k.getClientRects().length > 1).map(k => k.textContent.slice(0, 40))""")
                if broken:
                    bad.append(f"math split across lines: {broken[:3]}")
                if await pg.locator("#s-explorer").count():
                    box = await pg.locator("#s-explorer .explorer").bounding_box()
                    if box and box["height"] > 900 - 140:
                        bad.append(f"explorer is {round(box['height'])}px tall; it must fit under the sticky bars")
                    tops = await pg.evaluate("""[...document.querySelectorAll('#s-explorer .ex-stat .value')].map(v => Math.round(v.getBoundingClientRect().top))""")
                    if tops and max(tops) - min(tops) > 1:
                        bad.append(f"stat values not top-aligned: {tops}")
                    if shots:
                        await pg.evaluate("document.getElementById('s-explorer').scrollIntoView(); window.scrollBy(0, -150)")
                        await pg.wait_for_timeout(300)
                        await pg.screenshot(path=str(Path(shots) / f"explorer-{n}.png"))
                if shots:
                    await pg.evaluate("window.scrollTo(0, 0)")
                    await pg.screenshot(path=str(Path(shots) / f"top-{n}.png"))
            await pg.set_viewport_size({"width": 390, "height": 844})
            await pg.reload()
            await pg.wait_for_timeout(800)
            sw = await pg.evaluate("document.documentElement.scrollWidth")
            if sw > 391:
                bad.append(f"horizontal scroll at 390px (page is {sw}px wide)")
            await pg.set_viewport_size({"width": 1440, "height": 900})
            bad += [f"page error: {e}" for e in errs]
            print(f"{n}: " + ("ok" if not bad else "PROBLEMS"))
            for x in bad:
                print("   -", x)
            problems += bad
        await b.close()
    httpd.shutdown()
    return 1 if problems else 0


def main():
    args = [a for a in sys.argv[1:]]
    shots = None
    if "--shots" in args:
        i = args.index("--shots")
        shots = args[i + 1]
        Path(shots).mkdir(parents=True, exist_ok=True)
        del args[i:i + 2]
    if len(args) < 2:
        sys.exit(__doc__)
    sys.exit(asyncio.run(check(args[0], [int(x) for x in args[1:]], shots)))


if __name__ == "__main__":
    main()
