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
 * Calculate content density to determine if we need to shrink or expand
 * Returns a scaling factor: <1 means shrink, >1 means expand, 1 means perfect fit
 */
function calculateContentDensity(content) {
  if (!content) return 1.0
  
  // Count content elements
  const workExpCount = content.workExperience?.length || 0
  const totalBullets = content.workExperience?.reduce((sum, exp) => sum + (exp.bullets?.length || 0), 0) || 0
  const personalStatementLength = content.personalStatement?.length || 0
  const skillsLength = content.skills?.length || 0
  const educationCount = content.education?.length || 0
  
  // Calculate density score (rough estimate of content volume)
  // Each work experience = 100 points
  // Each bullet = 30 points  
  // Personal statement = 1 point per 10 chars
  // Skills = 1 point per 20 chars
  // Each education = 40 points
  const densityScore = 
    (workExpCount * 100) + 
    (totalBullets * 30) + 
    (personalStatementLength / 10) +
    (skillsLength / 20) +
    (educationCount * 40)
  
  console.log('📊 Content Density Analysis:', {
    workExpCount,
    totalBullets,
    personalStatementLength,
    skillsLength,
    educationCount,
    densityScore
  })
  
  // Determine scaling factor based on density
  // < 400: Very short resume → expand (scale up to 1.15x)
  // 400-600: Short resume → expand slightly (scale up to 1.05x)
  // 600-800: Medium resume → perfect fit (scale 1.0x)
  // 800-1000: Long resume → shrink slightly (scale down to 0.85x)
  // > 1000: Very long resume → shrink aggressively (scale down to 0.70x)
  
  if (densityScore < 400) {
    // Very short - expand by 15%
    const scaleFactor = 1.15
    console.log(`✅ Short resume detected (score: ${densityScore}) → Expanding by ${(scaleFactor - 1) * 100}%`)
    return scaleFactor
  } else if (densityScore < 600) {
    // Short - expand by 5%
    const scaleFactor = 1.05
    console.log(`✅ Slightly short resume (score: ${densityScore}) → Expanding by ${(scaleFactor - 1) * 100}%`)
    return scaleFactor
  } else if (densityScore < 800) {
    // Medium - perfect fit
    console.log(`✅ Perfect fit resume (score: ${densityScore}) → No scaling needed`)
    return 1.0
  } else if (densityScore < 1000) {
    // Long - shrink by 15%
    const scaleFactor = 0.85
    console.log(`⚠️ Long resume detected (score: ${densityScore}) → Shrinking by ${(1 - scaleFactor) * 100}%`)
    return scaleFactor
  } else {
    // Very long - shrink by 30%
    const scaleFactor = 0.70
    console.log(`⚠️ Very long resume detected (score: ${densityScore}) → Shrinking by ${(1 - scaleFactor) * 100}%`)
    return scaleFactor
  }
}

/**
 * Adjust font sizes and spacing to optimally fill one page
 * Expands short resumes, shrinks long resumes
 */
