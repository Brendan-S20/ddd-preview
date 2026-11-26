// Detroit Doo Disposal preview by HoundStack.
// Preview only: nothing on this site sends, saves or calls anything. No fetch, no form action.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Mobile menu
  const menuBtn = $('.menu-btn'), nav = $('nav.main');
  if (menuBtn && nav) {
    const setMenu = open => { nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); menuBtn.textContent = open ? 'Close' : 'Menu'; };
    menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
    // Close when focus or a tap leaves the header
    const head = $('header.site');
    head.addEventListener('focusout', e => { if (e.relatedTarget && !head.contains(e.relatedTarget)) setMenu(false); });
    document.addEventListener('click', e => { if (nav.classList.contains('open') && !head.contains(e.target)) setMenu(false); });
  }

  // Slogan band: pause and play
  const bandBtn = $('.band-toggle');
  if (bandBtn) bandBtn.addEventListener('click', () => {
    const paused = $('.band').classList.toggle('paused');
    bandBtn.textContent = paused ? 'Play banner' : 'Pause banner';
  });

  // Preview-only dialog for Portal and Call
  const dlg = $('#preview-dlg');
  const msgs = {
    portal: ['Customer portal', 'On the live version this opens the Detroit Doo customer portal. In this preview it goes nowhere.'],
    call: ['Call (734) 301-7232', 'On the live version this button calls Detroit Doo. Calling is off in the preview so nobody rings Devin by accident.']
  };
  $$('[data-preview]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    const m = msgs[el.dataset.preview]; if (!m || !dlg) return;
    $('#dlg-title').textContent = m[0];
    $('#dlg-body').textContent = m[1];
    dlg.showModal();
  }));
  if (dlg) {
    $('#dlg-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  }

  // Service area checker: a result links straight to booking, with the city filled in on a match
  const zone = $('#zone-input');
  if (zone) {
    const items = $$('.cities li');
    const norm = s => s.toLowerCase().replace(/township|twp\.?/g, '').replace(/[^a-z]/g, '');
    const out = $('#zone-msg');
    const cta = city => {
      const a = document.createElement('a');
      a.className = 'zone-go';
      a.href = 'book.html' + (city ? '?city=' + encodeURIComponent(city) : '');
      a.textContent = 'Schedule My Cleanup →';
      return a;
    };
    zone.addEventListener('input', () => {
      const q = norm(zone.value);
      items.forEach(li => li.classList.remove('hit'));
      out.className = 'zone-msg';
      out.textContent = '';
      if (/^\s*\d/.test(zone.value)) { out.classList.add('maybe'); out.textContent = 'Type your city name, not a ZIP code.'; return; }
      if (q.length < 3) return;
      const hits = items.filter(li => norm(li.textContent).startsWith(q));
      if (hits.length) {
        hits.forEach(li => li.classList.add('hit'));
        out.classList.add('yes');
        const city = hits[0].textContent;
        out.append('You’re in our zone. ' + city + ' gets scooped. ', cta(city));
      } else {
        out.classList.add('maybe');
        out.append('Not on the list yet. If you’re in Wayne County, just ask. ', cta(''));
      }
    });
  }

  // FAQ filter buttons
  const tabs = $$('.faq-tabs button');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-pressed', x === t));
    $$('.faq-group').forEach(g => g.classList.toggle('hidden', t.dataset.tab !== 'all' && g.dataset.group !== t.dataset.tab));
  }));

  // Booking wizard (preview only: no action, no network, nothing stored)
  const form = $('#book-form');
  if (!form) return;
  const steps = $$('.bstep', form), bars = $$('.progress span');
  const err = $('#book-err'), label = $('#step-label'), errHome = $('.nav-row', form);
  let i = 0;
  const params = new URLSearchParams(location.search);
  if (params.get('type') === 'commercial') $('#t-com').checked = true;
  const wantCity = (params.get('city') || '').toLowerCase();
  if (wantCity) {
    const sel = $('#f-city');
    const match = Array.from(sel.options).find(o => o.value.toLowerCase() === wantCity);
    if (match) sel.value = match.value;
  }

  function syncType() {
    const com = $('#t-com').checked;
    $$('.only-res', form).forEach(e => e.classList.toggle('hidden', com));
    $$('.only-com', form).forEach(e => e.classList.toggle('hidden', !com));
  }
  $$('input[name=type]').forEach(r => r.addEventListener('change', syncType));
  syncType();

  function show(n, focus) {
    i = n;
    steps.forEach((s, k) => s.classList.toggle('hidden', k !== n));
    bars.forEach((b, k) => b.classList.toggle('on', k <= n));
    $('#back').classList.toggle('hidden', n === 0);
    $('#next').textContent = n === steps.length - 1 ? 'Request my cleanup' : 'Next';
    label.textContent = 'Step ' + (n + 1) + ' of ' + steps.length;
    clearErr();
    if (focus) {
      $('legend', steps[n]).focus({ preventScroll: true });
      $('#book-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  // Errors show right under the field they are about, scrolled into view (phones too)
  function clearErr() {
    err.textContent = '';
    errHome.before(err);
    $$('[aria-invalid]', form).forEach(f => { f.removeAttribute('aria-invalid'); f.removeAttribute('aria-describedby'); });
  }
  function bad(f, msg) {
    const box = f.closest('.field');
    box.append(err);
    err.textContent = msg;
    f.setAttribute('aria-invalid', 'true');
    f.setAttribute('aria-describedby', 'book-err');
    f.focus({ preventScroll: true });
    box.scrollIntoView({ block: 'center' });
    return false;
  }
  form.addEventListener('input', e => { if (e.target.hasAttribute('aria-invalid') || e.target.type === 'radio') clearErr(); });
  form.addEventListener('change', e => { if (e.target.type === 'radio') clearErr(); });
  function valid() {
    const s = steps[i];
    const radios = $$('input[type=radio]', s).filter(r => !r.closest('.hidden'));
    const names = [...new Set(radios.map(r => r.name))];
    for (const n of names) if (!$(`input[name="${n}"]:checked`, s)) {
      const first = $(`input[name="${n}"]`, s), fs = first.closest('fieldset');
      $('legend', fs).after(err);
      err.textContent = 'Pick how often to keep going.';
      first.focus({ preventScroll: true });
      fs.scrollIntoView({ block: 'center' });
      return false;
    }
    for (const f of $$('input[required],select[required]', s)) {
      if (f.closest('.hidden')) continue;
      f.removeAttribute('aria-invalid');
      if (!f.value.trim()) return bad(f, 'We need your ' + f.dataset.label + '.');
      if (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value)) return bad(f, 'That email looks off.');
      if (f.type === 'tel' && f.value.replace(/\D/g, '').length < 10) return bad(f, 'That phone number looks short.');
    }
    return true;
  }
  $('#back').addEventListener('click', () => show(Math.max(0, i - 1), true));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!valid()) return;
    if (i < steps.length - 1) return show(i + 1, true);
    const pick = $(($('#t-com').checked ? 'input[name=cplan]' : 'input[name=plan]') + ':checked');
    const plan = pick ? pick.value : '';
    const first = ($('#f-name').value.trim().split(' ')[0]) || 'friend';
    form.reset();
    form.classList.add('hidden');
    const done = $('#book-done');
    $('#done-name').textContent = first;
    const planText = { 'Twice a week': ' for a twice-a-week plan', 'One-time': ' for a one-time cleanup' };
    $('#done-plan').textContent = plan ? (planText[plan] || ' for a ' + plan.toLowerCase() + ' plan') : '';
    done.classList.remove('hidden');
    done.focus({ preventScroll: true });
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  show(0, false);
})();
