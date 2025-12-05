/**
 * Style Matching Engine
 * Uses OpenAI API to intelligently apply reference template styling to new resume content
 */

/**
 * Apply reference template styling to parsed content using OpenAI
 * @param {Object} parsedContent - Parsed resume content
 * @param {Object} referenceTemplate - Reference template with styling specs
 * @param {string} openAIApiKey - OpenAI API key
 * @returns {Promise<Object>} Styled resume data ready for rendering
 */
export async function applyStylingWithAI(parsedContent, referenceTemplate, openAIApiKey) {
  if (!openAIApiKey || !openAIApiKey.trim()) {
    throw new Error('OpenAI API key is required for style matching')
  }

  if (!parsedContent || !referenceTemplate) {
    throw new Error('Parsed content and reference template are required')
  }

  try {
    // Prepare the prompt for OpenAI
    const prompt = createStylingPrompt(parsedContent, referenceTemplate)
    
    // Call OpenAI API via proxy server
    const response = await fetch('http://localhost:3001/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: openAIApiKey,
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a resume styling formatter. Your ONLY task is to return the EXACT same content with styling information attached. DO NOT modify, rewrite, shorten, or change ANY content. Return the content exactly as provided, with only styling metadata added.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent formatting
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      throw new Error('OpenAI API returned empty response')
    }

    // Parse AI response to extract styled content
    const styledContent = parseAIResponse(aiResponse, parsedContent, referenceTemplate)
    
    return {
      success: true,
      styledContent,
      rawAIResponse: aiResponse
    }
  } catch (error) {
    console.error('Error applying styling with AI:', error)
    // Fallback to programmatic styling if AI fails
    return {
      success: false,
      error: error.message,
      styledContent: applyStylingProgrammatically(parsedContent, referenceTemplate)
    }
  }
}

/**
 * Create prompt for OpenAI styling task
 */
function createStylingPrompt(parsedContent, referenceTemplate) {
  const specs = referenceTemplate.stylingSpecs
  const fonts = specs.fonts || {}
  const layout = specs.layout || {}
  const bullets = specs.bullets || {}
  const links = specs.links || {}
  const transforms = specs.transforms || {}

  return `Apply the following reference resume styling specifications to the new resume content.

REFERENCE STYLING SPECIFICATIONS:

FONTS:
- Name: ${fonts.name?.size || 'N/A'}pt, ${fonts.name?.weight || 'bold'}, ${fonts.name?.style || 'normal'}, ${fonts.name?.family || 'Helvetica'}
- Section Titles: ${fonts.sectionTitle?.size || 'N/A'}pt, ${fonts.sectionTitle?.weight || 'bold'}, ${fonts.sectionTitle?.transform || 'uppercase'}
- Company Names: ${fonts.companyName?.size || 'N/A'}pt, ${fonts.companyName?.weight || 'N/A'}, ${fonts.companyName?.style || 'N/A'}
- Role Titles: ${fonts.roleTitle?.size || 'N/A'}pt, ${fonts.roleTitle?.weight || 'N/A'}, ${fonts.roleTitle?.style || 'N/A'}
- Dates: ${fonts.date?.size || 'N/A'}pt, ${fonts.date?.weight || 'N/A'}, ${fonts.date?.style || 'N/A'}
- Body Text: ${fonts.body?.size || 'N/A'}pt, ${fonts.body?.weight || 'normal'}, ${fonts.body?.lineHeight || 1.5}
- Bullet Text: ${fonts.bulletText?.size || 'N/A'}pt, ${fonts.bulletText?.weight || 'N/A'}
- Contact Info: ${fonts.contact?.size || 'N/A'}pt, ${fonts.contact?.weight || 'N/A'}

LAYOUT:
- Margins: Top ${layout.margins?.top || 'N/A'}pt, Bottom ${layout.margins?.bottom || 'N/A'}pt, Left ${layout.margins?.left || 'N/A'}pt, Right ${layout.margins?.right || 'N/A'}pt
- Section Spacing: ${layout.sectionSpacing || 'N/A'}pt
- Paragraph Spacing: ${layout.paragraphSpacing || 'N/A'}pt

BULLETS:
- Style: ${bullets.style || '•'}
- Indentation: ${bullets.indentation || 'N/A'}pt
- Line Spacing: ${bullets.lineSpacing || 'N/A'}

TEXT TRANSFORMS:
- Section Titles: ${transforms.sectionTitle || 'none'}
- Name: ${transforms.name || 'none'}

NEW RESUME CONTENT TO STYLE:

Contact Info:
${JSON.stringify(parsedContent.contactInfo, null, 2)}

Personal Statement:
${parsedContent.personalStatement || 'None'}

Work Experience (${parsedContent.workExperience?.length || 0} entries):
${JSON.stringify(parsedContent.workExperience, null, 2)}

Skills:
${parsedContent.skills || 'None'}

Education (${parsedContent.education?.length || 0} entries):
${JSON.stringify(parsedContent.education, null, 2)}

CRITICAL: DO NOT MODIFY CONTENT
- Return the EXACT same content as provided
- Do NOT rewrite, rephrase, shorten, or change any text
- Do NOT remove any information
- Do NOT combine or merge bullet points
- Keep all jobs, all bullets, all text exactly as provided
- Only add styling metadata to the structure

TASK:
1. Return the EXACT content provided below
2. Add styling information based on reference specifications
3. Structure the data for PDF rendering
4. Preserve 100% of the original content - no changes allowed

Return ONLY a valid JSON object with this structure:
{
  "contactInfo": { "name": "...", "email": "...", ... },
  "personalStatement": "...",
  "workExperience": [
    {
      "company": "...",
      "title": "...",
      "date": "...",
      "location": "...",
      "bullets": ["...", "..."]
    }
  ],
  "skills": "...",
  "education": [
    {
      "school": "...",
      "degree": "...",
      "date": "...",
      "gpa": "...",
      "certificate": "..."
    }
  ],
  "styling": {
    "fonts": { ... },
    "layout": { ... },
    "bullets": { ... },
    "transforms": { ... }
  }
}`
}

