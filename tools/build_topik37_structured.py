import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


SOURCE = Path(sys.argv[1])
ROOT = Path(__file__).parents[1]
OUTPUT = ROOT / "assets" / "topik37" / "topik37-structured-data.js"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


with zipfile.ZipFile(SOURCE) as archive:
    document = ET.fromstring(archive.read("word/document.xml"))
paragraphs = [
    "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()
    for paragraph in document.findall(".//w:p", NS)
]

reading_start = next(i for i, text in enumerate(paragraphs) if text.startswith("[2교시] 읽기")) + 1
lines = [text for text in paragraphs[reading_start:] if text]
questions = []
instruction = ""
context_buffer = []
group_context = []
current = None


def split_options(text):
    markers = list(re.finditer(r"([①②③④])\s*", text))
    if not markers:
        return text.strip(), []
    prompt = text[: markers[0].start()].strip()
    options = []
    for index, marker in enumerate(markers):
        end = markers[index + 1].start() if index + 1 < len(markers) else len(text)
        options.append(text[marker.end() : end].strip())
    return prompt, options


def finish_current():
    global current
    if not current:
        return
    current["prompt"] = current["prompt"].strip()
    questions.append(current)
    current = None


for line in lines:
    if line.startswith("※"):
        finish_current()
        instruction = line
        context_buffer = []
        group_context = []
        continue
    match = re.match(r"^(\d{1,2})\.\s*(.*)$", line)
    if match:
        finish_current()
        number = int(match.group(1))
        if not group_context:
            group_context = list(context_buffer)
        context_buffer = []
        prompt, options = split_options(match.group(2))
        current = {
            "number": number,
            "instruction": instruction,
            "context": list(group_context),
            "prompt": prompt,
            "options": options,
        }
        continue
    if current:
        prompt_part, options = split_options(line)
        if options:
            if prompt_part:
                current["prompt"] += ("\n" if current["prompt"] else "") + prompt_part
            current["options"] = options
        else:
            current["prompt"] += ("\n" if current["prompt"] else "") + line
    else:
        context_buffer.append(line)

finish_current()

underline = {
    3: {"prompt": ["나온 탓에"]},
    4: {"prompt": ["모르는 척했다"]},
    23: {"context": ["순간 머리를 한 대 얻어맞은 것 같았다"]},
    50: {"context": ["그것은 자칫 다름을 철저히 배격함으로써 지구촌 차원의 불행을 야기할 수도 있다"]},
}
for question in questions:
    question["underline"] = underline.get(question["number"], {})
    if question["number"] in {48, 49, 50} and question["context"]:
        duplicate = "그것은 자칫 다름을 철저히 배격함으로써 지구촌 차원의 불행을 야기할 수도 있다."
        question["context"] = [text.replace(f"{duplicate} {duplicate}", duplicate) for text in question["context"]]

payload = {"source": SOURCE.name, "exam": 37, "reading": questions}
OUTPUT.write_text(
    "window.TOPIK37_STRUCTURED_DATA=" + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n",
    encoding="utf-8",
)
print(f"Wrote {len(questions)} reading questions")
bad = [(q["number"], len(q["options"])) for q in questions if len(q["options"]) != 4]
print("Questions without four options:", bad)
