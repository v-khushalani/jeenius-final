import katex from 'katex';

/**
 * Converts common text patterns to proper Unicode symbols
 */
export function renderMathText(text: string): string {
  if (!text) return '';
  
  let processed = text;
  
  // Convert common chemistry notations
  processed = processed.replace(/H2O/g, 'H₂O');
  processed = processed.replace(/CO2/g, 'CO₂');
  processed = processed.replace(/O2/g, 'O₂');
  processed = processed.replace(/N2/g, 'N₂');
  processed = processed.replace(/H2/g, 'H₂');
  processed = processed.replace(/SO4/g, 'SO₄');
  processed = processed.replace(/NO3/g, 'NO₃');
  processed = processed.replace(/NH3/g, 'NH₃');
  processed = processed.replace(/CH4/g, 'CH₄');
  processed = processed.replace(/Ca\(OH\)2/g, 'Ca(OH)₂');
  processed = processed.replace(/H2SO4/g, 'H₂SO₄');
  processed = processed.replace(/HNO3/g, 'HNO₃');
  
  // Convert degree symbols
  processed = processed.replace(/(\d+)\s*deg(?:ree)?s?/gi, '$1°');
  
  // Convert arrow symbols
  processed = processed.replace(/->/g, '→');
  processed = processed.replace(/<-/g, '←');
  processed = processed.replace(/<=>/g, '⇌');
  processed = processed.replace(/>=/g, '≥');
  processed = processed.replace(/<=/g, '≤');
  processed = processed.replace(/!=/g, '≠');
  processed = processed.replace(/~=/g, '≈');
  
  // Convert common superscripts
  processed = processed.replace(/\^2(?!\{)/g, '²');
  processed = processed.replace(/\^3(?!\{)/g, '³');
  
  return processed;
}

/**
 * Safely render LaTeX with KaTeX
 */
function renderWithKatex(latex: string, displayMode: boolean = false): string {
  if (!latex || !latex.trim()) return '';
  
  try {
    return katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false,
      errorColor: '#cc0000',
      strict: false,
      trust: true,
      output: 'html'
    });
  } catch (e) {
    console.error('KaTeX render error:', e);
    return `<span style="color:red">${latex}</span>`;
  }
}

/**
 * Check if text contains LaTeX that needs rendering
 */
export function containsLatex(text: string): boolean {
  if (!text) return false;
  
  // Check for $ delimiters
  if (text.includes('$')) {
    return true;
  }
  
  // Check for common LaTeX commands
  const patterns = [
    '\\frac', '\\sqrt', '\\lim', '\\sum', '\\int',
    '\\left', '\\right', '\\begin', '\\end',
    '\\alpha', '\\beta', '\\gamma', '\\delta', '\\theta',
    '\\lambda', '\\sigma', '\\pi', '\\omega', '\\infty',
    '\\times', '\\div', '\\pm', '\\neq', '\\leq', '\\geq',
    '\\to', '\\cdot', '\\vec', '\\cos', '\\sin', '\\tan', '\\log', '\\ln'
  ];
  
  return patterns.some(p => text.includes(p));
}

/**
 * Main function to render LaTeX math expressions
 */
export function renderLatex(text: string): string {
  if (!text) return '';
  
  // If no $ and no LaTeX commands, just return basic text conversions
  if (!containsLatex(text)) {
    return renderMathText(text);
  }
  
  // If no $ delimiters but has LaTeX commands, wrap and render entire text
  if (!text.includes('$')) {
    const isDisplay = text.includes('\\begin{') || text.includes('\\\\');
    return renderWithKatex(text, isDisplay);
  }
  
  let result = text;
  
  // Handle display math $$...$$ first (greedy match)
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (_, latex) => {
    return renderWithKatex(latex, true);
  });
  
  // Handle inline math $...$
  // Use a more permissive pattern that allows any character except $ between delimiters
  result = result.replace(/\$([^\$]+)\$/g, (fullMatch, latex) => {
    // Skip if looks like currency
    if (/^\s*\d+(\.\d+)?\s*$/.test(latex)) {
      return fullMatch;
    }
    return renderWithKatex(latex, false);
  });
  
  // Apply basic text conversions to any remaining plain text
  if (!result.includes('class="katex"')) {
    result = renderMathText(result);
  }
  
  return result;
}
