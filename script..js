/* =====================================================================
   MAIN.JS  -  table of contents
   1. Navbar, mobile menu & hero parallax
   2. About frame (reveal, counters, mini carousel)
   3. Projects (featured film, vertical reels, lightbox)
   4. 8-project coverflow carousel   <- edit your 8 projects here
   5. Call to action (marquee, magnetic button)
   6. Project detail view            <- edit gallery + details here
   ===================================================================== */
(() => {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const body = document.body;

  // navbar turns solid on scroll
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // mobile menu
  const setMenu = open => {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  document.querySelectorAll('#drawer a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

  // smooth mouse parallax (desktop only, skipped for reduced motion)
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (still || !fine) return;
  const items = [...document.querySelectorAll('[data-depth]')];
  let tx = 0, ty = 0, x = 0, y = 0;
  addEventListener('mousemove', e => {
    tx = (e.clientX / innerWidth - .5) * 2;
    ty = (e.clientY / innerHeight - .5) * 2;
  });
  (function loop(){
    x += (tx - x) * .06; y += (ty - y) * .06;
    items.forEach(el => {
      const d = +el.dataset.depth;
      el.style.transform = `translate3d(${x * d}px,${y * d * .6}px,0)`;
    });
    requestAnimationFrame(loop);
  })();
})();

/* ================= ABOUT FRAME ================= */
(() => {
  const frame = document.getElementById('frame');
  if (!frame) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reveal + count-up when the frame scrolls into view
  const countUp = el => {
    const end = +el.dataset.count;
    if (still) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1600;
    (function tick(t){
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  };
  new IntersectionObserver((entries, io) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      frame.classList.add('in');
      frame.querySelectorAll('[data-count]').forEach(countUp);
      io.disconnect();
    });
  }, {threshold:.2}).observe(frame);

  // mini project carousel (edit this list with the client's projects)
  const projects = [
    {img:'images/project-1.jpg', loc:'Ulaanbaatar, Mongolia'},
    {img:'images/project-2.jpg', loc:'Agadir, Morocco'},
    {img:'images/project-3.jpg', loc:'Marrakech, Morocco'}
  ];
  const fallback = 'linear-gradient(135deg,#4a4d3a,#1E1E1E)';
  const img = document.getElementById('miniImg'), loc = document.getElementById('miniLoc');
  let i = 0;
  const show = n => {
    i = (n + projects.length) % projects.length;
    img.classList.add('swap');
    setTimeout(() => {
      img.style.backgroundImage = `url("${projects[i].img}"), ${fallback}`;
      loc.textContent = projects[i].loc;
      img.classList.remove('swap');
    }, 350);
  };
  img.style.backgroundImage = `url("${projects[0].img}"), ${fallback}`;
  loc.textContent = projects[0].loc;
  document.getElementById('prev').addEventListener('click', () => show(i - 1));
  document.getElementById('next').addEventListener('click', () => show(i + 1));

  // gentle parallax on the big photo while scrolling
  const photo = frame.querySelector('.photo');
  if (!still && photo) {
    addEventListener('scroll', () => {
      const r = frame.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      photo.style.transform = `translateY(${(r.top / innerHeight) * -28}px) scale(1.04)`;
    }, {passive:true});
  }
})();

/* ================= PROJECTS ================= */
(() => {
  const track = document.getElementById('reelsTrack');
  if (!track) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const pad = n => String(n).padStart(2, '0');

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), {threshold:.12});
  document.querySelectorAll('.projects .reveal').forEach(el => io.observe(el));

  /* ---- EDIT HERE: your media ---- */
  const places = ['Ulaanbaatar, Mongolia', 'Agadir, Morocco', 'Marrakech, Morocco'];
  const feats = [
    {src:'videos/video-1.mp4', title:'Homes that listen<br>to their landscape.', place:places[1]},
    {src:'videos/video-2.mp4', title:'Quiet spaces,<br>full of light.',        place:places[2]},
    {src:'videos/video-3.mp4', title:'Built to belong<br>where it stands.',    place:places[0]}
  ];

  /* ---- lightbox ---- */
  const lb = document.getElementById('lb'), stage = document.getElementById('lbStage'), cap = document.getElementById('lbCap');
  let list = [], idx = 0, lastFocus = null;
  const strip = h => h.replace(/<br>/g, ' ');
  const showLB = () => {
    const it = list[idx];
    stage.innerHTML = it.type === 'video' ? `<video src="${it.src}" controls autoplay playsinline loop></video>` : `<img src="${it.src}" alt="">`;
    cap.textContent = `${strip(it.title)} · ${it.place}  ·  ${idx + 1} / ${list.length}`;
  };
  const openLB = (l, i) => { list = l; idx = i; lastFocus = document.activeElement; lb.hidden = false; document.body.style.overflow = 'hidden'; showLB(); document.getElementById('lbX').focus(); };
  const closeLB = () => { lb.hidden = true; stage.innerHTML = ''; document.body.style.overflow = ''; lastFocus && lastFocus.focus(); };
  const step = d => { idx = (idx + d + list.length) % list.length; showLB(); };
  document.getElementById('lbX').onclick = closeLB;
  window.openLB = openLB;
  document.getElementById('lbP').onclick = () => step(-1);
  document.getElementById('lbN').onclick = () => step(1);
  lb.addEventListener('click', e => { if (e.target === lb || e.target === stage) closeLB(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ---- featured player ---- */
  const fv = document.getElementById('featVideo'), ft = document.getElementById('featTitle'), fl = document.getElementById('featLoc');
  const tabs = [...document.querySelectorAll('.notch button')];
  let fi = 0;
  const playF = () => { if (!still) fv.play().catch(() => {}); };
  const setFeat = i => {
    fi = (i + feats.length) % feats.length;
    fv.classList.add('swap'); ft.classList.add('swap');
    setTimeout(() => {
      fv.src = feats[fi].src; ft.innerHTML = feats[fi].title; fl.textContent = feats[fi].place;
      tabs.forEach((t, k) => t.classList.toggle('on', k === fi));
      fv.classList.remove('swap'); ft.classList.remove('swap'); playF();
    }, 350);
  };
  fv.src = feats[0].src; fl.textContent = feats[0].place;
  tabs.forEach((t, k) => t.addEventListener('click', () => setFeat(k)));
  document.getElementById('featNext').onclick = () => setFeat(fi + 1);
  document.getElementById('featPlay').onclick = () => openLB(feats.map(f => ({type:'video', src:f.src, title:f.title, place:f.place})), fi);
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? playF() : fv.pause()), {threshold:.25}).observe(document.getElementById('feat'));

  /* ---- reels: the 9 vertical explainer films ---- */
  /* ---- EDIT HERE: titles + small labels (files: videos/video-1.mp4 … video-9.mp4) ---- */
  const reelData = [
    ['Reading the landscape',    'Design'],   ['Why we build on stilts',   'Structure'], ['Light & orientation',      'Design'],
    ['Materials that last',      'Materials'], ['Privacy by design',        'Planning'],  ['Planning the interior',    'Interior'],
    ['From sketch to render',    'Process'],   ['Building on site',         'Build'],     ['Living in the finished home', 'Result']
  ];
  const reels = reelData.map(([title, tag], i) => ({type:'video', src:`videos/video-${i + 1}.mp4`, title, place:tag}));
  track.innerHTML = reels.map((r, i) => `
    <figure class="reel" tabindex="0" data-i="${i}">
      <video muted loop playsinline preload="metadata" src="${r.src}#t=0.5"></video>
      <i class="reel-no">${pad(i + 1)}</i>
      <i class="reel-play"><svg viewBox="0 0 10 12" fill="currentColor"><path d="M0 0l10 6-10 6z"/></svg></i>
      <figcaption><span>${r.place}</span><b>${r.title}</b></figcaption>
    </figure>`).join('');

  let dragX = null, startLeft = 0, dragged = false;
  track.querySelectorAll('.reel').forEach(el => {
    const v = el.querySelector('video'), open = () => openLB(reels, +el.dataset.i);
    el.addEventListener('click', () => { if (dragged) { dragged = false; return; } open(); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    if (fine && !still) {                                   // silent preview on hover
      el.addEventListener('mouseenter', () => v.play().catch(() => {}));
      el.addEventListener('mouseleave', () => { v.pause(); v.currentTime = .5; });
    }
  });

  // mouse drag-to-scroll (touch already scrolls natively)
  track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; dragX = e.clientX; startLeft = track.scrollLeft; dragged = false; });
  addEventListener('pointermove', e => {
    if (dragX === null) return;
    const d = e.clientX - dragX;
    if (Math.abs(d) > 5) { dragged = true; track.style.scrollSnapType = 'none'; track.scrollLeft = startLeft - d; }
  });
  addEventListener('pointerup', () => { if (dragX === null) return; dragX = null; track.style.scrollSnapType = ''; });

  // arrows + progress bar
  const card = () => track.querySelector('.reel').offsetWidth + 14;
  const scrollBy = d => track.scrollBy({left:d * card() * 2, behavior: still ? 'auto' : 'smooth'});
  document.getElementById('reelPrev').onclick = () => scrollBy(-1);
  document.getElementById('reelNext').onclick = () => scrollBy(1);
  const bar = document.getElementById('reelsBar');
  const progress = () => {
    const max = track.scrollWidth - track.clientWidth, w = Math.min(100, track.clientWidth / track.scrollWidth * 100);
    bar.style.width = w + '%';
    bar.style.marginLeft = (max > 0 ? track.scrollLeft / max * (100 - w) : 0) + '%';
  };
  track.addEventListener('scroll', progress, {passive:true});
  addEventListener('resize', progress);
  progress();
})();

