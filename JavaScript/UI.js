const UI = {
  updateNavAuth() {
    const user = State.getUser();
    const navAuth = document.getElementById('nav-auth');
    const navUser = document.getElementById('nav-user');

    if (user) {
      navAuth.classList.add('hidden');
      navUser.classList.remove('hidden');
      document.getElementById('user-greeting').textContent = `Hi, ${user.name.split(' ')[0]}`;
      document.getElementById('user-rep-badge').textContent = `⭐ ${user.reputation || 0}`;
    } else {
      navAuth.classList.remove('hidden');
      navUser.classList.add('hidden');
    }
  },
  

  showMsg(id, msg, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className = `form-msg ${type}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 4000);
  },

  formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  escape(str = '') {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },
};
