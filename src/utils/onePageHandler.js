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
  if (!openAIApiKey || !openAIApiKey.trim()) {
    // Without API key, use programmatic optimization
    return optimizeProgrammatically(styledContent, referenceTemplate)
  }

  try {
    // Use AI to optimize content - PRESERVE original text, just condense
    const prompt = `CRITICAL: Condense this resume to fit EXACTLY on ONE PAGE (A4: 8.5" x 11"). 

IMPORTANT RULES:
1. DO NOT rewrite or change the meaning of any content
2. DO NOT add new information
3. ONLY shorten/condense existing text
4. Preserve all metrics, numbers, and achievements exactly
5. Keep the same wording style, just make it more concise

OPTIMIZATION STRATEGY:
1. Reduce bullet points to 3-4 most important per job (remove least important, don't rewrite)
2. Shorten personal statement by removing less critical phrases (keep core message)
3. Condense skills to single line if categorized
4. Keep all jobs - don't remove any
5. Shorten bullet points by removing filler words, but keep exact metrics
6. Preserve all company names, dates, titles exactly

ORIGINAL CONTENT (PRESERVE MEANING, JUST CONDENSE):
${JSON.stringify(styledContent, null, 2)}

Return ONLY a JSON object with the SAME structure. Condense text but DO NOT rewrite. Keep all information, just make it shorter.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a resume condensing expert. Your ONLY job is to shorten text while preserving the EXACT original meaning and wording. DO NOT rewrite, rephrase, or change content. ONLY remove words to make it shorter. Preserve all metrics, numbers, company names, and achievements exactly as written.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2, // Low temperature for consistent, focused optimization
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      return optimizeProgrammatically(styledContent, referenceTemplate)
    }

    // Parse optimized content
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const optimized = JSON.parse(jsonMatch[0])
        return {
          success: true,
          optimizedContent: {
            ...optimized,
            styling: styledContent.styling || referenceTemplate.stylingSpecs // Preserve styling
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse AI optimization, using programmatic fallback:', parseError)
        return optimizeProgrammatically(styledContent, referenceTemplate)
      }
    }

    return optimizeProgrammatically(styledContent, referenceTemplate)
  } catch (error) {
    console.error('Error optimizing with AI, using programmatic fallback:', error)
    return optimizeProgrammatically(styledContent, referenceTemplate)
  }
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

