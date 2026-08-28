const Toast = (() => {
  const el = document.getElementById('toast');
  let timer;

  const config = {
    success: { icon: '\u2705', title: 'Success' },
    error:   { icon: '\u274c', title: 'Error' },
    info:    { icon: '\ud83d\udca1', title: 'Info' },
  };

  return {
    show(msg, type = 'info', duration = 3500) {
      clearTimeout(timer);
      el.classList.remove('hiding');

      const { icon, title } = config[type] || config.info;

      el.className = `toast ${type}`;
      el.innerHTML = `
        <div class="toast-inner">
          <div class="toast-icon">${icon}</div>
          <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-msg">${msg}</div>
          </div>
          <button class="toast-close" onclick="Toast.hide()">\u2715</button>
        </div>
        <div class="toast-progress"></div>
      `;
      el.classList.remove('hidden');
      timer = setTimeout(() => this.hide(), duration);
    },

    hide() {
      el.classList.add('hiding');
      setTimeout(() => {
        el.classList.add('hidden');
        el.classList.remove('hiding');
      }, 350);
    },
  };
})();
