// Detroit Doo Disposal preview by HoundStack.
// Preview only: nothing on this site sends, saves or calls anything.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Mobile menu
  const menuBtn = $('.menu-btn'), nav = $('nav.main');
  if (menuBtn && nav) menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
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
  if (dlg) $('#dlg-close').addEventListener('click', () => dlg.close());

  // Service area checker
  const zone = $('#zone-input');
  if (zone) {
    const items = $$('.cities li');
    const norm = s => s.toLowerCase().replace(/township|twp\.?/g, '').replace(/[^a-z]/g, '');
    zone.addEventListener('input', () => {
      const q = norm(zone.value), out = $('#zone-msg');
      items.forEach(li => li.classList.remove('hit'));
      out.className = 'zone-msg';
      if (q.length < 3) { out.textContent = ''; return; }
      const hits = items.filter(li => norm(li.textContent).startsWith(q));
      if (hits.length) {
        hits.forEach(li => li.classList.add('hit'));
        out.classList.add('yes');
        out.textContent = 'You’re in our zone. ' + hits[0].textContent + ' gets scooped.';
      } else {
        out.classList.add('maybe');
        out.textContent = 'Not on the list yet. If you’re in Wayne County, ask anyway — we probably cover you.';
      }
    });
  }

  // FAQ tabs
  const tabs = $$('.faq-tabs button');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', x === t));
    $$('.faq-group').forEach(g => g.classList.toggle('hidden', t.dataset.tab !== 'all' && g.dataset.group !== t.dataset.tab));
  }));

  // Booking wizard (preview only: no action, no network)
  const form = $('#book-form');
  if (!form) return;
  const steps = $$('.bstep', form), bars = $$('.progress span');
  const err = $('#book-err');
  let i = 0;
  const params = new URLSearchParams(location.search);
  if (params.get('type') === 'commercial') $('#t-com').checked = true;

  function syncType() {
    const com = $('#t-com').checked;
    $$('.only-res').forEach(e => e.classList.toggle('hidden', com));
    $$('.only-com').forEach(e => e.classList.toggle('hidden', !com));
  }
  $$('input[name=type]').forEach(r => r.addEventListener('change', syncType));
  syncType();

  function show(n) {
    i = n;
    steps.forEach((s, k) => s.classList.toggle('hidden', k !== n));
    bars.forEach((b, k) => b.classList.toggle('on', k <= n));
    $('#back').classList.toggle('hidden', n === 0);
    $('#next').textContent = n === steps.length - 1 ? 'Request my cleanup' : 'Next';
    err.textContent = '';
  }
  function valid() {
    const s = steps[i];
    const radios = $$('input[type=radio]', s).filter(r => !r.closest('.hidden'));
    const names = [...new Set(radios.map(r => r.name))];
    for (const n of names) if (!$(`input[name="${n}"]:checked`, s)) { err.textContent = 'Pick one to keep going.'; return false; }
    for (const f of $$('input[required],select[required]', s)) {
      if (f.closest('.hidden')) continue;
      if (!f.value.trim()) { err.textContent = 'We need your ' + f.dataset.label + '.'; f.focus(); return false; }
      if (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value)) { err.textContent = 'That email looks off.'; f.focus(); return false; }
    }
    return true;
  }
  $('#back').addEventListener('click', () => show(Math.max(0, i - 1)));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!valid()) return;
    if (i < steps.length - 1) return show(i + 1);
    const pick = $(($('#t-com').checked ? 'input[name=cplan]' : 'input[name=plan]') + ':checked');
    const plan = pick ? pick.value : '';
    const first = ($('#f-name').value.trim().split(' ')[0]) || 'friend';
    form.reset();
    form.classList.add('hidden');
    const done = $('#book-done');
    $('#done-name').textContent = first;
    $('#done-plan').textContent = plan ? ' for a ' + plan.toLowerCase() + ' plan' : '';
    done.classList.remove('hidden');
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  show(0);
})();
