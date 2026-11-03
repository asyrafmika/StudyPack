/**
 * Renders ```mermaid code blocks into SVG diagrams in the browser.
 * Mermaid is ~1MB, so it is imported lazily — pages without diagrams never download it.
 */
let counter = 0;

export async function renderMermaid(rerender = false) {
  // Markdown renders ```mermaid as <pre><code class="language-mermaid">
  const blocks = [...document.querySelectorAll<HTMLElement>('code.language-mermaid')].map(
    (code) => code.closest('pre') ?? code,
  );
  if (!blocks.length) return;

  const { default: mermaid } = await import('mermaid');
  const dark = document.documentElement.dataset.theme === 'dark';
  mermaid.initialize({
    startOnLoad: false,
    theme: dark ? 'dark' : 'default',
    securityLevel: 'strict',
    fontFamily: 'inherit',
  });

  for (const block of blocks) {
    // Keep the original source so we can re-render when the theme changes
    let source = block.dataset.src;
    if (!source) {
      source = block.textContent ?? '';
      block.dataset.src = source;
    }
    if (block.dataset.rendered && !rerender) continue;

    try {
      const { svg } = await mermaid.render(`mmd-${counter++}`, source);
      let host = block.nextElementSibling as HTMLElement | null;
      if (!host?.classList.contains('diagram')) {
        host = document.createElement('div');
        host.className = 'diagram';
        block.after(host);
      }
      host.innerHTML = svg;
      block.hidden = true;
      block.dataset.rendered = '1';
    } catch (err) {
      console.error('Mermaid render failed', err);
      block.classList.add('mermaid-error');
    }
  }
}
