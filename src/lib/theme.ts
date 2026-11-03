export function initTheme(onChange?: () => void) {
  const btn = document.getElementById('theme-toggle');
  btn?.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('sp:theme', next);
    } catch {
      /* private mode etc. — theme just won't persist */
    }
    onChange?.();
  });
}
