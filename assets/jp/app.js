const SECTIONS = {
    'radio-materials': 'Радиоматериалы',
    'electronics': 'Электроника',
    'otc': 'ОТЦ'
};

const BASE_URL = ''; // Для GitHub Pages с кастомным доменом или корнем

function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

async function initSectionPage() {
    // ... (код без изменений, но с учётом BASE_URL если нужен префикс)
    // Пример запроса:
    const res = await fetch(`${section}/lecture-${num}/manifest.json`, { method: 'HEAD' });
}

async function initLecturePage() {
    // ... код без изменений
    const res = await fetch(`${section}/lecture-${lecture}/manifest.json`);
    // ...
}
