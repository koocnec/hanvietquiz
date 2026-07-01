import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(r"D:\tải xuống\TOPIK37_B_text_theo_template.docx")
ROOT = Path(__file__).parents[1]
OUTPUT = ROOT / "assets" / "topik37" / "topik37-reading-data.js"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def clean_line(value: str) -> str:
    value = value.strip()
    value = re.sub(r"\s+([,.?!:;)])", r"\1", value)
    value = re.sub(r"([(])\s+", r"\1", value)
    value = re.sub(r"\s{2,}", " ", value)
    replacements = {
        "0)": "①", "1)": "①", "@)": "②", "@": "②", "(3)": "③",
        "(@)": "③", "4)": "④", "®": "①",
    }
    for old, new in replacements.items():
        if value.startswith(old):
            value = new + value[len(old):]
            break
    return value.strip()


with zipfile.ZipFile(SOURCE) as archive:
    document = ET.fromstring(archive.read("word/document.xml"))
    paragraphs = [
        "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()
        for paragraph in document.findall(".//w:p", NS)
    ]

pages = {}
current_page = None
for paragraph in paragraphs:
    marker = re.fullmatch(r"Trang PDF\s+(\d+)", paragraph)
    if marker:
        page_number = int(marker.group(1))
        current_page = page_number if 20 <= page_number <= 40 else None
        if current_page:
            pages[current_page] = []
        continue
    if current_page is None or not paragraph:
        continue
    if paragraph in {"Trang gốc (đối chiếu)", "Nội dung có thể chỉnh sửa (OCR text)"}:
        continue
    cleaned = clean_line(paragraph)
    if not cleaned or re.search(r"제\s*37\s*회.*2\s*교\s*시", cleaned, re.I):
        continue
    if cleaned == str(current_page - 19):
        continue
    pages[current_page].append(cleaned)

payload = {
    "source": SOURCE.name,
    "exam": 37,
    "section": "reading",
    "pages": {str(page): lines for page, lines in pages.items()},
}
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(
    "window.TOPIK37_READING_DATA=" + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n",
    encoding="utf-8",
)
print(f"Wrote {OUTPUT} with {len(pages)} pages and {sum(map(len, pages.values()))} lines")
