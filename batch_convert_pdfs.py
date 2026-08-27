import fitz
import sys
import os
import re
import glob

pdf_dir = sys.argv[1]
output_dir = sys.argv[2]
os.makedirs(output_dir, exist_ok=True)

pdf_files = glob.glob(os.path.join(pdf_dir, "*.pdf"))

for pdf_path in pdf_files:
    basename = os.path.basename(pdf_path)
    match = re.search(r'Block_(\d+)', basename)
    if not match:
        print(f"Skipping {basename} - no Block_XX found")
        continue
    
    card_id = int(match.group(1))
    
    doc = fitz.open(pdf_path)
    
    if len(doc) >= 1:
        page = doc.load_page(0)
        pix = page.get_pixmap(dpi=150)
        output_path = os.path.join(output_dir, f"{card_id}_front.png")
        pix.save(output_path)
    
    if len(doc) >= 2:
        page = doc.load_page(1)
        pix = page.get_pixmap(dpi=150)
        output_path = os.path.join(output_dir, f"{card_id}_back.png")
        pix.save(output_path)
        
    print(f"Processed {basename}")
