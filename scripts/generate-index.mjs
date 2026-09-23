import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LECTURES = path.join(ROOT, "lectures");
const OUT = path.join(ROOT, "lectures.json");
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif", ".bmp"]);

const COURSES = [
  { id: "radiomaterials", title: "Радиоматериалы", subtitle: "Материалы и компоненты" },
  { id: "electronics", title: "Электроника", subtitle: "Приборы и схемы" },
  { id: "otc", title: "ОТЦ", subtitle: "Основы теории цепей" }
];

function naturalKey(value) {
  return value.split(/(\d+)/).map((part) => (part === "" || Number.isNaN(Number(part)) ? part.toLowerCase() : Number(part)));
}

function cmp(a, b) {
  const ka = naturalKey(a);
  const kb = naturalKey(b);
  for (let i = 0; i < Math.max(ka.length, kb.length); i += 1) {
    if (ka[i] === kb[i]) continue;
    if (ka[i] === undefined) return -1;
    if (kb[i] === undefined) return 1;
    if (ka[i] < kb[i]) return -1;
    if (ka[i] > kb[i]) return 1;
  }
  return 0;
}

function lectureId(folderName, index) {
  const match = folderName.match(/\d+/);
  if (!match) return String(index + 1);
  return String(Number(match[0]));
}

function collectImages(folder) {
  return fs.readdirSync(folder)
    .filter((name) => !name.startsWith("."))
    .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()))
    .filter((name) => fs.statSync(path.join(folder, name)).isFile())
    .sort(cmp)
    .map((name) => path.relative(ROOT, path.join(folder, name)).split(path.sep).join("/"));
}

const courses = COURSES.map((meta) => {
  const courseDir = path.join(LECTURES, meta.id);
  fs.mkdirSync(courseDir, { recursive: true });
  const folders = fs.readdirSync(courseDir)
    .map((name) => ({ name, full: path.join(courseDir, name) }))
    .filter((item) => !item.name.startsWith(".") && fs.statSync(item.full).isDirectory())
    .sort((a, b) => cmp(a.name, b.name));

  const lectures = folders.map((folder, index) => {
    const images = collectImages(folder.full);
    const id = lectureId(folder.name, index);
    return images.length ? { id, title: `Лекция ${id}`, folder: folder.name, images } : null;
  }).filter(Boolean);

  lectures.sort((a, b) => Number(a.id) - Number(b.id));
  return { ...meta, lectures };
});

fs.writeFileSync(OUT, JSON.stringify({ courses }, null, 2), "utf8");
console.log(`Wrote ${OUT}`);
