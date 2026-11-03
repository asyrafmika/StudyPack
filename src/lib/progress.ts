/**
 * "Done" state per week, saved in the browser (localStorage).
 * Key format: sp:done:<course>/<week-slug>
 * It's per device — nothing is sent anywhere.
 */
const key = (id: string) => `sp:done:${id}`;

export function isDone(id: string): boolean {
  try {
    return localStorage.getItem(key(id)) === '1';
  } catch {
    return false;
  }
}

export function setDone(id: string, done: boolean) {
  try {
    if (done) localStorage.setItem(key(id), '1');
    else localStorage.removeItem(key(id));
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Mark every [data-progress-id] element with .is-done, and fill [data-progress-of] counters. */
export function paintProgress(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-progress-id]').forEach((el) => {
    el.classList.toggle('is-done', isDone(el.dataset.progressId!));
  });
  root.querySelectorAll<HTMLElement>('[data-progress-of]').forEach((el) => {
    const ids = el.dataset.progressOf!.split(',').filter(Boolean);
    const done = ids.filter(isDone).length;
    const bar = el.querySelector<HTMLElement>('.bar-fill');
    const label = el.querySelector<HTMLElement>('.bar-label');
    if (bar) bar.style.width = ids.length ? `${(done / ids.length) * 100}%` : '0%';
    if (label) label.textContent = `${done}/${ids.length} weeks done`;
  });
}
