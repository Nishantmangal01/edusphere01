(function init() {
  UI.updateNavAuth();
  loadStats();
  Router.show('hero');
  
  const splash = document.getElementById('splash-screen');
  setTimeout(() => {
    splash.style.opacity = '0';
    splash.style.transition = 'opacity 0.7s ease';
    setTimeout(() => {
      splash.style.display = 'none';
    }, 700);
  }, 2500);

})();