# Builds the Traditional Chinese web fonts used by lang-v10/zh-tw/override.css.
#
# Usage (needs: pip install fonttools brotli, and node on PATH):
#   python tools/zh-tw/subset-fonts.py <LXGWWenKaiTC-Regular.ttf> <Huninn-Regular.ttf>
# Sources (SIL OFL 1.1): https://github.com/google/fonts/tree/main/ofl/lxgwwenkaitc
#                        https://github.com/google/fonts/tree/main/ofl/huninn
#
# Character set = Big5 frequently used characters (A440-C67E)
#               + Traditional form of every GB2312 character (live ghost data arrives as zh-cn)
#               + every character in lang-v10/zh-tw/*.json
import json
import os
import subprocess
import sys

from fontTools import subset

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "styles-v10", "fonts")


def big5_common():
    chars = set()
    for cp in range(0x4E00, 0xA000):
        try:
            b = chr(cp).encode("big5")
        except UnicodeEncodeError:
            continue
        if len(b) == 2 and 0xA440 <= (b[0] << 8 | b[1]) <= 0xC67E:
            chars.add(chr(cp))
    return chars


def gb2312_as_traditional():
    gb = []
    for cp in range(0x4E00, 0xA000):
        try:
            chr(cp).encode("gb2312")
            gb.append(chr(cp))
        except UnicodeEncodeError:
            pass
    script = (
        "const O=require(process.argv[1]);const c=O.Converter({from:'cn',to:'twp'});"
        "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(c(s)))"
    )
    res = subprocess.run(
        ["node", "-e", script, os.path.join(ROOT, "lang-v10", "zh-tw", "opencc-cn2t.js")],
        input="".join(gb).encode("utf-8"), capture_output=True, check=True,
    )
    return set(res.stdout.decode("utf-8")) | set(gb)


def site_text():
    chars = set()
    for name in ("data.json", "wiki.json"):
        with open(os.path.join(ROOT, "lang-v10", "zh-tw", name), encoding="utf-8") as f:
            chars |= set("".join(json.load(f).values()))
    return chars


def build(src, dst, text):
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    font = subset.load_font(src, opts)
    sub = subset.Subsetter(opts)
    sub.populate(text="".join(text))
    sub.subset(font)
    subset.save_font(font, dst, opts)
    print(f"{os.path.relpath(dst, ROOT)}: {os.path.getsize(dst) / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__ or "usage: subset-fonts.py <LXGWWenKaiTC-Regular.ttf> <Huninn-Regular.ttf>")
    ascii_punct = {chr(c) for c in range(0x20, 0x7F)}
    cjk_punct = set("，。、；：？！「」『』（）《》〈〉【】—…‧·～“”‘’　％＋－／＝＜＞")
    text = big5_common() | gb2312_as_traditional() | site_text() | ascii_punct | cjk_punct
    print(f"{len(text)} characters")
    build(sys.argv[1], os.path.join(OUT, "lxgwwenkaitc-zhtw.woff2"), text)
    build(sys.argv[2], os.path.join(OUT, "huninn-zhtw.woff2"), text)