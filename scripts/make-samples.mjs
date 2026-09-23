import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const slides = {
  radiomaterials: {
    1: [
      ["Диэлектрики", "Классификация радиоматериалов", "Проводники · Полупроводники · Диэлектрики · Магнетики"],
      ["Удельное сопротивление", "ρ = R · S / l", "Для меди ρ ≈ 1,72·10⁻⁸ Ом·м"]
    ],
    2: [
      ["Магнетики", "μ = B / (μ₀ H)", "Диа-, пара- и ферромагнетики"]
    ]
  },
  electronics: {
    1: [
      ["p-n переход", "Диод и вольт-амперная характеристика", "Прямое и обратное смещение"],
      ["Биполярный транзистор", "Режимы: отсечка, активный, насыщение", "n-p-n и p-n-p"]
    ],
    2: [
      ["ОУ", "Идеальный операционный усилитель", "Бесконечный коэффициент усиления"]
    ]
  },
  otc: {
    1: [
      ["Закон Ома", "U = I · R", "Для участка цепи без ЭДС"],
      ["Законы Кирхгофа", "ΣI = 0,  ΣE = ΣIR", "Узлы и контуры"]
    ],
    2: [
      ["R, L, C", "Сопротивления элементов", "Z_R = R,  Z_L = jωL,  Z_C = 1/(jωC)"],
      ["Резонанс", "ω₀ = 1 / √(LC)", "Последовательный и параллельный контуры"]
    ]
  }
};

function svg(title, heading, note, k, n) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="#101826"/>
  <rect x="48" y="48" width="1504" height="804" rx="28" fill="#182234" stroke="#2a3b55"/>
  <text x="96" y="130" fill="#f0b429" font-family="Segoe UI, Arial" font-size="28" font-weight="700">${title}</text>
  <text x="96" y="230" fill="#eef3fb" font-family="Segoe UI, Arial" font-size="64" font-weight="800">${heading}</text>
  <text x="96" y="330" fill="#9fb0c9" font-family="Segoe UI, Arial" font-size="36">${note}</text>
  <text x="96" y="800" fill="#6f7f96" font-family="Segoe UI, Arial" font-size="24">Слайд ${k} из ${n} · пример, замените своими картинками</text>
</svg>`;
}

for (const [course, lectures] of Object.entries(slides)) {
  for (const [lecture, pages] of Object.entries(lectures)) {
    const dir = path.join(ROOT, "lectures", course, lecture);
    fs.mkdirSync(dir, { recursive: true });
    pages.forEach((page, index) => {
      const file = path.join(dir, `${String(index + 1).padStart(2, "0")}.svg`);
      fs.writeFileSync(file, svg(`Лекция ${lecture}`, page[0], `${page[1]}  ·  ${page[2]}`, index + 1, pages.length), "utf8");
    });
  }
}

console.log("Sample slides written");
