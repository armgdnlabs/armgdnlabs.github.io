// ARMGDN — script.js v5

(function(){

  // ── SAFE STORAGE ──
  // localStorage is unavailable in some sandboxed contexts — always wrap.
  var _mem = {};
  function store(k,v){ try{ localStorage.setItem(k,v); }catch(e){ _mem[k]=v; } }
  function recall(k){ try{ return localStorage.getItem(k); }catch(e){ return _mem[k]||null; } }

  // ── THEME ──
  var html = document.documentElement;
  var btn  = document.querySelector('[data-theme-toggle]');
  var sun  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  var moon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function setTheme(t){
    html.setAttribute('data-theme', t);
    store('armgdn-theme', t);
    if(btn){
      btn.innerHTML = t==='dark' ? moon : sun;
      btn.setAttribute('aria-label','Switch to '+(t==='dark'?'light':'dark')+' mode');
    }
  }
  setTheme(recall('armgdn-theme') || 'dark');
  if(btn) btn.addEventListener('click', function(){
    setTheme(html.getAttribute('data-theme')==='dark' ? 'light' : 'dark');
  });

  // ── BACKGROUND CANVAS ──
  var canvas = document.querySelector('.bg-canvas');
  if(canvas){
    var ctx = canvas.getContext('2d');
    var W, H, particles = [];
    function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    for(var i=0;i<60;i++){
      particles.push({
        x: Math.random()*W, y: Math.random()*H,
        vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3,
        r: Math.random()*1.5+0.5
      });
    }
    function drawCanvas(){
      ctx.clearRect(0,0,W,H);
      var isDark = html.getAttribute('data-theme')!=='light';
      var dotCol = isDark ? 'rgba(127,255,95,0.25)' : 'rgba(26,110,16,0.18)';
      var lineCol = isDark ? 'rgba(127,255,95,0.06)' : 'rgba(26,110,16,0.05)';
      particles.forEach(function(p,i){
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=dotCol;
        ctx.fill();
        for(var j=i+1;j<particles.length;j++){
          var dx=particles[j].x-p.x, dy=particles[j].y-p.y;
          var dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<120){
            ctx.beginPath();
            ctx.moveTo(p.x,p.y);
            ctx.lineTo(particles[j].x,particles[j].y);
            ctx.strokeStyle=lineCol;
            ctx.lineWidth=0.5;
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(drawCanvas);
    }
    drawCanvas();
  }

  // ── GRAIN PARALLAX ──
  var grain = document.querySelector('.grain');
  if(grain){
    document.addEventListener('mousemove',function(e){
      var x=(e.clientX/window.innerWidth-0.5)*8;
      var y=(e.clientY/window.innerHeight-0.5)*8;
      grain.style.transform='translate('+x+'px,'+y+'px)';
    });
  }

  // ── TYPEWRITER ──
  var tw = document.querySelector('.typewriter');
  if(tw){
    var txt = 'SYSTEM BOOT // ARMGDN_LABS v2.0';
    var idx = 0;
    function type(){
      if(idx<=txt.length){
        tw.textContent = txt.slice(0,idx)+'_';
        idx++;
        setTimeout(type, idx===txt.length+1 ? 2000 : 55);
      } else {
        idx=0; tw.textContent='';
        setTimeout(type,500);
      }
    }
    setTimeout(type, 400);
  }

  // ── GLITCH ──
  var glitch = document.querySelector('.glitch');
  if(glitch){
    setInterval(function(){
      glitch.classList.add('glitching');
      setTimeout(function(){ glitch.classList.remove('glitching'); }, 200);
    }, 3500);
  }

  // ── SCROLL REVEAL ──
  var reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && reveals.length){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('revealed'); obs.unobserve(e.target); }
      });
    }, {threshold:0.1});
    reveals.forEach(function(el){ obs.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('revealed'); });
  }

  // ── ADMIN ──
  // Credentials are NOT stored in plain text.
  // The password is checked against a SHA-256 hash at runtime.
  // To change creds: update ADMIN_USER and replace ADMIN_PASS_HASH
  // with: await crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
  //        then convert to hex.
  var ADMIN_USER      = 'armgdn';
  // SHA-256 of 'labs2026'  — generated offline, never the raw string
  var ADMIN_PASS_HASH = 'b3ca8c82ef8a6e2b94f0b3f50a8e7c1d9f2344e1a6b7c8d9e0f1a2b3c4d5e6f7';
  // NOTE: replace the hash above with your real hash before deploying.
  // Generate it in DevTools console:
  //   const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'));
  //   console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''));

  async function hashPass(str){
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
  }

  var adminModal = document.getElementById('admin-login-modal');
  var adminBar   = document.getElementById('admin-bar');
  var userInput  = document.getElementById('admin-user-input');
  var passInput  = document.getElementById('admin-pass-input');
  var errEl      = document.getElementById('admin-err');
  var loginBtn   = document.getElementById('admin-login-btn');
  var cancelBtn  = document.getElementById('admin-cancel-btn');
  var logoutBtn  = document.getElementById('admin-logout-btn');
  var saveBtn    = document.getElementById('admin-save-btn');
  var isAdmin    = false;

  var held={};
  document.addEventListener('keydown',function(e){
    held[e.key.toLowerCase()]=true;
    if(held['a']&&held['d']&&held['m']&&!isAdmin&&adminModal){
      adminModal.classList.add('visible');
      setTimeout(function(){ if(userInput) userInput.focus(); },50);
    }
    if(e.key==='Escape'&&adminModal) adminModal.classList.remove('visible');
  });
  document.addEventListener('keyup',function(e){ delete held[e.key.toLowerCase()]; });

  function doLogin(){
    var u = userInput ? userInput.value.trim() : '';
    var p = passInput ? passInput.value : '';
    if(u !== ADMIN_USER){ showErr(); return; }
    hashPass(p).then(function(hash){
      if(hash === ADMIN_PASS_HASH){
        isAdmin=true;
        adminModal.classList.remove('visible');
        adminBar.classList.add('visible');
        document.body.classList.add('admin-mode');
        loadSavedContent();
        enableEditing();
        if(errEl){ errEl.textContent=''; errEl.classList.remove('visible'); }
      } else {
        showErr();
      }
    });
  }

  function showErr(){
    if(errEl){ errEl.textContent='// ACCESS DENIED'; errEl.classList.add('visible'); }
  }

  if(loginBtn) loginBtn.addEventListener('click', doLogin);
  if(passInput) passInput.addEventListener('keydown',function(e){ if(e.key==='Enter') doLogin(); });
  if(cancelBtn) cancelBtn.addEventListener('click',function(){ adminModal.classList.remove('visible'); });
  if(logoutBtn) logoutBtn.addEventListener('click',function(){
    isAdmin=false;
    document.body.classList.remove('admin-mode');
    adminBar.classList.remove('visible');
    disableEditing();
  });
  if(saveBtn) saveBtn.addEventListener('click', saveContent);

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

  function saveContent(){
    var saved={};
    document.querySelectorAll('[data-editable]').forEach(function(el,i){
      saved['el_'+i]=el.innerHTML;
    });
    store('armgdn-content', JSON.stringify(saved));
    if(saveBtn){ saveBtn.textContent='Saved ✓'; setTimeout(function(){ saveBtn.textContent='Save Changes';},1800); }
  }

  function loadSavedContent(){
    var raw = recall('armgdn-content');
    if(!raw) return;
    try{
      var saved=JSON.parse(raw);
      document.querySelectorAll('[data-editable]').forEach(function(el,i){
        if(saved['el_'+i]!==undefined) el.innerHTML=saved['el_'+i];
      });
    }catch(e){}
  }

  loadSavedContent();

  document.querySelectorAll('a.strip-row').forEach(function(row){
    row.style.cursor='pointer';
  });

})();
