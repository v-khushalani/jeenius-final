import katex from 'katex';

/**
 * Converts common text patterns to proper LaTeX and renders them
 */
export function renderMathText(text: string): string {
  if (!text) return '';
  
  let processed = text;
  
  // Convert common superscript patterns
  processed = processed.replace(/(\w)\^(\d+)/g, '$1^{$2}');
  processed = processed.replace(/(\w)\^{(\w+)}/g, '$1^{$2}');
  
  // Convert common subscript patterns
  processed = processed.replace(/(\w)_(\d+)/g, '$1_{$2}');
  processed = processed.replace(/(\w)_{(\w+)}/g, '$1_{$2}');
  
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
  processed = processed.replace(/NaCl/g, 'NaCl');
  processed = processed.replace(/Ca\(OH\)2/g, 'Ca(OH)₂');
  processed = processed.replace(/H2SO4/g, 'H₂SO₄');
  processed = processed.replace(/HNO3/g, 'HNO₃');
  processed = processed.replace(/HCl/g, 'HCl');
  
  // Convert degree symbols
  processed = processed.replace(/(\d+)\s*deg(?:ree)?s?/gi, '$1°');
  processed = processed.replace(/(\d+)\s*\^o/g, '$1°');
  
  // Convert common physics symbols
  processed = processed.replace(/m\/s\^2/g, 'm/s²');
  processed = processed.replace(/m\/s2/g, 'm/s²');
  processed = processed.replace(/kg\.m\/s/g, 'kg·m/s');
  processed = processed.replace(/\bN\.m\b/g, 'N·m');
  
  // Convert fractions like a/b to proper format
  processed = processed.replace(/\b(\d+)\/(\d+)\b/g, '$1⁄$2');
  
  // Convert arrow symbols
  processed = processed.replace(/->/g, '→');
  processed = processed.replace(/<-/g, '←');
  processed = processed.replace(/<=>/g, '⇌');
  processed = processed.replace(/>=/g, '≥');
  processed = processed.replace(/<=/g, '≤');
  processed = processed.replace(/!=/g, '≠');
  processed = processed.replace(/~=/g, '≈');
  
  // Convert Greek letters (only if not in LaTeX context)
  if (!text.includes('$')) {
    processed = processed.replace(/\balpha\b/gi, 'α');
    processed = processed.replace(/\bbeta\b/gi, 'β');
    processed = processed.replace(/\bgamma\b/gi, 'γ');
    processed = processed.replace(/\bdelta\b/gi, 'δ');
    processed = processed.replace(/\bDelta\b/g, 'Δ');
    processed = processed.replace(/\btheta\b/gi, 'θ');
    processed = processed.replace(/\bTheta\b/g, 'Θ');
    processed = processed.replace(/\blambda\b/gi, 'λ');
    processed = processed.replace(/\bLambda\b/g, 'Λ');
    processed = processed.replace(/\bmu\b/gi, 'μ');
    processed = processed.replace(/\bpi\b/gi, 'π');
    processed = processed.replace(/\bPi\b/g, 'Π');
    processed = processed.replace(/\bsigma\b/gi, 'σ');
    processed = processed.replace(/\bSigma\b/g, 'Σ');
    processed = processed.replace(/\bomega\b/gi, 'ω');
    processed = processed.replace(/\bOmega\b/g, 'Ω');
    processed = processed.replace(/\bphi\b/gi, 'φ');
    processed = processed.replace(/\bPhi\b/g, 'Φ');
    processed = processed.replace(/\bpsi\b/gi, 'ψ');
    processed = processed.replace(/\bPsi\b/g, 'Ψ');
    processed = processed.replace(/\brho\b/gi, 'ρ');
    processed = processed.replace(/\bepsilon\b/gi, 'ε');
    processed = processed.replace(/\btau\b/gi, 'τ');
    processed = processed.replace(/\bxi\b/gi, 'ξ');
    processed = processed.replace(/\bzeta\b/gi, 'ζ');
    processed = processed.replace(/\beta\b/gi, 'η');
    processed = processed.replace(/\bkappa\b/gi, 'κ');
    processed = processed.replace(/\bnu\b/gi, 'ν');
    processed = processed.replace(/\bchi\b/gi, 'χ');
  }
  
  // Convert common math symbols
  processed = processed.replace(/\bsqrt\b/g, '√');
  processed = processed.replace(/\binfinity\b/gi, '∞');
  processed = processed.replace(/\bintegral\b/gi, '∫');
  processed = processed.replace(/\bsum\b/gi, '∑');
  processed = processed.replace(/\bproduct\b/gi, '∏');
  
  // Convert common superscripts
  processed = processed.replace(/\^2\b/g, '²');
  processed = processed.replace(/\^3\b/g, '³');
  processed = processed.replace(/\^n\b/g, 'ⁿ');
  processed = processed.replace(/\^-1\b/g, '⁻¹');
  processed = processed.replace(/\^-2\b/g, '⁻²');
  
  // Convert common subscripts (numeric)
  processed = processed.replace(/_0\b/g, '₀');
  processed = processed.replace(/_1\b/g, '₁');
  processed = processed.replace(/_2\b/g, '₂');
  processed = processed.replace(/_3\b/g, '₃');
  processed = processed.replace(/_4\b/g, '₄');
  processed = processed.replace(/_n\b/g, 'ₙ');
  
  return processed;
}

