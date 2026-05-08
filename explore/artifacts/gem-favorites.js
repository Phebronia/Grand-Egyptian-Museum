/* =========================================================
   GEM FAVORITES — Shared favorites logic for artifact pages
   Each page must set window.GEM_ARTIFACT before loading this:
   window.GEM_ARTIFACT = { id, title, era, img, link }
   ========================================================= */
(function () {
  const KEY = 'gem_favorites';
  const artifact = window.GEM_ARTIFACT;
  if (!artifact) return;

  const favBtn   = document.getElementById('favBtn');
  const favIcon  = document.getElementById('favIcon');
  if (!favBtn) return;
  const favLabel = favBtn.querySelector('.fav-label');

  function isLoggedIn() {
    try { return !!(JSON.parse(localStorage.getItem('gem_user') || '{}').email); }
    catch (e) { return false; }
  }

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }

  function isSaved() {
    return getAll().some(a => a.id === artifact.id);
  }

  function render() {
    const saved = isSaved();
    favBtn.classList.toggle('active', saved);
    favBtn.setAttribute('aria-pressed', saved ? 'true' : 'false');
    if (favIcon) favIcon.className = saved ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    if (favLabel) favLabel.textContent = saved ? 'Saved' : 'Save';
  }

  favBtn.addEventListener('click', () => {
    if (!isLoggedIn()) {
      window.location.href = '../../login/regestiration.html';
      return;
    }

    const list = getAll();
    const idx  = list.findIndex(a => a.id === artifact.id);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(artifact);
      favBtn.classList.add('pop');
      setTimeout(() => favBtn.classList.remove('pop'), 400);
    }
    localStorage.setItem(KEY, JSON.stringify(list));
    try {
      const email = JSON.parse(localStorage.getItem('gem_user') || '{}').email;
      if (email) localStorage.setItem(KEY + '_' + email, JSON.stringify(list));
    } catch(e) {}
    render();
  });

  render();
})();
