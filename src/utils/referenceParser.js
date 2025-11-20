/**
 * Reference Resume Parser
 * Extracts structure and content from a reference resume text
 */

/**
 * Parse reference resume text to identify sections and structure
 * @param {string} resumeText - The raw resume text
 * @returns {Object} Parsed resume structure
 */
export function parseReferenceResume(resumeText) {
  if (!resumeText || !resumeText.trim()) {
    return { error: 'Resume text is empty' }
  }

  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line)
  
  // Identify sections by common patterns
  const sections = {
    header: null,
    personalStatement: null,
    workExperience: null,
    skills: null,
    education: null,
    other: []
  }

  // Common section title patterns
  const sectionPatterns = {
    personalStatement: /^(personal\s+statement|summary|professional\s+summary|about|profile)$/i,
    workExperience: /^(work\s+experience|experience|employment|professional\s+experience|career\s+history)$/i,
    skills: /^(skills|technical\s+skills|core\s+competencies|competencies)$/i,
    education: /^(education|academic\s+background|qualifications)$/i
  }

  let currentSection = null
  let sectionContent = []
  let headerLines = []

  // Extract header (first few lines typically contain name and contact)
  let headerEndIndex = 0
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i]
    // Check if this looks like a section header (all caps, short, no special chars)
    if (line.length < 50 && /^[A-Z\s\-]+$/.test(line) && line.length > 3) {
      // Might be a section header, stop collecting header
      break
    }
    headerLines.push(line)
    headerEndIndex = i
  }

  sections.header = headerLines.join('\n')

  // Parse remaining sections
  for (let i = headerEndIndex + 1; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if this is a section header
    let isSectionHeader = false
    for (const [sectionKey, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) {
        // Save previous section content
        if (currentSection && sectionContent.length > 0) {
          sections[currentSection] = sectionContent.join('\n')
        }
        // Start new section
        currentSection = sectionKey
        sectionContent = []
        isSectionHeader = true
        break
      }
    }

    if (!isSectionHeader) {
      if (currentSection) {
        sectionContent.push(line)
      } else {
        // Unidentified section
        sections.other.push(line)
      }
    }
  }

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    sections[currentSection] = sectionContent.join('\n')
  }

  // Extract contact information from header
  const contactInfo = extractContactInfo(sections.header)

  return {
    success: true,
    sections,
    contactInfo,
    rawText: resumeText,
    lineCount: lines.length
  }
}

/**
 * Extract contact information from header text
 * @param {string} headerText - Header section text
 * @returns {Object} Extracted contact information
 */
function extractContactInfo(headerText) {
  if (!headerText) return {}

  const contact = {
    name: null,
    email: null,
    phone: null,
    location: null,
    website: null
  }

  const lines = headerText.split('\n').map(l => l.trim()).filter(l => l)
  
  // First line is usually the name
  if (lines.length > 0) {
    contact.name = lines[0]
  }

  // Extract email
  const emailMatch = headerText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  if (emailMatch) {
    contact.email = emailMatch[0]
  }

  // Extract phone (various formats)
  const phonePatterns = [
    /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\+?\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/
  ]
  for (const pattern of phonePatterns) {
    const match = headerText.match(pattern)
    if (match) {
      contact.phone = match[0]
      break
    }
  }

  // Extract website/URL
  const urlMatch = headerText.match(/https?:\/\/[^\s]+|www\.[^\s]+/i)
  if (urlMatch) {
    contact.website = urlMatch[0]
  }

  // Extract location (usually after contact info, common patterns)
  const locationPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*[A-Z]{2}/, // City, State
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+)/, // City, Country
  ]
  for (const pattern of locationPatterns) {
    const match = headerText.match(pattern)
    if (match) {
      contact.location = match[0]
      break
    }
  }

  return contact
}

/**
 * Identify section titles from the resume
 * @param {string} resumeText - The raw resume text
 * @returns {Array} Array of section titles found
 */
export function extractSectionTitles(resumeText) {
  const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l)
  const sectionTitles = []

  const sectionPatterns = [
    /^(personal\s+statement|summary|professional\s+summary|about|profile)$/i,
    /^(work\s+experience|experience|employment|professional\s+experience|career\s+history)$/i,
    /^(skills|technical\s+skills|core\s+competencies|competencies)$/i,
    /^(education|academic\s+background|qualifications)$/i
  ]

  for (const line of lines) {
    for (const pattern of sectionPatterns) {
      if (pattern.test(line)) {
        sectionTitles.push(line)
        break
      }
    }
  }

  return sectionTitles
}