/**
 * Wraps raw LaTeX commands with $ delimiters
 * Handles text that contains LaTeX without proper delimiters
 */
function wrapRawLatex(text: string): string {
  if (!text) return '';
  
  // If already has $ delimiters, return as is
  if (/\$/.test(text)) return text;
  
  // Check if the entire text appears to be a LaTeX expression
  const hasLatexCommands = /\\(begin|end|frac|lim|sum|int|sqrt|max|min|prod|left|right|times|div|pm|neq|leq|geq|alpha|beta|gamma|delta|theta|lambda|infty|cdot|to|rightarrow|leftarrow|sigma|pi|mu|omega|phi|psi|epsilon|eta|rho|tau|xi|zeta|kappa|nu|chi|Delta|Sigma|Pi|Omega|Phi|Psi|Theta|Lambda|vec|bar|hat|tilde|dot|ddot|overline|underline|overbrace|underbrace|text|mathrm|mathbf|mathit|mathbb|mathcal|binom|choose|cases|matrix|pmatrix|bmatrix|vmatrix|array|aligned|gathered|split|substack|limits|nolimits|displaystyle|textstyle|scriptstyle|scriptscriptstyle)/.test(text);
  
  if (hasLatexCommands) {
    // Check if it's a display math expression (multi-line, complex)
    const isDisplay = /\\begin\{|\\end\{|\\\\|\\newline/.test(text);
    
    if (isDisplay) {
      return `$$${text}$$`;
    } else {
      return `$${text}$`;
    }
  }
  
  return text;
}

/**
 * Renders LaTeX math expressions within $...$ or $$...$$ delimiters
 * Also handles raw LaTeX by auto-wrapping it
 */
export function renderLatex(text: string): string {
  if (!text) return '';
  
  // First wrap any raw LaTeX commands with $ delimiters
  let processed = wrapRawLatex(text);
  
  try {
    // Render display math $$...$$ first (to avoid conflicts with inline math)
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
      try {
        const cleaned = latex.trim();
        return katex.renderToString(cleaned, { 
          displayMode: true,
          throwOnError: false,
          output: 'html',
          strict: false,
          trust: true,
          fleqn: false
        });
      } catch (e) {
        console.warn('Display math rendering failed:', latex, e);
        return match;
      }
    });
    
    // Render inline math $...$
    processed = processed.replace(/\$([^\$]+?)\$/g, (match, latex) => {
      try {
        const cleaned = latex.trim();
        return katex.renderToString(cleaned, { 
          displayMode: false,
          throwOnError: false,
          output: 'html',
          strict: false,
          trust: true
        });
      } catch (e) {
        console.warn('Inline math rendering failed:', latex, e);
        return match;
      }
    });
    
    // Apply basic text conversions only if no KaTeX was rendered
    if (!processed.includes('<span class="katex">')) {
      processed = renderMathText(processed);
    }
  } catch (error) {
    console.error('LaTeX rendering error:', error);
    // Fallback to basic text rendering
    processed = renderMathText(text);
  }
  
  return processed;
}

/**
 * Check if text contains LaTeX delimiters or raw LaTeX commands
 */
export function containsLatex(text: string): boolean {
  // Check for $ delimiters
  if (/\$.*?\$/.test(text) || /\$\$.*?\$\$/.test(text)) {
    return true;
  }
  
  // Check for common LaTeX commands that indicate raw LaTeX
  const latexCommands = [
    '\\begin{', '\\end{', '\\frac{', '\\sqrt{', '\\lim_', '\\lim{',
    '\\sum_', '\\int_', '\\max\\', '\\min\\', '\\left', '\\right',
    '\\times', '\\div', '\\pm', '\\neq', '\\leq', '\\geq',
    '\\alpha', '\\beta', '\\gamma', '\\delta', '\\theta', '\\lambda',
    '\\infty', '\\cdot', '\\to', '\\rightarrow', '\\leftarrow'
  ];
  
  return latexCommands.some(cmd => text.includes(cmd));
}
