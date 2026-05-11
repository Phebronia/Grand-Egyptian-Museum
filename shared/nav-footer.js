/* =============================================================
   GEM - Shared Navbar + Footer injector
   Auto-detects root path from its own URL.
   Injects nav, side menu, footer, and back-to-top on every page.
============================================================= */
(function () {
    'use strict';

    const scriptSrc = (document.currentScript || {}).src || '';
    const root = scriptSrc ? scriptSrc.replace(/shared\/nav-footer\.js[^/]*$/, '') : '';
    const lang = () => (document.documentElement.lang || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
    const localize = (value) => typeof value === 'string' ? value : (value?.[lang()] || value?.en || '');
    const buildHref = (relativePath) => root + relativePath.replace(/ /g, '%20');

    const searchUI = {
        placeholder: {
            en: 'Search artifacts, halls, and pages',
            ar: 'ابحث عن القطع والقاعات والصفحات'
        },
        noResults: {
            en: 'No matching results found.',
            ar: 'لم يتم العثور على نتائج مطابقة.'
        },
        viewAll: {
            en: 'View all results',
            ar: 'عرض كل النتائج'
        },
        resultsTitle: {
            en: 'Search results',
            ar: 'نتائج البحث'
        },
        searchButton: {
            en: 'Search',
            ar: 'بحث'
        },
        typeLabels: {
            page: { en: 'Page', ar: 'صفحة' },
            gallery: { en: 'Gallery', ar: 'قاعة' },
            artifact: { en: 'Artifact', ar: 'قطعة أثرية' },
            feature: { en: 'Feature', ar: 'ميزة' }
        }
    };

    const searchCatalog = [
        {
            id: 'home',
            type: 'page',
            href: buildHref('home/home.html'),
            title: { en: 'Grand Egyptian Museum', ar: 'المتحف المصري الكبير' },
            description: {
                en: 'Homepage with highlights, featured artifacts, and visitor information.',
                ar: 'الصفحة الرئيسية مع أبرز المعروضات والمعلومات الأساسية للزوار.'
            },
            keywords: ['home main museum grand egyptian museum featured highlights visitor information']
        },
        {
            id: 'explore',
            type: 'page',
            href: buildHref('explore/explore.htm'),
            title: { en: 'Explore Ancient Egypt', ar: 'استكشف مصر القديمة' },
            description: {
                en: 'Browse museum halls, iconic galleries, and featured highlights.',
                ar: 'تصفح القاعات والمعارض المميزة وأبرز مقتنيات المتحف.'
            },
            keywords: ['explore halls galleries collection museum halls ancient egypt']
        },
        {
            id: 'visit',
            type: 'page',
            href: buildHref('planyourvisit/visit.html'),
            title: { en: 'Plan Your Visit', ar: 'خطط لزيارتك' },
            description: {
                en: 'Opening hours, directions, and visitor planning information.',
                ar: 'مواعيد الزيارة والاتجاهات وكل ما تحتاجه لتخطيط الزيارة.'
            },
            keywords: ['visit plan opening hours directions tickets location']
        },
        {
            id: 'about',
            type: 'page',
            href: buildHref('about/about.html'),
            title: { en: 'About the Museum', ar: 'عن المتحف' },
            description: {
                en: 'Learn about the museum, its mission, architecture, and story.',
                ar: 'تعرف على المتحف ورسالة إنشائه ومعماره وقصته.'
            },
            keywords: ['about mission story architecture history museum']
        },
        {
            id: 'contact',
            type: 'page',
            href: buildHref('contact us/contact.html'),
            title: { en: 'Contact Us', ar: 'تواصل معنا' },
            description: {
                en: 'Reach the museum team and send your questions or feedback.',
                ar: 'تواصل مع فريق المتحف وأرسل أسئلتك أو ملاحظاتك.'
            },
            keywords: ['contact support email phone feedback map']
        },
        {
            id: 'quiz',
            type: 'feature',
            href: buildHref('quiz/quiz.html'),
            title: { en: 'Ancient Egypt Quiz', ar: 'اختبار مصر القديمة' },
            description: {
                en: 'Test your knowledge with the museum quiz.',
                ar: 'اختبر معلوماتك من خلال اختبار المتحف.'
            },
            keywords: ['quiz game questions knowledge test']
        },
        {
            id: 'pharaonic-names',
            type: 'feature',
            href: buildHref('pharaonic name/ph-name.html'),
            title: { en: 'Pharaonic Names', ar: 'الأسماء الفرعونية' },
            description: {
                en: 'Write your name in hieroglyphs and download the design.',
                ar: 'اكتب اسمك بالهيروغليفية وقم بتنزيل التصميم.'
            },
            keywords: ['pharaonic names hieroglyphs hieroglyphic name generator']
        },
        {
            id: 'program-plan',
            type: 'feature',
            href: buildHref('Program plan/plan.html'),
            title: { en: 'Program Plan', ar: 'خطط برنامجك' },
            description: {
                en: 'Build a customized visit plan based on your time and group type.',
                ar: 'أنشئ خطة زيارة مخصصة حسب وقتك ونوع مجموعتك.'
            },
            keywords: ['program plan schedule customize visit duration']
        },
        {
            id: 'tut-health',
            type: 'page',
            href: buildHref('tutankhamun-health/tutankhamun-health.html'),
            title: { en: "Tutankhamun's Health", ar: 'صحة توت عنخ آمون' },
            description: {
                en: 'A scientific look at Tutankhamun’s health, injuries, and DNA research.',
                ar: 'نظرة علمية على صحة توت عنخ آمون وإصاباته وأبحاث الحمض النووي.'
            },
            keywords: ['tutankhamun health dna mummy medical research king tut']
        },
        {
            id: 'tut-collection',
            type: 'gallery',
            href: buildHref('explore/gallaries/tut-collection.html'),
            title: { en: 'Tutankhamun Collection', ar: 'مجموعة توت عنخ آمون' },
            description: {
                en: 'Explore the story and treasures of Tutankhamun.',
                ar: 'استكشف قصة وكنوز توت عنخ آمون.'
            },
            keywords: ['tutankhamun collection king tut treasures gallery mask throne']
        },
        {
            id: 'grand-hall',
            type: 'gallery',
            href: buildHref('explore/gallaries/grand-hall.html'),
            title: { en: 'Grand Hall', ar: 'القاعة الكبرى' },
            description: {
                en: 'The museum’s monumental entrance space and royal sculptures.',
                ar: 'المدخل الضخم للمتحف وما يضمه من تماثيل ملكية مهيبة.'
            },
            keywords: ['grand hall ramses entrance colossus hall']
        },
        {
            id: 'grand-staircase',
            type: 'gallery',
            href: buildHref('explore/gallaries/grand stairs/grandstaircase.html'),
            title: { en: 'Grand Staircase', ar: 'السلم الكبير' },
            description: {
                en: 'A vertical gallery of kings, gods, and monumental artifacts.',
                ar: 'معرض رأسي للملوك والآلهة والقطع الأثرية الضخمة.'
            },
            keywords: ['grand staircase stairs kings gods levels']
        },
        {
            id: 'hall-08',
            type: 'gallery',
            href: buildHref('explore/gallaries/Hall08.html'),
            title: { en: 'Hall 08', ar: 'القاعة 08' },
            description: {
                en: 'A New Kingdom hall focused on kingship and military power.',
                ar: 'قاعة من الدولة الحديثة تركز على الملكية والقوة العسكرية.'
            },
            keywords: ['hall 08 new kingdom kingship ramses thutmose']
        },
        {
            id: 'mask-of-tutankhamun',
            type: 'artifact',
            href: buildHref('explore/artifacts/tutankhamun.html'),
            title: { en: 'Mask of Tutankhamun', ar: 'قناع توت عنخ آمون' },
            description: {
                en: 'The iconic golden funerary mask of Tutankhamun.',
                ar: 'القناع الجنائزي الذهبي الشهير لتوت عنخ آمون.'
            },
            keywords: ['tutankhamun mask king tut golden mask funerary mask']
        },
        {
            id: 'golden-throne',
            type: 'artifact',
            href: buildHref('explore/artifacts/golden-throne.html'),
            title: { en: 'Golden Throne', ar: 'العرش الذهبي' },
            description: {
                en: 'A richly decorated throne from Tutankhamun’s treasures.',
                ar: 'عرش مزخرف من كنوز توت عنخ آمون.'
            },
            keywords: ['golden throne tutankhamun throne chair']
        },
        {
            id: 'tut-head',
            type: 'artifact',
            href: buildHref('explore/artifacts/tut-head.html'),
            title: { en: 'Head of Tutankhamun', ar: 'رأس توت عنخ آمون' },
            description: {
                en: 'A sculpted head representing Tutankhamun.',
                ar: 'رأس منحوت يمثل توت عنخ آمون.'
            },
            keywords: ['head of tutankhamun tut head sculpture bust']
        },
        {
            id: 'khufu-boat',
            type: 'artifact',
            href: buildHref('explore/artifacts/khufu-boat.html'),
            title: { en: "Khufu's Solar Boat", ar: 'مركب خوفو الشمسية' },
            description: {
                en: 'The remarkable ceremonial solar boat of King Khufu.',
                ar: 'المركب الجنائزية المذهلة الخاصة بالملك خوفو.'
            },
            keywords: ['khufu boat solar boat ship old kingdom']
        },
        {
            id: 'hanging-obelisk',
            type: 'artifact',
            href: buildHref('explore/artifacts/hanging-obelisk.html'),
            title: { en: 'Hanging Obelisk', ar: 'المسلة المعلقة' },
            description: {
                en: 'One of the museum’s most striking architectural features.',
                ar: 'واحدة من أبرز السمات المعمارية المميزة في المتحف.'
            },
            keywords: ['hanging obelisk obelisk monument']
        },
        {
            id: 'ramses-statue',
            type: 'artifact',
            href: buildHref('explore/artifacts/ramses.html'),
            title: { en: 'Statue of Ramses II', ar: 'تمثال رمسيس الثاني' },
            description: {
                en: 'The colossal statue of Ramses II.',
                ar: 'التمثال الضخم للملك رمسيس الثاني.'
            },
            keywords: ['ramses statue ramses ii colossus']
        },
        {
            id: 'hatshepsut-statue',
            type: 'artifact',
            href: buildHref('explore/artifacts/Hatshepsut.html'),
            title: { en: 'Statue of Hatshepsut', ar: 'تمثال حتشبسوت' },
            description: {
                en: 'A royal sculpture of the pharaoh Hatshepsut.',
                ar: 'تمثال ملكي للفرعون حتشبسوت.'
            },
            keywords: ['hatshepsut statue queen pharaoh']
        },
        {
            id: 'merenptah-column',
            type: 'artifact',
            href: buildHref('explore/artifacts/column.html'),
            title: { en: 'Column of King Merenptah', ar: 'عمود الملك مرنبتاح' },
            description: {
                en: 'A decorated column associated with King Merenptah.',
                ar: 'عمود مزخرف مرتبط بالملك مرنبتاح.'
            },
            keywords: ['column merenptah column of king merenptah']
        },
        {
            id: 'ptolemaic-king',
            type: 'artifact',
            href: buildHref('explore/artifacts/king.html'),
            title: { en: 'Colossus of a Ptolemaic King', ar: 'تمثال ضخم لملك بطلمي' },
            description: {
                en: 'A monumental sculpture from the Ptolemaic era.',
                ar: 'تمثال ضخم من العصر البطلمي.'
            },
            keywords: ['ptolemaic king colossus king statue']
        },
        {
            id: 'senwosret',
            type: 'artifact',
            href: buildHref('explore/artifacts/Senwosret III.html'),
            title: { en: 'Colossus of Senwosret III', ar: 'تمثال سنوسرت الثالث' },
            description: {
                en: 'A famous royal portrait from the Middle Kingdom.',
                ar: 'صورة ملكية شهيرة من عصر الدولة الوسطى.'
            },
            keywords: ['senwosret iii colossus middle kingdom statue']
        }
    ];

    function normalizeSearchValue(value) {
        return (value || '')
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[_/\\|]+/g, ' ')
            .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function escapeHTML(value) {
        return (value || '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function scoreSearchItem(item, query, terms) {
        const titleTokens = [
            normalizeSearchValue(localize(item.title)),
            normalizeSearchValue(item.title?.en),
            normalizeSearchValue(item.title?.ar)
        ].filter(Boolean);
        const descriptionTokens = [
            normalizeSearchValue(localize(item.description)),
            normalizeSearchValue(item.description?.en),
            normalizeSearchValue(item.description?.ar)
        ].filter(Boolean);
        const keywordTokens = (item.keywords || []).map(normalizeSearchValue).filter(Boolean);
        const haystack = [...titleTokens, ...descriptionTokens, ...keywordTokens].join(' ');

        if (!haystack || !terms.every((term) => haystack.includes(term))) return -1;

        let score = 0;
        titleTokens.forEach((token) => {
            if (token === query) score += 140;
            else if (token.startsWith(query)) score += 90;
            else if (token.includes(query)) score += 55;
        });
        descriptionTokens.forEach((token) => {
            if (token.includes(query)) score += 20;
        });
        keywordTokens.forEach((token) => {
            if (token.includes(query)) score += 12;
        });
        score += Math.max(0, 20 - item.href.length / 10);

        return score;
    }

    function searchSite(query) {
        const normalizedQuery = normalizeSearchValue(query);
        if (!normalizedQuery) return [];
        const terms = normalizedQuery.split(' ').filter(Boolean);

        return searchCatalog
            .map((item) => ({ item, score: scoreSearchItem(item, normalizedQuery, terms) }))
            .filter((entry) => entry.score >= 0)
            .sort((a, b) => b.score - a.score || localize(a.item.title).localeCompare(localize(b.item.title)))
            .map((entry) => entry.item);
    }

    function buildSearchResultsUrl(query) {
        return `${buildHref('explore/explore.htm')}?search=${encodeURIComponent(query.trim())}`;
    }

    window.GEMSearch = {
        items: searchCatalog,
        search(query) {
            return searchSite(query);
        },
        getResultsUrl(query) {
            return buildSearchResultsUrl(query);
        },
        openResults: null
    };

    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
        document.head.appendChild(fa);
    }

    if (!document.querySelector('link[href*="Cinzel"]')) {
        const gf = document.createElement('link');
        gf.rel = 'stylesheet';
        gf.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;700&family=Poppins:wght@300;400;500;600;700&display=swap';
        document.head.appendChild(gf);
    }

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
        <li><a href="${root}quiz/quiz.html" data-navkey="quiz" data-i18n="nav.quiz">QUIZ</a></li>
        <li class="moree">
            <a href="#"><span data-i18n="nav.more">MORE</span> <i class="fa-solid fa-chevron-down"></i></a>
            <div class="con">
                <ul>
                    <li><a href="${root}pharaonic%20name/ph-name.html" data-i18n="nav.pharaonicNames">Pharaonic Names</a></li>
                    <li><a href="${root}Program%20plan/plan.html" data-i18n="nav.programPlan">Program Plan</a></li>
                    <li><a href="${root}tutankhamun-health/tutankhamun-health.html" data-navkey="tutHealth" data-i18n="nav.tutHealth">Tutankhamun's Health</a></li>
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
            <form class="nav-search" id="navSearchForm" role="search">
                <button type="button" class="icon-btn nav-search-trigger" id="navSearchTrigger" aria-expanded="false">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </button>
                <div class="nav-search-shell">
                    <i class="fa-solid fa-magnifying-glass nav-search-icon" aria-hidden="true"></i>
                    <input type="search" id="navSearchInput" class="nav-search-input" autocomplete="off">
                    <button type="submit" class="nav-search-submit">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                    <button type="button" class="nav-search-close" id="navSearchClose">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="nav-search-panel" id="navSearchPanel" hidden></div>
            </form>
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
    <form class="side-search" id="sideSearchForm" role="search">
        <label class="side-search-label" for="sideSearchInput">Search</label>
        <div class="side-search-shell">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input type="search" id="sideSearchInput" class="side-search-input" autocomplete="off">
            <button type="submit" class="side-search-submit">
                <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
        <div class="side-search-panel" id="sideSearchPanel" hidden></div>
    </form>
    <ul class="side-links">
        <li><i class="fa-solid fa-house"></i><a href="${root}home/home.html" data-navkey="home" data-i18n="nav.home">HOME</a></li>
        <li><i class="fa-solid fa-compass"></i><a href="${root}explore/explore.htm" data-navkey="explore" data-i18n="nav.explore">EXPLORE</a></li>
        <li><i class="fa-solid fa-map-location-dot"></i><a href="${root}planyourvisit/visit.html" data-navkey="plan" data-i18n="nav.plan">PLAN YOUR VISIT</a></li>
        <li><i class="fa-solid fa-circle-info"></i><a href="${root}about/about.html" data-navkey="about" data-i18n="nav.about">ABOUT US</a></li>
        <li><i class="fa-solid fa-lightbulb"></i><a href="${root}quiz/quiz.html" data-navkey="quiz" data-i18n="nav.quiz">QUIZ</a></li>
        <li><i class="fa-solid fa-scroll"></i><a href="${root}pharaonic%20name/ph-name.html" data-i18n="nav.pharaonicNames">Pharaonic Names</a></li>
        <li><i class="fa-solid fa-calendar-days"></i><a href="${root}Program%20plan/plan.html" data-i18n="nav.programPlan">Program Plan</a></li>
        <li><i class="fa-solid fa-heart-pulse"></i><a href="${root}tutankhamun-health/tutankhamun-health.html" data-navkey="tutHealth" data-i18n="nav.tutHealth">Tutankhamun's Health</a></li>
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
    <button class="side-auth-btn side-logout" id="gemSideLogout" style="display:none">
        <i class="fa-solid fa-right-from-bracket"></i>
        <span data-i18n="nav.logout">LOG OUT</span>
    </button>
    <a href="${root}ticket/booking.html" class="side-buy-link">
        <button class="side-buy" data-i18n="nav.buyTicket">BUY TICKET</button>
    </a>
</div>`;

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

    const backToTopHTML = `
<button class="back-to-top" id="gemBackToTop" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="Back to top">
    <i class="fa-solid fa-arrow-up"></i>
</button>`;

    document.body.insertAdjacentHTML('afterbegin', navHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    if (!document.querySelector('.back-to-top')) {
        document.body.insertAdjacentHTML('beforeend', backToTopHTML);
    }

    const path = (window.location.pathname + window.location.href).toLowerCase();
    document.querySelectorAll('[data-navkey]').forEach((link) => {
        const key = link.dataset.navkey;
        const active =
            (key === 'home' && (path.includes('/home/home') || path.includes('home.html'))) ||
            (key === 'explore' && path.includes('/explore/')) ||
            (key === 'plan' && path.includes('/planyourvisit/')) ||
            (key === 'about' && path.includes('/about/')) ||
            (key === 'quiz' && (path.includes('/quiz/') || path.includes('quiz.html'))) ||
            (key === 'tutHealth' && (path.includes('/tutankhamun-health/') || path.includes('tutankhamun-health.html')));
        if (active) link.classList.add('active');
    });

    const navSearchForm = document.getElementById('navSearchForm');
    const navSearchTrigger = document.getElementById('navSearchTrigger');
    const navSearchClose = document.getElementById('navSearchClose');
    const navSearchInput = document.getElementById('navSearchInput');
    const navSearchPanel = document.getElementById('navSearchPanel');
    const sideSearchForm = document.getElementById('sideSearchForm');
    const sideSearchInput = document.getElementById('sideSearchInput');
    const sideSearchPanel = document.getElementById('sideSearchPanel');

    function typeLabel(type) {
        return localize(searchUI.typeLabels[type] || searchUI.typeLabels.page);
    }

    function setSearchCopy() {
        const placeholder = localize(searchUI.placeholder);
        const buttonLabel = localize(searchUI.searchButton);

        if (navSearchInput) {
            navSearchInput.placeholder = placeholder;
            navSearchInput.setAttribute('aria-label', placeholder);
        }
        if (sideSearchInput) {
            sideSearchInput.placeholder = placeholder;
            sideSearchInput.setAttribute('aria-label', placeholder);
        }
        document.querySelectorAll('.nav-search-submit, .side-search-submit').forEach((button) => {
            button.setAttribute('aria-label', buttonLabel);
            button.title = buttonLabel;
        });
        navSearchTrigger?.setAttribute('aria-label', buttonLabel);
        navSearchTrigger?.setAttribute('title', buttonLabel);
        navSearchClose?.setAttribute('aria-label', localize({ en: 'Close search', ar: 'إغلاق البحث' }));
        navSearchClose?.setAttribute('title', localize({ en: 'Close search', ar: 'إغلاق البحث' }));

        const sideLabel = document.querySelector('.side-search-label');
        if (sideLabel) sideLabel.textContent = buttonLabel;
    }

    function closeSearchPanel(form, panel) {
        if (panel) {
            panel.hidden = true;
            panel.innerHTML = '';
        }
        form?.classList.remove('open');
    }

    function openNavSearch() {
        if (!navSearchForm) return;
        navSearchForm.classList.add('expanded');
        navSearchTrigger?.setAttribute('aria-expanded', 'true');
    }

    function closeNavSearch() {
        closeSearchPanel(navSearchForm, navSearchPanel);
        navSearchForm?.classList.remove('expanded');
        navSearchTrigger?.setAttribute('aria-expanded', 'false');
    }

    function closeAllSearchPanels() {
        closeNavSearch();
        closeSearchPanel(sideSearchForm, sideSearchPanel);
    }

    function renderSearchPanel(query, form, panel) {
        const trimmed = query.trim();
        if (!form || !panel) return;
        if (!trimmed) {
            panel.hidden = true;
            panel.innerHTML = '';
            form.classList.remove('open');
            return;
        }

        if (form === navSearchForm) openNavSearch();

        const results = searchSite(trimmed).slice(0, 6);
        if (!results.length) {
            panel.innerHTML = `<div class="nav-search-empty">${escapeHTML(localize(searchUI.noResults))}</div>`;
        } else {
            panel.innerHTML = `
                <div class="nav-search-results-title">${escapeHTML(localize(searchUI.resultsTitle))}</div>
                ${results.map((item) => `
                    <a class="nav-search-result" href="${item.href}">
                        <span class="nav-search-result-type">${escapeHTML(typeLabel(item.type))}</span>
                        <strong>${escapeHTML(localize(item.title))}</strong>
                        <span>${escapeHTML(localize(item.description))}</span>
                    </a>
                `).join('')}
                <a class="nav-search-view-all" href="${buildSearchResultsUrl(trimmed)}">${escapeHTML(localize(searchUI.viewAll))}</a>
            `;
        }

        panel.hidden = false;
        form.classList.add('open');
    }

    function submitSearch(query) {
        const trimmed = query.trim();
        if (!trimmed) return;

        closeAllSearchPanels();
        if (path.includes('/explore/') && typeof window.GEMSearch?.openResults === 'function') {
            window.GEMSearch.openResults(trimmed);
            return;
        }
        window.location.href = buildSearchResultsUrl(trimmed);
    }

    function bindSearchForm(form, input, panel) {
        if (!form || !input || !panel) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            submitSearch(input.value);
        });

        input.addEventListener('input', () => {
            renderSearchPanel(input.value, form, panel);
        });

        input.addEventListener('focus', () => {
            if (form === navSearchForm) openNavSearch();
            if (input.value.trim()) renderSearchPanel(input.value, form, panel);
        });

        form.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                if (form === navSearchForm) closeNavSearch();
                else closeSearchPanel(form, panel);
                input.blur();
            }
        });
    }

    bindSearchForm(navSearchForm, navSearchInput, navSearchPanel);
    bindSearchForm(sideSearchForm, sideSearchInput, sideSearchPanel);
    setSearchCopy();
    navSearchTrigger?.addEventListener('click', () => {
        openNavSearch();
        navSearchInput?.focus();
    });
    navSearchClose?.addEventListener('click', () => {
        closeNavSearch();
        navSearchTrigger?.focus();
    });

    const menuBtn = document.querySelector('.menu-btn');
    const sideMenu = document.getElementById('gemSideMenu');
    const sideClose = document.getElementById('gemSideClose');

    function openSide() {
        sideMenu?.classList.add('open');
    }

    function closeSide() {
        sideMenu?.classList.remove('open');
    }

    menuBtn?.addEventListener('click', openSide);
    sideClose?.addEventListener('click', closeSide);
    document.addEventListener('click', (event) => {
        if (sideMenu?.classList.contains('open') &&
            !sideMenu.contains(event.target) &&
            !menuBtn?.contains(event.target)) {
            closeSide();
        }
        if (![navSearchForm, sideSearchForm].some((form) => form?.contains(event.target))) {
            closeAllSearchPanels();
        }
    });

    const DJANGO = 'http://127.0.0.1:8000';
    const userBtn = document.getElementById('userIconBtn');
    const userMenu = document.getElementById('userDdMenu');
    const sideAuth = document.getElementById('gemSideAuth');
    const user = (() => {
        try { return JSON.parse(localStorage.getItem('gem_user')); }
        catch { return null; }
    })();

    const sideUserCard = document.getElementById('gemSideUserCard');
    const sideAvatar = document.getElementById('gemSideAvatar');
    const sideUserName = document.getElementById('gemSideUserName');
    const sideUserEmail = document.getElementById('gemSideUserEmail');

    if (user && sideUserCard) {
        const profile = (() => {
            try { return JSON.parse(localStorage.getItem('gem_profile') || '{}'); }
            catch { return {}; }
        })();
        const displayName = profile.fullName || user.name || 'Visitor';
        sideUserCard.style.display = 'block';
        sideUserName.textContent = displayName;
        sideUserEmail.textContent = user.email || '';
        if (profile.avatar) {
            sideAvatar.style.backgroundImage = `url(${profile.avatar})`;
            sideAvatar.innerHTML = '';
        }
    }

    const sideLogoutBtn = document.getElementById('gemSideLogout');

    async function doLogout() {
        try { await fetch(`${DJANGO}/api/logout/`, { method: 'POST', credentials: 'include' }); }
        catch (_) {}
        localStorage.removeItem('gem_user');
        window.location.href = root + 'home/home.html';
    }

    if (userBtn) {
        if (!user) {
            userBtn.addEventListener('click', () => {
                window.location.href = root + 'login/regestiration.html';
            });
        } else {
            if (sideAuth) sideAuth.style.display = 'none';
            if (sideLogoutBtn) sideLogoutBtn.style.display = 'flex';

            userBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                userMenu?.classList.toggle('show');
            });
            document.addEventListener('click', () => userMenu?.classList.remove('show'));
            document.getElementById('ddLogoutBtn')?.addEventListener('click', doLogout);
        }
    }

    sideLogoutBtn?.addEventListener('click', doLogout);

    const sideLangBtns = document.querySelectorAll('.side-lang-btn[data-lang]');
    function updateSideLangActive() {
        const current = document.documentElement.lang || 'en';
        sideLangBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.lang === current));
    }

    sideLangBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            if (window.I18n) window.I18n.change(btn.dataset.lang);
            updateSideLangActive();
        });
    });
    updateSideLangActive();

    document.addEventListener('languagechange', () => {
        updateSideLangActive();
        setSearchCopy();
        if (navSearchInput?.value.trim()) renderSearchPanel(navSearchInput.value, navSearchForm, navSearchPanel);
        if (sideSearchInput?.value.trim()) renderSearchPanel(sideSearchInput.value, sideSearchForm, sideSearchPanel);
    });

    const btt = document.getElementById('gemBackToTop') || document.querySelector('.back-to-top');
    if (btt) {
        window.addEventListener('scroll', () => {
            btt.style.display = window.scrollY > 400 ? 'flex' : 'none';
        });
    }
})();
