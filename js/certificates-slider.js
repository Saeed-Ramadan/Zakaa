/* ==========================================================================
   سلايدر شهادات الطلاب المتفوقين وخريجي منصة ذكاء (Certificates Auto Slider)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const certsTrack = document.getElementById('certsTrack');
  const certsDotsContainer = document.getElementById('certsDots');
  const certsPrevBtn = document.getElementById('certsPrev');
  const certsNextBtn = document.getElementById('certsNext');

  if (!certsTrack) return;

  const certCards = Array.from(certsTrack.children);
  let currentIndex = 0;
  let autoplayTimer = null;

  // تحديد عدد الشهادات المعروضة بناءً على حجم الشاشة
  function getVisibleCardsCount() {
    const width = window.innerWidth;
    if (width <= 768) return 1;
    if (width <= 1024) return 2;
    return 3;
  }

  function getMaxIndex() {
    const visible = getVisibleCardsCount();
    return Math.max(0, certCards.length - visible);
  }

  // توليد نقاط التنقل السفلية (Dots)
  function createDots() {
    if (!certsDotsContainer) return;
    certsDotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();

    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      certsDotsContainer.appendChild(dot);
    }
  }

  // تحريك مسار السلايدر
  function updateSliderPosition() {
    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) currentIndex = maxIdx;
    if (currentIndex < 0) currentIndex = 0;

    const visibleCount = getVisibleCardsCount();
    const slideWidthPercent = 100 / visibleCount;
    certsTrack.style.transform = `translateX(${currentIndex * slideWidthPercent}%)`;

    // تحديث حالة النقطة النشطة
    if (certsDotsContainer) {
      const dots = Array.from(certsDotsContainer.children);
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }
  }

  function goToSlide(index) {
    currentIndex = index;
    updateSliderPosition();
    resetAutoplay();
  }

  function nextSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex >= maxIdx) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateSliderPosition();
  }

  function prevSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex <= 0) {
      currentIndex = maxIdx;
    } else {
      currentIndex--;
    }
    updateSliderPosition();
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, 3800);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // أزرار التنقل (Next & Prev)
  if (certsNextBtn) {
    certsNextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextSlide();
      resetAutoplay();
    });
  }

  if (certsPrevBtn) {
    certsPrevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevSlide();
      resetAutoplay();
    });
  }

  // إيقاف التشغيل التلقائي عند مرور الماوس
  const certsWrapper = certsTrack.closest('.certificates-slider-container');
  if (certsWrapper) {
    certsWrapper.addEventListener('mouseenter', stopAutoplay);
    certsWrapper.addEventListener('mouseleave', startAutoplay);
  }

  // دعم السحب باللمس على شاشات الهواتف والأجهزة اللوحية
  let touchStartX = 0;
  certsTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  certsTrack.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      resetAutoplay();
    }
  }, { passive: true });

  // التكيف الفوري عند تغيير حجم الشاشة (Resize Handler)
  window.addEventListener('resize', () => {
    createDots();
    updateSliderPosition();
  });

  // تكبير الشهادة عند النقر (Lightbox Modal)
  document.querySelectorAll('.btn-zoom-cert, .cert-img-wrap').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const card = el.closest('.cert-card-item');
      if (!card) return;
      const img = card.querySelector('img');
      if (img && img.src) {
        if (typeof window.openImageLightbox === 'function') {
          window.openImageLightbox(img.src);
        } else {
          window.open(img.src, '_blank');
        }
      }
    });
  });

  // التهيئة الأولية
  createDots();
  updateSliderPosition();
  startAutoplay();
});
