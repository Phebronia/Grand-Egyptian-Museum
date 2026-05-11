(() => {
  const ui = {
    eyebrow: { en: 'Search', ar: 'البحث' },
    title: { en: 'Search Results', ar: 'نتائج البحث' },
    prompt: {
      en: 'Search for artifacts, halls, and pages across the museum website.',
      ar: 'ابحث عن القطع والقاعات والصفحات في موقع المتحف.'
    },
    empty: {
      en: 'No matching pages were found. Try a different keyword.',
      ar: 'لم يتم العثور على صفحات مطابقة. جرّب كلمة بحث مختلفة.'
    },
    resultCount(count, query, currentLang) {
      if (currentLang === 'ar') {
        return `تم العثور على ${count} نتيجة عن "${query}".`;
      }
      return `Showing ${count} result${count === 1 ? '' : 's'} for "${query}".`;
    },
    typeLabels: {
      page: { en: 'Page', ar: 'صفحة' },
      gallery: { en: 'Gallery', ar: 'قاعة' },
      artifact: { en: 'Artifact', ar: 'قطعة أثرية' },
      feature: { en: 'Feature', ar: 'ميزة' }
    }
  };

  const currentLang = () => (document.documentElement.lang || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
  const t = (value) => typeof value === 'string' ? value : (value?.[currentLang()] || value?.en || '');
  const escapeHTML = (value) => (value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const btns = document.querySelectorAll('.halls-filter button');
  const matrix = document.querySelector('.matrix');
  const cards = document.querySelectorAll('.hall-card');
  const colHeads = document.querySelectorAll('.col-head');

  function applyHallFilter(theme) {
    btns.forEach((button) => button.classList.toggle('active', button.dataset.theme === theme));

    if (theme === 'all') {
      matrix?.classList.remove('filtered');
      cards.forEach((card) => card.classList.remove('dimmed', 'focused'));
      colHeads.forEach((head) => head.classList.remove('dimmed', 'focused'));
      return;
    }

    matrix?.classList.add('filtered');
    cards.forEach((card) => {
      const focused = card.dataset.theme === theme;
      card.classList.toggle('focused', focused);
      card.classList.toggle('dimmed', !focused);
    });
    colHeads.forEach((head) => {
      const focused = head.dataset.col === theme;
      head.classList.toggle('focused', focused);
      head.classList.toggle('dimmed', !focused);
    });
  }

  btns.forEach((button) => {
    button.addEventListener('click', () => applyHallFilter(button.dataset.theme));
  });

  const section = document.getElementById('searchResultsSection');
  const summary = document.getElementById('searchResultsSummary');
  const grid = document.getElementById('searchResultsGrid');
  const eyebrow = document.getElementById('searchEyebrow');
  const title = document.getElementById('searchResultsTitle');

  function typeLabel(type) {
    return t(ui.typeLabels[type] || ui.typeLabels.page);
  }

  function getQueryFromUrl() {
    return new URLSearchParams(window.location.search).get('search') || '';
  }

  function updateStaticCopy() {
    if (eyebrow) eyebrow.textContent = t(ui.eyebrow);
    if (title) title.textContent = t(ui.title);
    if (summary && !getQueryFromUrl().trim()) summary.textContent = t(ui.prompt);
  }

  function renderSearchResults(query, options = {}) {
    const { updateHistory = false, scroll = false } = options;
    const trimmed = (query || '').trim();

    updateStaticCopy();
    if (!section || !summary || !grid || !window.GEMSearch?.search) return;

    if (!trimmed) {
      section.hidden = true;
      grid.innerHTML = '';
      summary.textContent = t(ui.prompt);
      if (updateHistory) {
        history.replaceState({}, '', window.location.pathname);
      }
      return;
    }

    const results = window.GEMSearch.search(trimmed);
    section.hidden = false;
    summary.textContent = ui.resultCount(results.length, trimmed, currentLang());

    if (!results.length) {
      grid.innerHTML = `<article class="search-empty-card">${escapeHTML(t(ui.empty))}</article>`;
    } else {
      grid.innerHTML = results.map((item) => `
        <a class="search-card" href="${item.href}">
          <span class="search-card-type">${escapeHTML(typeLabel(item.type))}</span>
          <h3>${escapeHTML(t(item.title))}</h3>
          <p>${escapeHTML(t(item.description))}</p>
          <span class="search-card-link">${currentLang() === 'ar' ? 'افتح الصفحة' : 'Open page'} <i class="fa-solid fa-arrow-right"></i></span>
        </a>
      `).join('');
    }

    if (updateHistory) {
      history.replaceState({}, '', window.GEMSearch.getResultsUrl(trimmed));
    }
    if (scroll) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  window.GEMSearch = window.GEMSearch || {};
  window.GEMSearch.openResults = (query) => renderSearchResults(query, { updateHistory: true, scroll: true });

  renderSearchResults(getQueryFromUrl(), { updateHistory: false, scroll: false });
  document.addEventListener('languagechange', () => renderSearchResults(getQueryFromUrl(), { updateHistory: false, scroll: false }));
  window.addEventListener('popstate', () => renderSearchResults(getQueryFromUrl(), { updateHistory: false, scroll: false }));
})();
