const COURSE_FALLBACK = [
  { id: "radiomaterials", title: "Радиоматериалы", subtitle: "Материалы и компоненты" },
  { id: "electronics", title: "Электроника", subtitle: "Приборы и схемы" },
  { id: "otc", title: "ОТЦ", subtitle: "Основы теории цепей" }
];

const app = document.getElementById("app");
let catalog = { courses: COURSE_FALLBACK.map((c) => ({ ...c, lectures: [] })) };
let lightboxKeys = null;

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
        <p class="lead">Откройте курс, найдите нужную лекцию и листайте слайды. Нажмите на картинку, чтобы увеличить её на весь экран.</p>
      </section>
      <div class="grid">
        ${catalog.courses.map((course, i) => `
          <a class="card" href="#/${escapeHtml(course.id)}">
            <div class="kicker">Курс ${i + 1}</div>
            <h2>${escapeHtml(course.title)}</h2>
            <p>${escapeHtml(course.subtitle || "")}</p>
            <p class="meta" style="margin-top:14px">${course.lectures.length} ${plural(course.lectures.length, "лекция", "лекции", "лекций")}</p>
          </a>
        `).join("")}
      </div>
    </div>
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
        <p class="lead" style="margin:0">${lecture.images.length} ${plural(lecture.images.length, "картинка", "картинки", "картинок")}. Листайте вниз или откройте на весь экран и переключайте стрелками.</p>
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
    if (res.ok) catalog = await res.json();
  } catch {
    // file:// or missing index: keep empty course cards
  }
  render();
  addEventListener("hashchange", render);
}

boot();
