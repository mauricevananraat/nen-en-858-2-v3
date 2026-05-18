/**
 * SVG-photo generator voor scenario-foto's.
 * Output: data-URL SVG die in de browser via canvas.toDataURL('image/png')
 * naar PNG wordt geconverteerd (pdfMake accepteert geen SVG-dataURLs in image:).
 */

export const COLORS = {
  ok:        '#22c55e',  // groen — goedgekeurd / OK
  opmerking: '#f59e0b',  // oranje — let op / krap
  defect:    '#dc2626',  // rood — afgekeurd / over grenswaarde
  neutraal:  '#005EB8'   // Symitech blauw — overzicht / context
};

const ICONS = {
  ok:        '✓',
  opmerking: '⚠',
  defect:    '✕',
  neutraal:  '•'
};

/**
 * Genereer een gelabelde SVG voor een scenario-foto.
 * @param {object} opts
 * @param {string} opts.label - Hoofdtekst (bv. "OLIELAAG 95mm")
 * @param {string} [opts.sublabel] - Onderschrift (bv. "OVER GRENSWAARDE")
 * @param {keyof COLORS} opts.status - 'ok' | 'opmerking' | 'defect' | 'neutraal'
 * @returns {{ svg: string, status: string, label: string }}
 */
export function svgPhoto({ label, sublabel = '', status }) {
  const color = COLORS[status];
  const icon = ICONS[status];
  if (!color) throw new Error(`svgPhoto: onbekende status "${status}"`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <rect width="600" height="450" fill="${color}"/>
  <rect x="20" y="20" width="560" height="410" fill="none" stroke="#fff" stroke-width="4"/>
  <text x="300" y="180" text-anchor="middle" font-size="80" fill="#fff">${icon}</text>
  <text x="300" y="260" text-anchor="middle" font-size="38" font-weight="bold" fill="#fff">${label}</text>
  <text x="300" y="310" text-anchor="middle" font-size="22" fill="#fff">${sublabel}</text>
  <text x="300" y="400" text-anchor="middle" font-size="16" fill="#fff">testfoto — scenario-demo</text>
</svg>`;

  return { svg, status, label };
}
