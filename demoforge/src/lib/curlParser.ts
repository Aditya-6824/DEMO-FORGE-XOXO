/**
 * A robust utility to parse cURL command strings into structured objects.
 */
export interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

export function parseCurl(curlString: string): ParsedCurl {
  const result: ParsedCurl = {
    url: '',
    method: 'GET',
    headers: {},
    body: null,
  };

  // 1. Pre-process: handle backslash line-continuations and clean all types of newlines
  const cleaned = curlString
    .replace(/\\\s*\n/g, ' ') // Handle backslash followed by optional whitespace and newline
    .replace(/\s+/g, ' ')     // Collapse all whitespace (newlines, tabs, etc.) into single spaces
    .trim();

  // 2. Tokenize the string (respecting quotes)
  const tokens: string[] = [];
  let current = '';
  let inQuotes: string | null = null;
  let escaped = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escaped) {
      current += char;
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (inQuotes) {
      if (char === inQuotes) inQuotes = null;
      else current += char;
    } else if (char === "'" || char === '"') {
      inQuotes = char;
    } else if (char === ' ') {
      if (current) tokens.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current) tokens.push(current);

  // 3. Parse tokens
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    
    // URL detection (first non-flag token starting with http)
    if (!result.url && t.startsWith('http')) {
      result.url = t;
      continue;
    }

    if (t === '-H' || t === '--header') {
      const headerLine = tokens[++i];
      if (headerLine) {
        const sep = headerLine.indexOf(':');
        if (sep !== -1) {
          const k = headerLine.substring(0, sep).trim();
          const v = headerLine.substring(sep + 1).trim();
          result.headers[k] = v;
        }
      }
    } else if (t === '-X' || t === '--request') {
      result.method = (tokens[++i] || 'GET').toUpperCase();
    } else if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--json') {
      result.body = tokens[++i] || '';
      if (result.method === 'GET') result.method = 'POST';
    } else if (t === '--location' || t === '-L' || t === 'curl') {
      // ignore
    } else if (!result.url && !t.startsWith('-')) {
       // Fallback for URL if it's the first positional arg
       result.url = t;
    }
  }

  return result;
}
