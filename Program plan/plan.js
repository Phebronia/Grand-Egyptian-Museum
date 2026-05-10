/* nav / side-menu / back-to-top are handled by ../shared/nav-footer.js */

  function selectVisitor(el) {
    document.querySelectorAll('.visitor-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('visitor-message').style.display = 'none';
  }
 
  function selectDur(el) {
    document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('duration-message').style.display = 'none';
  }
 
  function markDone(circleId, labelId, lineId) {
    const c = document.getElementById(circleId);
    c.classList.remove('active', 'inactive');
    c.classList.add('done');
    document.getElementById(labelId).classList.add('done-label');
    if (lineId) document.getElementById(lineId).classList.add('done-line');
  }
 
  function markActive(circleId) {
    const c = document.getElementById(circleId);
    c.classList.remove('inactive', 'done');
    c.classList.add('active');
  }
 
  function completeStep1() {
    if (!document.querySelector('.visitor-card.selected')) {
      document.getElementById('visitor-message').style.display = 'block';
      return;
    }

    markDone('circle-1', 'label-1', 'line-1');
    markActive('circle-2');
    document.getElementById('step1-block').style.display = 'none';
    document.getElementById('step2-block').style.display = 'block';
  }
 
  function completeStep2() {
    if (!document.querySelector('.dur-btn.selected')) {
      document.getElementById('duration-message').style.display = 'block';
      return;
    }

    markDone('circle-2', 'label-2', 'line-2');
    markActive('circle-3');
    document.getElementById('step2-block').style.display = 'none';
    document.getElementById('step3-block').style.display = 'block';
    setTimeout(() => markDone('circle-3', 'label-3', null), 500);
  }
 
  function resetAll() {
    ['circle-1','circle-2','circle-3'].forEach(id => {
      const c = document.getElementById(id);
      c.classList.remove('done', 'active');
      c.classList.add('inactive');
    });
    ['label-1','label-2','label-3'].forEach(id => document.getElementById(id).classList.remove('done-label'));
    ['line-1','line-2'].forEach(id => document.getElementById(id).classList.remove('done-line'));
 
    // reset step 1 to active
    document.getElementById('circle-1').classList.remove('inactive');
    document.getElementById('circle-1').classList.add('active');
 
    document.getElementById('step2-block').style.display = 'none';
    document.getElementById('step3-block').style.display = 'none';
    document.getElementById('step1-block').style.display = 'block';
    document.querySelectorAll('.visitor-card, .dur-btn').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.option-message').forEach(el => el.style.display = 'none');
  }

  