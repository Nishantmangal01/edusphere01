document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const view = e.currentTarget.dataset.view;
    Router.show(view);
    if (view === 'feed') Questions.loadFeed();
    else if (view === 'trending') Questions.loadTrending();
  });
});

document.querySelector('.nav-brand').addEventListener('click', () => Router.show('hero'));

document.getElementById('hero-explore').addEventListener('click', () => {
  Router.show('feed'); Questions.loadFeed();
});
document.getElementById('hero-ask').addEventListener('click', () => {
  if (!State.isLoggedIn()) { Auth.openLogin(); return; }
  Router.show('ask');
});

document.getElementById('btn-login-nav').addEventListener('click', () => Auth.openLogin());
document.getElementById('btn-register-nav').addEventListener('click', () => Auth.openRegister());
document.getElementById('btn-logout').addEventListener('click', () => Auth.logout());

document.getElementById('modal-close').addEventListener('click', () => Auth.close());
document.getElementById('auth-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) Auth.close();
});

document.getElementById('go-register').addEventListener('click', () => Auth.openRegister());
document.getElementById('go-login').addEventListener('click', () => Auth.openLogin());

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) { UI.showMsg('login-msg', 'All fields required.'); return; }
  try {
    await Auth.login(email, password);
  } catch (err) {
    UI.showMsg('login-msg', err.message || 'Login failed.');
  }
});

document.getElementById('register-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const role     = document.getElementById('reg-role').value;
  if (!name || !email || !password) { UI.showMsg('reg-msg', 'All fields required.'); return; }
  if (password.length < 6) { UI.showMsg('reg-msg', 'Password must be at least 6 characters.'); return; }
  try {
    await Auth.register(name, email, password, role);
  } catch (err) {
    UI.showMsg('reg-msg', err.message || 'Registration failed.');
  }
});

document.getElementById('question-form').addEventListener('submit', async e => {
  e.preventDefault();
  const title   = document.getElementById('q-title').value.trim();
  const subject = document.getElementById('q-subject').value;
  const course  = document.getElementById('q-course').value.trim();
  const desc    = document.getElementById('q-desc').value.trim();

  if (!title || !subject || !course || !desc) {
    UI.showMsg('ask-msg', 'Please fill all fields.'); return;
  }
  if (title.length < 10) {
    UI.showMsg('ask-msg', 'Title must be at least 10 characters.'); return;
  }

  try {
    await Questions.postQuestion(title, desc, subject, course);
    UI.showMsg('ask-msg', 'Question posted successfully!', 'success');
    document.getElementById('question-form').reset();
    setTimeout(() => { Router.show('feed'); Questions.loadFeed(); }, 1200);
  } catch (err) {
    UI.showMsg('ask-msg', err.message || 'Failed to post question.');
  }
});

document.getElementById('btn-apply-filter').addEventListener('click', () => {
  State.set('filters', {
    subject: document.getElementById('filter-subject').value,
    course:  document.getElementById('filter-course').value,
  });
  State.set('currentPage', 1);
  Questions.loadFeed();
});

document.getElementById('btn-back').addEventListener('click', () => {
  Router.show('feed'); Questions.loadFeed();
});

document.getElementById('answer-form').addEventListener('submit', async e => {
  e.preventDefault();
  const text = document.getElementById('ans-text').value.trim();
  if (!text) { UI.showMsg('ans-msg', 'Answer cannot be empty.'); return; }

  const q = State.get('currentQuestion');
  if (!q) return;

  try {
    await Questions.postAnswer(q._id, text);
    document.getElementById('ans-text').value = '';
    UI.showMsg('ans-msg', 'Answer posted!', 'success');
    setTimeout(() => Questions.openDetail(q._id), 800);
  } catch (err) {
    UI.showMsg('ans-msg', err.message || 'Failed to post answer.');
  }
});

document.getElementById('prompt-login-btn').addEventListener('click', () => Auth.openLogin());


function attachCardDelegation(listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.addEventListener('click', e => {
    const card = e.target.closest('.question-card');
    if (card && card.dataset.id) {
      Questions.openDetail(card.dataset.id);
    }
  });
}
attachCardDelegation('questions-list');
attachCardDelegation('trending-list');

document.getElementById('answers-list').addEventListener('click', async e => {
  const btn = e.target.closest('.ans-vote-btn');
  if (!btn) return;

  const answerId = btn.dataset.ans;
  const vote     = parseInt(btn.dataset.vote, 10);
  const q        = State.get('currentQuestion');
  if (!q || !answerId) return;

  try {
    const data = await Questions.voteAnswer(q._id, answerId, vote);
    const countEl = document.getElementById(`av-${answerId}`);
    if (countEl) countEl.textContent = data.votes ?? countEl.textContent;

    if (data.reputation !== undefined && State.getUser()) {
      const user = State.getUser();
      user.reputation = data.reputation;
      State.setSession(user, State.getToken());
      document.getElementById('user-rep-badge').textContent = `⭐ ${user.reputation}`;
    }

    Toast.show(vote > 0 ? 'Upvoted!' : 'Downvoted!', 'success');
  } catch (err) {
    Toast.show(err.message || 'Vote failed', 'error');
  }
});