#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LECTURES = ROOT / "lectures"
OUT = ROOT / "lectures.json"
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif", ".bmp"}

COURSES = [
    {"id": "radiomaterials", "title": "Радиоматериалы", "subtitle": "Материалы и компоненты"},
    {"id": "electronics", "title": "Электроника", "subtitle": "Приборы и схемы"},
    {"id": "otc", "title": "ОТЦ", "subtitle": "Основы теории цепей"},
]

LINKS = [
    {
        "id": "electronics-book",
        "title": "Книга по электронике",
        "subtitle": "Учебное пособие А.А. Дурнакова по электронике",
        "href": "https://XyLIIGAH.github.io/lectures/electronics/0/1.pdf",
        "icon": "book",
    },
    {
    "id": "mathkniga",
    "title": "Книга по СГМ",
    "subtitle": "Содержит несколько полезных тем из ДГМ",
    "href": "https://XyLIIGAH.github.io/lectures/electronics/0/2.pdf",
    "icon": "pdf",
  },
  {
    "id": "resheb",
    "title": "Задачник по ДГМ",
    "subtitle": "Оттуда берёт задачи на практику И.А. Шестакова",
    "href": "https://XyLIIGAH.github.io/lectures/electronics/0/3.pdf",
    "icon": "pdf",
  },
   {
    "id": "electronicbaza",
    "title": "Примерный перечень вопросов к зачету по электронике",
    "subtitle": "Составлен на основе учебного пособия А.А. Дурнакова",
    "href": "https://XyLIIGAH.github.io/lectures/electronics/0/electronic.pdf",
    "icon": "pdf",
  },
  {
    "id": "radiobaza",
    "title": "Перечень вопросов к зачету по радиоматериалам",
    "subtitle": "Взят с курса на сайте elearn",
    "href": "https://XyLIIGAH.github.io/lectures/electronics/0/radio.pdf",
    "icon": "pdf",
  },
  {
    "id": "linux",
    "title": "Книга 'Внутреннее устройство Linux'",
    "subtitle": "Книга Д.В. Кетова, по ней составляет презентации препод по Linux (файл весом >100 МБ на сайт нельзя загрузить)",
    "href": "https://vk.ru/wall-159224823_101056",
    "icon": "link",
  },
  {
    "id": "otc",
    "title": "ГИПЕРМЕТОД",
    "subtitle": "Содержит все материалы по ОТЦ",
    "href": "https://learn.urfu.ru/subject/lessons/index/subject_id/2585",
    "icon": "link",
  }
]


def natural_key(value: str):
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", value)]


def lecture_id(folder_name: str, index: int) -> str:
    match = re.search(r"\d+", folder_name)
    return match.group(0).lstrip("0") or "0" if match else str(index + 1)


def collect_images(folder: Path) -> list[str]:
    files = [
        path
        for path in folder.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_EXT and not path.name.startswith(".")
    ]
    files.sort(key=lambda p: natural_key(p.name))
    return [p.relative_to(ROOT).as_posix() for p in files]


def main() -> None:
    courses = []
    for meta in COURSES:
        course_dir = LECTURES / meta["id"]
        course_dir.mkdir(parents=True, exist_ok=True)
        folders = [p for p in course_dir.iterdir() if p.is_dir() and not p.name.startswith(".")]
        folders.sort(key=lambda p: natural_key(p.name))
        lectures = []
        for index, folder in enumerate(folders):
            images = collect_images(folder)
            if not images:
                continue
            lid = lecture_id(folder.name, index)
            lectures.append(
                {
                    "id": lid,
                    "title": f"Лекция {lid}",
                    "folder": folder.name,
                    "images": images,
                }
            )
        lectures.sort(key=lambda item: int(item["id"]) if str(item["id"]).isdigit() else 10**9)
        courses.append({**meta, "lectures": lectures})

    OUT.write_text(
        json.dumps({"courses": courses, "links": LINKS}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()