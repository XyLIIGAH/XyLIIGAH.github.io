# Лекции: радиоматериалы, электроника, ОТЦ

Статический сайт для GitHub Pages. Каждый предмет читает папки с картинками и превращает их в «Лекция 1», «Лекция 2» и так далее.

## Как добавить лекцию

1. Положите картинки в папку курса:

```text
lectures/radiomaterials/1/01.jpg
lectures/electronics/2/slide.png
lectures/otc/3/page-1.webp
```

Имя папки должно содержать номер лекции (`1`, `02`, `Лекция 4`). Поддерживаются `png`, `jpg`, `jpeg`, `webp`, `gif`, `svg`.

2. Обновите индекс (если смотрите сайт локально):

```powershell
node scripts/generate-index.mjs
npx --yes serve .
```

Откройте адрес, который покажет `serve` (обычно http://localhost:3000).

На GitHub Pages индекс собирается сам при каждом push в `main`.

## Публикация

1. Создайте репозиторий `lectures-site` на GitHub.
2. Залейте проект и включите **Settings → Pages → Source: GitHub Actions**.
3. Сайт будет по адресу `https://xyliigah.github.io/`.
