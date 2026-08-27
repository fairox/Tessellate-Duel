import fitz
from PIL import Image, ImageDraw
import numpy as np
import os
import sys

def extract_card_path(page, n_bezier_pts=150):
    """
    Extract the exact mathematical boundary curve (lines + cubic Bézier curves)
    from the PDF vector drawing elements where the grey trimming element interfaces with the card.
    """
    drawings = page.get_drawings()
    card_drawing = drawings[1]
    items = card_drawing['items']
    
    polygon = []
    for item in items:
        cmd = item[0]
        if cmd == 'l':
            p1, p2 = item[1], item[2]
            polygon.append([p1.x, p1.y])
            polygon.append([p2.x, p2.y])
        elif cmd == 'c':
            p0, p1, p2, p3 = item[1], item[2], item[3], item[4]
            t = np.linspace(0, 1, n_bezier_pts)[:, None]
            p0_arr = np.array([p0.x, p0.y])
            p1_arr = np.array([p1.x, p1.y])
            p2_arr = np.array([p2.x, p2.y])
            p3_arr = np.array([p3.x, p3.y])
            b_pts = ((1-t)**3 * p0_arr + 3*(1-t)**2 * t * p1_arr + 3*(1-t) * t**2 * p2_arr + t**3 * p3_arr)
            for pt in b_pts:
                polygon.append([pt[0], pt[1]])
                
    return np.array(polygon), card_drawing['rect']

def trim_card_pdf(pdf_path, output_dir, dpi=300):
    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    scale = dpi / 72.0

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        name = 'front' if page_num == 0 else 'back'
        
        poly_pts, card_rect = extract_card_path(page)
        
        # Render high-resolution page
        pix_full = page.get_pixmap(dpi=dpi)
        img_full = Image.frombytes('RGB', [pix_full.width, pix_full.height], pix_full.samples)
        
        crop_x0 = int(round(card_rect.x0 * scale))
        crop_y0 = int(round(card_rect.y0 * scale))
        crop_x1 = int(round(card_rect.x1 * scale))
        crop_y1 = int(round(card_rect.y1 * scale))
        
        img_cropped = img_full.crop((crop_x0, crop_y0, crop_x1, crop_y1))
        w, h = img_cropped.size
        
        # 4x Supersampling for ultra-smooth anti-aliasing
        ss = 4
        mask_w, mask_h = w * ss, h * ss
        mask = Image.new('L', (mask_w, mask_h), 0)
        draw = ImageDraw.Draw(mask)
        
        # Translate polygon points relative to crop origin
        poly_shifted = (poly_pts - np.array([card_rect.x0, card_rect.y0])) * scale * ss
        poly_tuples = [tuple(p) for p in poly_shifted]
        
        draw.polygon(poly_tuples, fill=255)
        
        mask_final = mask.resize((w, h), Image.Resampling.LANCZOS)
        
        img_diecut = img_cropped.convert('RGBA')
        img_diecut.putalpha(mask_final)
        
        # Save die-cut PNG with exact transparent vector curves
        diecut_path = os.path.join(output_dir, f'test_{name}.png')
        img_diecut.save(diecut_path, 'PNG')
        
        # Save rectangular cropped version
        crop_path = os.path.join(output_dir, f'test_{name}_rect.png')
        img_cropped.save(crop_path, 'PNG')
        
        print(f"Saved: {diecut_path} ({w}x{h} px)")

if __name__ == '__main__':
    default_pdf = r'c:\Users\mokhe\Desktop\DXT_TOP_TRUMPS\Lesotho_Mokhethi Rampeta_CARDS_LIGHT\Lesotho_Mokhethi Rampeta_Block_01_Curved_Furrows_LIGHT.pdf'
    pdf = sys.argv[1] if len(sys.argv) > 1 else default_pdf
    out = sys.argv[2] if len(sys.argv) > 2 else r'c:\Users\mokhe\Desktop\DXT_TOP_TRUMPS\test'
    trim_card_pdf(pdf, out)
