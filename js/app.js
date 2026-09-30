const COURSE_FALLBACK = [
  { id: "radiomaterials", title: "Радиоматериалы", subtitle: "Материалы и компоненты" },
  { id: "electronics", title: "Электроника", subtitle: "Приборы и схемы" },
  { id: "otc", title: "ОТЦ", subtitle: "Основы теории цепей" }
];

const LINK_FALLBACK = [
  {
    id: "electronics-book",
    title: "Книга по электронике",
    subtitle: "Учебное пособие А.А. Дурнакова",
    href: "https://XyLIIGAH.github.io/lectures/electronics/0/1.pdf",
    icon: "pdf"
  },
  {
    id: "mathkniga",
    title: "Книга по СГМ",
    subtitle: "Содержит несколько полезных тем из ДГМ",
    href: "https://XyLIIGAH.github.io/lectures/electronics/0/2.pdf",
    icon: "pdf"
  },
  {
    id: "resheb",
    title: "Задачник по ДГМ",
    subtitle: "Оттуда берёт задачи на практику И.А. Шестакова",
    href: "https://XyLIIGAH.github.io/lectures/electronics/0/3.pdf",
    icon: "pdf"
  },
  {
    id: "linux",
    title: "Книга 'Внутреннее устройство Linux'",
    subtitle: "Книга Д.В. Кетова, по ней составляет презентации препод по Linux (файл весом >100 МБ на сайт нельзя загрузить)",
    href: "https://vk.ru/wall-159224823_101056",
    icon: "link"
  },
  {
    id: "otc",
    title: "ГИПЕРМЕТОД",
    subtitle: "Содержит все материалы по ОТЦ",
    href: "https://learn.urfu.ru/subject/lessons/index/subject_id/2585",
    icon: "link"
  }
];

const app = document.getElementById("app");
let catalog = {
  courses: COURSE_FALLBACK.map((c) => ({ ...c, lectures: [] })),
  links: LINK_FALLBACK
};
let lightboxKeys = null;

/* ---------- Иконки ---------- */
const ICONS = {
  book: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5V4.5z"/>
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20"/>
      <line x1="9" y1="7" x2="16" y2="7"/>
      <line x1="9" y1="11" x2="16" y2="11"/>
    </svg>`,
  pdf: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/>
      <polyline points="14 2 14 7 19 7"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="15" y2="17"/>
    </svg>`,
  link: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/>
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/>
    </svg>`,
  arrow: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>`
};

function parseHash() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  return {
    courseId: parts[0] || null,
    lectureId: parts[1] || null,
    slide: parts[2] ? Number(parts[2]) : null
  };
}

function findCourse(id) {
  return catalog.courses.find((c) => c.id === id);
}

