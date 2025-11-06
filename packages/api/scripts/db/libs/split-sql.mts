export function splitSQL(text: string): string[] {
  const result: string[] = [];
  let i = 0,
    buf = '',
    inS = false,
    inD = false,
    inML = false,
    inDL = false;
  let dlTag = ''; // current $$tag$$

  while (i < text.length) {
    const curr = text[i];
    const next = text[i + 1];

    // handle multi-line comment
    if (inML) {
      if (curr === '*' && next === '/') {
        inML = false;
        i += 2;
        continue;
      }

      buf += curr;
      i++;
      continue;
    }

    // handle dollar-quoted block
    if (inDL) {
      buf += curr;
      i++;
      if (text.slice(i - dlTag.length - 2, i) === '$' + dlTag + '$') {
        inDL = false;
      }
      continue;
    }

    // handle single quote string
    if (inS) {
      buf += curr;
      i++;
      if (curr === "'" && text[i - 2] !== '\\') inS = false;
      continue;
    }

    // handle double quote string (ident)
    if (inD) {
      buf += curr;
      i++;
      if (curr === `"` && text[i - 2] !== '\\') inD = false;
      continue;
    }

    // start comment/string/dollar
    if (curr === '-' && next === '-') {
      // line comment: consume to endline
      while (i < text.length && text[i] !== '\n') {
        buf += text[i++];
      }
      continue;
    }
    if (curr === '/' && next === '*') {
      inML = true;
      buf += '/*';
      i += 2;
      continue;
    }
    if (curr === "'") {
      inS = true;
      buf += curr;
      i++;
      continue;
    }
    if (curr === `"`) {
      inD = true;
      buf += curr;
      i++;
      continue;
    }
    if (curr === '$') {
      // attempt to parse $$tag$ start
      const m = text.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
      if (m) {
        dlTag = m[0].slice(1, -1); // inside $$...$
        inDL = true;
        buf += m[0];
        i += m[0].length;
        continue;
      }
    }

    // split point?
    if (curr === ';') {
      const stmt = buf.trim();
      if (stmt) result.push(stmt + ';');
      buf = '';
      i++;
      continue;
    }

    buf += curr;
    i++;
  }
  const tail = buf.trim();
  if (tail) result.push(tail);
  return result.filter((s) => s.length > 0);
}