/**
 * Parse AI response and extract styled content
 */
function parseAIResponse(aiResponse, parsedContent, referenceTemplate) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      
      // ALWAYS prioritize original content - AI might have modified it
      // Only use AI response if it matches original structure, otherwise use original
      return {
        contactInfo: parsedContent.contactInfo, // Always use original
        personalStatement: parsedContent.personalStatement, // Always use original
        workExperience: parsedContent.workExperience, // Always use original
        skills: parsedContent.skills, // Always use original
        education: parsedContent.education, // Always use original
        styling: referenceTemplate.stylingSpecs // Use reference styling
      }
    }
  } catch (error) {
    console.warn('Failed to parse AI response as JSON, using original content:', error)
  }

  // Fallback: use original content with reference styling
  return applyStylingProgrammatically(parsedContent, referenceTemplate)
}

/**
 * Fallback: Apply styling programmatically without AI
 */
function applyStylingProgrammatically(parsedContent, referenceTemplate) {
  const specs = referenceTemplate.stylingSpecs

  return {
    contactInfo: parsedContent.contactInfo,
    personalStatement: parsedContent.personalStatement,
    workExperience: parsedContent.workExperience,
    skills: parsedContent.skills,
    education: parsedContent.education,
    styling: specs
  }
}

/**
 * Optimize content to fit one page using OpenAI
 * @param {Object} styledContent - Styled resume content
 * @param {Object} referenceTemplate - Reference template
 * @param {string} openAIApiKey - OpenAI API key
 * @returns {Promise<Object>} Optimized content
 */
export async function optimizeForOnePage(styledContent, referenceTemplate, openAIApiKey) {
  if (!openAIApiKey || !openAIApiKey.trim()) {
    // Return original content if no API key
    return { success: true, optimizedContent: styledContent }
  }

  try {
    const prompt = `Optimize the following resume content to fit exactly on one page while maintaining all important information and the reference styling.

REFERENCE STYLING:
- Font sizes, margins, spacing must remain unchanged
- Only adjust content length if necessary

CURRENT CONTENT:
${JSON.stringify(styledContent, null, 2)}

OPTIMIZATION RULES:
1. Prioritize most recent and relevant work experience
2. Condense bullet points while preserving key achievements
3. Shorten descriptions only if absolutely necessary
4. Maintain all contact information and education
5. Keep skills concise but complete

Return ONLY a JSON object with the optimized content in the same structure.`

    const response = await fetch('http://localhost:3001/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: openAIApiKey,
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at optimizing resume content to fit one page while preserving all critical information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      return { success: true, optimizedContent: styledContent }
    }

    // Parse optimized content
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const optimized = JSON.parse(jsonMatch[0])
      return {
        success: true,
        optimizedContent: {
          ...styledContent,
          ...optimized,
          styling: styledContent.styling // Preserve styling
        }
      }
    }

    return { success: true, optimizedContent: styledContent }
  } catch (error) {
    console.error('Error optimizing content:', error)
    return { success: true, optimizedContent: styledContent }
  }
}

