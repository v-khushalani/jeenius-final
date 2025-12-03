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
    console.error('KaTeX render error:', e, 'for:', latex.substring(0, 100));
    // Return the original text wrapped in a span so it's at least visible
    return `<span class="katex-error">${latex}</span>`;
  }
}

/**
 * Common LaTeX command patterns that indicate math content
 */
const LATEX_PATTERNS = [
  '\\frac', '\\sqrt', '\\lim', '\\sum', '\\int', '\\prod',
  '\\left', '\\right', '\\begin', '\\end',
  '\\alpha', '\\beta', '\\gamma', '\\delta', '\\theta', '\\epsilon',
  '\\lambda', '\\sigma', '\\pi', '\\omega', '\\infty', '\\mu', '\\nu',
  '\\rho', '\\phi', '\\psi', '\\tau', '\\xi', '\\eta', '\\zeta',
  '\\times', '\\div', '\\pm', '\\neq', '\\leq', '\\geq', '\\approx',
  '\\to', '\\rightarrow', '\\leftarrow', '\\Rightarrow', '\\Leftarrow',
  '\\cdot', '\\vec', '\\hat', '\\bar', '\\dot', '\\ddot',
  '\\cos', '\\sin', '\\tan', '\\cot', '\\sec', '\\csc',
  '\\log', '\\ln', '\\exp',
  '\\partial', '\\nabla', '\\forall', '\\exists',
  '\\in', '\\notin', '\\subset', '\\supset', '\\cup', '\\cap',
  '\\over', '\\atop', '\\choose',
  '^{', '_{', // subscripts and superscripts with braces
];

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
  return LATEX_PATTERNS.some(p => text.includes(p));
}

/**
 * Wrap raw LaTeX content with $ delimiters if needed
 */
function wrapRawLatex(text: string): string {
  if (!text) return '';
  
  // If already has $ delimiters, return as is
  if (text.includes('$')) {
    return text;
  }
  
  // If it has LaTeX commands, wrap the entire thing
  if (containsLatex(text)) {
    return `$${text}$`;
  }
  
  return text;
}

/**
 * Main function to render LaTeX math expressions
 * This handles:
 * 1. Text with $...$ delimiters (inline math)
 * 2. Text with $$...$$ delimiters (display math)
 * 3. Raw LaTeX without delimiters (auto-wrapped)
 */
export function renderLatex(text: string): string {
  if (!text) return '';
  
  // If no LaTeX content at all, just apply basic text conversions
  if (!containsLatex(text)) {
    return renderMathText(text);
  }
  
  let result = text;
  
  // If text has $ delimiters, process them
  if (text.includes('$')) {
    // Handle display math $$...$$ first
    result = result.replace(/\$\$([\s\S]+?)\$\$/g, (_, latex) => {
      return renderWithKatex(latex, true);
    });
    
    // Handle inline math $...$
    // Use a more robust pattern that handles complex content
    result = result.replace(/\$([^$]+)\$/g, (fullMatch, latex) => {
      // Skip if it looks like currency (just numbers)
      if (/^\s*\d+(\.\d+)?\s*$/.test(latex)) {
        return fullMatch;
      }
      return renderWithKatex(latex, false);
    });
    
    // If there are still unprocessed $ signs (odd number), try to handle them
    // This handles cases where there's a single $...$ that didn't get matched
    if (result.includes('$') && !result.includes('class="katex"')) {
      // Extract content between first and last $
      const firstDollar = result.indexOf('$');
      const lastDollar = result.lastIndexOf('$');
      
      if (firstDollar !== lastDollar && firstDollar !== -1) {
        const before = result.substring(0, firstDollar);
        const latex = result.substring(firstDollar + 1, lastDollar);
        const after = result.substring(lastDollar + 1);
        
        result = before + renderWithKatex(latex, false) + after;
      }
    }
  } else {
    // No $ delimiters but has LaTeX commands - render entire text as math
    const isDisplay = text.includes('\\begin{') || text.includes('\\\\') || text.length > 100;
    result = renderWithKatex(text, isDisplay);
  }
  
  // Apply basic text conversions to any remaining non-KaTeX parts
  // Only if we haven't already processed everything
  if (!result.includes('class="katex"')) {
    result = renderMathText(result);
  }
  
  return result;
}

/**
 * Process text that might contain mixed content (text and LaTeX)
 * More aggressive version that ensures LaTeX is always rendered
 */
export function renderMixedContent(text: string): string {
  if (!text) return '';
  
  // If it has $ signs, use standard renderLatex
  if (text.includes('$')) {
    return renderLatex(text);
  }
  
  // Check if it looks like pure LaTeX
  if (containsLatex(text)) {
    // If the whole thing looks like LaTeX, render it
    return renderWithKatex(text, text.length > 100);
  }
  
  // Otherwise just do basic conversions
  return renderMathText(text);
}
