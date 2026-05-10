/* i18n is handled by ../shared/i18n.js which is loaded before this script */
/* nav/side-menu/footer/back-to-top are handled by ../shared/nav-footer.js  */

/* =========================================================
   🎞 HERO SLIDER
========================================================= */
const slides     = document.querySelectorAll('.hero-slide');
const sliderDots = document.querySelectorAll('#dots .dot');
let currentSlide = 0;
let slideTimer;

function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    sliderDots.forEach(d => d.classList.remove('active'));
    slides[index]?.classList.add('active');
    sliderDots[index]?.classList.add('active');
    currentSlide = index;
}

function startSlideshow() {
    clearInterval(slideTimer);
    slideTimer = setInterval(() => {
        if (slides.length > 0) showSlide((currentSlide + 1) % slides.length);
    }, 5000);
}

sliderDots.forEach((dot, i) => {
    dot.addEventListener('click', () => { showSlide(i); startSlideshow(); });
});

if (slides.length > 0) startSlideshow();


/* =========================================================
   🎬 VIDEO MODAL
========================================================= */
const videoModal   = document.getElementById('videoModal');
const tourVideo    = document.getElementById('tourVideo');
const playTrigger  = document.querySelector('.play-trigger');
const closeVideoBtn = document.querySelector('.video-modal-close');

function openVideo() {
    videoModal?.classList.add('open');
    tourVideo?.play();
    document.body.style.overflow = 'hidden';
}

function closeVideo() {
    videoModal?.classList.remove('open');
    if (tourVideo) { tourVideo.pause(); tourVideo.currentTime = 0; }
    document.body.style.overflow = '';
}

playTrigger?.addEventListener('click', openVideo);
closeVideoBtn?.addEventListener('click', closeVideo);
videoModal?.addEventListener('click', (e) => { if (e.target === videoModal) closeVideo(); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal?.classList.contains('open')) closeVideo();
});


/* =========================================================
   🔢 COUNTER ANIMATION (locale-aware)
========================================================= */
function formatNumber(n) {
    return n.toLocaleString(window.I18n?.lang === 'ar' ? 'ar-EG' : 'en-US');
}

function animateCount(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 2000;
    const startTime = performance.now();

    function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased    = 1 - (1 - progress) * (1 - progress);
        el.textContent = formatNumber(Math.floor(eased * target)) + suffix;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = formatNumber(target) + suffix;
    }
    requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) animateCount(entry.target);
        else entry.target.textContent = formatNumber(0);
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));

document.addEventListener('languagechange', () => {
    document.querySelectorAll('.stat-num[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        el.textContent = formatNumber(target) + suffix;
    });
});


