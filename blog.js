  const menuBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('closeBtn');
  const navOverlay = document.getElementById('navOverlay');
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  function openNav(){
    navOverlay.classList.add('open');
    navOverlay.setAttribute('aria-hidden','false');
    menuBtn.setAttribute('aria-expanded','true');
    body.classList.add('lock');
  }
  function closeNav(){
    navOverlay.classList.remove('open');
    navOverlay.setAttribute('aria-hidden','true');
    menuBtn.setAttribute('aria-expanded','false');
    body.classList.remove('lock');
  }

  menuBtn.addEventListener('click', openNav);
  closeBtn.addEventListener('click', closeNav);

  document.querySelectorAll('.nav-close').forEach(link=>{
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeNav();
  });

  themeToggle.addEventListener('click', ()=>{
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
  });