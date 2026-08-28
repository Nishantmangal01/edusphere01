async function loadStats() {
  try {
    const data = await Http.get('/stats');
    animateCounter('stat-q', data.questions || 0);
    animateCounter('stat-a', data.answers || 0);
    animateCounter('stat-u', data.users || 0);
  } catch (e) {  }
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.floor(target / 40));
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(interval);
  }, 30);
}