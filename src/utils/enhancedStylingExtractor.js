/**
 * Enhanced Styling Extractor
 * Extracts granular styling specifications including:
 * - Font sizes for all element types (name, titles, subtitles, company, role, dates, body, contact)
 * - Font weights (bold, italic, normal) for each element
 * - Font families
 * - URLs and link formatting
 * - Bullet point styles and details
 * - Text transforms
 */

/**
 * Extract enhanced styling specifications from PDF text items
 * @param {Array} textItems - Array of text items with font information
 * @param {Object} structuredContent - Parsed structured content
 * @returns {Object} Enhanced styling specifications
 */
export function extractEnhancedStyling(textItems, structuredContent) {
  if (!textItems || textItems.length === 0) {
    return getDefaultEnhancedSpecs()
  }

  // Analyze font properties from text items
  const fontAnalysis = analyzeFontProperties(textItems, structuredContent)
  
  // Extract URLs and link formatting
  const linkAnalysis = extractLinkFormatting(textItems, structuredContent)
  
  // Enhanced bullet point analysis
  const bulletAnalysis = analyzeBulletPoints(textItems, structuredContent)
  
  // Analyze text transforms
  const transformAnalysis = analyzeTextTransforms(textItems, structuredContent)

  return {
    fonts: fontAnalysis,
    links: linkAnalysis,
    bullets: bulletAnalysis,
    transforms: transformAnalysis
  }
}

/**
 * Analyze font properties for all element types
 */
function analyzeFontProperties(textItems, structuredContent) {
  // Group text items by context to identify element types
  const elementGroups = categorizeTextElements(textItems, structuredContent)
  
  const fonts = {
    name: extractFontSpec(elementGroups.name, 'bold'),
    sectionTitle: extractFontSpec(elementGroups.sectionTitle, 'bold'),
    subtitle: extractFontSpec(elementGroups.subtitle, 'normal'),
    companyName: extractFontSpec(elementGroups.companyName, 'bold'),
    roleTitle: extractFontSpec(elementGroups.roleTitle, 'bold'),
    date: extractFontSpec(elementGroups.date, 'normal'),
    body: extractFontSpec(elementGroups.body, 'normal'),
    bulletText: extractFontSpec(elementGroups.bulletText, 'normal'),
    contact: extractFontSpec(elementGroups.contact, 'normal'),
    skills: extractFontSpec(elementGroups.skills, 'normal'),
    education: extractFontSpec(elementGroups.education, 'normal')
  }

  return fonts
}

/**
 * Categorize text items into element types based on position, size, and context
 */
function categorizeTextElements(textItems, structuredContent) {
  const groups = {
    name: [],
    sectionTitle: [],
    subtitle: [],
    companyName: [],
    roleTitle: [],
    date: [],
    body: [],
    bulletText: [],
    contact: [],
    skills: [],
    education: []
  }

  // Sort by Y position (top to bottom)
  const sortedItems = [...textItems].sort((a, b) => b.y - a.y)
  
  // Get unique font sizes to identify hierarchy
  const fontSizes = [...new Set(textItems.map(item => item.fontSize))].sort((a, b) => b - a)
  const largestSize = fontSizes[0] || 16
  const secondLargest = fontSizes[1] || largestSize * 0.7
  const thirdLargest = fontSizes[2] || largestSize * 0.6
  const smallestSize = fontSizes[fontSizes.length - 1] || 10

  // Analyze each text item
  sortedItems.forEach((item, index) => {
    const text = item.text.trim()
    const fontSize = item.fontSize
    const fontName = item.fontName || ''
    const isBold = isFontBold(fontName)
    const isItalic = isFontItalic(fontName)
    
    // Identify element type based on patterns
    if (index < 3 && fontSize >= largestSize * 0.8) {
      // First few lines with large font = name
      groups.name.push({ ...item, isBold, isItalic })
    } else if (isSectionTitle(text)) {
      // Section titles (WORK EXPERIENCE, SKILLS, etc.)
      groups.sectionTitle.push({ ...item, isBold, isItalic })
    } else if (fontSize >= secondLargest * 0.9 && isBold && !isDate(text)) {
      // Large bold text that's not a date = likely company name or role
      if (isCompanyName(text, index, sortedItems)) {
        groups.companyName.push({ ...item, isBold, isItalic })
      } else {
        groups.roleTitle.push({ ...item, isBold, isItalic })
      }
    } else if (isDate(text)) {
      // Dates
      groups.date.push({ ...item, isBold, isItalic })
    } else if (text.startsWith('•') || text.startsWith('-') || text.startsWith('*')) {
      // Bullet points
      groups.bulletText.push({ ...item, isBold, isItalic })
    } else if (fontSize <= smallestSize * 1.2 && index < 5) {
      // Small text in header area = contact info
      groups.contact.push({ ...item, isBold, isItalic })
    } else if (isSkillsSection(text, index, sortedItems)) {
      // Skills section
      groups.skills.push({ ...item, isBold, isItalic })
    } else if (isEducationSection(text, index, sortedItems)) {
      // Education section
      groups.education.push({ ...item, isBold, isItalic })
    } else {
      // Default to body text
      groups.body.push({ ...item, isBold, isItalic })
    }
  })

  return groups
}

