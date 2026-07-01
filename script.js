// ARMGDN — script.js

(function(){
  // ── theme toggle ──
  var html = document.documentElement;
  var btn  = document.querySelector('[data-theme-toggle]');
  var theme = html.getAttribute('data-theme') || 'dark';
  var sun  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  var moon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  function setTheme(t){
    theme = t;
    html.setAttribute('data-theme', t);
    if(btn){
      btn.innerHTML = t==='dark' ? moon : sun;
      btn.setAttribute('aria-label','Switch to '+(t==='dark'?'light':'dark')+' mode');
    }
  }
  setTheme(theme);
  if(btn) btn.addEventListener('click',function(){ setTheme(theme==='dark'?'light':'dark'); });

  // ── grain mouse parallax ──
  var grain = document.querySelector('.grain');
  if(grain){
    document.addEventListener('mousemove',function(e){
      var x = (e.clientX/window.innerWidth - 0.5)*8;
      var y = (e.clientY/window.innerHeight - 0.5)*8;
      grain.style.transform = 'translate('+x+'px,'+y+'px)';
    });
  }

  // ── admin login ──
  var ADMIN_PASS = 'armgdn2026'; // change this
  var adminBar  = document.querySelector('.admin-bar');
  var adminLogin= document.querySelector('.admin-login');
  var adminInput= document.querySelector('.admin-input');
  var adminErr  = document.querySelector('.admin-err');
  var isAdmin   = false;

  // secret: press A+D+M together
  var held = {};
  document.addEventListener('keydown',function(e){
    held[e.key.toLowerCase()]=true;
    if(held['a']&&held['d']&&held['m']&&!isAdmin&&adminLogin){
      adminLogin.classList.add('visible');
      setTimeout(function(){ if(adminInput) adminInput.focus(); },50);
    }
    if(e.key==='Escape'&&adminLogin) adminLogin.classList.remove('visible');
  });
  document.addEventListener('keyup',function(e){ delete held[e.key.toLowerCase()]; });

  var loginBtn = document.getElementById('admin-login-btn');
  var logoutBtn= document.getElementById('admin-logout-btn');
  var cancelBtn= document.getElementById('admin-cancel-btn');

  if(loginBtn) loginBtn.addEventListener('click',function(){
    if(adminInput && adminInput.value === ADMIN_PASS){
      isAdmin = true;
      adminLogin.classList.remove('visible');
      if(adminBar) adminBar.classList.add('visible');
      document.body.classList.add('admin-mode');
      enableEditing();
      if(adminErr) adminErr.classList.remove('visible');
    } else {
      if(adminErr){ adminErr.textContent='wrong password'; adminErr.classList.add('visible'); }
    }
  });
  if(adminInput) adminInput.addEventListener('keydown',function(e){ if(e.key==='Enter'&&loginBtn) loginBtn.click(); });
  if(cancelBtn) cancelBtn.addEventListener('click',function(){ if(adminLogin) adminLogin.classList.remove('visible'); });
  if(logoutBtn) logoutBtn.addEventListener('click',function(){
    isAdmin=false;
    document.body.classList.remove('admin-mode');
    if(adminBar) adminBar.classList.remove('visible');
    disableEditing();
  });

  function enableEditing(){
    document.querySelectorAll('[data-editable]').forEach(function(el){
      el.contentEditable='true';
    });
  }
  function disableEditing(){
    document.querySelectorAll('[data-editable]').forEach(function(el){
      el.contentEditable='false';
    });
  }

  // strip row hover cursor
  document.querySelectorAll('a.strip-row').forEach(function(row){
    row.style.cursor='pointer';
  });

})();
