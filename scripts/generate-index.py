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
    {
        "id": "radiomaterials",
        "title": "Радиоматериалы",
        "subtitle": "Материалы и компоненты",
    },
    {
        "id": "electronics",
        "title": "Электроника",
        "subtitle": "Приборы и схемы",
    },
    {
        "id": "otc",
        "title": "ОТЦ",
        "subtitle": "Основы теории цепей",
    },
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

    OUT.write_text(json.dumps({"courses": courses}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
