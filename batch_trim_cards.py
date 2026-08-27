import fitz
from PIL import Image, ImageDraw
import numpy as np
import os
import glob
import re

def extract_card_path(page, n_bezier_pts=150):
    """
    Extract the exact mathematical boundary curve (lines + cubic Bézier curves)
    from the PDF vector drawing elements where the grey trimming element interfaces with the white card.
    """
    drawings = page.get_drawings()
    # Drawing 1 is the white card background path with rounded corners
    card_drawing = drawings[1] if len(drawings) > 1 else drawings[0]
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

def process_all_cards(pdf_dir, output_dir, dpi=300):
    os.makedirs(output_dir, exist_ok=True)
    pdf_files = glob.glob(os.path.join(pdf_dir, '*.pdf'))
    scale = dpi / 72.0
    
    print(f"Starting batch trim for {len(pdf_files)} PDF files at {dpi} DPI...")
    
    for pdf_path in sorted(pdf_files):
        basename = os.path.basename(pdf_path)
        match = re.search(r'Block_(\d+)', basename)
        if not match:
            print(f"Skipping {basename} (no Block_XX match)")
            continue
            
        card_id = int(match.group(1))
        doc = fitz.open(pdf_path)
        
        # Process Page 0 (Front)
        if len(doc) >= 1:
            page = doc.load_page(0)
            poly_pts, card_rect = extract_card_path(page)
            
            pix_full = page.get_pixmap(dpi=dpi)
            img_full = Image.frombytes('RGB', [pix_full.width, pix_full.height], pix_full.samples)
            
            crop_x0 = int(round(card_rect.x0 * scale))
            crop_y0 = int(round(card_rect.y0 * scale))
            crop_x1 = int(round(card_rect.x1 * scale))
            crop_y1 = int(round(card_rect.y1 * scale))
            
            img_cropped = img_full.crop((crop_x0, crop_y0, crop_x1, crop_y1))
            w, h = img_cropped.size
            
            # 4x Supersampled anti-aliased mask
            ss = 4
            mask = Image.new('L', (w * ss, h * ss), 0)
            draw = ImageDraw.Draw(mask)
            poly_shifted = (poly_pts - np.array([card_rect.x0, card_rect.y0])) * scale * ss
            poly_tuples = [tuple(p) for p in poly_shifted]
            draw.polygon(poly_tuples, fill=255)
            mask_final = mask.resize((w, h), Image.Resampling.LANCZOS)
            
            img_diecut = img_cropped.convert('RGBA')
            img_diecut.putalpha(mask_final)
            
            out_front = os.path.join(output_dir, f"{card_id}_front.png")
            img_diecut.save(out_front, 'PNG')
            
        # Process Page 1 (Back)
        if len(doc) >= 2:
            page = doc.load_page(1)
            poly_pts, card_rect = extract_card_path(page)
            
            pix_full = page.get_pixmap(dpi=dpi)
            img_full = Image.frombytes('RGB', [pix_full.width, pix_full.height], pix_full.samples)
            
            crop_x0 = int(round(card_rect.x0 * scale))
            crop_y0 = int(round(card_rect.y0 * scale))
            crop_x1 = int(round(card_rect.x1 * scale))
            crop_y1 = int(round(card_rect.y1 * scale))
            
            img_cropped = img_full.crop((crop_x0, crop_y0, crop_x1, crop_y1))
            w, h = img_cropped.size
            
            ss = 4
            mask = Image.new('L', (w * ss, h * ss), 0)
            draw = ImageDraw.Draw(mask)
            poly_shifted = (poly_pts - np.array([card_rect.x0, card_rect.y0])) * scale * ss
            poly_tuples = [tuple(p) for p in poly_shifted]
            draw.polygon(poly_tuples, fill=255)
            mask_final = mask.resize((w, h), Image.Resampling.LANCZOS)
            
            img_diecut = img_cropped.convert('RGBA')
            img_diecut.putalpha(mask_final)
            
            out_back = os.path.join(output_dir, f"{card_id}_back.png")
            img_diecut.save(out_back, 'PNG')
            
        print(f"Trimmed Block {card_id:02d}: {basename} -> {card_id}_front.png, {card_id}_back.png")

    print("\nAll 40 cards successfully trimmed to the exact white area!")

if __name__ == '__main__':
    pdf_directory = r'c:\Users\mokhe\Desktop\DXT_TOP_TRUMPS\Lesotho_Mokhethi Rampeta_CARDS_LIGHT'
    out_directory = r'c:\Users\mokhe\Desktop\DXT_TOP_TRUMPS\tessellate-duel\public\cards'
    process_all_cards(pdf_directory, out_directory, dpi=300)
