/**
 * Content Parser
 * Parses new resume text content and extracts structured data
 */

/**
 * Parse new resume content text into structured format
 * @param {string} resumeText - Raw resume text
 * @returns {Object} Parsed resume content
 */
export function parseResumeContent(resumeText) {
  if (!resumeText || !resumeText.trim()) {
    return { error: 'Resume text is empty' }
  }

  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line)
  
  // Extract contact information (usually first few lines)
  const contactInfo = extractContactInfo(lines)
  
  // Identify and extract sections
  const sections = extractSections(lines)
  
  // Extract work experience
  const workExperience = extractWorkExperience(sections.workExperience || [])
  
  // Extract education
  const education = extractEducation(sections.education || [])
  
  // Extract skills
  const skills = extractSkills(sections.skills || [])

  return {
    success: true,
    contactInfo,
    personalStatement: sections.personalStatement || null,
    workExperience,
    skills,
    education,
    otherSections: sections.other || [],
    rawText: resumeText
  }
}

/**
 * Extract contact information from header lines
 */
function extractContactInfo(lines) {
  const contact = {
    name: null,
    email: null,
    phone: null,
    location: null,
    website: null
  }

  // First line is usually the name
  if (lines.length > 0) {
    contact.name = lines[0]
  }

  // Check next few lines for contact info
  const headerLines = lines.slice(0, 5).join(' ')
  
  // Extract email
  const emailMatch = headerLines.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
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
    const match = headerLines.match(pattern)
    if (match) {
      contact.phone = match[0]
      break
    }
  }

  // Extract website/URL
  const urlMatch = headerLines.match(/https?:\/\/[^\s]+|www\.[^\s]+/i)
  if (urlMatch) {
    contact.website = urlMatch[0]
  }

  // Extract location
  const locationPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*[A-Z]{2}/, // City, State
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+)/, // City, Country
  ]
  for (const pattern of locationPatterns) {
    const match = headerLines.match(pattern)
    if (match) {
      contact.location = match[0]
      break
    }
  }

  return contact
}

/**
 * Extract sections from resume text
 */
function extractSections(lines) {
  const sections = {
    personalStatement: null,
    workExperience: [],
    skills: null,
    education: [],
    other: []
  }

  const sectionPatterns = {
    personalStatement: /^(personal\s+statement|summary|professional\s+summary|about|profile|objective)$/i,
    workExperience: /^(work\s+experience|experience|employment|professional\s+experience|career\s+history)$/i,
    skills: /^(skills|technical\s+skills|core\s+competencies|competencies|key\s+skills)$/i,
    education: /^(education|academic\s+background|qualifications)$/i
  }

  let currentSection = null
  let sectionContent = []
  let headerEndIndex = 0

  // Skip header (first few lines)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i]
    if (line.length < 50 && /^[A-Z\s\-]+$/.test(line) && line.length > 3) {
      // Might be a section header
      break
    }
    headerEndIndex = i
  }

  // Parse remaining sections
  for (let i = headerEndIndex + 1; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if this is a section header
    let isSectionHeader = false
    for (const [sectionKey, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) {
        // Save previous section content
        if (currentSection && sectionContent.length > 0) {
          if (currentSection === 'workExperience' || currentSection === 'education') {
            sections[currentSection].push(sectionContent.join('\n'))
          } else {
            sections[currentSection] = sectionContent.join('\n')
          }
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
    if (currentSection === 'workExperience' || currentSection === 'education') {
      sections[currentSection].push(sectionContent.join('\n'))
    } else {
      sections[currentSection] = sectionContent.join('\n')
    }
  }

  return sections
}

/**
 * Extract work experience entries
 */
function extractWorkExperience(workExpSections) {
  if (!workExpSections || workExpSections.length === 0) {
    return []
  }

  const experiences = []

  workExpSections.forEach(section => {
    // Split by double newlines or patterns that indicate new job
    const entries = section.split(/\n\n+/).filter(entry => entry.trim())
    
    entries.forEach(entry => {
      const lines = entry.split('\n').filter(line => line.trim())
      if (lines.length === 0) return

      // First line is usually job title or company
      const firstLine = lines[0]
      
      // Try to parse: "Job Title | Company | Date" or "Job Title\nCompany\nDate"
      let title = ''
      let company = ''
      let date = ''
      let bullets = []

      // Check if first line has pipe separators
      if (firstLine.includes('|')) {
        const parts = firstLine.split('|').map(p => p.trim())
        title = parts[0] || ''
        company = parts[1] || ''
        date = parts[2] || ''
        bullets = lines.slice(1)
      } else {
        // Multi-line format
        title = firstLine
        if (lines.length > 1) {
          const secondLine = lines[1]
          // Check if second line is a date
          if (isDate(secondLine)) {
            date = secondLine
            company = ''
            bullets = lines.slice(2)
          } else {
            company = secondLine
            if (lines.length > 2 && isDate(lines[2])) {
              date = lines[2]
              bullets = lines.slice(3)
            } else {
              bullets = lines.slice(2)
            }
          }
        }
      }

      // Extract bullets (lines starting with •, -, *, or numbers)
      const extractedBullets = bullets
        .filter(line => /^[•\-\*▪▫◦‣⁃]|\d+[\.\)]/.test(line.trim()))
        .map(line => line.replace(/^[•\-\*▪▫◦‣⁃\d+\.\)]\s*/, '').trim())

      if (title || company) {
        experiences.push({
          title: title,
          company: company,
          date: date,
          bullets: extractedBullets.length > 0 ? extractedBullets : bullets
        })
      }
    })
  })

  return experiences
}

/**
 * Extract education entries
 */
function extractEducation(educationSections) {
  if (!educationSections || educationSections.length === 0) {
    return []
  }

  const educations = []

  educationSections.forEach(section => {
    const entries = section.split(/\n\n+/).filter(entry => entry.trim())
    
    entries.forEach(entry => {
      const lines = entry.split('\n').filter(line => line.trim())
      if (lines.length === 0) return

      const degree = lines[0]
      const school = lines.length > 1 ? lines.slice(1).join('\n') : ''
      
      // Extract date if present
      const dateMatch = entry.match(/\d{4}\s*[-–]\s*\d{4}|\d{4}\s*[-–]\s*Present/i)
      const date = dateMatch ? dateMatch[0] : ''

      educations.push({
        degree: degree,
        school: school,
        date: date
      })
    })
  })

  return educations
}

/**
 * Extract skills
 */
function extractSkills(skillsSection) {
  if (!skillsSection) {
    return ''
  }

  // Skills can be comma-separated, line-separated, or bulleted
  const skillsText = Array.isArray(skillsSection) 
    ? skillsSection.join('\n') 
    : skillsSection

  // Remove bullet points if present
  const cleaned = skillsText
    .split('\n')
    .map(line => line.replace(/^[•\-\*▪▫◦‣⁃]\s*/, '').trim())
    .filter(line => line)
    .join(', ')

  return cleaned
}

/**
 * Check if text is a date
 */
function isDate(text) {
  const datePatterns = [
    /\d{4}\s*[-–]\s*\d{4}/,
    /\d{4}\s*[-–]\s*Present/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/i,
    /\d{1,2}\/\d{4}/
  ]
  return datePatterns.some(pattern => pattern.test(text))
}

