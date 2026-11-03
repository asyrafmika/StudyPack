import type { SearchEntry } from './search';

/** ⌘K / Ctrl+K / "/" command-palette search over every note page. Fully client-side. */
export function initSearch() {
  const dialog = document.getElementById('search') as HTMLDialogElement | null;
  const input = document.getElementById('search-input') as HTMLInputElement | null;
  const list = document.getElementById('search-results');
  const data = document.getElementById('search-data');
  if (!dialog || !input || !list || !data) return;

  const entries: SearchEntry[] = JSON.parse(data.textContent || '[]');
  const hay = entries.map((e) => `${e.t} ${e.c} ${e.l} ${e.s} ${e.k}`.toLowerCase());
  let active = 0;
  let shown: SearchEntry[] = [];

  const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);

  const render = () => {
    const words = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    shown = entries
      .map((e, i) => {
        if (!words.every((w) => hay[i].includes(w))) return null;
        const title = e.t.toLowerCase();
        const score = words.reduce((s, w) => s + (title.includes(w) ? 3 : 0) + (e.k.toLowerCase().includes(w) ? 1 : 0), 0);
        return { e, score };
      })
      .filter((x): x is { e: SearchEntry; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.e);
    active = 0;
    list.innerHTML = shown.length
      ? shown
          .map(
            (e, i) => `<li role="option" aria-selected="${i === 0}"><a href="${e.u}">
              <span class="sr-meta"><span class="sr-code">${esc(e.c)}</span>${esc(e.l)}</span>
              <span class="sr-title">${esc(e.t)}</span>
              <span class="sr-sum">${esc(e.s)}</span></a></li>`,
          )
          .join('')
      : `<li class="search-empty">No pages match “${esc(input.value)}”.</li>`;
  };

  const move = (d: number) => {
    const items = list.querySelectorAll('li[role="option"]');
    if (!items.length) return;
    items[active]?.setAttribute('aria-selected', 'false');
    active = (active + d + items.length) % items.length;
    items[active].setAttribute('aria-selected', 'true');
    items[active].scrollIntoView({ block: 'nearest' });
  };

  const open = () => {
    if (dialog.open) return;
    input.value = '';
    render();
    dialog.showModal();
    input.focus();
  };

  document.getElementById('search-open')?.addEventListener('click', open);
  document.querySelectorAll('[data-open-search]').forEach((el) => el.addEventListener('click', open));
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable;
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !dialog.open)) {
      e.preventDefault();
      open();
    }
  });
  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), move(1));
    else if (e.key === 'ArrowUp') (e.preventDefault(), move(-1));
    else if (e.key === 'Enter' && shown[active]) location.href = shown[active].u;
  });
  // Click on the backdrop closes
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  // Show the right shortcut for the platform
  if (!/Mac|iPhone|iPad/.test(navigator.platform)) {
    document.querySelectorAll('.search-kbd').forEach((k) => (k.textContent = 'Ctrl K'));
  }
}