/* ================= 8-PROJECT COVERFLOW ================= */
(() => {
  const stage = document.getElementById('cfStage');
  if (!stage) return;

  /* ---- EDIT HERE: your 8 projects (images/project-1.jpg … project-8.jpg) ---- */
  const data = [
    {n:'Terra House',      c:'Private house', p:'City, Country', a:'173 m²', y:2022, d:'A compact home on stilts, sheltered from the wind by deep overhangs and open to the landscape.'},
    {n:'Atlas Villa',      c:'Villa',         p:'City, Country', a:'320 m²', y:2023, d:'Warm stone and timber around a quiet inner courtyard, built for long family summers.'},
    {n:'Dune Residence',   c:'Private house', p:'City, Country', a:'210 m²', y:2021, d:'Low, horizontal volumes that follow the dunes and frame the horizon from every room.'},
    {n:'Cedar Retreat',    c:'Retreat',       p:'City, Country', a:'140 m²', y:2024, d:'A calm cabin of dark cedar and glass, tucked into the trees for total privacy.'},
    {n:'Horizon House',    c:'Private house', p:'City, Country', a:'260 m²', y:2022, d:'Panoramic glazing and a floating roof line turn the view into part of the interior.'},
    {n:'Stone Pavilion',   c:'Pavilion',      p:'City, Country', a:'95 m²',  y:2023, d:'A minimal guest pavilion in raw stone, designed to stay cool and quiet all year.'},
    {n:'Oasis Courtyard',  c:'Villa',         p:'City, Country', a:'410 m²', y:2020, d:'Garden, water and shade gathered around a central court for relaxed outdoor living.'},
    {n:'Nordic Cabin',     c:'Cabin',         p:'City, Country', a:'80 m²',  y:2024, d:'A small cabin with big ideas: smart storage, soft light and a generous terrace.'}
  ];
  const N = data.length, pad = n => String(n).padStart(2, '0');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  stage.innerHTML = data.map((d, i) => `
    <article class="cf-card" data-i="${i}" aria-label="${d.n}">
      <img src="images/project-${i + 1}.jpg" alt="${d.n}" loading="lazy" draggable="false" onerror="this.remove()">
      <button type="button" class="cf-exp">Expand</button>
      <div class="cf-glass">
        <div class="cf-top"><h4>${d.n}</h4><span>${i + 1} / ${N}</span></div>
        <small>${d.c}</small>
        <div class="cf-more"><p>${d.d}</p>
          <div class="meta"><span><b>${d.p}</b></span><span>${d.a}</span><span>${d.y}</span></div></div>
      </div>
    </article>`).join('');

  const cards = [...stage.children];
  const dotsEl = document.getElementById('cfDots');
  dotsEl.innerHTML = data.map((d, i) => `<button type="button" aria-label="Go to ${d.n}"></button>`).join('');
  const dots = [...dotsEl.children];
  const nameEl = document.getElementById('cfName'), catEl = document.getElementById('cfCat'), thumb = document.getElementById('cfThumb'), heart = document.getElementById('cfHeart');
  const saved = new Set();
  let cur = 0;

  const update = () => {
    cards.forEach((c, i) => {
      const o = ((i - cur + N / 2) % N + N) % N - N / 2;      // signed distance from the active card
      const a = Math.abs(o), s = Math.sign(o);
      const jump = c._o !== undefined && Math.abs(o - c._o) > N / 2;  // wrapping around the back: don't animate across the stage
      if (jump) c.style.transition = 'none';
      const x = s * (a ? a * 52 + 14 : 0), z = -a * 140, r = s * (a ? 24 + (a - 1) * 10 : 0);
      c.style.transform = `translateX(${x}%) translateZ(${z}px) rotateY(${-r}deg) scale(${1 - a * .07})`;
      c.style.opacity = [1, 1, .85, .4, 0][a];
      c.style.filter = `brightness(${1 - a * .16})`;
      c.style.zIndex = 10 - a;
      c.style.pointerEvents = a > 2 ? 'none' : 'auto';
      c.classList.toggle('on', o === 0);
      c.setAttribute('aria-hidden', o !== 0);
      if (jump) { void c.offsetWidth; c.style.transition = ''; }
      c._o = o;
    });
    dots.forEach((d, i) => d.classList.toggle('on', i === cur));
    nameEl.textContent = data[cur].n; catEl.textContent = `${data[cur].c} · ${data[cur].y}`;
    thumb.style.backgroundImage = `url("images/project-${cur + 1}.jpg"), linear-gradient(135deg,#B1C729,#4a4d3a)`;
    heart.setAttribute('aria-pressed', saved.has(cur));
  };
  const go = i => { cur = (i + N) % N; update(); };

  document.getElementById('cfPrev').onclick = () => go(cur - 1);
  document.getElementById('cfNext').onclick = () => go(cur + 1);
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  heart.addEventListener('click', () => { saved.has(cur) ? saved.delete(cur) : saved.add(cur); heart.setAttribute('aria-pressed', saved.has(cur)); });
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
  });

  // drag / swipe, and click a side card to bring it forward
  let sx = null, moved = false;
  stage.addEventListener('pointerdown', e => { sx = e.clientX; moved = false; });
  stage.addEventListener('pointercancel', () => sx = null);
  stage.addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50) { moved = true; go(cur + (dx < 0 ? 1 : -1)); }
  });
  stage.addEventListener('click', e => {
    if (moved) { moved = false; return; }
    if (e.target.closest('.cf-exp')) {
      window.openProject && window.openProject(cur);
      return;
    }
    const c = e.target.closest('.cf-card');
    if (c && !c.classList.contains('on')) go(+c.dataset.i);
    else if (c) window.openProject && window.openProject(cur);
  });

  // place cards without animating on first paint
  cards.forEach(c => c.style.transition = 'none');
  update();
  void stage.offsetWidth;
  cards.forEach(c => c.style.transition = '');
})();