function findLecture(course, id) {
  return course?.lectures.find((l) => String(l.id) === String(id));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function render() {
  if (lightboxKeys) {
    window.removeEventListener("keydown", lightboxKeys);
    lightboxKeys = null;
  }
  const { courseId, lectureId, slide } = parseHash();
  const course = findCourse(courseId);
  const lecture = findLecture(course, lectureId);

  if (course && lecture) {
    app.innerHTML = lectureView(course, lecture);
    bindLightbox(course, lecture, Number.isFinite(slide) ? slide : 0);
    return;
  }
  if (course) {
    app.innerHTML = courseView(course);
    return;
  }
  app.innerHTML = homeView();
}

function homeView() {
  const links = catalog.links || [];
  return `
    <div class="wrap">
      <header class="topbar">
        <div class="brand">
          <small>Конспект лекций</small>
          <strong>Радиотехнические дисциплины</strong>
        </div>
      </header>
      <section class="hero">
        <h1>Выберите предмет</h1>
        <p class="lead">
          Откройте курс, найдите нужную лекцию и листайте слайды.
          Нажмите на картинку, чтобы увеличить её на весь экран.
        </p>
      </section>

      <h2 class="section-title">
        <span class="section-icon">${ICONS.book}</span>
        Конспекты лекций
      </h2>
      <div class="grid">
        ${catalog.courses.map((course, i) => `
          <a class="card" href="#/${escapeHtml(course.id)}">
            <div class="kicker">Курс ${i + 1}</div>
            <h3>${escapeHtml(course.title)}</h3>
            <p>${escapeHtml(course.subtitle || "")}</p>
            <p class="meta" style="margin-top:14px">
              ${course.lectures.length} ${plural(course.lectures.length, "лекция", "лекции", "лекций")}
            </p>
          </a>
        `).join("")}
      </div>

      ${links.length ? `
        <h2 class="section-title">
          <span class="section-icon">${ICONS.link}</span>
          Полезные ссылки
        </h2>
        <div class="links">
          ${links.map((link) => linkCard(link)).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function linkCard(link) {
  const iconKey = link.icon && ICONS[link.icon] ? link.icon : "link";
  return `
    <a class="link-card" href="${escapeHtml(link.href)}"
       target="_blank" rel="noopener">
      <div class="link-icon" aria-hidden="true">${ICONS[iconKey]}</div>
      <div class="link-text">
        <h3>${escapeHtml(link.title)}</h3>
        <p>${escapeHtml(link.subtitle || "")}</p>
      </div>
      <div class="link-arrow" aria-hidden="true">${ICONS.arrow}</div>
    </a>
  `;
}

function courseView(course) {
  const lectures = [...course.lectures].sort((a, b) => Number(a.id) - Number(b.id));
  return `
    <div class="wrap">
      <header class="topbar">
        <div class="brand">
          <small>${escapeHtml(course.subtitle || "Курс")}</small>
          <strong>${escapeHtml(course.title)}</strong>
        </div>
        <a class="crumb" href="#/">Все предметы</a>
      </header>
      <section class="page-head">
        <h1>Лекции</h1>
        <p class="lead">Папки с картинками внутри курса автоматически становятся лекциями.</p>
      </section>
      ${lectures.length ? `
        <div class="lectures">
          ${lectures.map((lecture) => `
            <a class="card lecture-card" href="#/${escapeHtml(course.id)}/${escapeHtml(lecture.id)}">
              <div class="num">${escapeHtml(lecture.id)}</div>
              <h2 style="margin:0;font-size:20px">${escapeHtml(lecture.title)}</h2>
              <p>${lecture.images.length} ${plural(lecture.images.length, "слайд", "слайда", "слайдов")}</p>
            </a>
          `).join("")}
        </div>
      ` : `
        <div class="empty">Пока нет лекций. Добавьте папки с картинками в <code>lectures/${escapeHtml(course.id)}/</code> и обновите индекс.</div>
      `}
    </div>
  `;
}

function lectureView(course, lecture) {
  return `
    <div class="wrap">
      <header class="topbar">
        <div class="brand">
          <small>${escapeHtml(course.title)}</small>
          <strong>${escapeHtml(lecture.title)}</strong>
        </div>
        <a class="crumb" href="#/${escapeHtml(course.id)}">К списку лекций</a>
      </header>
      <div class="viewer-head">
        <p class="lead" style="margin:0">
          ${lecture.images.length} ${plural(lecture.images.length, "картинка", "картинки", "картинок")}.
          Листайте вниз или откройте на весь экран и переключайте стрелками.
        </p>
      </div>
      <div class="slides">
        ${lecture.images.map((src, index) => `
          <figure class="slide">
            <button type="button" data-open="${index}" aria-label="Открыть слайд ${index + 1}">
              <img src="${escapeHtml(src)}" alt="${escapeHtml(lecture.title)} — слайд ${index + 1}" loading="lazy">
            </button>
            <figcaption>
              <span>Слайд ${index + 1}</span>
              <span>Нажмите, чтобы увеличить</span>
            </figcaption>
          </figure>
        `).join("")}
      </div>
    </div>
    <div class="lightbox" hidden>
      <div class="lb-top">
        <span id="lb-title"></span>
        <button class="icon-btn" type="button" data-close>Закрыть</button>
      </div>
      <div class="lb-stage">
        <img id="lb-image" alt="">
      </div>
      <div class="lb-bottom">
        <button class="icon-btn" type="button" data-prev>←</button>
        <span class="hint" id="lb-counter"></span>
        <button class="icon-btn" type="button" data-next>→</button>
      </div>
    </div>
  `;
}

function bindLightbox(course, lecture, startIndex) {
  const box = app.querySelector(".lightbox");
  const image = app.querySelector("#lb-image");
  const title = app.querySelector("#lb-title");
  const counter = app.querySelector("#lb-counter");
  let index = 0;
  let startX = 0;

  const show = (nextIndex) => {
    index = (nextIndex + lecture.images.length) % lecture.images.length;
    image.src = lecture.images[index];
    image.alt = `${lecture.title} — слайд ${index + 1}`;
    title.textContent = `${lecture.title} · слайд ${index + 1}`;
    counter.textContent = `${index + 1} / ${lecture.images.length}`;
    history.replaceState(null, "", `#/${course.id}/${lecture.id}/${index + 1}`);
  };

  const open = (nextIndex) => {
    box.hidden = false;
    show(nextIndex);
  };

  const close = () => {
    box.hidden = true;
    history.replaceState(null, "", `#/${course.id}/${lecture.id}`);
  };

  app.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => open(Number(btn.dataset.open)));
  });
  box.querySelector("[data-close]").addEventListener("click", close);
  box.querySelector("[data-prev]").addEventListener("click", () => show(index - 1));
  box.querySelector("[data-next]").addEventListener("click", () => show(index + 1));
  box.addEventListener("click", (event) => {
    if (event.target === box || event.target.classList.contains("lb-stage")) close();
  });

  function onKey(event) {
    if (box.hidden) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  }
  lightboxKeys = onKey;
  window.addEventListener("keydown", onKey);

  image.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
  });
  image.addEventListener("pointerup", (event) => {
    const dx = event.clientX - startX;
    if (dx > 50) show(index - 1);
    if (dx < -50) show(index + 1);
  });

  if (startIndex > 0 && startIndex <= lecture.images.length) {
    open(startIndex - 1);
  }
}

function plural(n, one, few, many) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}

async function boot() {
  try {
    const res = await fetch("lectures.json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      catalog = {
        courses: data.courses || [],
        links: data.links || []
      };
    }
  } catch {
    // file:// или отсутствующий index — оставляем fallback
  }
  render();
  addEventListener("hashchange", render);
}

boot();