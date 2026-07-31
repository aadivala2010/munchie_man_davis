"""Link + asset check. Run `python check.py` before every deploy.

Catches the failure that actually matters on a one-page hiring site: a renamed
asset or a dead in-page anchor going live.
"""

import pathlib
import re
import sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).parent
PAGES = sorted(ROOT.glob("*.html"))
SHEETS = sorted(ROOT.glob("*.css"))
SCRIPTS = sorted(ROOT.glob("*.js"))
REMOTE = re.compile(r"(https?:|mailto:|tel:|data:|//)")


class Refs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids = [], {"top"}

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        for key in ("href", "src"):
            if a.get(key):
                self.links.append(a[key])


def local_exists(link):
    return (ROOT / link.lstrip("/").split("?")[0]).exists()


def check_page(page):
    p = Refs()
    p.feed(page.read_text(encoding="utf-8"))
    bad = []
    for link in p.links:
        if link.startswith("#"):
            if link[1:] not in p.ids:
                bad.append(f"dead anchor {link}")
        elif REMOTE.match(link):
            continue
        elif not local_exists(link):
            bad.append(f"missing file {link}")
    return bad


def check_sheet(sheet):
    """url(...) in CSS — paths.svg is referenced from here and nowhere else."""
    urls = re.findall(r"""url\(\s*['"]?([^'")]+)""", sheet.read_text(encoding="utf-8"))
    return [f"missing file {u}" for u in urls if not REMOTE.match(u) and not local_exists(u)]


def check_script(script):
    """ES module imports — the browser resolves these itself, so a bad path
    fails silently at runtime with the gallery simply never appearing."""
    src = script.read_text(encoding="utf-8")
    specs = re.findall(r"""(?:^|\s)(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]""",
                       src, re.M)
    specs += re.findall(r"""import\s*\(\s*['"]([^'"]+)['"]""", src)
    bad = []
    for s in specs:
        if REMOTE.match(s):
            continue
        if not s.startswith("."):
            bad.append(f"bare import {s!r} — browsers can't resolve this without an import map")
        elif not (ROOT / s.lstrip("./")).exists():
            bad.append(f"missing module {s}")
    return bad


def main():
    assert PAGES, "no .html files found"
    targets = ([(p, check_page(p)) for p in PAGES]
               + [(s, check_sheet(s)) for s in SHEETS]
               + [(j, check_script(j)) for j in SCRIPTS])
    failures = [(f.name, b) for f, bad in targets for b in bad]
    for name, b in failures:
        print(f"FAIL {name}: {b}")
    if failures:
        sys.exit(1)
    print(f"ok — {len(PAGES)} page(s), {len(SHEETS)} sheet(s), "
          f"{len(SCRIPTS)} script(s), all refs resolve")


if __name__ == "__main__":
    main()
