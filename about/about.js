const menuBtn = document.querySelector('.menu-btn');
const sideMenu = document.querySelector('.side-menu');
const nav = document.querySelector('.nav');
const closeBtn = document.querySelector('.side-close');
const scrollTop = document.querySelector('.scroll-top');

function closeMenu() {
  sideMenu?.classList.remove('open');
  nav?.classList.remove('hidden');
}

menuBtn?.addEventListener('click', () => {
  sideMenu?.classList.toggle('open');
  nav?.classList.toggle('hidden');
});

closeBtn?.addEventListener('click', closeMenu);

document.addEventListener('click', (event) => {
  if (!sideMenu || !menuBtn) {
    return;
  }

  if (!sideMenu.contains(event.target) && !menuBtn.contains(event.target)) {
    closeMenu();
  }
});

window.addEventListener('scroll', () => {
  if (!scrollTop) {
    return;
  }

  scrollTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
});

scrollTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* =========================================================
   ABOUT PAGE
   ========================================================= */

/* ---------- Timeline scroll fill ---------- */
(() => {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    const fill = timeline.querySelector('.timeline-line-fill');
    const items = [...timeline.querySelectorAll('.item')];
    if (!fill || !items.length) return;

    let ticking = false;

    function update() {
        const rect = timeline.getBoundingClientRect();
        const trigger = window.innerHeight * 0.55;

        let progress = 1 - (rect.bottom - trigger) / (rect.height || 1);
        progress = Math.max(0, Math.min(1, progress));

        fill.style.width = (progress * 100) + '%';

        const fillEnd = progress * timeline.offsetWidth;
        items.forEach(item => {
            const dot = item.querySelector('.dot');
            if (!dot) return;
            const dotCenter = dot.offsetLeft + dot.offsetWidth / 2;
            item.classList.toggle('is-active', dotCenter <= fillEnd);
        });
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => { update(); ticking = false; });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
})();

/* ---------- Scroll-to-top button ---------- */
(() => {
    const btn = document.getElementById('scrollTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();