// ============================================================
//  Логика сайта лекций: разделы → лекции → картинки + lightbox
// ============================================================

const SECTIONS = {
  'radio-materials': 'Радиоматериалы',
  'electronics': 'Электроника',
  'otc': 'ОТЦ'
};

const MAX_LECTURES = 50; // сколько номеров лекций проверяем

// ----- Утилиты -----
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function fileExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
    return res.ok;
  } catch {
    return false;
  }
}

// ============================================================
//  Страница раздела: section.html
// ============================================================
async function initSectionPage() {
  const section = getParam('section');
  const titleEl = document.getElementById('sectionTitle');
  const listEl  = document.getElementById('lecturesList');
  const emptyEl = document.getElementById('emptyMessage');

  if (!section || !SECTIONS[section]) {
    titleEl.textContent = 'Раздел не найден';
    emptyEl.style.display = 'block';
    return;
  }

  titleEl.textContent = SECTIONS[section];
  document.title = SECTIONS[section];

  // Проверяем все возможные номера лекций параллельно
  const checks = [];
  for (let i = 1; i <= MAX_LECTURES; i++) {
    checks.push(
      fileExists(`${section}/lecture-${i}/manifest.json`).then(ok => ok ? i : null)
    );
  }
  const results = await Promise.all(checks);
  const foundLectures = results.filter(n => n !== null).sort((a, b) => a - b);

  if (foundLectures.length === 0) {
    emptyEl.style.display = 'block';
    return;
  }

  foundLectures.forEach(num => {
    const a = document.createElement('a');
    a.className = 'lecture-item';
    a.href = `lecture.html?section=${encodeURIComponent(section)}&lecture=${num}`;
    a.textContent = `Лекция ${num}`;
    listEl.appendChild(a);
  });
}

// ============================================================
//  Страница лекции: lecture.html
// ============================================================
async function initLecturePage() {
  const section = getParam('section');
  const lecture = getParam('lecture');
  const titleEl = document.getElementById('lectureTitle');
  const backEl  = document.getElementById('backToSection');
  const imagesEl = document.getElementById('imagesList');

  if (!section || !lecture || !SECTIONS[section]) {
    titleEl.textContent = 'Лекция не найдена';
    return;
  }

  titleEl.textContent = `${SECTIONS[section]} — Лекция ${lecture}`;
  document.title = titleEl.textContent;
  backEl.href = `section.html?section=${encodeURIComponent(section)}`;

  // Загружаем manifest.json со списком картинок
  let images = [];
  try {
    const res = await fetch(`${section}/lecture-${lecture}/manifest.json`, { cache: 'no-cache' });
    if (res.ok) images = await res.json();
  } catch (e) {
    console.error('Не удалось загрузить manifest.json:', e);
  }

  if (!Array.isArray(images) || images.length === 0) {
    imagesEl.innerHTML = '<p class="empty-message">В этой лекции нет изображений.</p>';
    return;
  }

  const basePath = `${section}/lecture-${lecture}/`;

  images.forEach((filename, i) => {
    const img = document.createElement('img');
    img.src = basePath + filename;
    img.alt = `Страница ${i + 1}`;
    img.loading = 'lazy';
    img.dataset.index = i;
    img.addEventListener('click', () => openLightbox(i, images, basePath));
    imagesEl.appendChild(img);
  });
}

// ============================================================
//  Lightbox
// ============================================================
let lbState = { images: [], basePath: '', index: 0 };

function openLightbox(index, images, basePath) {
  lbState = { images, basePath, index };
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  img.src = basePath + images[index];
  lb.classList.add('active');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
}

function showNext(dir) {
  if (!lbState.images.length) return;
  lbState.index = (lbState.index + dir + lbState.images.length) % lbState.images.length;
  document.getElementById('lightboxImg').src = lbState.basePath + lbState.images[lbState.index];
}

// Навешиваем обработчики lightbox один раз после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  lb.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lightbox-prev').addEventListener('click', e => { e.stopPropagation(); showNext(-1); });
  lb.querySelector('.lightbox-next').addEventListener('click', e => { e.stopPropagation(); showNext(1); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showNext(-1);
    if (e.key === 'ArrowRight')  showNext(1);
  });
});
