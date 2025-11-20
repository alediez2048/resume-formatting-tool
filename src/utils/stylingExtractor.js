/**
 * Styling Specification Extractor
 * Analyzes reference resume to extract styling specifications
 * Works with both PDF parsing results and text parsing results
 */

/**
 * Extract styling specifications from parsed reference resume
 * @param {Object} parsedData - Parsed resume structure (from PDF or text)
 * @returns {Object} Styling specifications
 */
export function extractStylingSpecs(parsedData) {
  if (!parsedData) {
    return { error: 'Invalid parsed resume data' }
  }

  // If data comes from PDF parser, it already has stylingSpecs
  if (parsedData.stylingSpecs) {
    return {
      success: true,
      specs: parsedData.stylingSpecs,
      metadata: {
        extractedAt: new Date().toISOString(),
        sourceType: 'pdf',
        viewport: parsedData.viewport
      }
    }
  }

  // Fallback for text-based parsing (legacy support)
  if (!parsedData.success) {
    return { error: 'Invalid parsed resume data' }
  }

  const specs = {
    fonts: {
      name: {
        family: 'Helvetica', // Default, will be inferred from PDF rendering
        size: inferFontSize(parsedResume.contactInfo?.name || parsedResume.sections?.header?.split('\n')[0] || ''),
        weight: 'bold'
      },
      sectionTitle: {
        family: 'Helvetica',
        size: inferSectionTitleSize(parsedResume.sections),
        weight: 'bold',
        transform: inferTextTransform(parsedResume.sections)
      },
      body: {
        family: 'Helvetica',
        size: 11, // Standard resume body text
        lineHeight: 1.5
      },
      contact: {
        family: 'Helvetica',
        size: 10 // Typically smaller than body
      }
    },
    layout: {
      margins: {
        top: 40, // Default PDF margins in points
        bottom: 40,
        left: 40,
        right: 40
      },
      sectionSpacing: inferSectionSpacing(parsedResume),
      paragraphSpacing: 8
    },
    sections: {
      titles: extractSectionTitles(parsedResume),
      order: inferSectionOrder(parsedResume),
      contactFormat: inferContactFormat(parsedResume.contactInfo)
    },
    bullets: {
      style: inferBulletStyle(parsedResume),
      indentation: parsedResume.stylingSpecs?.bullets?.indentation || 10,
      lineSpacing: parsedResume.stylingSpecs?.bullets?.lineSpacing || 1.5
    },
    constraints: {
      onePage: true,
      maxCharactersPerLine: 80 // Approximate for A4 page
    }
  }

  return {
    success: true,
    specs,
    metadata: {
      extractedAt: new Date().toISOString(),
      sourceType: 'text',
      sourceLength: parsedData.rawText?.length || 0
    }
  }
}

/**
 * Infer font size from text (rough estimation based on length and context)
 */
function inferFontSize(text) {
  if (!text) return 24 // Default name size
  
  // Names are typically 18-28pt, estimate based on length
  const length = text.length
  if (length <= 15) return 24
  if (length <= 25) return 22
  return 20
}

/**
 * Infer section title size
 */
function inferSectionTitleSize(sections) {
  // Section titles are typically 12-16pt
  return 14 // Standard size
}

/**
 * Infer text transform (uppercase, capitalize, etc.)
 */
function inferTextTransform(sections) {
  if (!sections) return 'uppercase'
  
  // Check if section titles are all caps
  const sectionTitles = extractSectionTitles({ sections })
  if (sectionTitles.length > 0) {
    const firstTitle = sectionTitles[0]
    if (firstTitle === firstTitle.toUpperCase() && firstTitle.length > 3) {
      return 'uppercase'
    }
  }
  
  return 'none' // Default to no transform
}

/**
 * Extract section titles from parsed resume
 */
function extractSectionTitles(parsedResume) {
  const titles = []
  const sections = parsedResume.sections || parsedResume.structuredContent?.sections
  if (sections?.personalStatement) titles.push('Personal Statement')
  if (sections?.workExperience) titles.push('Work Experience')
  if (sections?.skills) titles.push('Skills')
  if (sections?.education) titles.push('Education')
  return titles
}

/**
 * Infer section order from parsed resume
 */
function inferSectionOrder(parsedResume) {
  const order = []
  const sections = parsedResume.sections || parsedResume.structuredContent?.sections
  if (sections?.personalStatement) order.push('personalStatement')
  if (sections?.workExperience) order.push('workExperience')
  if (sections?.skills) order.push('skills')
  if (sections?.education) order.push('education')
  return order
}

/**
 * Infer section spacing
 */
function inferSectionSpacing(parsedResume) {
  // If PDF parser provided spacing, use it
  if (parsedResume.stylingSpecs?.layout?.sectionSpacing) {
    return parsedResume.stylingSpecs.layout.sectionSpacing
  }
  // Standard spacing between sections
  return 20 // points
}

/**
 * Infer contact information format
 */
function inferContactFormat(contactInfo) {
  if (!contactInfo) return { separator: ' | ', layout: 'horizontal' }
  
  // Analyze how contact info is formatted
  // This is a simplified version - could be enhanced
  return {
    separator: ' | ', // Common separator
    layout: 'horizontal', // Most resumes use horizontal layout
    includeWebsite: !!contactInfo.website
  }
}

/**
 * Infer bullet point style from sections
 */
function inferBulletStyle(parsedResume) {
  // If PDF parser provided bullet style, use it
  if (parsedResume.stylingSpecs?.bullets?.style) {
    return parsedResume.stylingSpecs.bullets.style
  }
  
  const sections = parsedResume.sections || parsedResume.structuredContent?.sections
  if (!sections) return '•'
  
  // Check work experience section for bullet style
  const workExp = sections.workExperience || ''
  if (workExp.includes('•')) return '•'
  if (workExp.includes('-')) return '-'
  if (workExp.includes('*')) return '*'
  
  return '•' // Default
}

/**
 * Create a complete reference template object
 * @param {Object} parsedData - Parsed resume (from PDF or text)
 * @param {Object} stylingSpecs - Styling specifications
 * @returns {Object} Complete reference template
 */
export function createReferenceTemplate(parsedData, stylingSpecs) {
  // Handle both PDF and text parsing results
  const contactInfo = parsedData.structuredContent?.contactInfo || parsedData.contactInfo
  const sections = parsedData.structuredContent?.sections || parsedData.sections
  const rawText = parsedData.rawText || ''

  return {
    id: `template_${Date.now()}`,
    name: `Reference Template - ${new Date().toLocaleDateString()}`,
    createdAt: new Date().toISOString(),
    parsedResume: {
      contactInfo,
      sections,
      rawText
    },
    stylingSpecs: stylingSpecs.specs,
    metadata: {
      ...stylingSpecs.metadata,
      sourceType: parsedData.stylingSpecs ? 'pdf' : 'text'
    }
  }
}

