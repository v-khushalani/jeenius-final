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
  
  // Convert Greek letters
  processed = processed.replace(/\balpha\b/gi, 'α');
  processed = processed.replace(/\bbeta\b/gi, 'β');
  processed = processed.replace(/\bgamma\b/gi, 'γ');
  processed = processed.replace(/\bdelta\b/gi, 'δ');
  processed = processed.replace(/\btheta\b/gi, 'θ');
  processed = processed.replace(/\blambda\b/gi, 'λ');
  processed = processed.replace(/\bmu\b/gi, 'μ');
  processed = processed.replace(/\bpi\b/gi, 'π');
  processed = processed.replace(/\bsigma\b/gi, 'σ');
  processed = processed.replace(/\bomega\b/gi, 'ω');
  processed = processed.replace(/\bphi\b/gi, 'φ');
  processed = processed.replace(/\bpsi\b/gi, 'ψ');
  processed = processed.replace(/\brho\b/gi, 'ρ');
  processed = processed.replace(/\bepsilon\b/gi, 'ε');
  
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
 * Renders LaTeX math expressions within $...$ or $$...$$ delimiters
 */
export function renderLatex(text: string): string {
  if (!text) return '';
  
  // First apply basic text conversions
  let processed = renderMathText(text);
  
  try {
    // Render display math $$...$$
    processed = processed.replace(/\$\$(.*?)\$\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex, { 
          displayMode: true,
          throwOnError: false,
          output: 'html'
        });
      } catch {
        return `$$${latex}$$`;
      }
    });
    
    // Render inline math $...$
    processed = processed.replace(/\$(.*?)\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex, { 
          displayMode: false,
          throwOnError: false,
          output: 'html'
        });
      } catch {
        return `$${latex}$`;
      }
    });
  } catch (error) {
    console.error('LaTeX rendering error:', error);
  }
  
  return processed;
}

/**
 * Check if text contains LaTeX delimiters
 */
export function containsLatex(text: string): boolean {
  return /\$.*?\$/.test(text) || /\$\$.*?\$\$/.test(text);
}
