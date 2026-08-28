const Router = {
  views: {
    hero: document.getElementById('view-hero'),
    feed: document.getElementById('view-feed'),
    trending: document.getElementById('view-trending'),
    ask: document.getElementById('view-ask'),
    detail: document.getElementById('view-detail'),
  },

  show(viewName) {
    Object.values(this.views).forEach(v => v && v.classList.add('hidden'));
    const view = this.views[viewName];
    if (view) {
      view.classList.remove('hidden');
      State.set('currentView', viewName);
    }
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};
