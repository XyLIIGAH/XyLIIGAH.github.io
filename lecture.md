---
layout: default
title: Лекция
permalink: /lecture.html
---

<a href="#" id="backToSection" class="back-link">← К разделу</a>

<h1 id="lectureTitle">Лекция</h1>

<div id="imagesList" class="images-list"></div>

<!-- Модальное окно для увеличения картинок -->
<div id="lightbox" class="lightbox">
  <span class="lightbox-close">&times;</span>
  <span class="lightbox-prev">&#10094;</span>
  <img id="lightboxImg" src="" alt="">
  <span class="lightbox-next">&#10095;</span>
</div>

<script src="{{ '/assets/js/app.js' | relative_url }}"></script>
<script>
  initLecturePage();
</script>
