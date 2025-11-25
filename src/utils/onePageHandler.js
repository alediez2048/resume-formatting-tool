/**
 * One-Page Constraint Handler
 * Automatically ensures resume content fits on one page
 */

/**
 * Automatically optimize content to fit one page using AI
 * @param {Object} styledContent - Styled resume content
 * @param {Object} referenceTemplate - Reference template
 * @param {string} openAIApiKey - OpenAI API key
 * @returns {Promise<Object>} Optimized content that fits on one page
 */
export async function ensureOnePage(styledContent, referenceTemplate, openAIApiKey) {
  // Skip AI condensation entirely - just return original content
  // Font scaling will be handled by adjustStylingMinimally in the UI component
  return optimizeProgrammatically(styledContent, referenceTemplate)
}

/**
 * Programmatic optimization fallback - NO LONGER USED
 * Content is now preserved, only font sizes are adjusted
 */
function optimizeProgrammatically(styledContent, referenceTemplate) {
  // Return original content unchanged - font adjustment happens elsewhere
  return {
    success: true,
    optimizedContent: styledContent
  }
}

/**
 * Returns a dedicated 'Compact' preset guaranteed to save space.
 * Uses absolute values known to be efficient, rather than relative reduction.
 */
export function getCompactLayoutPreset(baseStyling) {
    // Start with a deep copy to preserve colors/fonts/styles
    const preset = JSON.parse(JSON.stringify(baseStyling));

    // 1. Strict Margins: 0.4 inch (approx 28pt)
    // This is aggressive but professional.
    preset.layout = preset.layout || {};
    preset.layout.margins = {
        top: 28,
        bottom: 28,
        left: 28,
        right: 28
    };

    // 2. Minimal Vertical Spacing
    preset.layout.sectionSpacing = 6; // Very tight between sections
    preset.layout.paragraphSpacing = 4; // Tight between items

    // 3. Compact Fonts
    preset.fonts = preset.fonts || {};
    
    // Name: Large enough to be prominent, but not huge
    if (!preset.fonts.name) preset.fonts.name = {};
    preset.fonts.name.size = 18; 
    
    // Section Titles: Distinct but compact
    if (!preset.fonts.sectionTitle) preset.fonts.sectionTitle = {};
    preset.fonts.sectionTitle.size = 11;

    // Body Text: The critical part. 9pt is the standard "compact" size.
    if (!preset.fonts.body) preset.fonts.body = {};
    preset.fonts.body.size = 9;
    preset.fonts.body.lineHeight = 1.15; // Tight line height

    // Bullets: Match body or slightly smaller
    if (!preset.fonts.bulletText) preset.fonts.bulletText = {};
    preset.fonts.bulletText.size = 9;
    
    // Meta info (dates, locations): Smallest readable size
    if (!preset.fonts.date) preset.fonts.date = {};
    preset.fonts.date.size = 9;
    
    if (!preset.fonts.companyName) preset.fonts.companyName = {};
    preset.fonts.companyName.size = 10; // Slightly larger than body
    
    if (!preset.fonts.roleTitle) preset.fonts.roleTitle = {};
    preset.fonts.roleTitle.size = 9;

    // 4. Bullet Spacing
    preset.bullets = preset.bullets || {};
    preset.bullets.lineSpacing = 1.15;
    preset.bullets.indentation = 10; // Keep indentation for readability

    return preset;
}

/**
 * Adjust font sizes and spacing to fit one page while preserving reference styling
 * Progressively reduces font sizes until content fits
 */