/**
 * Extract font specification for an element group
 */
function extractFontSpec(items, defaultWeight) {
  if (!items || items.length === 0) {
    return {
      family: 'Helvetica',
      size: 11,
      weight: defaultWeight,
      style: 'normal'
    }
  }

  // Get most common font size
  const sizes = items.map(item => item.fontSize)
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length
  
  // Get most common font family
  const families = items.map(item => extractFontFamily(item.fontName))
  const mostCommonFamily = getMostCommon(families) || 'Helvetica'
  
  // Determine weight (bold if majority are bold)
  const boldCount = items.filter(item => item.isBold).length
  const weight = boldCount > items.length / 2 ? 'bold' : defaultWeight
  
  // Determine style (italic if majority are italic)
  const italicCount = items.filter(item => item.isItalic).length
  const style = italicCount > items.length / 2 ? 'italic' : 'normal'

  return {
    family: mostCommonFamily,
    size: Math.round(avgSize),
    weight: weight,
    style: style
  }
}

/**
 * Check if font name indicates bold
 */
function isFontBold(fontName) {
  if (!fontName) return false
  const lower = fontName.toLowerCase()
  return lower.includes('bold') || lower.includes('black') || lower.includes('heavy')
}

/**
 * Check if font name indicates italic
 */
function isFontItalic(fontName) {
  if (!fontName) return false
  const lower = fontName.toLowerCase()
  return lower.includes('italic') || lower.includes('oblique')
}

/**
 * Extract font family from font name
 */
function extractFontFamily(fontName) {
  if (!fontName) return 'Helvetica'
  
  // Common font families
  const families = ['Helvetica', 'Arial', 'Times', 'Courier', 'Calibri', 'Garamond', 'Georgia']
  for (const family of families) {
    if (fontName.toLowerCase().includes(family.toLowerCase())) {
      return family
    }
  }
  
  // Extract base name (remove Bold, Italic, etc.)
  const base = fontName.split('-')[0].split(' ')[0]
  return base || 'Helvetica'
}

/**
 * Check if text is a section title
 */
function isSectionTitle(text) {
  const sectionPatterns = [
    /^(work\s+experience|experience|employment)$/i,
    /^(skills|technical\s+skills)$/i,
    /^(education|academic)$/i,
    /^(personal\s+statement|summary|about)$/i,
    /^(projects|certifications|awards)$/i
  ]
  return sectionPatterns.some(pattern => pattern.test(text))
}

/**
 * Check if text is a date
 */
function isDate(text) {
  const datePatterns = [
    /\d{4}\s*[-–]\s*\d{4}/, // 2020 - 2024
    /\d{4}\s*[-–]\s*Present/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/i,
    /\d{1,2}\/\d{4}/
  ]
  return datePatterns.some(pattern => pattern.test(text))
}

/**
 * Check if text is a company name
 */
function isCompanyName(text, index, allItems) {
  // Company names are usually:
  // - Bold
  // - On their own line or followed by a role
  // - Not dates, not section titles
  if (isDate(text) || isSectionTitle(text)) return false
  
  // Check if next item might be a role title
  if (index < allItems.length - 1) {
    const nextItem = allItems[index + 1]
    const nextText = nextItem.text.trim()
    // If next item looks like a role (contains common role words), this might be company
    if (/engineer|manager|director|analyst|developer|designer/i.test(nextText)) {
      return true
    }
  }
  
  return false
}

/**
 * Check if text is in skills section
 */
function isSkillsSection(text, index, allItems) {
  // Look backwards for "SKILLS" section title
  for (let i = index - 1; i >= Math.max(0, index - 10); i--) {
    if (isSectionTitle(allItems[i].text) && /skill/i.test(allItems[i].text)) {
      return true
    }
  }
  return false
}

/**
 * Check if text is in education section
 */
function isEducationSection(text, index, allItems) {
  // Look backwards for "EDUCATION" section title
  for (let i = index - 1; i >= Math.max(0, index - 10); i--) {
    if (isSectionTitle(allItems[i].text) && /education|academic/i.test(allItems[i].text)) {
      return true
    }
  }
  return false
}

/**
 * Extract link formatting and URLs
 */
