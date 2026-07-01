// ARMGDN — script.js v6
// Key changes:
//   1. Admin session uses sessionStorage so it persists across page navigations
//   2. Content is only restored when admin is active (not on every page load)
//   3. All accent color references now go through CSS vars (no hardcoded hex)
//   4. Logo/placeholder upload wired up

(function(){

  // ── SAFE STORAGE ──
  // sessionStorage for admin state (lives for tab lifetime, crosses page navigations)
  // localStorage for saved edits and color overrides
  var _mem = {};
  function store(k,v){ try{ localStorage.setItem(k,v); }catch(e){ _mem[k]=v; } }
  function recall(k){ try{ return localStorage.getItem(k); }catch(e){ return _mem[k]||null; } }
  function sStore(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){ _mem['s_'+k]=v; } }
  function sRecall(k){ try{ return sessionStorage.getItem(k); }catch(e){ return _mem['s_'+k]||null; } }
  function sClear(k){ try{ sessionStorage.removeItem(k); }catch(e){ delete _mem['s_'+k]; } }

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

  // Always restore saved color overrides on load (harmless, just CSS vars)
  (function loadSavedColors(){
    var vars = ['--green','--fg','--muted','--bg','--surface','--border'];
    vars.forEach(function(name){
      var saved = recall('armgdn-color-'+name);
      if(saved) document.documentElement.style.setProperty(name, saved);
    });
  })();

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
      // use computed --green for particle color so it follows admin color changes
      var accentRaw = getComputedStyle(html).getPropertyValue('--green').trim() || '#7fff5f';
      var dotCol = isDark
        ? 'color-mix(in oklch,'+accentRaw+' 30%,transparent)'
        : 'color-mix(in oklch,'+accentRaw+' 20%,transparent)';
      var lineCol = isDark
        ? 'color-mix(in oklch,'+accentRaw+' 8%,transparent)'
        : 'color-mix(in oklch,'+accentRaw+' 6%,transparent)';
      // canvas doesn't support color-mix natively — fall back to rgba with fixed opacity
      var dotAlpha = isDark ? 0.25 : 0.18;
      var lineAlpha = isDark ? 0.06 : 0.05;
      particles.forEach(function(p,i){
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=hexToRgba(accentRaw, dotAlpha);
        ctx.fill();
        for(var j=i+1;j<particles.length;j++){
          var dx=particles[j].x-p.x, dy=particles[j].y-p.y;
          var dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<120){
            ctx.beginPath();
            ctx.moveTo(p.x,p.y);
            ctx.lineTo(particles[j].x,particles[j].y);
            ctx.strokeStyle=hexToRgba(accentRaw, lineAlpha);
            ctx.lineWidth=0.5;
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(drawCanvas);
    }
    function hexToRgba(hex, alpha){
      hex = hex.replace('#','');
      if(hex.length===3) hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      var r=parseInt(hex.slice(0,2),16)||127;
      var g=parseInt(hex.slice(2,4),16)||255;
      var b=parseInt(hex.slice(4,6),16)||95;
      return 'rgba('+r+','+g+','+b+','+alpha+')';
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

  // ── TEXT SCRAMBLE ──
  var scrambleEl = document.querySelector('.glitch');
  if(scrambleEl){
    var chars = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ01';
    var originalText = scrambleEl.dataset.text || scrambleEl.textContent;
    scrambleEl.addEventListener('mouseenter', function(){
      var iter = 0;
      var interval = setInterval(function(){
        scrambleEl.textContent = originalText
          .split('')
          .map(function(c,i){
            if(c === ' ' || c === '\n') return c;
            if(i < iter) return originalText[i];
            return chars[Math.floor(Math.random()*chars.length)];
          })
          .join('');
        if(iter >= originalText.length) clearInterval(interval);
        iter += 1.5;
      }, 40);
    });
  }

  // ── STRIP ROW cursor ──
  document.querySelectorAll('.strip-row').forEach(function(row){
    row.style.cursor = 'pointer';
  });

  // ── ADMIN ──
  // SHA-256 of 'labs2026'. To update:
  //   const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('newpassword'));
  //   console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''));
  var ADMIN_USER      = 'armgdn';
  var ADMIN_PASS_HASH = 'aeae0a59f459f47a2ab815a420d6a4e29c7de68c730a7fffca44725563360989';

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

  // ── SESSION PERSISTENCE ──
  // If admin was active in this tab before navigating, restore automatically
  if(sRecall('armgdn-admin') === '1'){
    isAdmin = true;
    document.body.classList.add('admin-mode');
    if(adminBar) adminBar.classList.add('visible');
    loadSavedContent();   // only restore content when admin is confirmed active
    enableEditing();
  }

  // Trigger: hold A+D+M simultaneously
  var held={};
  document.addEventListener('keydown',function(e){
    held[e.key.toLowerCase()]=true;
    if(held['a']&&held['d']&&held['m']&&!isAdmin&&adminModal){
      adminModal.classList.add('visible');
      setTimeout(function(){ if(userInput) userInput.focus(); },50);
    }
    if(e.key==='Escape'){
      if(adminModal) adminModal.classList.remove('visible');
    }
  });
  document.addEventListener('keyup',function(e){ delete held[e.key.toLowerCase()]; });

  function showErr(){ if(errEl){ errEl.textContent='// ACCESS DENIED'; errEl.classList.add('visible'); } }

  function doLogin(){
    var u = userInput ? userInput.value.trim() : '';
    var p = passInput ? passInput.value : '';
    if(u !== ADMIN_USER){ showErr(); return; }
    hashPass(p).then(function(hash){
      if(hash === ADMIN_PASS_HASH){
        isAdmin=true;
        sStore('armgdn-admin','1');   // mark session as admin
        if(adminModal) adminModal.classList.remove('visible');
        if(adminBar)   adminBar.classList.add('visible');
        document.body.classList.add('admin-mode');
        loadSavedContent();
        enableEditing();
        if(errEl){ errEl.textContent=''; errEl.classList.remove('visible'); }
      } else { showErr(); }
    });
  }

  if(loginBtn)  loginBtn.addEventListener('click', doLogin);
  if(passInput) passInput.addEventListener('keydown',function(e){ if(e.key==='Enter') doLogin(); });
  if(cancelBtn) cancelBtn.addEventListener('click',function(){ if(adminModal) adminModal.classList.remove('visible'); });
  if(logoutBtn) logoutBtn.addEventListener('click',function(){
    isAdmin=false;
    sClear('armgdn-admin');   // clear session flag so next page won't auto-restore
    document.body.classList.remove('admin-mode');
    if(adminBar) adminBar.classList.remove('visible');
    disableEditing();
  });
  if(saveBtn) saveBtn.addEventListener('click', saveContent);

  function enableEditing(){
    document.querySelectorAll('[data-editable]').forEach(function(el){
      el.contentEditable='true';
    });
    injectColorPanel();
    wireLogoUpload();
  }
  function disableEditing(){
    document.querySelectorAll('[data-editable]').forEach(function(el){
      el.contentEditable='false';
    });
    var cp = document.getElementById('admin-color-panel');
    if(cp) cp.remove();
  }

  // ── LOGO UPLOAD ──
  function wireLogoUpload(){
    var mark = document.querySelector('.hero-mark');
    if(!mark) return;

    // Restore saved logo if present
    var savedLogo = recall('armgdn-logo');
    if(savedLogo) applyLogo(savedLogo);

    mark.addEventListener('click', function(){
      if(!isAdmin) return;
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.onchange = function(){
        var file = inp.files[0];
        if(!file) return;
        var reader = new FileReader();
        reader.onload = function(e){
          var dataUrl = e.target.result;
          store('armgdn-logo', dataUrl);
          applyLogo(dataUrl);
        };
        reader.readAsDataURL(file);
      };
      inp.click();
    });
  }

  function applyLogo(src){
    var mark = document.querySelector('.hero-mark');
    if(!mark) return;
    mark.innerHTML = '<img src="'+src+'" alt="ARMGDN logo" class="hero-logo-img">';
  }

  // Logo is restored on every page load (not admin-gated — visitors should see it too)
  (function(){
    var savedLogo = recall('armgdn-logo');
    if(savedLogo) applyLogo(savedLogo);
  })();

  // ── COLOR PANEL (admin only) ──
  function injectColorPanel(){
    if(document.getElementById('admin-color-panel')) return;
    var panel = document.createElement('div');
    panel.id = 'admin-color-panel';
    panel.style.cssText = [
      'position:fixed','bottom:52px','right:1rem',
      'background:var(--s2)','border:1px solid var(--green-b)',
      'padding:1rem','z-index:9999','font-family:var(--font-mono)',
      'font-size:0.65rem','letter-spacing:0.1em','color:var(--muted)',
      'display:flex','gap:1rem','flex-wrap:wrap','max-width:420px',
      'box-shadow:var(--sh-md)'
    ].join(';');

    // Only expose --green since all other accent values derive from it via color-mix
    // Also expose bg, text, muted, surface and border for full control
    var vars = [
      ['--green',   'Accent'],
      ['--text',    'Text'],
      ['--muted',   'Muted'],
      ['--bg',      'Background'],
      ['--s1',      'Surface'],
      ['--border',  'Border'],
    ];

    var style = getComputedStyle(document.documentElement);
    vars.forEach(function(v){
      var name = v[0], label = v[1];
      var current = style.getPropertyValue(name).trim();
      // convert color-mix or rgba to something the color input can preview
      // just fallback gracefully
      var wrap = document.createElement('label');
      wrap.style.cssText = 'display:flex;flex-direction:column;gap:0.25rem;align-items:center;cursor:pointer;';
      wrap.innerHTML = '<input type="color" style="width:32px;height:32px;border:none;background:none;cursor:pointer;padding:0;" data-var="'+name+'">'+label;
      var inp = wrap.querySelector('input');
      // try to set initial value
      try{
        // strip alpha / functions that color picker can't parse
        var hex = current.match(/#[0-9a-fA-F]{3,6}/);
        if(hex) inp.value = hex[0];
      }catch(e){}
      inp.addEventListener('input', function(e){
        document.documentElement.style.setProperty(name, e.target.value);
        store('armgdn-color-'+name, e.target.value);
      });
      panel.appendChild(wrap);
    });

    var resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset colors';
    resetBtn.style.cssText = 'margin-top:0.5rem;width:100%;background:none;border:1px solid var(--border);color:var(--muted);padding:0.3rem;cursor:pointer;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.1em;';
    resetBtn.addEventListener('click', function(){
      vars.forEach(function(v){
        document.documentElement.style.removeProperty(v[0]);
        store('armgdn-color-'+v[0],'');
      });
    });
    panel.appendChild(resetBtn);
    document.body.appendChild(panel);
  }

  // ── CONTENT SAVE / LOAD ──
  // saveContent: only runs when admin explicitly presses Save
  function saveContent(){
    var saved={};
    document.querySelectorAll('[data-editable]').forEach(function(el,i){
      saved['el_'+i]=el.innerHTML;
    });
    store('armgdn-content', JSON.stringify(saved));
    if(saveBtn){
      var orig = saveBtn.textContent;
      saveBtn.textContent='Saved ✓';
      setTimeout(function(){ saveBtn.textContent=orig; },1800);
    }
  }

  // loadSavedContent: only called when admin session is confirmed (login or session restore)
  // so unsaved drafts never appear for regular visitors
  function loadSavedContent(){
    var raw = recall('armgdn-content');
    if(!raw) return;
    try{
      var saved = JSON.parse(raw);
      document.querySelectorAll('[data-editable]').forEach(function(el,i){
        if(saved['el_'+i]!==undefined) el.innerHTML=saved['el_'+i];
      });
    }catch(e){}
  }

})();
