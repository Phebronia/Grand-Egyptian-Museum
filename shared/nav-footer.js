/* =============================================================
   GEM — Shared Navbar + Footer injector
   Auto-detects root path from its own URL.
   Injects nav, side menu, footer, and back-to-top on every page.
============================================================= */
(function () {
    'use strict';

    /* ── Root path derived from this script's URL ── */
    const scriptSrc = (document.currentScript || {}).src || '';
    const root = scriptSrc ? scriptSrc.replace(/shared\/nav-footer\.js[^/]*$/, '') : '';

    /* ── Ensure Font Awesome is loaded ── */
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
        document.head.appendChild(fa);
    }

    /* ── Ensure Cinzel + Poppins fonts ── */
    if (!document.querySelector('link[href*="Cinzel"]')) {
        const gf = document.createElement('link');
        gf.rel = 'stylesheet';
        gf.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;700&family=Poppins:wght@300;400;500;600;700&display=swap';
        document.head.appendChild(gf);
    }

    /* ── Nav HTML ── */
    const navHTML = `
<nav class="nav">
    <a href="${root}home/home.html" class="nav-brand">
        <div class="nav-logo"><img src="${root}home/imgs/logo.png" alt="GEM logo"></div>
        <span class="nav-brand-name" data-i18n="[html]hero.titleLine0">Grand Egyptian Museum</span>
    </a>

    <ul class="nav-links">
        <li><a href="${root}home/home.html" data-navkey="home" data-i18n="nav.home">HOME</a></li>
        <li><a href="${root}explore/explore.htm" data-navkey="explore" data-i18n="nav.explore">EXPLORE</a></li>
        <li><a href="${root}planyourvisit/visit.html" data-navkey="plan" data-i18n="nav.plan">PLAN YOUR VISIT</a></li>
        <li><a href="${root}about/about.html" data-navkey="about" data-i18n="nav.about">ABOUT US</a></li>
        <li class="moree">
            <a href="#"><span data-i18n="nav.more">MORE</span> <i class="fa-solid fa-chevron-down"></i></a>
            <div class="con">
                <ul>
                    <li><a href="${root}pharaonic%20name/ph-name.html" data-i18n="nav.pharaonicNames">Pharaonic Names</a></li>
                    <li><a href="${root}Program%20plan/plan.html" data-i18n="nav.programPlan">Program Plan</a></li>
                    <li><a href="${root}contact%20us/contact.html" data-i18n="nav.contact">Contact Us</a></li>
                </ul>
            </div>
        </li>
    </ul>

    <div class="nav-right">
        <button class="menu-btn" aria-label="Open menu">
            <span class="menu-line"></span>
            <span class="menu-line menu-line-short"></span>
            <span class="menu-line"></span>
        </button>

        <div class="icons">
            <div class="lang-dropdown">
                <button class="icon-btn" aria-label="Change language">
                    <i class="fa-solid fa-globe"></i>
                    <span class="current-lang" id="currentLang">EN</span>
                </button>
                <div class="dropdown-menu">
                    <div data-lang="en">English</div>
                    <div data-lang="ar">العربية</div>
                </div>
            </div>
            <div class="nav-divider"></div>
            <div class="user-nav-wrapper" id="userNavWrapper">
                <button class="icon-btn" id="userIconBtn" aria-label="Account">
                    <i class="fa-regular fa-user"></i>
                </button>
                <div class="user-dd-menu" id="userDdMenu">
                    <a href="${root}user%20profile/profile.html" class="user-dd-item">
                        <i class="fa-regular fa-user"></i>
                        <span data-i18n="nav.profile">Profile</span>
                    </a>
                    <div class="user-dd-divider"></div>
                    <button class="user-dd-item user-dd-logout" id="ddLogoutBtn">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span data-i18n="nav.logout">Logout</span>
                    </button>
                </div>
            </div>
        </div>

        <a href="${root}ticket/booking.html"><button class="buy-btn" data-i18n="nav.buyTicket">BUY TICKET</button></a>
    </div>
</nav>

<div class="side-menu" id="gemSideMenu">
    <div class="side-menu-header">
        <img src="${root}home/imgs/logo.png" alt="GEM logo" class="side-logo">
        <button class="side-close" id="gemSideClose" aria-label="Close menu">
            <i class="fa-solid fa-xmark"></i>
        </button>
    </div>
    <div class="side-user-card" id="gemSideUserCard" style="display:none">
        <a href="${root}user%20profile/profile.html" class="side-user-link">
            <div class="side-user-avatar" id="gemSideAvatar"><i class="fa-regular fa-user"></i></div>
            <div class="side-user-info">
                <span class="side-user-name" id="gemSideUserName"></span>
                <span class="side-user-email" id="gemSideUserEmail"></span>
            </div>
            <i class="fa-solid fa-chevron-right side-user-arrow"></i>
        </a>
    </div>
    <ul class="side-links">
        <li><i class="fa-solid fa-house"></i><a href="${root}home/home.html" data-navkey="home" data-i18n="nav.home">HOME</a></li>
        <li><i class="fa-solid fa-compass"></i><a href="${root}explore/explore.htm" data-navkey="explore" data-i18n="nav.explore">EXPLORE</a></li>
        <li><i class="fa-solid fa-map-location-dot"></i><a href="${root}planyourvisit/visit.html" data-navkey="plan" data-i18n="nav.plan">PLAN YOUR VISIT</a></li>
        <li><i class="fa-solid fa-circle-info"></i><a href="${root}about/about.html" data-navkey="about" data-i18n="nav.about">ABOUT US</a></li>
        <li><i class="fa-solid fa-scroll"></i><a href="${root}pharaonic%20name/ph-name.html" data-i18n="nav.pharaonicNames">Pharaonic Names</a></li>
        <li><i class="fa-solid fa-calendar-days"></i><a href="${root}Program%20plan/plan.html" data-i18n="nav.programPlan">Program Plan</a></li>
        <li><i class="fa-solid fa-envelope"></i><a href="${root}contact%20us/contact.html" data-i18n="nav.contact">Contact Us</a></li>
    </ul>
    <div class="side-lang">
        <i class="fa-solid fa-globe"></i>
        <button class="side-lang-btn" data-lang="en">EN</button>
        <span class="side-lang-divider">|</span>
        <button class="side-lang-btn" data-lang="ar">ع</button>
    </div>
    <div class="side-auth-buttons" id="gemSideAuth">
        <a href="${root}login/regestiration.html" class="side-auth-btn side-signin">
            <i class="fa-solid fa-right-to-bracket"></i>
            <span data-i18n="nav.signIn">SIGN IN</span>
        </a>
        <a href="${root}login/regestiration.html" class="side-auth-btn side-signup">
            <i class="fa-solid fa-user-plus"></i>
            <span data-i18n="nav.signUp">SIGN UP</span>
        </a>
    </div>
    <a href="${root}ticket/booking.html" class="side-buy-link">
        <button class="side-buy" data-i18n="nav.buyTicket">BUY TICKET</button>
    </a>
</div>`;

    /* ── Footer HTML ── */
    const footerHTML = `
<footer class="footer">
    <div class="footer-top-accent"></div>
    <div class="footer-content">
        <div class="footer-brand">
            <div class="footer-logo">
                <img src="${root}home/imgs/logo.png" alt="GEM logo">
                <div class="footer-brand-name" data-i18n="[html]hero.titleLine1">Grand Egyptian<br>Museum</div>
            </div>
            <p data-i18n="footer.tagline">Preserving 7,000 years of history. Home to the world's largest collection of pharaonic artifacts.</p>
            <div class="footer-socials">
                <a href="https://www.facebook.com/GrandEgyptianMuseum" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa-brands fa-facebook"></i></a>
                <a href="https://www.instagram.com/grandegyptianmuseum/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                <a href="https://www.youtube.com/@GrandEgyptianMuseum" target="_blank" rel="noopener" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
            </div>
        </div>
        <div class="footer-col">
            <h4 data-i18n="footer.explore.heading">Explore</h4>
            <ul>
                <li><a href="#" data-i18n="footer.explore.collections">Collections</a></li>
                <li><a href="#" data-i18n="footer.explore.exhibitions">Exhibitions</a></li>
                <li><a href="#" data-i18n="footer.explore.events">Events</a></li>
                <li><a href="#" data-i18n="footer.explore.education">Educational Programs</a></li>
            </ul>
        </div>
        <div class="footer-col">
            <h4 data-i18n="footer.visit.heading">Visit</h4>
            <ul>
                <li><a href="${root}about/about.html" data-i18n="footer.visit.about">About Us</a></li>
                <li><a href="${root}planyourvisit/visit.html" data-i18n="footer.visit.plan">Plan Your Visit</a></li>
                <li><a href="${root}contact%20us/contact.html" data-i18n="footer.visit.contact">Contact</a></li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom">
        <span data-i18n="footer.copyright">© 2024 Grand Egyptian Museum. All rights reserved.</span>
        <div class="footer-legal">
            <a href="#" data-i18n="footer.privacy">Privacy Policy</a>
            <a href="#" data-i18n="footer.terms">Terms of Service</a>
        </div>
    </div>
</footer>`;

    /* ── Back to top HTML ── */
    const backToTopHTML = `
<button class="back-to-top" id="gemBackToTop" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="Back to top">
    <i class="fa-solid fa-arrow-up"></i>
</button>`;

    /* ── Inject ── */
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    if (!document.querySelector('.back-to-top')) {
        document.body.insertAdjacentHTML('beforeend', backToTopHTML);
    }

    /* ── Active link detection ── */
    const path = (window.location.pathname + window.location.href).toLowerCase();
    document.querySelectorAll('[data-navkey]').forEach(a => {
        const key = a.dataset.navkey;
        const active =
            (key === 'home'    && (path.includes('/home/home') || path.includes('home.html'))) ||
            (key === 'explore' && path.includes('/explore/')) ||
            (key === 'plan'    && path.includes('/planyourvisit/')) ||
            (key === 'about'   && path.includes('/about/'));
        if (active) a.classList.add('active');
    });

    /* ── Hamburger / side menu ── */
    const menuBtn  = document.querySelector('.menu-btn');
    const sideMenu = document.getElementById('gemSideMenu');
    const sideClose = document.getElementById('gemSideClose');

    function openSide()  { sideMenu?.classList.add('open'); }
    function closeSide() { sideMenu?.classList.remove('open'); }

    menuBtn?.addEventListener('click', openSide);
    sideClose?.addEventListener('click', closeSide);
    document.addEventListener('click', e => {
        if (sideMenu?.classList.contains('open') &&
            !sideMenu.contains(e.target) &&
            !menuBtn?.contains(e.target)) {
            closeSide();
        }
    });

    /* ── User dropdown ── */
    const DJANGO     = 'http://127.0.0.1:8000';
    const userBtn    = document.getElementById('userIconBtn');
    const userMenu   = document.getElementById('userDdMenu');
    const sideAuth   = document.getElementById('gemSideAuth');

    const user = (() => {
        try { return JSON.parse(localStorage.getItem('gem_user')); }
        catch { return null; }
    })();

    /* ── Side menu user card ── */
    const sideUserCard  = document.getElementById('gemSideUserCard');
    const sideAvatar    = document.getElementById('gemSideAvatar');
    const sideUserName  = document.getElementById('gemSideUserName');
    const sideUserEmail = document.getElementById('gemSideUserEmail');

    if (user && sideUserCard) {
        const profile = (() => {
            try { return JSON.parse(localStorage.getItem('gem_profile') || '{}'); }
            catch { return {}; }
        })();
        const displayName = profile.fullName || user.name || 'Visitor';
        sideUserCard.style.display = 'block';
        sideUserName.textContent  = displayName;
        sideUserEmail.textContent = user.email || '';
        if (profile.avatar) {
            sideAvatar.style.backgroundImage = `url(${profile.avatar})`;
            sideAvatar.innerHTML = '';
        }
    }

    if (userBtn) {
        if (!user) {
            userBtn.addEventListener('click', () => {
                window.location.href = root + 'login/regestiration.html';
            });
        } else {
            /* Hide sign-in/up in side menu when logged in */
            if (sideAuth) sideAuth.style.display = 'none';

            userBtn.addEventListener('click', e => {
                e.stopPropagation();
                userMenu?.classList.toggle('show');
            });
            document.addEventListener('click', () => userMenu?.classList.remove('show'));

            document.getElementById('ddLogoutBtn')?.addEventListener('click', async () => {
                try { await fetch(`${DJANGO}/api/logout/`, { method: 'POST', credentials: 'include' }); }
                catch (_) {}
                localStorage.removeItem('gem_user');
                window.location.href = root + 'home/home.html';
            });
        }
    }

    /* ── Side menu language switcher ── */
    const sideLangBtns = document.querySelectorAll('.side-lang-btn[data-lang]');
    function updateSideLangActive() {
        const current = document.documentElement.lang || 'en';
        sideLangBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === current));
    }
    sideLangBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.I18n) window.I18n.change(btn.dataset.lang);
            updateSideLangActive();
        });
    });
    updateSideLangActive();

    /* ── Back to top visibility ── */
    const btt = document.getElementById('gemBackToTop') || document.querySelector('.back-to-top');
    if (btt) {
        window.addEventListener('scroll', () => {
            btt.style.display = window.scrollY > 400 ? 'flex' : 'none';
        });
    }
})();
