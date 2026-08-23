/* ==========================================================================
   سلايدر آراء أولياء الأمور ورسائل التقييمات (Parents Reviews Slider & Lightbox)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reviewsTrack = document.getElementById('reviewsTrack');
  const reviewsDotsContainer = document.getElementById('reviewsDots');
  const reviewsPrevBtn = document.getElementById('reviewsPrev');
  const reviewsNextBtn = document.getElementById('reviewsNext');

  if (!reviewsTrack) return;

  const reviewCards = Array.from(reviewsTrack.children);
  let currentIndex = 0;
  let autoplayTimer = null;

  // معرفة عدد العناصر المعروضة بناءً على عُرض الشاشة
  function getVisibleCardsCount() {
    const width = window.innerWidth;
    if (width <= 768) return 1;
    if (width <= 1024) return 2;
    return 3;
  }

  function getMaxIndex() {
    const visible = getVisibleCardsCount();
    return Math.max(0, reviewCards.length - visible);
  }

  // إنشاء النقاط التفاعلية
  function createDots() {
    if (!reviewsDotsContainer) return;
    reviewsDotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();

    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      reviewsDotsContainer.appendChild(dot);
    }
  }

  function updateSliderPosition() {
    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) currentIndex = 0;
    if (currentIndex < 0) currentIndex = maxIdx;

    const visibleCount = getVisibleCardsCount();
    const slideWidthPercent = 100 / visibleCount;
    reviewsTrack.style.transform = `translateX(${currentIndex * slideWidthPercent}%)`;

    // تحديث النقاط النشطة
    if (reviewsDotsContainer) {
      const dots = Array.from(reviewsDotsContainer.children);
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
    autoplayTimer = setInterval(nextSlide, 3500);
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

  // أزرار السلايدر
  if (reviewsNextBtn) reviewsNextBtn.addEventListener('click', (e) => { e.preventDefault(); nextSlide(); resetAutoplay(); });
  if (reviewsPrevBtn) reviewsPrevBtn.addEventListener('click', (e) => { e.preventDefault(); prevSlide(); resetAutoplay(); });

  // توقف الحركة عند التمرير بالماوس
  const reviewsContainer = reviewsTrack.parentElement;
  if (reviewsContainer) {
    reviewsContainer.addEventListener('mouseenter', stopAutoplay);
    reviewsContainer.addEventListener('mouseleave', startAutoplay);
  }

  // دعم السحب باللمس على الجوال
  let startX = 0;
  reviewsTrack.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  reviewsTrack.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      resetAutoplay();
    }
  }, { passive: true });

  // ==========================================================================
  // نافذة معاينة الرأي الخفيفة الفورية (Zero-Lag Standalone Lightbox Modal)
  // ==========================================================================
  function openImageLightbox(imgSrc) {
    stopAutoplay();

    let lightbox = document.getElementById('globalImageLightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'globalImageLightbox';
      lightbox.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(4, 29, 56, 0.92);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 15px;
        box-sizing: border-box;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
      `;
      lightbox.innerHTML = `
        <div style="position: relative; max-width: 92vw; max-height: 90vh; display: flex; align-items: center; justify-content: center;">
          <button id="closeLightboxBtn" style="
            position: absolute;
            top: -16px; left: -16px;
            background: #ff6f00; color: #ffffff;
            border: 2px solid #ffffff;
            width: 42px; height: 42px;
            border-radius: 50%;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            z-index: 100000;
            line-height: 1;
          ">&times;</button>
          <img id="lightboxImage" src="" alt="رأي ولي أمر مكبر" style="
            max-width: 100%;
            max-height: 85vh;
            object-fit: contain;
            border-radius: 12px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.6);
            background: #ffffff;
            border: 3px solid #ffffff;
            display: block;
          ">
        </div>
      `;
      document.body.appendChild(lightbox);

      // أزرار الإغلاق
      const closeBtn = lightbox.querySelector('#closeLightboxBtn');
      if (closeBtn) {
        closeBtn.onclick = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          closeImageLightbox();
        };
      }

      lightbox.onclick = (ev) => {
        if (ev.target === lightbox) {
          closeImageLightbox();
        }
      };

      document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') {
          closeImageLightbox();
        }
      });
    }

    const imgEl = lightbox.querySelector('#lightboxImage');
    if (imgEl) imgEl.src = imgSrc;

    lightbox.style.display = 'flex';
    void lightbox.offsetWidth; // Force CSS Reflow
    lightbox.style.opacity = '1';
    document.body.style.overflow = 'hidden';
  }

  function closeImageLightbox() {
    const lightbox = document.getElementById('globalImageLightbox');
    if (lightbox) {
      lightbox.style.opacity = '0';
      setTimeout(() => {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        startAutoplay();
      }, 200);
    }
  }

  // ربط الأزرار والصور بفتح النافذة المباشرة
  document.querySelectorAll('.btn-zoom-review').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const imgSrc = btn.getAttribute('data-img-src');
      if (imgSrc) openImageLightbox(imgSrc);
    };
  });

  document.querySelectorAll('.review-img-wrap').forEach(wrap => {
    wrap.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const img = wrap.querySelector('img');
      if (img) openImageLightbox(img.getAttribute('src') || img.src);
    };
  });

  // إعادة الحساب عند تغيير حجم الشاشة
  window.addEventListener('resize', () => {
    createDots();
    updateSliderPosition();
  });

  // تصدير دالة المعاينة عالمياً
  window.openImageLightbox = openImageLightbox;

  // التهيئة وتفعيل الحركة التلقائية
  createDots();
  updateSliderPosition();
  startAutoplay();
});
