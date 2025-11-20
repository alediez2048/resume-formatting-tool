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
  try {
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
  } catch (error) {
    console.error('Error in parseResumeContent:', error)
    return {
      error: `Failed to parse resume content: ${error.message || 'Unknown error'}`,
      success: false
    }
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
    personalStatement: /^(personal\s+statement|summary|professional\s+summary|about|profile|objective|professional\s+summary|executive\s+summary)$/i,
    workExperience: /^(work\s+experience|experience|employment|professional\s+experience|career\s+history|professional\s+experience)$/i,
    skills: /^(skills|technical\s+skills|core\s+competencies|competencies|key\s+skills|core\s+skills|technical\s+proficiencies|core\s+skills)$/i,
    education: /^(education|academic\s+background|qualifications|academic)$/i
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
    
    // Skip divider lines (e.g., "⸻", "---", "___")
    if (/^[⸻\-_=]+$/.test(line)) {
      continue
    }
    
    // Check if this is a section header
    let isSectionHeader = false
    for (const [sectionKey, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) {
        // Save previous section content
        if (currentSection && sectionContent.length > 0) {
          if (currentSection === 'workExperience' || currentSection === 'education') {
            sections[currentSection].push(sectionContent.join('\n'))
          } else {
            sections[currentSection] = sectionContent.join('\n').trim()
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
        // Check if this might be personal statement content before any section header
        // (e.g., content right after contact info)
        // Check if line is NOT a section header by testing against patterns
        const isNotASectionHeader = !Object.values(sectionPatterns).some(pattern => pattern.test(line))
        if (i < headerEndIndex + 10 && line.length > 20 && isNotASectionHeader) {
          // This might be personal statement content
          if (!sections.personalStatement) {
            sections.personalStatement = line
          } else {
            sections.personalStatement += ' ' + line
          }
        } else {
          // Unidentified section
          sections.other.push(line)
        }
      }
    }
  }

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    if (currentSection === 'workExperience' || currentSection === 'education') {
      sections[currentSection].push(sectionContent.join('\n'))
    } else {
      sections[currentSection] = sectionContent.join('\n').trim()
    }
  }

  // Clean up personal statement - remove if it's empty or just whitespace
  if (sections.personalStatement && sections.personalStatement.trim().length === 0) {
    sections.personalStatement = null
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
    // Split section into lines
    const allLines = section.split('\n').map(line => line.trim()).filter(line => line)
    
    let currentExp = null
    let currentBullets = []
    let i = 0

    while (i < allLines.length) {
      const line = allLines[i]
      
      // Check if this line is a bullet point
      const isBullet = /^[•\-\*▪▫◦‣⁃\t]|\d+[\.\)]/.test(line)
      
      // Check if this line looks like a company name
      // Company names are usually:
      // - Short to medium length (less than 80 chars)
      // - Not starting with bullet points, tabs, or special chars
      // - Not containing "|" (which would be a different format)
      // - Not a date
      // - Not a section header
      // - Followed by lines that look like job title, then location/date
      const isLikelyCompany = line.length < 80 && 
                             !line.startsWith('•') && 
                             !line.startsWith('-') &&
                             !line.startsWith('\t') &&
                             !line.includes('|') &&
                             !isDate(line) &&
                             !isSectionHeader(line) &&
                             i + 1 < allLines.length &&
                             !allLines[i + 1].startsWith('•') &&
                             !allLines[i + 1].startsWith('-') &&
                             !allLines[i + 1].startsWith('\t')

      // Additional check: if next 2-3 lines follow pattern: company -> title -> location/date -> bullets
      // This is a strong indicator of a new company entry
      let looksLikeNewCompany = false
      if (isLikelyCompany && i + 2 < allLines.length) {
        const nextLine = allLines[i + 1]
        const lineAfterNext = allLines[i + 2]
        // Pattern: company name, then title (usually longer), then location/date (contains · or emoji or date)
        const hasTitlePattern = nextLine.length > line.length && 
                               !isDate(nextLine) && 
                               !nextLine.startsWith('•') &&
                               !nextLine.startsWith('-') &&
                               !nextLine.startsWith('\t')
        const hasLocationDatePattern = /[📍·•]|Remote|On-site|Hybrid|\d{4}\s*[-–]/.test(lineAfterNext) ||
                                       isDate(lineAfterNext)
        looksLikeNewCompany = hasTitlePattern && hasLocationDatePattern
      }

      // Also check if we're currently processing bullets and hit a new company
      // This handles the case where we're in the middle of one company's bullets
      // and encounter a new company name
      let isNewCompanyAfterBullets = false
      if (currentExp && currentBullets.length > 0 && isLikelyCompany && i + 2 < allLines.length) {
        const nextLine = allLines[i + 1]
        const lineAfterNext = allLines[i + 2]
        // If we see company -> title -> date pattern, it's definitely a new company
        const hasTitle = nextLine.length > line.length && 
                        !isDate(nextLine) && 
                        !nextLine.startsWith('•') &&
                        !nextLine.startsWith('-')
        const hasDate = /[📍·•]|Remote|On-site|Hybrid|\d{4}\s*[-–]/.test(lineAfterNext) ||
                       isDate(lineAfterNext)
        isNewCompanyAfterBullets = hasTitle && hasDate
      }

      if ((isLikelyCompany && (looksLikeNewCompany || isNewCompanyAfterBullets)) || (isLikelyCompany && currentExp === null)) {
        // Save previous experience if exists
        if (currentExp) {
          currentExp.bullets = currentBullets
          experiences.push(currentExp)
        }

        // Start new experience
        const company = line
        let title = ''
        let date = ''
        let location = ''

        // Next line is likely job title
        if (i + 1 < allLines.length) {
          const nextLine = allLines[i + 1]
          if (!nextLine.startsWith('•') && 
              !nextLine.startsWith('-') && 
              !nextLine.startsWith('\t') &&
              !isDate(nextLine) &&
              !isSectionHeader(nextLine)) {
            title = nextLine
            i++
          }
        }

        // Next line might be location and date
        if (i + 1 < allLines.length) {
          const nextLine = allLines[i + 1]
          // Check if it contains date pattern or location markers
          if (isDate(nextLine) || nextLine.includes('📍') || nextLine.includes('·') || /Remote|On-site|Hybrid/.test(nextLine)) {
            // Extract date from line
            const dateMatch = nextLine.match(/\d{4}\s*[-–]\s*\d{4}|\d{4}\s*[-–]\s*Present/i)
            if (dateMatch) {
              date = dateMatch[0]
            }
            
            // Extract location - look for city names or common location terms
            // Remove emojis and date first
            let locationText = nextLine.replace(/[📍·]/g, '').replace(/\d{4}\s*[-–]\s*\d{4}|\d{4}\s*[-–]\s*Present/i, '').trim()
            
            // Check for common location patterns
            if (/Remote|On-site|Hybrid/i.test(locationText)) {
              location = locationText.match(/(Remote|On-site|Hybrid)/i)[0]
            } else {
              // Try to extract city, state pattern
              const cityStateMatch = locationText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*[A-Z]{2}/)
              if (cityStateMatch) {
                location = cityStateMatch[0]
              } else {
                // Just use the text before the date
                location = locationText.split(/\d{4}/)[0].trim()
              }
            }
            
            i++
          }
        }

        currentExp = {
          company: company,
          title: title,
          date: date,
          location: location,
          bullets: []
        }
        currentBullets = []
      } else if (isBullet && currentExp) {
        // This is a bullet point for current experience
        const bulletText = line.replace(/^[•\-\*▪▫◦‣⁃\d+\.\)]\s*/, '').trim()
        if (bulletText) {
          currentBullets.push(bulletText)
        }
      } else if (currentExp && !isBullet && line.length > 0) {
        // Might be continuation of title or additional info
        // If current title is empty, this might be the title
        if (!currentExp.title) {
          currentExp.title = line
        }
      }

      i++
    }

    // Save last experience
    if (currentExp) {
      currentExp.bullets = currentBullets
      experiences.push(currentExp)
    }

    // Fallback: If no experiences found with new logic, try old logic
    if (experiences.length === 0) {
      const entries = section.split(/\n\n+/).filter(entry => entry.trim())
      
      entries.forEach(entry => {
        const lines = entry.split('\n').filter(line => line.trim())
        if (lines.length === 0) return

        const firstLine = lines[0]
        let title = ''
        let company = ''
        let date = ''
        let bullets = []

        if (firstLine.includes('|')) {
          const parts = firstLine.split('|').map(p => p.trim())
          title = parts[0] || ''
          company = parts[1] || ''
          date = parts[2] || ''
          bullets = lines.slice(1)
        } else {
          title = firstLine
          if (lines.length > 1) {
            const secondLine = lines[1]
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
    }
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
    const allLines = section.split('\n').map(line => line.trim()).filter(line => line)
    
    let i = 0
    while (i < allLines.length) {
      const line = allLines[i]
      
      // Skip if it's a section header or divider
      if (isSectionHeader(line) || /^[⸻\-_=]+$/.test(line)) {
        i++
        continue
      }
      
      // Define patterns to distinguish degrees from certificates
      const degreePattern = /B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|Ph\.?D\.?|Bachelor|Master|Doctorate|Associate|B\.?Sc\.?|B\.?Eng\.?|B\.?Comm\.?/i
      const certificatePattern = /Certificate|Certification|Diploma|Bootcamp|Immersive|Program|Course|Training/i
      
      // Check if this line is a certificate (standalone, no school)
      const isStandaloneCertificate = certificatePattern.test(line) && !/University|College|School|Institute|Academy/i.test(line)
      
      // Check if this line looks like a school name (usually capitalized, might be university/college)
      const isLikelySchool = /University|College|School|Institute|Academy/i.test(line) ||
                            (line.length > 5 && line.length < 60 && 
                             !line.startsWith('•') && 
                             !line.startsWith('-') &&
                             !isDate(line) &&
                             !line.includes('·') &&
                             !certificatePattern.test(line) && // Not a certificate
                             i + 1 < allLines.length)
      
      if (isStandaloneCertificate) {
        // This is a standalone certificate (e.g., "General Assembly · Web Development Immersive Certificate")
        let certificate = line
        let date = ''
        
        // Extract date if present
        const dateMatch = line.match(/\d{4}\s*[-–]\s*\d{4}|\d{4}\s*[-–]\s*Present/i)
        if (dateMatch) {
          date = dateMatch[0]
          certificate = line.replace(dateMatch[0], '').trim()
        }
        
        educations.push({
          school: '', // No school for standalone certificates
          degree: '', // No degree for certificates
          date: date,
          gpa: '',
          certificate: certificate
        })
      } else if (isLikelySchool) {
        // This is a school, next lines should be degree(s) and possibly certificate
        const school = line
        let degree = ''
        let date = ''
        let gpa = ''
        let certificate = ''
        
        // Next line(s) might be degree(s) and date
        if (i + 1 < allLines.length) {
          const nextLine = allLines[i + 1]
          
          // Check if it's a certificate (certificates come after degrees or standalone)
          if (certificatePattern.test(nextLine) && !degreePattern.test(nextLine)) {
            // This is a certificate line, not a degree
            certificate = nextLine
            i++
            
            // Check for date in certificate line or next line
            const dateMatch = nextLine.match(/\d{4}\s*[-–]\s*\d{4}|\d{4}\s*[-–]\s*Present/i)
            if (dateMatch) {
              date = dateMatch[0]
            } else if (i + 1 < allLines.length && isDate(allLines[i + 1])) {
              date = allLines[i + 1]
              i++
            }
          }
          // Check if it contains degree information (NOT certificate)
          else if (degreePattern.test(nextLine) && !certificatePattern.test(nextLine)) {
            degree = nextLine
            
            // Extract GPA if present (e.g., "3.8 GPA" or "GPA: 3.8")
            const gpaMatch = nextLine.match(/(\d+\.?\d*)\s*GPA|GPA[:\s]+(\d+\.?\d*)/i)
            if (gpaMatch) {
              gpa = gpaMatch[1] || gpaMatch[2]
            }
            
            // Extract date if present in the same line
            const dateMatch = nextLine.match(/\d{4}\s*[-–]\s*\d{4}|\d{4}\s*[-–]\s*Present/i)
            if (dateMatch) {
              date = dateMatch[0]
            }
            
            i++
            
            // Check if there's another line (could be certificate or date)
            if (i + 1 < allLines.length) {
              const lineAfter = allLines[i + 1]
              // Check if it's a certificate (certificates often come after degrees)
              if (certificatePattern.test(lineAfter) && !degreePattern.test(lineAfter)) {
                certificate = lineAfter
                i++
              } else if (isDate(lineAfter) && !date) {
                date = lineAfter
                i++
              }
            }
          } else if (isDate(nextLine)) {
            // If next line is just a date
            date = nextLine
            i++
          } else if (!certificatePattern.test(nextLine)) {
            // Might be degree on same line or next line (but not a certificate)
            degree = nextLine
            i++
          }
        }
        
        educations.push({
          school: school,
          degree: degree,
          date: date,
          gpa: gpa,
          certificate: certificate || null
        })
      } else {
        // Might be a standalone degree without school name
        // Check if it contains degree keywords (but NOT certificate keywords)
        if (degreePattern.test(line) && !certificatePattern.test(line)) {
          let degree = line
          let date = ''
          let gpa = ''
          
          // Extract date and GPA
          const dateMatch = line.match(/\d{4}\s*[-–]\s*\d{4}|\d{4}\s*[-–]\s*Present/i)
          if (dateMatch) {
            date = dateMatch[0]
          }
          
          const gpaMatch = line.match(/(\d+\.?\d*)\s*GPA|GPA[:\s]+(\d+\.?\d*)/i)
          if (gpaMatch) {
            gpa = gpaMatch[1] || gpaMatch[2]
          }
          
          educations.push({
            school: '',
            degree: degree,
            date: date,
            gpa: gpa,
            certificate: null
          })
        }
      }
      
      i++
    }
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

  // Skills can be comma-separated, line-separated, bulleted, or categorized
  const skillsText = Array.isArray(skillsSection) 
    ? skillsSection.join('\n') 
    : skillsSection

  const allLines = skillsText.split('\n').map(line => line.trim()).filter(line => line)
  
  // Check if skills are categorized (e.g., "LLM & AI Tools: OpenAI API, Gemini...")
  const hasCategories = allLines.some(line => /:\s*[A-Z]/.test(line))
  
  if (hasCategories) {
    // Handle categorized skills
    const categorizedSkills = {}
    let currentCategory = 'General'
    
    allLines.forEach(line => {
      // Check if line is a category header (ends with colon)
      if (/:\s*$/.test(line) || /:\s*[A-Z]/.test(line)) {
        const colonIndex = line.indexOf(':')
        if (colonIndex > 0) {
          currentCategory = line.substring(0, colonIndex).trim()
          const skillsAfterColon = line.substring(colonIndex + 1).trim()
          if (skillsAfterColon) {
            categorizedSkills[currentCategory] = skillsAfterColon
          } else {
            categorizedSkills[currentCategory] = ''
          }
        }
      } else {
        // Continue adding to current category
        if (categorizedSkills[currentCategory]) {
          categorizedSkills[currentCategory] += ', ' + line.replace(/^[•\-\*▪▫◦‣⁃]\s*/, '').trim()
        } else {
          categorizedSkills[currentCategory] = line.replace(/^[•\-\*▪▫◦‣⁃]\s*/, '').trim()
        }
      }
    })
    
    // Format categorized skills
    return Object.entries(categorizedSkills)
      .map(([category, skills]) => {
        if (skills) {
          return `${category}: ${skills}`
        }
        return category
      })
      .join('\n')
  } else {
    // Handle non-categorized skills (bulleted, comma-separated, or line-separated)
    const skills = []
    
    allLines.forEach(line => {
      // Remove bullet points
      const cleaned = line.replace(/^[•\-\*▪▫◦‣⁃\t]\s*/, '').trim()
      
      if (!cleaned) return
      
      // Check if line contains multiple comma-separated skills
      if (cleaned.includes(',')) {
        const commaSkills = cleaned.split(',').map(s => s.trim()).filter(s => s)
        skills.push(...commaSkills)
      } else {
        // Single skill per line
        skills.push(cleaned)
      }
    })
    
    // Return as comma-separated string
    return skills.join(', ')
  }
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

/**
 * Check if line is a section header
 */
function isSectionHeader(line) {
  const sectionPatterns = [
    /^(work\s+experience|experience|employment|professional\s+experience|career\s+history|professional\s+experience)$/i,
    /^(skills|technical\s+skills|core\s+competencies|competencies|key\s+skills|core\s+skills)$/i,
    /^(education|academic\s+background|qualifications)$/i,
    /^(personal\s+statement|summary|professional\s+summary|about|profile|objective)$/i,
    /^(projects|prototypes|certifications|awards)$/i
  ]
  return sectionPatterns.some(pattern => pattern.test(line))
}