/* ================= CTA ================= */
(() => {
  const panel = document.querySelector('.cta-panel');
  if (!panel) return;
  const track = document.getElementById('mqTrack');
  track.innerHTML += track.innerHTML;                      // duplicate words for a seamless loop

  new IntersectionObserver((es, io) => es.forEach(e => {
    if (e.isIntersecting) { panel.classList.add('in'); io.disconnect(); }
  }), {threshold:.15}).observe(panel);

  // magnetic button
  const btn = document.getElementById('ctaBtn');
  const ok = matchMedia('(hover:hover) and (pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ok) return;
  btn.addEventListener('pointermove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.transition = 'background .35s,color .35s,box-shadow .35s';
    btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
  });
  btn.addEventListener('pointerleave', () => {
    btn.style.transition = 'transform .7s var(--ease),background .35s,color .35s,box-shadow .35s';
    btn.style.transform = '';
  });
})();

/* ================= PROJECT DETAIL VIEW ================= */
(() => {
  /* ---------- EDIT HERE: one entry per project, same order as the carousel ----------
     gallery items:  {type:'image', src:'...'}   or   {type:'video', src:'...'}
     Delete any gallery item you don't have. */
  const P = (n, name, cat, area, year, desc) => ({
    name, cat, area, year, desc,
    loc: 'City, Country',
    arch: 'Name Surname',
    gallery: [1, 2, 3, 4].map(k => ({type:'image', src:`images/projects/project-${n}/${k}.jpg`}))
      .concat([{type:'video', src:`videos/project-${n}.mp4`}])
  });
  const PROJECTS = [
    P(1, 'Terra House',     'Private house', '173 m²', 2022, 'A compact home on stilts, sheltered from the wind by deep overhangs and open to the landscape. Replace this with the full project story.'),
    P(2, 'Atlas Villa',     'Villa',         '320 m²', 2023, 'Warm stone and timber around a quiet inner courtyard, built for long family summers.'),
    P(3, 'Dune Residence',  'Private house', '210 m²', 2021, 'Low, horizontal volumes that follow the dunes and frame the horizon from every room.'),
    P(4, 'Cedar Retreat',   'Retreat',       '140 m²', 2024, 'A calm cabin of dark cedar and glass, tucked into the trees for total privacy.'),
    P(5, 'Horizon House',   'Private house', '260 m²', 2022, 'Panoramic glazing and a floating roof line turn the view into part of the interior.'),
    P(6, 'Stone Pavilion',  'Pavilion',      '95 m²',  2023, 'A minimal guest pavilion in raw stone, designed to stay cool and quiet all year.'),
    P(7, 'Oasis Courtyard', 'Villa',         '410 m²', 2020, 'Garden, water and shade gathered around a central court for relaxed outdoor living.'),
    P(8, 'Nordic Cabin',    'Cabin',         '80 m²',  2024, 'A small cabin with big ideas: smart storage, soft light and a generous terrace.')
  ];

  /* ---------- markup ---------- */
  const chev = d => `<svg viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="${d}"/></svg>`;
  const root = document.createElement('div');
  root.className = 'pd';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Project details');
  root.innerHTML = `
    <div class="pd-scrim"></div>
    <div class="pd-sheet">
      <button class="pd-x" type="button" aria-label="Close">&times;</button>
      <div class="pd-media">
        <div class="pd-stage" id="pdStage">
          <button class="pd-arrow pd-prev" type="button" aria-label="Previous image">${chev('M6.5 1l-5 5 5 5')}</button>
          <button class="pd-arrow pd-next" type="button" aria-label="Next image">${chev('m1.5 1 5 5-5 5')}</button>
          <span class="pd-count" id="pdCount"></span>
        </div>
        <div class="pd-thumbs" id="pdThumbs"></div>
      </div>
      <div class="pd-info">
        <p class="pd-kicker"><i></i><span id="pdKick"></span></p>
        <h2 id="pdName"></h2>
        <p class="pd-desc" id="pdDesc"></p>
        <dl class="pd-specs" id="pdSpecs"></dl>
        <a class="pd-cta" href="#order" id="pdCta"><span>Order a similar project</span>
          <svg viewBox="0 0 34 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M0 6h32M27 1l5 5-5 5"/></svg></a>
        <div class="pd-switch">
          <button type="button" id="pdPrevP">&larr; Previous project</button>
          <button type="button" id="pdNextP">Next project &rarr;</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(root);

  const $ = id => root.querySelector('#' + id);
  const stage = $('pdStage'), thumbs = $('pdThumbs'), count = $('pdCount'), closeBtn = root.querySelector('.pd-x');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let p = 0, g = 0, lastFocus = null;
  const pad = n => String(n).padStart(2, '0');

  /* ---------- rendering ---------- */
  const showMedia = () => {
    const item = PROJECTS[p].gallery[g];
    stage.querySelectorAll('img,video').forEach(el => el.remove());
    const el = document.createElement(item.type === 'video' ? 'video' : 'img');
    el.src = item.src;
    if (item.type === 'video') { el.controls = true; el.playsInline = true; el.loop = true; el.autoplay = !still; }
    else { el.alt = PROJECTS[p].name; el.draggable = false; }
    el.onerror = () => el.remove();                        // missing file → gradient placeholder stays
    stage.prepend(el);
    count.textContent = `${g + 1} / ${PROJECTS[p].gallery.length}`;
    [...thumbs.children].forEach((t, i) => t.classList.toggle('on', i === g));
  };
  const renderProject = () => {
    const d = PROJECTS[p];
    $('pdKick').textContent = `Project ${pad(p + 1)} / ${pad(PROJECTS.length)}`;
    $('pdName').textContent = d.name;
    $('pdDesc').textContent = d.desc;
    $('pdSpecs').innerHTML = [['Location', d.loc], ['Category', d.cat], ['Area', d.area], ['Year', d.year], ['Architects', d.arch]]
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    thumbs.innerHTML = d.gallery.map((m, i) => `
      <button type="button" class="${m.type === 'video' ? 'vid' : ''}" aria-label="Show ${m.type} ${i + 1}">
        ${m.type === 'video' ? `<video src="${m.src}#t=0.5" muted preload="metadata"></video>` : `<img src="${m.src}" alt="" loading="lazy" onerror="this.remove()">`}
      </button>`).join('');
    [...thumbs.children].forEach((t, i) => t.addEventListener('click', () => { g = i; showMedia(); }));
    g = 0; showMedia();
    root.querySelector('.pd-info').scrollTop = 0;
  };

  /* ---------- open / close ---------- */
  const open = i => {
    p = (i + PROJECTS.length) % PROJECTS.length;
    lastFocus = document.activeElement;
    renderProject();
    root.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };
  const close = () => {
    root.classList.remove('open');
    stage.querySelectorAll('video').forEach(v => v.pause());
    document.body.style.overflow = '';
    lastFocus && lastFocus.focus();
  };
  const stepImg = d => { const n = PROJECTS[p].gallery.length; g = (g + d + n) % n; showMedia(); };

  closeBtn.onclick = close;
  root.querySelector('.pd-scrim').onclick = close;
  root.querySelector('.pd-prev').onclick = () => stepImg(-1);
  root.querySelector('.pd-next').onclick = () => stepImg(1);
  $('pdPrevP').onclick = () => open(p - 1);
  $('pdNextP').onclick = () => open(p + 1);
  $('pdCta').addEventListener('click', close);             // jump to the Order section, closing the sheet

  addEventListener('keydown', e => {
    if (!root.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') stepImg(-1);
    if (e.key === 'ArrowRight') stepImg(1);
    if (e.key === 'Tab') {                                 // keep keyboard focus inside the sheet
      const f = [...root.querySelectorAll('button,a[href]')].filter(el => el.offsetParent !== null);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // swipe on the image
  let sx = null;
  stage.addEventListener('pointerdown', e => { if (e.target.tagName !== 'VIDEO') sx = e.clientX; });
  stage.addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50) stepImg(dx < 0 ? 1 : -1);
  });

  window.openProject = open;
})();