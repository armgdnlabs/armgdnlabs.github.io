// ARMGDN — theme toggle + terminal typewriter
(function () {
  var html = document.documentElement;
  var btn = document.querySelector('[data-theme-toggle]');
  var currentTheme = 'dark';

  var sunIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  var moonIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  if (btn) {
    btn.addEventListener('click', function () {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', currentTheme);
      btn.setAttribute('aria-label', 'Switch to ' + (currentTheme === 'dark' ? 'light' : 'dark') + ' mode');
      btn.innerHTML = currentTheme === 'dark' ? moonIcon : sunIcon;
    });
  }

  // Terminal typewriter on hero title — subtle cursor blink after render
  var title = document.querySelector('.hero-title');
  if (title) {
    title.style.borderRight = '2px solid var(--accent)';
    title.style.paddingRight = '4px';
    setTimeout(function () {
      title.style.transition = 'border-color 0.2s';
      var on = true;
      var cur = setInterval(function () {
        title.style.borderRightColor = on ? 'transparent' : 'var(--accent)';
        on = !on;
      }, 600);
      // stop cursor after 8s
      setTimeout(function () {
        clearInterval(cur);
        title.style.borderRight = 'none';
        title.style.paddingRight = '0';
      }, 8000);
    }, 500);
  }

})();