function extractLinkFormatting(textItems, structuredContent) {
  const links = []
  const linkPattern = /https?:\/\/[^\s]+|www\.[^\s]+/gi
  
  textItems.forEach(item => {
    const matches = item.text.match(linkPattern)
    if (matches) {
      matches.forEach(url => {
        links.push({
          url: url,
          text: item.text,
          fontSize: item.fontSize,
          fontName: item.fontName,
          isBold: isFontBold(item.fontName),
          isItalic: isFontItalic(item.fontName),
          color: null, // Would need visual analysis for color
          isClickable: true // Assume links are clickable in PDF
        })
      })
    }
  })

  return {
    links: links,
    defaultFormatting: {
      color: '#0000EE', // Default link blue
      underline: true,
      isClickable: true
    }
  }
}

/**
 * Enhanced bullet point analysis
 */
function analyzeBulletPoints(textItems, structuredContent) {
  const bullets = []
  
  textItems.forEach(item => {
    const text = item.text.trim()
    const bulletMatch = text.match(/^([•\-\*▪▫◦‣⁃]|\d+[\.\)])\s*(.+)/)
    
    if (bulletMatch) {
      bullets.push({
        character: bulletMatch[1],
        text: bulletMatch[2],
        fontSize: item.fontSize,
        fontName: item.fontName,
        isBold: isFontBold(item.fontName),
        isItalic: isFontItalic(item.fontName),
        indentation: item.x
      })
    }
  })

  // Get most common bullet character
  const bulletChars = bullets.map(b => b.character)
  const mostCommonBullet = getMostCommon(bulletChars) || '•'
  
  // Calculate average indentation
  const indentations = bullets.map(b => b.indentation)
  const avgIndentation = indentations.length > 0
    ? indentations.reduce((a, b) => a + b, 0) / indentations.length
    : 10

  return {
    style: mostCommonBullet,
    indentation: Math.round(avgIndentation),
    lineSpacing: 1.5,
    characterSpacing: 0,
    details: bullets
  }
}

/**
 * Analyze text transforms (uppercase, lowercase, capitalize)
 */
function analyzeTextTransforms(textItems, structuredContent) {
  const transforms = {
    sectionTitle: 'none',
    name: 'none',
    companyName: 'none',
    roleTitle: 'none'
  }

  // Check section titles
  const sectionTitleItems = textItems.filter(item => isSectionTitle(item.text))
  if (sectionTitleItems.length > 0) {
    const firstTitle = sectionTitleItems[0].text
    if (firstTitle === firstTitle.toUpperCase() && firstTitle.length > 3) {
      transforms.sectionTitle = 'uppercase'
    } else if (firstTitle === firstTitle.toLowerCase()) {
      transforms.sectionTitle = 'lowercase'
    } else if (firstTitle === firstTitle.charAt(0).toUpperCase() + firstTitle.slice(1).toLowerCase()) {
      transforms.sectionTitle = 'capitalize'
    }
  }

  return transforms
}

/**
 * Get most common value in array
 */
function getMostCommon(arr) {
  if (!arr || arr.length === 0) return null
  
  const counts = {}
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1
  })
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
}

/**
 * Get default enhanced specs
 */
function getDefaultEnhancedSpecs() {
  return {
    fonts: {
      name: { family: 'Helvetica', size: 24, weight: 'bold', style: 'normal' },
      sectionTitle: { family: 'Helvetica', size: 14, weight: 'bold', style: 'normal' },
      subtitle: { family: 'Helvetica', size: 12, weight: 'normal', style: 'normal' },
      companyName: { family: 'Helvetica', size: 12, weight: 'bold', style: 'normal' },
      roleTitle: { family: 'Helvetica', size: 11, weight: 'bold', style: 'normal' },
      date: { family: 'Helvetica', size: 10, weight: 'normal', style: 'normal' },
      body: { family: 'Helvetica', size: 11, weight: 'normal', style: 'normal' },
      bulletText: { family: 'Helvetica', size: 11, weight: 'normal', style: 'normal' },
      contact: { family: 'Helvetica', size: 10, weight: 'normal', style: 'normal' },
      skills: { family: 'Helvetica', size: 11, weight: 'normal', style: 'normal' },
      education: { family: 'Helvetica', size: 11, weight: 'normal', style: 'normal' }
    },
    links: {
      links: [],
      defaultFormatting: {
        color: '#0000EE',
        underline: true,
        isClickable: true
      }
    },
    bullets: {
      style: '•',
      indentation: 10,
      lineSpacing: 1.5,
      characterSpacing: 0,
      details: []
    },
    transforms: {
      sectionTitle: 'uppercase',
      name: 'none',
      companyName: 'none',
      roleTitle: 'none'
    }
  }
}

