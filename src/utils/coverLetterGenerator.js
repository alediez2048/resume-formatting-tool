/**
 * Generate a custom cover letter using OpenAI
 * @param {Object} params - Input parameters
 * @param {Object|string} params.resume - Parsed resume object or raw text
 * @param {string} params.jobDescription - Job description text
 * @param {Object} params.companyDetails - Company details (name, manager, etc.)
 * @param {string} params.apiKey - OpenAI API key
 * @returns {Promise<Object>} Generated cover letter content
 */
export async function generateCoverLetter({ resume, jobDescription, companyDetails, apiKey }) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required')
  }

  const resumeContent = typeof resume === 'string' ? resume : JSON.stringify(resume)
  
  const systemPrompt = `You are an expert professional career coach and writer. Your task is to write a compelling, professional, and concise cover letter.
  
  Formatting Constraints:
  - The letter MUST fit on a single page (approx 300-400 words).
  - Use a professional, confident, yet polite tone.
  - Do not include placeholders like "[Your Name]" - use the information provided or generic placeholders if absolutely necessary but prefer direct writing.
  
  Structure:
  1. Opening: Hook the reader, mention the specific role and company, and express enthusiasm.
  2. Body Paragraph 1: Connect past experience directly to the job requirements using key achievements.
  3. Body Paragraph 2: Highlight soft skills or cultural fit, demonstrating understanding of the company's values.
  4. Closing: Reiterate interest and propose a next step (interview).
  
  Output Format:
  Return a JSON object with the following fields:
  - content: The main body text of the letter (paragraphs separated by \\n\\n).
  - subjectLine: A professional subject line for the letter.
  - extractedCandidateName: The candidate's name extracted from the resume (if found).
  - extractedCandidateContact: The candidate's email/phone extracted from the resume (if found).
  `

  const userPrompt = `
  RESUME CONTENT:
  ${resumeContent.substring(0, 5000)}
  
  JOB DESCRIPTION:
  ${jobDescription.substring(0, 2000)}
  
  COMPANY DETAILS:
  Company: ${companyDetails.companyName}
  Job Title: ${companyDetails.jobTitle}
  Hiring Manager: ${companyDetails.hiringManager || 'Hiring Manager'}
  
  Write a custom cover letter for this application.
  `

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    
    return result

  } catch (error) {
    console.error('Error generating cover letter:', error)
    throw error
  }
}

