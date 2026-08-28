const State = (() => {
  let _state = {
    currentUser: null,
    token: null,
    currentView: 'hero',
    currentQuestion: null,
    currentPage: 1,
    totalPages: 1,
    filters: { subject: '', course: '' },
  };

  try {
    const saved = localStorage.getItem('edusphere_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      _state.currentUser = parsed.user;
      _state.token = parsed.token;
    }
  } catch (e) {}

  return {
    get: (key) => _state[key],
    set: (key, val) => { _state[key] = val; },
    getUser: () => _state.currentUser,
    getToken: () => _state.token,
    setSession: (user, token) => {
      _state.currentUser = user;
      _state.token = token;
      try { localStorage.setItem('edusphere_session', JSON.stringify({ user, token })); } catch(e){}
    },
    clearSession: () => {
      _state.currentUser = null;
      _state.token = null;
      try { localStorage.removeItem('edusphere_session'); } catch(e){}
    },
    isLoggedIn: () => !!_state.token,
  };
})();