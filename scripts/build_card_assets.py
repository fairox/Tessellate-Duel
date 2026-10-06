"""Build web-ready card assets from the master PNG plates.

For every card in public/cards/{id}_{front,back}.png this writes:
  public/cards/web/{id}_{front,back}.webp  - display copy (~1/10 the bytes)
  public/cards/foil/{id}.webp              - foil mask for the holo layer

The foil mask is the plate's ink: alpha = darkness of each pixel, so the
holographic foil only catches light on the drawn linework, the black stat
cells and the badge - like a foil-stamped print, not a sheen over paper.

Usage:  python3 scripts/build_card_assets.py
Re-run whenever a master PNG changes. Requires Pillow.
"""

from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
CARDS = ROOT / "public" / "cards"
WEB = CARDS / "web"
FOIL = CARDS / "foil"

DISPLAY_WIDTH = 900   # covers the inspect view at 2x DPR
MASK_WIDTH = 480      # foil is a soft light layer; it doesn't need full res


def resize(img: Image.Image, width: int) -> Image.Image:
    h = round(img.height * width / img.width)
    return img.resize((width, h), Image.LANCZOS)


def build_foil_mask(front: Image.Image) -> Image.Image:
    rgba = resize(front.convert("RGBA"), MASK_WIDTH)
    lum = rgba.convert("L")
    ink = ImageChops.invert(lum)                     # dark ink -> high value
    ink = ink.point(lambda v: 0 if v < 40 else min(255, int((v - 40) * 1.6)))
    ink = ink.filter(ImageFilter.GaussianBlur(0.6))  # soften stair-stepping
    ink = ImageChops.multiply(ink, rgba.getchannel("A"))  # respect die-cut corners
    out = Image.new("RGBA", rgba.size, (255, 255, 255, 0))
    out.putalpha(ink)
    return out


def main() -> None:
    WEB.mkdir(exist_ok=True)
    FOIL.mkdir(exist_ok=True)
    before = after = 0
    for png in sorted(CARDS.glob("*_*.png")):
        card_id, face = png.stem.split("_")
        img = Image.open(png)
        before += png.stat().st_size

        web_path = WEB / f"{card_id}_{face}.webp"
        resize(img.convert("RGBA"), DISPLAY_WIDTH).save(web_path, "WEBP", quality=82, method=4)
        after += web_path.stat().st_size

        if face == "front":
            mask_path = FOIL / f"{card_id}.webp"
            build_foil_mask(img).save(mask_path, "WEBP", quality=60, alpha_quality=60, method=4)
            after += mask_path.stat().st_size

    print(f"masters {before / 1e6:.1f} MB -> web assets {after / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