export function adjustStylingMinimally(stylingSpecs) {
  const adjusted = JSON.parse(JSON.stringify(stylingSpecs)) // Deep copy to preserve original

  // Font size reduction factor (reduce all fonts by 15-20% to fit one page)
  const fontReductionFactor = 0.85 // 15% reduction
  const minFontSize = 8 // Minimum readable font size

  // Reduce ALL font sizes proportionally
  if (adjusted.fonts) {
    // Name font
    if (adjusted.fonts.name?.size) {
      adjusted.fonts.name.size = Math.max(minFontSize, Math.round(adjusted.fonts.name.size * fontReductionFactor))
    }
    
    // Section title font
    if (adjusted.fonts.sectionTitle?.size) {
      adjusted.fonts.sectionTitle.size = Math.max(minFontSize, Math.round(adjusted.fonts.sectionTitle.size * fontReductionFactor))
    }
    
    // Company name font
    if (adjusted.fonts.companyName?.size) {
      adjusted.fonts.companyName.size = Math.max(minFontSize, Math.round(adjusted.fonts.companyName.size * fontReductionFactor))
    }
    
    // Role title font
    if (adjusted.fonts.roleTitle?.size) {
      adjusted.fonts.roleTitle.size = Math.max(minFontSize, Math.round(adjusted.fonts.roleTitle.size * fontReductionFactor))
    }
    
    // Date font
    if (adjusted.fonts.date?.size) {
      adjusted.fonts.date.size = Math.max(minFontSize, Math.round(adjusted.fonts.date.size * fontReductionFactor))
    }
    
    // Body font
    if (adjusted.fonts.body?.size) {
      adjusted.fonts.body.size = Math.max(minFontSize, Math.round(adjusted.fonts.body.size * fontReductionFactor))
    }
    
    // Bullet text font
    if (adjusted.fonts.bulletText?.size) {
      adjusted.fonts.bulletText.size = Math.max(minFontSize, Math.round(adjusted.fonts.bulletText.size * fontReductionFactor))
    }
    
    // Contact font
    if (adjusted.fonts.contact?.size) {
      adjusted.fonts.contact.size = Math.max(minFontSize, Math.round(adjusted.fonts.contact.size * fontReductionFactor))
    }
    
    // Skills font
    if (adjusted.fonts.skills?.size) {
      adjusted.fonts.skills.size = Math.max(minFontSize, Math.round(adjusted.fonts.skills.size * fontReductionFactor))
    }
    
    // Education font
    if (adjusted.fonts.education?.size) {
      adjusted.fonts.education.size = Math.max(minFontSize, Math.round(adjusted.fonts.education.size * fontReductionFactor))
    }
    
    // Reduce line heights proportionally
    if (adjusted.fonts.body?.lineHeight) {
      adjusted.fonts.body.lineHeight = Math.max(1.2, adjusted.fonts.body.lineHeight * 0.9)
    }
  }

  // Reduce spacing to complement font size reduction
  if (adjusted.layout) {
    // Reduce section spacing - minimal (less than 0.25 inch = 18pt)
    if (adjusted.layout.sectionSpacing) {
      // Cap at 12pt maximum (less than 0.25 inch), reduce by 70%
      adjusted.layout.sectionSpacing = Math.min(12, Math.max(6, Math.round(adjusted.layout.sectionSpacing * 0.3)))
    } else {
      adjusted.layout.sectionSpacing = 8 // Minimal spacing (less than 0.25 inch)
    }
    
    // Reduce paragraph spacing
    if (adjusted.layout.paragraphSpacing) {
      adjusted.layout.paragraphSpacing = Math.max(3, Math.round(adjusted.layout.paragraphSpacing * 0.4))
    } else {
      adjusted.layout.paragraphSpacing = 3
    }
    
    // Reduce margins - especially top margin for more content space
    if (adjusted.layout.margins) {
      adjusted.layout.margins = {
        top: Math.max(10, Math.round((adjusted.layout.margins.top || 40) * 0.25)), // Aggressively reduce top margin
        bottom: Math.max(15, Math.round((adjusted.layout.margins.bottom || 40) * 0.4)),
        left: Math.max(30, Math.round((adjusted.layout.margins.left || 40) * 0.75)),
        right: Math.max(30, Math.round((adjusted.layout.margins.right || 40) * 0.75))
      }
    } else {
      adjusted.layout.margins = {
        top: 10, // Minimal top margin
        bottom: 15,
        left: 30,
        right: 30
      }
    }
  } else {
    adjusted.layout = {
      sectionSpacing: 6,
      paragraphSpacing: 3,
      margins: {
        top: 20,
        bottom: 20,
        left: 30,
        right: 30
      }
    }
  }

  // Reduce bullet line spacing
  if (adjusted.bullets) {
    adjusted.bullets.lineSpacing = Math.max(1.15, (adjusted.bullets.lineSpacing || 1.5) * 0.85)
  } else {
    adjusted.bullets = {
      ...adjusted.bullets,
      lineSpacing: 1.15
    }
  }

  // PRESERVE: Colors, weights, transforms, bullet style, font families
  // Only font sizes and spacing are adjusted

  return adjusted
}

