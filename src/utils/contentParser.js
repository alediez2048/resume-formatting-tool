/**
 * Content Parser
 * Parses new resume text content and extracts structured data
 * Now includes AI-powered parsing using OpenAI for improved reliability
 */

/**
 * AI-powered resume parsing using OpenAI
 * This provides more reliable extraction, especially for bullet points
 * @param {string} resumeText - Raw resume text
 * @param {string} openAIApiKey - OpenAI API key
 * @returns {Promise<Object>} Parsed resume content
 */
export async function parseResumeContentWithAI(resumeText, openAIApiKey) {
  if (!openAIApiKey || !openAIApiKey.trim()) {
    throw new Error('OpenAI API key is required for AI-powered parsing')
  }

  try {
    console.log('🤖 Using AI-powered parsing for resume content')
    
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
            content: `You are an expert resume parser. Extract structured data from resume text and return it as valid JSON. 
            Pay special attention to:
            1. Bullet points - extract ALL bullet points for each work experience entry, even if they're formatted differently
            2. Work experience entries - correctly identify company, job title, dates, location, and ALL associated bullet points
            3. Contact information - extract name, email, phone, location, website
            4. Personal statement/summary - extract the full professional summary
            5. Education - extract school, degree, date, GPA, certificates
            6. Skills - extract all skills, preserving categories if present
            
            Return a JSON object with this exact structure:
            {
              "contactInfo": {
                "name": "string",
                "email": "string",
                "phone": "string",
                "location": "string",
                "website": "string"
              },
              "personalStatement": "string or null",
              "workExperience": [
                {
                  "company": "string",
                  "title": "string",
                  "date": "string",
                  "location": "string",
                  "bullets": ["string", "string", ...]
                }
              ],
              "education": [
                {
                  "school": "string",
                  "degree": "string",
                  "date": "string",
                  "gpa": "string",
                  "certificate": "string or null"
                }
              ],
              "skills": "string"
            }
            
            IMPORTANT: 
            - Extract ALL bullet points for each work experience, even if they use different formatting (•, -, *, numbers, tabs, spaces)
            - Preserve the exact text of bullet points
            - If a work experience has no bullets, use an empty array []
            - Return null for optional fields that are not present
            - Return skills as a single string (comma-separated or formatted as provided)`
          },
          {
            role: 'user',
            content: `Parse this resume text and extract all structured data, especially making sure to capture ALL bullet points for each work experience entry:\n\n${resumeText}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Low temperature for consistent parsing
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = `OpenAI API error: ${errorData.error.message || errorData.error.code || 'Unknown error'}`
        }
      } catch (e) {
        console.error('Error parsing OpenAI error response:', e)
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('OpenAI API returned empty response')
    }

    // Parse the JSON response
    let parsedData
    try {
      parsedData = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError)
      console.error('Raw response:', content)
      throw new Error('AI parsing returned invalid JSON format')
    }

    // Validate and normalize the response
    const result = {
      success: true,
      contactInfo: parsedData.contactInfo || {
        name: null,
        email: null,
        phone: null,
        location: null,
        website: null
      },
      personalStatement: parsedData.personalStatement || null,
      workExperience: Array.isArray(parsedData.workExperience) 
        ? parsedData.workExperience.map(exp => ({
            company: exp.company || '',
            title: exp.title || '',
            date: exp.date || '',
            location: exp.location || '',
            bullets: Array.isArray(exp.bullets) ? exp.bullets.filter(b => b && b.trim()) : []
          }))
        : [],
      education: Array.isArray(parsedData.education)
        ? parsedData.education.map(edu => ({
            school: edu.school || '',
            degree: edu.degree || '',
            date: edu.date || '',
            gpa: edu.gpa || '',
            certificate: edu.certificate || null
          }))
        : [],
      skills: parsedData.skills || '',
      rawText: resumeText
    }

    console.log('✅ AI parsing complete:', {
      personalStatement: result.personalStatement ? `✅ (${result.personalStatement.length} chars)` : '❌',
      workExperienceCount: result.workExperience.length,
      totalBullets: result.workExperience.reduce((sum, exp) => sum + (exp.bullets?.length || 0), 0),
      skills: result.skills ? '✅' : '❌',
      educationCount: result.education.length
    })

    return result
  } catch (error) {
    console.error('AI-powered parsing error:', error)
    throw error
  }
}

/**
 * Parse new resume content text into structured format
 * Uses AI-powered parsing if OpenAI key is provided, otherwise falls back to rule-based parsing
 * @param {string} resumeText - Raw resume text
 * @param {string} openAIApiKey - Optional OpenAI API key for AI-powered parsing
 * @returns {Promise<Object>|Object} Parsed resume content
 */
export async function parseResumeContent(resumeText, openAIApiKey = null) {
  console.log('🚀 parseResumeContent called with text length:', resumeText?.length || 0)
  console.log('📝 First 200 chars of input:', resumeText?.substring(0, 200) || 'EMPTY')
  console.log('🔑 OpenAI API key provided:', !!openAIApiKey)
  
  try {
    if (!resumeText || !resumeText.trim()) {
      console.error('❌ Resume text is empty!')
      return { error: 'Resume text is empty' }
    }

    // Try AI-powered parsing first if API key is provided
    if (openAIApiKey && openAIApiKey.trim()) {
      try {
        console.log('🤖 Attempting AI-powered parsing...')
        const aiResult = await parseResumeContentWithAI(resumeText, openAIApiKey)
        if (aiResult && aiResult.success) {
          console.log('✅ AI parsing succeeded, using AI results')
          return aiResult
        }
      } catch (aiError) {
        console.warn('⚠️ AI parsing failed, falling back to rule-based parsing:', aiError.message)
        // Continue to rule-based parsing below
      }
    } else {
      console.log('ℹ️ No OpenAI API key provided, using rule-based parsing')
    }

    // CRITICAL FIX: Preserve original lines with whitespace for proper parsing
    // Blank lines are important for section structure
    const originalLines = resumeText.split('\n')
    // Create trimmed version for pattern matching, but preserve originals
    const trimmedLines = originalLines.map(line => line.trim())
    
    console.log(`📏 Total lines: ${originalLines.length} (${trimmedLines.filter(l => l).length} non-empty)`)
    
    // Extract contact information (usually first few lines) - use trimmed for contact extraction
    const contactInfo = extractContactInfo(trimmedLines.filter(line => line))
    
    // Identify and extract sections - pass both original and trimmed for proper handling
    const sections = extractSections(originalLines, trimmedLines)
    
    // Extract work experience
    const workExperience = extractWorkExperience(sections.workExperience || [])
    
    // Extract education
    const education = extractEducation(sections.education || [])
    
    // Extract skills
    const skills = extractSkills(sections.skills || [])
    
    // Debug logging
    console.log('📊 PARSER RESULT:', {
      personalStatement: sections.personalStatement ? `✅ Found (${sections.personalStatement.length} chars)` : '❌ NOT FOUND',
      workExperienceCount: workExperience.length,
      workExperienceBullets: workExperience.reduce((sum, exp) => sum + (exp.bullets?.length || 0), 0),
      skills: skills ? '✅ Found' : '❌ NOT FOUND',
      educationCount: education.length
    })
    
    return {
      success: true,
      contactInfo,
      personalStatement: sections.personalStatement || null, // Use null, not empty string
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
 * @param {string[]} originalLines - Original lines with whitespace preserved
 * @param {string[]} trimmedLines - Trimmed lines for pattern matching
 */
function extractSections(originalLines, trimmedLines) {
  const sections = {
    personalStatement: null,
    workExperience: [],
    skills: null,
    education: [],
    other: []
  }

  const sectionPatterns = {
    personalStatement: /^(personal\s+statement|summary|professional\s+summary|about|profile|objective|executive\s+summary|professional\s+summary|summary\s+of\s+qualifications|career\s+summary|overview)$/i,
    workExperience: /^(work\s+experience|experience|employment|professional\s+experience|career\s+history|professional\s+experience|work\s+history|employment\s+history)$/i,
    skills: /^(skills|technical\s+skills|core\s+competencies|competencies|key\s+skills|core\s+skills|technical\s+proficiencies|core\s+skills)$/i,
    education: /^(education|academic\s+background|qualifications|academic)$/i
  }
  
  // Debug: Log section patterns for troubleshooting
  console.log('🔍 Section patterns:', Object.keys(sectionPatterns))

  let currentSection = null
  let sectionContent = []
  let headerEndIndex = 0

  // Skip header (first few lines) - use trimmed for detection
  // Look for contact info section (name, email, phone, etc.)
  for (let i = 0; i < Math.min(8, trimmedLines.length); i++) {
    const line = trimmedLines[i]
    // Check if this looks like a section header (all caps, short, not contact info)
    const looksLikeSectionHeader = line && 
                                   line.length < 50 && 
                                   line.length > 3 &&
                                   /^[A-Z\s\-]+$/.test(line) &&
                                   !line.includes('@') && // Not email
                                   !/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(line) && // Not phone
                                   !/^[A-Z][a-z]+/.test(line) // Not mixed case (likely name)
    
    if (looksLikeSectionHeader && !sectionPatterns.personalStatement.test(line)) {
      // Might be a section header (but not personal statement)
      break
    }
    headerEndIndex = i
  }
  
  console.log(`📍 Header end index: ${headerEndIndex} (checked first ${Math.min(8, trimmedLines.length)} lines)`)

  // Parse remaining sections - iterate through trimmed lines but preserve originals
  for (let i = headerEndIndex + 1; i < trimmedLines.length; i++) {
    const trimmedLine = trimmedLines[i] || ''
    const originalLine = originalLines[i] || ''
    
    // Skip divider lines (e.g., "⸻", "---", "___")
    if (/^[⸻\-_=]+$/.test(trimmedLine)) {
      continue
    }
    
    // Check if this is a section header (use trimmed for matching)
    let isSectionHeader = false
    let matchedSectionKey = null
    
    for (const [sectionKey, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(trimmedLine)) {
        console.log(`✅ Found section header at line ${i}: "${trimmedLine}" → ${sectionKey}`)
        
        // Save previous section content
        if (currentSection && sectionContent.length > 0) {
          if (currentSection === 'workExperience' || currentSection === 'education') {
            sections[currentSection].push(sectionContent.join('\n'))
            console.log(`💾 Saved ${currentSection} section with ${sectionContent.length} lines`)
          } else {
            const content = sectionContent.join('\n').trim()
            if (content.length > 0) {
              sections[currentSection] = content
              console.log(`💾 Saved ${currentSection} section: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`)
            }
          }
        }
        // Start new section
        currentSection = sectionKey
        matchedSectionKey = sectionKey
        sectionContent = []
        isSectionHeader = true
        break
      }
    }

    if (!isSectionHeader) {
      if (currentSection) {
        // We're in a section, add content
        // For personal statement, collect all lines until next section header
        // Include blank lines to preserve paragraph structure
        if (currentSection === 'personalStatement') {
          // Only skip if it's a clear divider, otherwise include it (even if blank)
          if (!/^[⸻\-_=]+$/.test(trimmedLine)) {
            // Preserve original line to maintain formatting
            sectionContent.push(originalLine)
          }
        } else {
          // For other sections, only add non-blank lines
          if (trimmedLine) {
            sectionContent.push(originalLine)
          }
        }
      } else {
        // No current section - check if this might be personal statement content
        // (e.g., content right after contact info, before first section header)
        const isNotASectionHeader = !Object.values(sectionPatterns).some(pattern => pattern.test(trimmedLine))
        const isNotADivider = !/^[⸻\-_=]+$/.test(trimmedLine)
        const isSubstantialText = trimmedLine.length > 10 && !isDate(trimmedLine)
        
        // More lenient: accept any substantial text before first section header
        // Also check if it might be personal statement even if it's further down
        const isBeforeFirstSection = i < headerEndIndex + 30 // Extended range
        const isSubstantialEnough = trimmedLine.length > 8 // More lenient (was 10)
        
        if (isBeforeFirstSection && isSubstantialEnough && isNotASectionHeader && isNotADivider) {
          // This might be personal statement content
          if (!sections.personalStatement) {
            sections.personalStatement = trimmedLine
            console.log(`💬 Found potential personal statement content at line ${i}: "${trimmedLine.substring(0, 50)}${trimmedLine.length > 50 ? '...' : ''}"`)
          } else {
            sections.personalStatement += ' ' + trimmedLine
            console.log(`💬 Appended to personal statement at line ${i}: "${trimmedLine.substring(0, 30)}${trimmedLine.length > 30 ? '...' : ''}"`)
          }
        } else if (trimmedLine) {
          // Unidentified section (only if not blank)
          sections.other.push(originalLine)
          if (i < 30) { // Only log first 30 lines to avoid spam
            const reason = !isBeforeFirstSection ? 'too far from header' : 
                          !isSubstantialEnough ? 'too short' : 
                          !isNotASectionHeader ? 'is section header' : 
                          !isNotADivider ? 'is divider' : 'unknown'
            console.log(`❓ Unidentified line ${i} (${reason}): "${trimmedLine.substring(0, 40)}${trimmedLine.length > 40 ? '...' : ''}"`)
          }
        }
      }
    }
  }

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    if (currentSection === 'workExperience' || currentSection === 'education') {
      sections[currentSection].push(sectionContent.join('\n'))
      console.log(`💾 Saved final ${currentSection} section with ${sectionContent.length} lines`)
    } else {
      const content = sectionContent.join('\n').trim()
      if (content.length > 0) {
        sections[currentSection] = content
        console.log(`💾 Saved final ${currentSection} section: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`)
      }
    }
  }

  // Clean up personal statement - remove if it's empty or just whitespace
  if (sections.personalStatement && sections.personalStatement.trim().length === 0) {
    console.log('⚠️ Personal statement was empty, setting to null')
    sections.personalStatement = null
  }
  
  // Debug: Show what we found
  console.log('📋 Final sections extracted:', {
    personalStatement: sections.personalStatement ? `✅ "${sections.personalStatement.substring(0, 60)}${sections.personalStatement.length > 60 ? '...' : ''}"` : '❌ NOT FOUND',
    workExperience: sections.workExperience.length > 0 ? `✅ ${sections.workExperience.length} section(s)` : '❌ None',
    skills: sections.skills ? '✅ Found' : '❌ NOT FOUND',
    education: sections.education.length > 0 ? `✅ ${sections.education.length} section(s)` : '❌ None'
  })

  return sections
}

/**
 * Extract work experience entries
 */
function extractWorkExperience(workExpSections) {
  if (!workExpSections || workExpSections.length === 0) {
    console.log('⚠️ No work experience sections found')
    return []
  }

  console.log(`💼 Extracting work experience from ${workExpSections.length} section(s)`)
  const experiences = []

  workExpSections.forEach((section, sectionIndex) => {
    console.log(`📄 Processing work experience section ${sectionIndex + 1}:`, section.substring(0, 200) + (section.length > 200 ? '...' : ''))
    // Split section into lines - preserve original for bullet detection
    const originalLines = section.split('\n')
    // Create mapping: index -> original line (to handle duplicates)
    const allLines = []
    const originalLineByIndex = []
    
    originalLines.forEach((origLine, origIndex) => {
      const trimmed = origLine.trim()
      if (trimmed) {
        allLines.push(trimmed)
        originalLineByIndex.push(origLine) // Preserve original with whitespace
      }
    })
    
    let currentExp = null
    let currentBullets = []
    let i = 0

    while (i < allLines.length) {
      const line = allLines[i]
      // Get original line (with spaces) for bullet detection
      const originalLine = originalLineByIndex[i] || line
      
      // Check if this line is a bullet point
      // Support bullets at start OR with leading spaces (common in resumes)
      // Also support numbered bullets and tab-indented bullets
      const trimmedForBulletCheck = line.trim()
      const isBullet = /^[•\-\*▪▫◦‣⁃]|\d+[\.\)]/.test(trimmedForBulletCheck) ||
                   /^\s{1,8}[•\-\*▪▫◦‣⁃]/.test(originalLine) || // Bullet with 1-8 leading spaces
                   /^\s{1,8}\d+[\.\)]/.test(originalLine) || // Numbered with leading spaces
                   originalLine.startsWith('\t') // Tab-indented
      
      // Check for common resume formats first
      // Format 1: "Job Title | Company | Date" or "Company | Job Title | Date"
      const pipeFormat = line.includes('|')
      // Format 2: "Company - Job Title" or "Job Title - Company" (dash separator)
      const dashFormat = line.includes(' - ') && !isDate(line)
      // Format 3: "Company | Job Title | Date"
      
      let detectedCompany = null
      let detectedTitle = null
      let detectedDate = null
      
      if (pipeFormat) {
        const parts = line.split('|').map(p => p.trim()).filter(p => p)
        if (parts.length >= 2) {
          // Try to identify which part is company, title, date
          parts.forEach((part, idx) => {
            if (isDate(part)) {
              detectedDate = part
            } else if (idx === 0 && !isDate(part)) {
              // First part might be title or company
              detectedTitle = part
            } else if (idx === 1 && !isDate(part)) {
              // Second part might be company
              detectedCompany = part
            }
          })
          
          // If we have 3 parts: title, company, date
          if (parts.length >= 3) {
            detectedTitle = parts[0]
            detectedCompany = parts[1]
            detectedDate = parts[2] || detectedDate
          }
        }
      } else if (dashFormat) {
        // Handle "Company - Job Title" or "Job Title - Company" format
        const parts = line.split(/\s+-\s+/).map(p => p.trim()).filter(p => p)
        if (parts.length >= 2) {
          // Heuristic: Company names are usually shorter and don't contain common job title words
          const jobTitleWords = /engineer|manager|director|analyst|developer|designer|strategist|producer|specialist|coordinator|lead|senior|junior/i
          
          const firstPart = parts[0]
          const secondPart = parts[1]
          
          // Check if first part looks like a company (shorter, no job title words)
          // or second part looks like a company
          if (jobTitleWords.test(firstPart) && !jobTitleWords.test(secondPart)) {
            // "Job Title - Company" format
            detectedTitle = firstPart
            detectedCompany = secondPart
          } else if (!jobTitleWords.test(firstPart) && jobTitleWords.test(secondPart)) {
            // "Company - Job Title" format
            detectedCompany = firstPart
            detectedTitle = secondPart
          } else {
            // Ambiguous - use length heuristic (company usually shorter)
            if (firstPart.length < secondPart.length) {
              detectedCompany = firstPart
              detectedTitle = secondPart
            } else {
              detectedTitle = firstPart
              detectedCompany = secondPart
            }
          }
        }
      }
      
      // Check if this line looks like a company name
      // Company names are usually:
      // - Short to medium length (less than 80 chars)
      // - Not starting with bullet points, tabs, or special chars
      // - Not a date
      // - Not a section header
      // - Followed by lines that look like job title, then location/date
      const isLikelyCompany = !isBullet &&
                             line.length < 80 && 
                             line.length > 2 &&
                             !line.startsWith('•') && 
                             !line.startsWith('-') &&
                             !line.startsWith('\t') &&
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

      // Handle pipe format (Job Title | Company | Date) or dash format (Company - Job Title)
      if ((pipeFormat || dashFormat) && detectedCompany) {
        // Save previous experience if exists
        if (currentExp) {
          currentExp.bullets = currentBullets
          experiences.push(currentExp)
          console.log(`💾 Saved experience: ${currentExp.company} - ${currentExp.title} (${currentBullets.length} bullets)`)
        }
        
        // Start new experience from pipe or dash format
        currentExp = {
          company: detectedCompany,
          title: detectedTitle || '',
          date: detectedDate || '',
          location: '',
          bullets: []
        }
        currentBullets = []
        const formatType = pipeFormat ? 'pipe' : 'dash'
        console.log(`✅ Detected new experience (${formatType} format): Company="${detectedCompany}", Title="${detectedTitle || 'No title'}", Date="${detectedDate || 'No date'}"`)
        i++
        continue
      }
      
      // Also check if current line is a dash format company-title (even if we're processing bullets)
      // This helps detect new companies that appear after bullets
      const isDashFormatCompany = dashFormat && detectedCompany && 
                                   currentExp && 
                                   detectedCompany !== currentExp.company
      
      // Check if this is a new company (standard format or dash format)
      if (isDashFormatCompany || (isLikelyCompany && (looksLikeNewCompany || isNewCompanyAfterBullets)) || (isLikelyCompany && currentExp === null)) {
        // Save previous experience if exists
        if (currentExp) {
          currentExp.bullets = currentBullets
          experiences.push(currentExp)
          console.log(`💾 Saved experience: ${currentExp.company} - ${currentExp.title} (${currentBullets.length} bullets)`)
        }

        // Start new experience
        const company = line
        let title = ''
        let date = ''
        let location = ''
        
        console.log(`✅ Detected potential company at line ${i}: "${company}"`)

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
        console.log(`📝 Created new experience entry: Company="${company}", Title="${title}", Date="${date}"`)
      } else if (isBullet) {
        // This is a bullet point
        if (currentExp) {
          // Remove bullet marker and leading whitespace
          const bulletText = originalLine
            .replace(/^\s*[•\-\*▪▫◦‣⁃]\s*/, '') // Remove bullet char with surrounding spaces
            .replace(/^\s*\d+[\.\)]\s*/, '') // Remove numbered bullet
            .replace(/^\t+/, '') // Remove leading tabs
            .trim()
          
          if (bulletText && bulletText.length > 0) {
            currentBullets.push(bulletText)
          }
        } else {
          // Bullet found but no currentExp - might be continuation of previous exp
          // Try to attach to last experience if it exists
          if (experiences.length > 0) {
            const lastExp = experiences[experiences.length - 1]
            const bulletText = originalLine
              .replace(/^\s*[•\-\*▪▫◦‣⁃]\s*/, '')
              .replace(/^\s*\d+[\.\)]\s*/, '')
              .replace(/^\t+/, '')
              .trim()
            
            if (bulletText && bulletText.length > 0) {
              if (!lastExp.bullets) {
                lastExp.bullets = []
              }
              lastExp.bullets.push(bulletText)
            }
          }
        }
      } else if (currentExp && !isBullet && line.length > 0) {
        // Check if this might be a bullet without explicit marker (indented line)
        const isIndentedBullet = /^\s{2,8}/.test(originalLine) && line.length < 150 && 
                                 !isDate(line) && 
                                 !isSectionHeader(line)
        
        if (isIndentedBullet) {
          // Treat indented lines as bullets if we're in an experience entry
          currentBullets.push(line)
        } else if (!currentExp.title) {
          // If current title is empty, this might be the title
          currentExp.title = line
        }
      }

      i++
    }

    // Save last experience
    if (currentExp) {
      currentExp.bullets = currentBullets
      experiences.push(currentExp)
      console.log(`💾 Saved final experience: ${currentExp.company} - ${currentExp.title} (${currentBullets.length} bullets)`)
    }
    
    console.log(`📊 Work experience extraction complete: ${experiences.length} experience(s) found`)
    experiences.forEach((exp, idx) => {
      console.log(`  ${idx + 1}. ${exp.company || 'No company'} - ${exp.title || 'No title'} (${exp.bullets?.length || 0} bullets)`)
    })

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

