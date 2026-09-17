(() => {
  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  let saved;
  try { saved = localStorage.getItem('autolejek-theme'); } catch {}
  let explicit = saved === 'dark' || saved === 'light';
  const apply = theme => {
    root.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-checked', String(theme === 'dark'));
    });
  };
  apply(explicit ? saved : preference.matches ? 'dark' : 'light');
  preference.addEventListener('change', event => {
    if (!explicit) apply(event.matches ? 'dark' : 'light');
  });
  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.hidden = false;
      button.addEventListener('click', () => {
        const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        explicit = true;
        apply(theme);
        try { localStorage.setItem('autolejek-theme', theme); } catch {}
      });
    });
  });
})();
