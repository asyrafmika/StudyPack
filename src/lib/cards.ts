import { Marked } from 'marked';

export type Level = 'easy' | 'medium' | 'hard' | 'term';
export interface Card {
  id: number;
  level: Level;
  q: string; // HTML (inline)
  a: string; // HTML (block)
  why: string; // HTML (inline) — shown when the learner marks the card wrong
}

const md = new Marked({ gfm: true });

/** Remove the common leading indentation so indented MDX children aren't parsed as code blocks. */
function dedent(text: string) {
  const lines = text.replace(/^\n+|\s+$/g, '').split('\n');
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join('\n');
}

/**
 * Pull flashcards out of a note's MDX source.
 * Each <QA q="…" level="…" why="…">answer markdown</QA> becomes one card.
 */
export function extractCards(body: string | undefined): Card[] {
  if (!body) return [];
  const re = /<QA\s+q="([^"]*)"\s+level="(easy|medium|hard)"(?:\s+why="([^"]*)")?\s*>([\s\S]*?)<\/QA>/g;
  const cards: Card[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const [, q, level, why = '', answer] = m;
    cards.push({
      id: cards.length,
      level: level as Level,
      q: md.parseInline(q) as string,
      a: md.parse(dedent(answer)) as string,
      why: md.parseInline(why) as string,
    });
  }
  return cards;
}

export function countByLevel(cards: Card[]) {
  return {
    easy: cards.filter((c) => c.level === 'easy').length,
    medium: cards.filter((c) => c.level === 'medium').length,
    hard: cards.filter((c) => c.level === 'hard').length,
  };
}
