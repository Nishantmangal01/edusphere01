const Questions = {

  renderCard(q) {
    const totalVotes = (q.answers || []).reduce((sum, a) => sum + (a.votes || 0), 0);
    const card = document.createElement('article');
    card.className = 'question-card';
    card.dataset.id = q._id;

    const authorRole = q.userId?.role === 'faculty' ? `<span class="tag tag-faculty">Faculty</span>` : '';

    card.innerHTML = `
      <div class="vote-col">
        <span class="vote-count">${q.answers?.length || 0}</span>
        <span class="vote-label">Ans</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${UI.escape(q.title)}</h3>
        <p class="card-desc">${UI.escape(q.description)}</p>
        <div class="card-meta">
          <span class="tag tag-subject">${UI.escape(q.subject)}</span>
          <span class="tag tag-course">${UI.escape(q.course)}</span>
          ${authorRole}
          <span class="meta-author">${UI.escape(q.userId?.name || 'Anonymous')} · ${UI.formatDate(q.createdAt)}</span>
        </div>
      </div>
    `;
    return card;
  },


  async loadFeed() {
    const list = document.getElementById('questions-list');
    list.innerHTML = '<div class="loading-state">Loading discussions…</div>';

    const page    = State.get('currentPage');
    const subject = State.get('filters').subject;
    const course  = State.get('filters').course;

    let ep = `/questions?page=${page}&limit=8`;
    if (subject) ep += `&subject=${encodeURIComponent(subject)}`;
    if (course)  ep += `&course=${encodeURIComponent(course)}`;

    try {
      const data = await Http.get(ep);
      State.set('totalPages', data.totalPages || 1);
      list.innerHTML = '';

      if (!data.questions?.length) {
        list.innerHTML = '<div class="empty-state"><h3>No questions yet</h3><p>Be the first to ask something!</p></div>';
        return;
      }

      data.questions.forEach(q => list.appendChild(this.renderCard(q)));
      this.renderPagination();
    } catch (err) {
      list.innerHTML = `<div class="empty-state"><h3>Couldn't load questions</h3><p>${err.message}</p></div>`;
    }
  },

  renderPagination() {
    const pg = document.getElementById('pagination');
    pg.innerHTML = '';
    const total = State.get('totalPages');
    const curr  = State.get('currentPage');
    if (total <= 1) return;

    for (let i = 1; i <= total; i++) {
      const btn = document.createElement('button');
      btn.className = `page-btn${i === curr ? ' active' : ''}`;
      btn.textContent = i;
      btn.addEventListener('click', () => {
        State.set('currentPage', i);
        Questions.loadFeed();
      });
      pg.appendChild(btn);
    }
  },

  async loadTrending() {
    const list = document.getElementById('trending-list');
    list.innerHTML = '<div class="loading-state">Calculating trends…</div>';

    try {
      const data = await Http.get('/questions/trending');
      list.innerHTML = '';

      if (!data.questions?.length) {
        list.innerHTML = '<div class="empty-state"><h3>No trending content</h3><p>Start engaging to see trends!</p></div>';
        return;
      }

      data.questions.forEach((q, i) => {
        const card = this.renderCard(q);
        const rankEl = document.createElement('div');
        rankEl.className = `trending-rank${i < 3 ? ' top' : ''}`;
        rankEl.textContent = `#${i + 1}`;
        card.style.position = 'relative';
        card.querySelector('.vote-col').prepend(rankEl);
        list.appendChild(card);
      });
    } catch (err) {
      list.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${err.message}</p></div>`;
    }
  },

  async openDetail(id) {
    Router.show('detail');
    const detailCard = document.getElementById('question-detail-card');
    const answersList = document.getElementById('answers-list');
    detailCard.innerHTML = '<div class="loading-state">Loading…</div>';
    answersList.innerHTML = '';

    try {
      const data = await Http.get(`/questions/${id}`);
      const q = data.question;
      State.set('currentQuestion', q);

      const authorRole = q.userId?.role === 'faculty' ? `<span class="tag tag-faculty">Faculty</span>` : '';
      const totalVotes = (q.answers || []).reduce((s, a) => s + (a.votes || 0), 0);

      detailCard.innerHTML = `
        <div class="detail-header">
          <h1 class="detail-title">${UI.escape(q.title)}</h1>
          <div class="detail-tags">
            <span class="tag tag-subject">${UI.escape(q.subject)}</span>
            <span class="tag tag-course">${UI.escape(q.course)}</span>
            ${authorRole}
          </div>
        </div>
        <p class="detail-body">${UI.escape(q.description)}</p>
        <div class="detail-footer">
          <span class="detail-author">Asked by ${UI.escape(q.userId?.name || 'Anonymous')} · ${UI.formatDate(q.createdAt)}</span>
        </div>
      `;

      document.getElementById('answers-heading').textContent = `${q.answers?.length || 0} Answer${q.answers?.length === 1 ? '' : 's'}`;
      answersList.innerHTML = '';

      if (q.answers?.length) {
        const sorted = [...q.answers].sort((a, b) => (b.votes || 0) - (a.votes || 0));
        sorted.forEach((ans, idx) => {
          const card = document.createElement('div');
          card.className = `answer-card${idx === 0 && ans.votes > 0 ? ' top-answer' : ''}`;
          card.dataset.ansId = ans._id;
          card.innerHTML = `
            <div class="answer-vote-col">
              <button class="ans-vote-btn up" data-ans="${ans._id}" data-vote="1" title="Upvote">▲</button>
              <span class="answer-vote-count" id="av-${ans._id}">${ans.votes || 0}</span>
              <button class="ans-vote-btn down" data-ans="${ans._id}" data-vote="-1" title="Downvote">▼</button>
            </div>
            <div>
              <p class="answer-body">${UI.escape(ans.answer)}</p>
              <span class="answer-meta">
                ${UI.escape(ans.userId?.name || 'Anonymous')}
                ${ans.userId?.role === 'faculty' ? '<span class="tag tag-faculty" style="font-size:0.7rem;padding:1px 6px">Faculty</span>' : ''}
                · ${UI.formatDate(ans.createdAt)}
              </span>
            </div>
          `;
          answersList.appendChild(card);
        });
      } else {
        answersList.innerHTML = '<div class="empty-state"><p>No answers yet. Be the first!</p></div>';
      }

      const wrap = document.getElementById('answer-form-wrap');
      const loginPrompt = document.getElementById('login-prompt-answer');
      if (State.isLoggedIn()) {
        wrap.classList.remove('hidden');
        loginPrompt.classList.add('hidden');
      } else {
        wrap.classList.add('hidden');
        loginPrompt.classList.remove('hidden');
      }

    } catch (err) {
      detailCard.innerHTML = `<div class="empty-state"><p>Error: ${err.message}</p></div>`;
    }
  },

  async postQuestion(title, description, subject, course) {
    if (!State.isLoggedIn()) { Auth.openLogin(); throw new Error('Login required'); }
    const data = await Http.post('/questions', { title, description, subject, course }, true);
    return data;
  },

  async voteAnswer(questionId, answerId, vote) {
    if (!State.isLoggedIn()) { Auth.openLogin(); throw new Error('Login required'); }
    const data = await Http.patch(`/questions/${questionId}/answers/${answerId}/vote`, { vote }, true);
    return data;
  },

  async postAnswer(questionId, answer) {
    if (!State.isLoggedIn()) { Auth.openLogin(); throw new Error('Login required'); }
    const data = await Http.post(`/questions/${questionId}/answers`, { answer }, true);
    return data;
  },
};
