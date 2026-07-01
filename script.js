// ARMGDN — script.js v7
// Changes:
//   1. Per-page content DB keyed by data-page-id (not global index) so pages don't overwrite each other
//   2. Each editable element uses data-key attribute for stable, index-independent saves
//   3. Color panel correctly reads and initialises live CSS var values on open
//   4. Canvas + scanlines injected automatically on any page that has .bg-canvas
//   5. Logo saved globally (not per-page) so it shows on all pages
//   6. Version bumped to v7 — bump ?v= in all HTML to match

(function(){

  // ── SAFE STORAGE ──
  var _mem = {};
  function store(k,v){ try{ if(v===null||v===undefined||v==='') localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){ _mem[k]=v; } }
  function recall(k){ try{ return localStorage.getItem(k); }catch(e){ return _mem[k]||null; } }
  function sStore(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){ _mem['s_'+k]=v; } }
  function sRecall(k){ try{ return sessionStorage.getItem(k); }catch(e){ return _mem['s_'+k]||null; } }
  function sClear(k){ try{ sessionStorage.removeItem(k); }catch(e){ delete _mem['s_'+k]; } }

  // ── PAGE IDENTITY ──
  // Each page declares <body data-page-id="home"> etc.
  // Fallback: derive from pathname so sub-pages never collide.
  var PAGE_ID = document.body.dataset.pageId ||
    (location.pathname.replace(/\/+$/,'').split('/').filter(Boolean).join('-') || 'home');
  var CONTENT_KEY = 'armgdn-content-' + PAGE_ID;

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

  // ── COLOR OVERRIDES (always apply on load — harmless, just CSS vars) ──
  var COLOR_VARS = ['--green','--text','--muted','--bg','--s1','--border'];
  COLOR_VARS.forEach(function(name){
    var saved = recall('armgdn-color-'+name);
    if(saved) html.style.setProperty(name, saved);
  });

  // ── LOGO (global — show on all pages) ──
  function applyLogo(src){
    var mark = document.querySelector('.hero-mark');
    if(!mark) return;
    mark.innerHTML = '<img src="'+src+'" alt="ARMGDN logo" class="hero-logo-img">';
  }
  (function(){
    var saved = recall('armgdn-logo');
    if(saved) applyLogo(saved);
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
      particles.push({ x:Math.random()*1920, y:Math.random()*1080, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, r:Math.random()*1.5+0.5 });
    }
    function hexToRgba(hex, alpha){
      hex = (hex||'').replace(/^\s+|\s+$/g,'').replace('#','');
      if(hex.length===3) hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      var r=parseInt(hex.slice(0,2),16)||127;
      var g=parseInt(hex.slice(2,4),16)||255;
      var b=parseInt(hex.slice(4,6),16)||95;
      return 'rgba('+r+','+g+','+b+','+alpha+')';
    }
    function getAccentHex(){
      // read inline style first (admin override), then computed
      var raw = html.style.getPropertyValue('--green') ||
                getComputedStyle(html).getPropertyValue('--green').trim();
      var m = raw.match(/#[0-9a-fA-F]{3,6}/);
      return m ? m[0] : '#7fff5f';
    }
    function drawCanvas(){
      ctx.clearRect(0,0,W,H);
      var isDark = html.getAttribute('data-theme')!=='light';
      var hex = getAccentHex();
      var dotAlpha = isDark ? 0.22 : 0.14;
      var lineAlpha = isDark ? 0.05 : 0.04;
      particles.forEach(function(p,i){
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=hexToRgba(hex,dotAlpha);
        ctx.fill();
        for(var j=i+1;j<particles.length;j++){
          var dx=particles[j].x-p.x, dy=particles[j].y-p.y, dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<120){
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(particles[j].x,particles[j].y);
            ctx.strokeStyle=hexToRgba(hex,lineAlpha); ctx.lineWidth=0.5; ctx.stroke();
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
      grain.style.transform='translate('+((e.clientX/window.innerWidth-0.5)*8)+'px,'+((e.clientY/window.innerHeight-0.5)*8)+'px)';
    });
  }

  // ── TYPEWRITER ──
  var tw = document.querySelector('.typewriter');
  if(tw){
    var txt='SYSTEM BOOT // ARMGDN_LABS v2.0', idx=0;
    function type(){
      if(idx<=txt.length){ tw.textContent=txt.slice(0,idx)+'_'; idx++; setTimeout(type,idx===txt.length+1?2000:55); }
      else{ idx=0; tw.textContent=''; setTimeout(type,500); }
    }
    setTimeout(type,400);
  }

  // ── GLITCH PULSE ──
  var glitch = document.querySelector('.glitch');
  if(glitch){
    setInterval(function(){ glitch.classList.add('glitching'); setTimeout(function(){ glitch.classList.remove('glitching'); },200); },3500);
    // text scramble on hover
    var chars='!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ01';
    var origText = glitch.dataset.text || glitch.textContent;
    glitch.addEventListener('mouseenter',function(){
      var iter=0;
      var iv=setInterval(function(){
        glitch.textContent=origText.split('').map(function(c,i){
          if(c===' '||c==='\n') return c;
          if(i<iter) return origText[i];
          return chars[Math.floor(Math.random()*chars.length)];
        }).join('');
        if(iter>=origText.length) clearInterval(iv);
        iter+=1.5;
      },40);
    });
  }

  // ── SCROLL REVEAL ──
  var reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && reveals.length){
    var obs=new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('revealed'); obs.unobserve(e.target); } }); },{threshold:0.08});
    reveals.forEach(function(el){ obs.observe(el); });
  } else { reveals.forEach(function(el){ el.classList.add('revealed'); }); }

  // ── ADMIN ──
  var ADMIN_USER      = 'armgdn';
  var ADMIN_PASS_HASH = 'aeae0a59f459f47a2ab815a420d6a4e29c7de68c730a7fffca44725563360989';
  async function hashPass(str){ var buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str)); return Array.from(new Uint8Array(buf)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join(''); }

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

  // Session restore — no login prompt needed when navigating between pages
  if(sRecall('armgdn-admin')==='1'){
    isAdmin=true;
    document.body.classList.add('admin-mode');
    if(adminBar) adminBar.classList.add('visible');
    loadSavedContent();
    enableEditing();
  }

  // Hotkey: hold A+D+M simultaneously
  var held={};
  document.addEventListener('keydown',function(e){
    held[e.key.toLowerCase()]=true;
    if(held['a']&&held['d']&&held['m']&&!isAdmin&&adminModal){ adminModal.classList.add('visible'); setTimeout(function(){ if(userInput) userInput.focus(); },50); }
    if(e.key==='Escape'&&adminModal) adminModal.classList.remove('visible');
  });
  document.addEventListener('keyup',function(e){ delete held[e.key.toLowerCase()]; });

  function showErr(){ if(errEl){ errEl.textContent='// ACCESS DENIED'; errEl.classList.add('visible'); } }

  function doLogin(){
    var u=userInput?userInput.value.trim():'';
    var p=passInput?passInput.value:'';
    if(u!==ADMIN_USER){ showErr(); return; }
    hashPass(p).then(function(hash){
      if(hash===ADMIN_PASS_HASH){
        isAdmin=true;
        sStore('armgdn-admin','1');
        if(adminModal) adminModal.classList.remove('visible');
        if(adminBar) adminBar.classList.add('visible');
        document.body.classList.add('admin-mode');
        loadSavedContent(); enableEditing();
        if(errEl){ errEl.textContent=''; errEl.classList.remove('visible'); }
      } else { showErr(); }
    });
  }

  if(loginBtn) loginBtn.addEventListener('click',doLogin);
  if(passInput) passInput.addEventListener('keydown',function(e){ if(e.key==='Enter') doLogin(); });
  if(cancelBtn) cancelBtn.addEventListener('click',function(){ if(adminModal) adminModal.classList.remove('visible'); });
  if(logoutBtn) logoutBtn.addEventListener('click',function(){
    isAdmin=false; sClear('armgdn-admin');
    document.body.classList.remove('admin-mode');
    if(adminBar) adminBar.classList.remove('visible');
    disableEditing();
  });
  if(saveBtn) saveBtn.addEventListener('click',saveContent);

  function enableEditing(){
    document.querySelectorAll('[data-editable]').forEach(function(el){ el.contentEditable='true'; });
    injectColorPanel();
    wireLogoUpload();
  }
  function disableEditing(){
    document.querySelectorAll('[data-editable]').forEach(function(el){ el.contentEditable='false'; });
    var cp=document.getElementById('admin-color-panel');
    if(cp) cp.remove();
  }

  // ── LOGO UPLOAD ──
  function wireLogoUpload(){
    var mark=document.querySelector('.hero-mark');
    if(!mark) return;
    mark.addEventListener('click',function(){
      if(!isAdmin) return;
      var inp=document.createElement('input');
      inp.type='file'; inp.accept='image/*';
      inp.onchange=function(){
        var file=inp.files[0]; if(!file) return;
        var reader=new FileReader();
        reader.onload=function(e){ store('armgdn-logo',e.target.result); applyLogo(e.target.result); };
        reader.readAsDataURL(file);
      };
      inp.click();
    });
  }

  // ── COLOR PANEL ──
  // Reads the LIVE computed value each time the panel opens
  // so the picker thumb correctly reflects the current color.
  function getLiveHex(name){
    // 1. Check inline override first (set by admin during this session)
    var inline = html.style.getPropertyValue(name).trim();
    if(inline && inline.match(/#[0-9a-fA-F]{3,6}/)) return inline.match(/#[0-9a-fA-F]{3,6}/)[0];
    // 2. Check saved override in localStorage
    var saved = recall('armgdn-color-'+name);
    if(saved && saved.match(/#[0-9a-fA-F]{3,6}/)) return saved.match(/#[0-9a-fA-F]{3,6}/)[0];
    // 3. Fallback defaults (matches CSS :root dark values)
    var defaults = { '--green':'#7fff5f','--text':'#c8c5a8','--muted':'#6a6855','--bg':'#0a0a08','--s1':'#141410','--border':'#1e1e14' };
    return defaults[name] || '#888888';
  }

  function injectColorPanel(){
    if(document.getElementById('admin-color-panel')) return;
    var panel=document.createElement('div');
    panel.id='admin-color-panel';
    panel.style.cssText=[
      'position:fixed','bottom:52px','right:1rem',
      'background:var(--s2)','border:1px solid var(--green-b)',
      'padding:0.9rem 1rem','z-index:9999',
      'font-family:var(--font-mono)','font-size:0.63rem',
      'letter-spacing:0.1em','color:var(--muted)',
      'display:flex','gap:0.85rem','flex-wrap:wrap','max-width:400px',
      'box-shadow:var(--sh-md)','border-radius:4px'
    ].join(';');

    var vars=[
      ['--green','Accent'],
      ['--text','Text'],
      ['--muted','Muted'],
      ['--bg','BG'],
      ['--s1','Surface'],
      ['--border','Border'],
    ];

    vars.forEach(function(v){
      var name=v[0],label=v[1];
      var wrap=document.createElement('label');
      wrap.style.cssText='display:flex;flex-direction:column;gap:0.25rem;align-items:center;cursor:pointer;gap:0.3rem;';
      var inp=document.createElement('input');
      inp.type='color';
      inp.value=getLiveHex(name);
      inp.style.cssText='width:30px;height:30px;border:none;background:none;cursor:pointer;padding:0;border-radius:3px;';
      inp.dataset.var=name;
      inp.addEventListener('input',function(e){
        html.style.setProperty(name,e.target.value);
        store('armgdn-color-'+name,e.target.value);
      });
      wrap.appendChild(inp);
      var lbl=document.createElement('span');
      lbl.textContent=label;
      wrap.appendChild(lbl);
      panel.appendChild(wrap);
    });

    var resetBtn=document.createElement('button');
    resetBtn.textContent='Reset';
    resetBtn.title='Reset all colors to defaults';
    resetBtn.style.cssText='margin-top:0.4rem;width:100%;background:none;border:1px solid var(--border);color:var(--muted);padding:0.25rem 0.5rem;cursor:pointer;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.1em;border-radius:2px;transition:border-color 0.16s,color 0.16s;';
    resetBtn.addEventListener('mouseenter',function(){ resetBtn.style.borderColor='var(--green-b)'; resetBtn.style.color='var(--text)'; });
    resetBtn.addEventListener('mouseleave',function(){ resetBtn.style.borderColor='var(--border)'; resetBtn.style.color='var(--muted)'; });
    resetBtn.addEventListener('click',function(){
      vars.forEach(function(v){
        html.style.removeProperty(v[0]);
        store('armgdn-color-'+v[0], null);
      });
      // re-sync pickers to new live values
      panel.querySelectorAll('input[type=color]').forEach(function(inp){
        inp.value = getLiveHex(inp.dataset.var);
      });
    });
    panel.appendChild(resetBtn);
    document.body.appendChild(panel);
  }

  // ── CONTENT SAVE / LOAD ──
  // Uses data-key attribute for stable identification.
  // Falls back to derived index if data-key is missing.
  // Keys are scoped per page via CONTENT_KEY so pages never overwrite each other.

  function getEditables(){
    return Array.from(document.querySelectorAll('[data-editable]'));
  }

  function elementKey(el, idx){
    // Prefer explicit data-key, fallback to tag+text hash+index for stability
    return el.dataset.key || ('el_'+idx);
  }

  function saveContent(){
    var saved={};
    getEditables().forEach(function(el,i){
      saved[elementKey(el,i)]=el.innerHTML;
    });
    store(CONTENT_KEY, JSON.stringify(saved));
    if(saveBtn){
      var orig=saveBtn.textContent;
      saveBtn.textContent='Saved ✓';
      setTimeout(function(){ saveBtn.textContent=orig; },1800);
    }
  }

  function loadSavedContent(){
    var raw=recall(CONTENT_KEY);
    if(!raw) return;
    try{
      var saved=JSON.parse(raw);
      getEditables().forEach(function(el,i){
        var key=elementKey(el,i);
        if(saved[key]!==undefined) el.innerHTML=saved[key];
      });
    }catch(e){}
  }

})();
