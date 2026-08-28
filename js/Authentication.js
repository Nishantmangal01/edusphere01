const Auth = {
  modal:       document.getElementById('auth-modal'),
  tabLogin:    document.getElementById('tab-login'),
  tabRegister: document.getElementById('tab-register'),

  openLogin() {
    this.tabLogin.classList.remove('hidden');
    this.tabRegister.classList.add('hidden');
    this.modal.classList.remove('hidden');
  },
  openRegister() {
    this.tabRegister.classList.remove('hidden');
    this.tabLogin.classList.add('hidden');
    this.modal.classList.remove('hidden');
  },
  close() { this.modal.classList.add('hidden'); },

  async login(email, password) {
    const data = await Http.post('/auth/login', { email, password });
    State.setSession(data.user, data.token);
    this.close();
    UI.updateNavAuth();
    Toast.show(`Welcome back, ${data.user.name}!`, 'success');
    return data;
  },

  async register(name, email, password, role) {
    const data = await Http.post('/auth/register', { name, email, password, role });
    State.setSession(data.user, data.token);
    this.close();
    UI.updateNavAuth();
    Toast.show(`Welcome to EduSphere, ${data.user.name}!`, 'success');
    return data;
  },

  logout() {
    State.clearSession();
    UI.updateNavAuth();
    Router.show('feed');
    Questions.loadFeed();
    Toast.show('Logged out successfully.', 'info');
  },
};