export function adjustStylingMinimally(stylingSpecs, content = null) {
  const adjusted = JSON.parse(JSON.stringify(stylingSpecs)) // Deep copy to preserve original

  // Calculate optimal scaling based on content density
  const scaleFactor = content ? calculateContentDensity(content) : 0.85 // Default to slight shrink if no content provided
  
  const minFontSize = 8 // Minimum readable font size
  const maxFontSize = 16 // Maximum font size (for short resumes)

  // Scale ALL font sizes proportionally (can expand or shrink)
  if (adjusted.fonts) {
    // Name font
    if (adjusted.fonts.name?.size) {
      adjusted.fonts.name.size = Math.max(minFontSize, Math.min(maxFontSize * 2, Math.round(adjusted.fonts.name.size * scaleFactor)))
    }
    
    // Section title font
    if (adjusted.fonts.sectionTitle?.size) {
      adjusted.fonts.sectionTitle.size = Math.max(minFontSize, Math.min(maxFontSize, Math.round(adjusted.fonts.sectionTitle.size * scaleFactor)))
    }
    
    // Company name font
    if (adjusted.fonts.companyName?.size) {
      adjusted.fonts.companyName.size = Math.max(minFontSize, Math.min(maxFontSize, Math.round(adjusted.fonts.companyName.size * scaleFactor)))
    }
    
    // Role title font
    if (adjusted.fonts.roleTitle?.size) {
      adjusted.fonts.roleTitle.size = Math.max(minFontSize, Math.min(maxFontSize, Math.round(adjusted.fonts.roleTitle.size * scaleFactor)))
    }
    
    // Date font
    if (adjusted.fonts.date?.size) {
      adjusted.fonts.date.size = Math.max(minFontSize, Math.min(maxFontSize, Math.round(adjusted.fonts.date.size * scaleFactor)))
    }
    
    // Body font
    if (adjusted.fonts.body?.size) {
      adjusted.fonts.body.size = Math.max(minFontSize, Math.min(maxFontSize, Math.round(adjusted.fonts.body.size * scaleFactor)))
    }
    
    // Bullet text font
    if (adjusted.fonts.bulletText?.size) {
      adjusted.fonts.bulletText.size = Math.max(minFontSize, Math.min(maxFontSize, Math.round(adjusted.fonts.bulletText.size * scaleFactor)))
    }
    
    // Contact font
    if (adjusted.fonts.contact?.size) {
      adjusted.fonts.contact.size = Math.max(minFontSize, Math.min(maxFontSize, Math.round(adjusted.fonts.contact.size * scaleFactor)))
    }
    
    // Skills font
    if (adjusted.fonts.skills?.size) {
      adjusted.fonts.skills.size = Math.max(minFontSize, Math.min(maxFontSize, Math.round(adjusted.fonts.skills.size * scaleFactor)))
    }
    
    // Education font
    if (adjusted.fonts.education?.size) {
      adjusted.fonts.education.size = Math.max(minFontSize, Math.min(maxFontSize, Math.round(adjusted.fonts.education.size * scaleFactor)))
    }
    
    // Adjust line heights based on scaling
    if (adjusted.fonts.body?.lineHeight) {
      if (scaleFactor < 1) {
        // Shrinking - use tighter line height
        adjusted.fonts.body.lineHeight = 1.15
      } else {
        // Expanding - use more comfortable line height
        adjusted.fonts.body.lineHeight = 1.4
      }
    }
  }

  // Adjust spacing to complement font scaling (expand or shrink)
  if (adjusted.layout) {
    if (scaleFactor < 1) {
      // Shrinking - use minimal spacing but maintain professional top margin
      adjusted.layout.sectionSpacing = 4 // Tight spacing
      adjusted.layout.paragraphSpacing = 2 // Tight spacing
      adjusted.layout.margins = {
        top: 30, // Maintain adequate top margin even when shrinking
        bottom: 15,
        left: 25,
        right: 25
      }
    } else {
      // Expanding - use more generous spacing to fill page
      const baseSpacing = adjusted.layout.sectionSpacing || 8
      const baseParagraphSpacing = adjusted.layout.paragraphSpacing || 4
      
      adjusted.layout.sectionSpacing = Math.round(baseSpacing * scaleFactor * 1.2) // Extra spacing
      adjusted.layout.paragraphSpacing = Math.round(baseParagraphSpacing * scaleFactor)
      adjusted.layout.margins = {
        top: Math.round(30 * scaleFactor), // Generous top margin when expanding
        bottom: Math.round(30 * scaleFactor),
        left: 30,
        right: 30
      }
    }
  } else {
    // Create layout if it doesn't exist
    if (scaleFactor < 1) {
      adjusted.layout = {
        sectionSpacing: 4,
        paragraphSpacing: 2,
        margins: { top: 30, bottom: 15, left: 25, right: 25 } // Adequate top margin
      }
    } else {
      adjusted.layout = {
        sectionSpacing: Math.round(8 * scaleFactor * 1.2),
        paragraphSpacing: Math.round(4 * scaleFactor),
        margins: { 
          top: Math.round(30 * scaleFactor), 
          bottom: Math.round(30 * scaleFactor), 
          left: 30, 
          right: 30 
        }
      }
    }
  }

  // Adjust bullet spacing based on scaling
  if (adjusted.bullets) {
    if (scaleFactor < 1) {
      // Shrinking - tight bullet spacing
      adjusted.bullets.lineSpacing = 1.1
      adjusted.bullets.indentation = 6
    } else {
      // Expanding - more generous bullet spacing
      adjusted.bullets.lineSpacing = 1.3
      adjusted.bullets.indentation = 10
    }
  } else {
    adjusted.bullets = {
      ...adjusted.bullets,
      lineSpacing: scaleFactor < 1 ? 1.1 : 1.3,
      indentation: scaleFactor < 1 ? 6 : 10
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

