const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const content = document.getElementById('smooth-content');

  /* ---- smooth (lerp) scroll ---- */
  function initSmoothScroll(){
    function setHeight(){ document.body.style.height = content.getBoundingClientRect().height + 'px'; }
    setHeight();
    window.addEventListener('resize', setHeight);

    let current = window.scrollY, target = window.scrollY;
    function raf(){
      target = window.scrollY;
      current += (target - current) * 0.085;
      content.style.transform = `translate3d(0, ${-current}px, 0)`;
      requestAnimationFrame(raf);
    }
    raf();
  }

  /* ---- hero entrance ---- */
  function playHeroEntrance(){
    if(window.gsap && !reduceMotion){
      gsap.set('.hero-line', {yPercent:120, opacity:0});
      gsap.set('.nav-logo, .nav-link, .hero-tagline, .scroll-cue', {opacity:0, y:-14});
      gsap.timeline({defaults:{ease:'power3.out'}})
        .to('.nav-logo', {opacity:1, y:0, duration:.6})
        .to('.nav-link', {opacity:1, y:0, duration:.6}, '<')
        .to('.hero-line', {yPercent:0, opacity:1, duration:.9, stagger:0.1}, '+=0.1')
        .to('.hero-tagline', {opacity:1, y:0, duration:.7}, '-=0.3')
        .to('.scroll-cue', {opacity:1, y:0, duration:.8}, '-=0.2');
    } else {
      document.querySelectorAll('.hero-line, .nav-logo, .nav-link, .hero-tagline, .scroll-cue')
        .forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    }
  }

  /* ---- everything below only starts once the preloader (if present) clears ---- */
  function startSite(){
    if(!reduceMotion){ initSmoothScroll(); }
    playHeroEntrance();
  }

  /* ---- preloader: paced counter, but it won't cross ~92% until the page has actually finished loading ---- */
  const preloader = document.getElementById('preloader');
  if(preloader){
    if(reduceMotion){
      preloader.remove();
      startSite();
    } else {
      const bg = preloader.querySelector('.preloader-bg');
      const text = preloader.querySelector('.preloader-text');
      document.body.classList.add('is-loading');

      let load = 0;
      let pageReady = document.readyState === 'complete';
      const CAP = 92;

      if(!pageReady){ window.addEventListener('load', () => { pageReady = true; }); }

      (function tick(){
        const ceiling = pageReady ? 100 : CAP;
        if(load < ceiling){ load++; }
        if(text){
          text.textContent = `${load}%`;
          text.style.opacity = 1 - load / 100;
          text.style.width = `${10 + load}%`;
        }
        if(bg){ bg.style.filter = `blur(${30 - (load * 30) / 100}px)`; }

        if(load >= 100){
          preloader.classList.add('is-done');
          document.body.classList.remove('is-loading');
          startSite();
          setTimeout(() => preloader.remove(), 650);
          return;
        }
        setTimeout(tick, 30);
      })();
    }
  } else {
    startSite();
  }


  /* ---- scroll reveal for work rows ---- */
  const rows = document.querySelectorAll('.row');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('is-visible'); } });
  }, { threshold: 0.2 });
  rows.forEach(r => io.observe(r));

  /* ---- blog link draw-in ---- */
  const blogLink = document.querySelector('.blog-link');
  if(blogLink){
    if(reduceMotion){
      blogLink.classList.add('is-visible');
    } else {
      const blogObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      blogObserver.observe(blogLink);
    }
  }

  /* ---- cursor-following hover panel (desktop only) ---- */
  const canHover = window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:1024px)').matches;
  if(canHover){
    const panel = document.getElementById('hoverPanel');
    const img = document.getElementById('hoverImg');
    const panelH = 340;
    let mouse = {x:0,y:0}, pos = {x:0,y:0}, target = {x:0,y:0}, active = false;

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if(active){ target.x = mouse.x + 28; }
    });

    function panelLoop(){
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      if(active){
        panel.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      }
      requestAnimationFrame(panelLoop);
    }
    panelLoop();

    let currentSrc = '';
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        const rect = row.getBoundingClientRect();
        target.x = mouse.x + 28;
        target.y = rect.top + rect.height / 2 - panelH / 2;
        pos.x = target.x; pos.y = target.y; // snap so it appears right at the row, no diagonal slide-in
        active = true;

        const src = row.dataset.img;
        const reveal = () => {
          if(!active) return; // mouse already left before the image finished loading
          pos.x = target.x; pos.y = target.y; // re-sync to where the cursor actually is now, no catch-up jump
          panel.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
          gsap ? gsap.to(panel, {opacity:1, scale:1, duration:.4, ease:'power3.out', overwrite:true})
               : (panel.style.opacity = 1);
        };

        if(src !== currentSrc){
          currentSrc = src;
          img.onload = reveal;
          img.src = src;
        } else {
          reveal(); // same image already loaded — no need to re-decode it
        }
      });
      row.addEventListener('mouseleave', () => {
        active = false;
        gsap ? gsap.to(panel, {opacity:0, scale:.92, duration:.3, overwrite:true}) : (panel.style.opacity = 0);
      });
    });
  }