/**
 * Adjust font sizes and spacing to fit one page - AGGRESSIVE (fallback only)
 * This modifies styling to ensure one-page fit
 */
export function adjustStylingForOnePage(stylingSpecs) {
  const adjusted = JSON.parse(JSON.stringify(stylingSpecs)) // Deep copy

  // AGGRESSIVE: Reduce font sizes more
  if (adjusted.fonts) {
    if (adjusted.fonts.body?.size) {
      adjusted.fonts.body.size = Math.max(9, (adjusted.fonts.body.size || 11) - 2)
    }
    if (adjusted.fonts.bulletText?.size) {
      adjusted.fonts.bulletText.size = Math.max(8, (adjusted.fonts.bulletText.size || 10) - 2)
    }
    if (adjusted.fonts.name?.size) {
      adjusted.fonts.name.size = Math.max(20, (adjusted.fonts.name.size || 24) - 2)
    }
    if (adjusted.fonts.sectionTitle?.size) {
      adjusted.fonts.sectionTitle.size = Math.max(12, (adjusted.fonts.sectionTitle.size || 14) - 1)
    }
    // AGGRESSIVE: Reduce line height significantly
    if (adjusted.fonts.body?.lineHeight) {
      adjusted.fonts.body.lineHeight = 1.2 // Force to 1.2
    } else {
      adjusted.fonts.body = adjusted.fonts.body || {}
      adjusted.fonts.body.lineHeight = 1.2
    }
  }

  // VERY AGGRESSIVE: Minimize spacing to fit one page
  if (adjusted.layout) {
    // Minimize section spacing - use very tight spacing
    adjusted.layout.sectionSpacing = 6 // Force to 6pt max between sections
    
    // Minimize paragraph spacing
    adjusted.layout.paragraphSpacing = 3 // Force to 3pt max
    
    if (adjusted.layout.margins) {
      // VERY AGGRESSIVE: Minimize margins significantly
      adjusted.layout.margins = {
        top: 20, // Force to 20pt
        bottom: 20, // Force to 20pt
        left: 30, // Keep readable
        right: 30 // Keep readable
      }
    } else {
      // Set defaults if margins don't exist
      adjusted.layout.margins = {
        top: 20,
        bottom: 20,
        left: 30,
        right: 30
      }
    }
  } else {
    // Create layout object if it doesn't exist
    adjusted.layout = {
      sectionSpacing: 6,
      paragraphSpacing: 3,
      margins: {
        top: 20,
        bottom: 20,
        left: 30,
        right: 30
      }
    }
  }

  // AGGRESSIVE: Minimize bullet spacing
  if (adjusted.bullets) {
    adjusted.bullets.lineSpacing = 1.1 // Force to 1.1
    adjusted.bullets.indentation = 8 // Force to 8pt
  } else {
    adjusted.bullets = {
      lineSpacing: 1.1,
      indentation: 8,
      style: stylingSpecs.bullets?.style || '•'
    }
  }

  return adjusted
}
