---
layout: default
title: Раздел
permalink: /section.html
---

<a href="{{ '/' | relative_url }}" class="back-link">← На главную</a>

<h1 id="sectionTitle">Загрузка…</h1>

<div id="lecturesList" class="lectures-list"></div>

<p id="emptyMessage" class="empty-message" style="display:none;">
  Пока нет лекций. Добавьте папки вида <code>lecture-1</code> в этот раздел.
</p>

<script src="{{ '/assets/js/app.js' | relative_url }}"></script>
<script>
  initSectionPage();
</script>
