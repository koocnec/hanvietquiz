import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).parents[1]
LISTENING_SOURCE = Path(sys.argv[1])
ANSWER_SOURCE = Path(sys.argv[2])
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def paragraphs(path: Path):
    with zipfile.ZipFile(path) as archive:
        document = ET.fromstring(archive.read("word/document.xml"))
    return [
        "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()
        for paragraph in document.findall(".//w:p", NS)
    ]


listening_pages = {}
question_pages = {}
current_page = None
for text in paragraphs(LISTENING_SOURCE):
    marker = re.fullmatch(r"Trang PDF\s+0*(\d+)", text)
    if marker:
        current_page = int(marker.group(1))
        listening_pages[current_page] = []
        continue
    if not current_page or not text or text in {"Trang gốc (đối chiếu)", "Nội dung có thể chỉnh sửa (OCR text)"}:
        continue
    if re.search(r"제\s*37\s*회.*(?:듣기|한국어능력시험)", text, re.I):
        continue
    listening_pages[current_page].append(text)
    for match in re.finditer(r"(?:^|\s)([1-5]?\d)\.\s", text):
        question = int(match.group(1))
        if 1 <= question <= 50:
            question_pages.setdefault(question, current_page)

answer_sets = {"listening": {}, "reading": {}}
section = None
for text in paragraphs(ANSWER_SOURCE):
    if "영역: 듣기" in text:
        section = "listening"
    elif "영역: 읽기" in text:
        section = "reading"
    if not section:
        continue
    match = re.fullmatch(r"\s*(\d{1,2})\s*\|\s*([①②③④])\s*\|\s*(\d+)\s*", text)
    if match:
        answer_sets[section][int(match.group(1))] = "①②③④".index(match.group(2)) + 1

payload = {
    "source": LISTENING_SOURCE.name,
    "exam": 37,
    "section": "listening",
    "pages": {str(page): lines for page, lines in listening_pages.items()},
    "questionPages": {str(question): page for question, page in question_pages.items()},
}
listening_output = ROOT / "assets" / "topik37" / "topik37-listening-data.js"
answer_output = ROOT / "assets" / "topik37" / "topik37-answer-data.js"
listening_output.write_text("window.TOPIK37_LISTENING_DATA=" + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
answer_output.write_text("window.TOPIK37_ANSWER_DATA=" + json.dumps({k: [v.get(i) for i in range(1, 51)] for k, v in answer_sets.items()}, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
print(f"Listening: {len(listening_pages)} pages, {len(question_pages)} mapped questions")
print(f"Answers: listening={len(answer_sets['listening'])}, reading={len(answer_sets['reading'])}")
