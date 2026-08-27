import fitz
import sys
import os

pdf_path = sys.argv[1]
output_dir = sys.argv[2]
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
for page_num in range(len(doc)):
    page = doc.load_page(page_num)
    pix = page.get_pixmap(dpi=150)
    output_path = os.path.join(output_dir, f"page_{page_num + 1}.png")
    pix.save(output_path)
    print(f"Saved {output_path}")
