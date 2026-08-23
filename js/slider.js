/* ==========================================================================
   سلايدر الهيرو التلقائي بالصور المحددة (1.webp -> 5.webp)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const sliderTrack = document.getElementById('heroSlider');
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');

  if (!sliderTrack) return;

  const slides = Array.from(sliderTrack.children);
  const totalSlides = slides.length;
  let currentIndex = 0;
  let autoplayTimer = null;

  // إنشاء النقاط التفاعلية (Dots)
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('slider-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function updateSliderUI() {
    sliderTrack.style.transform = `translateX(${currentIndex * 100}%)`;
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    if (currentIndex >= totalSlides) currentIndex = 0;
    if (currentIndex < 0) currentIndex = totalSlides - 1;
    updateSliderUI();
    resetAutoplay();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, 4000);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // أحداث الأزرار
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // إيقاف السلايدر عند التمرير بالماوس
  const sliderWrapper = sliderTrack.parentElement;
  if (sliderWrapper) {
    sliderWrapper.addEventListener('mouseenter', stopAutoplay);
    sliderWrapper.addEventListener('mouseleave', startAutoplay);
  }

  // دعم السحب على شاشات اللمس (Mobile Touch Swipe)
  let startX = 0;
  let endX = 0;

  sliderTrack.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  sliderTrack.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // سحب لليسار -> الشريحة التالية
        nextSlide();
      } else {
        // سحب لليمين -> الشريحة السابقة
        prevSlide();
      }
    }
  }, { passive: true });

  // بدء التدوير التلقائي
  startAutoplay();
});
