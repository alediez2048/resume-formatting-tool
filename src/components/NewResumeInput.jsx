import { useState } from 'react'
import './NewResumeInput.css'

const NewResumeInput = ({ onParse }) => {
  const [resumeText, setResumeText] = useState('')
  const [isParsing, setIsParsing] = useState(false)

  const handleSubmit = async () => {
    if (!resumeText.trim()) {
      alert('Please paste your resume content')
      return
    }

    setIsParsing(true)
    try {
      await onParse(resumeText)
    } catch (error) {
      console.error('Error parsing resume:', error)
      alert('Error parsing resume. Please check the console.')
    } finally {
      setIsParsing(false)
    }
  }

  const handleClear = () => {
    setResumeText('')
  }

  return (
    <div className="new-resume-input">
      <div className="input-header">
        <h2>Paste Your New Resume Content</h2>
        <p className="instruction-text">
          Paste your new resume text below. The system will identify sections (name, contact, 
          work experience, skills, education, etc.) and format them to match your reference resume's styling.
        </p>
      </div>

      <div className="textarea-container">
        <textarea
          className="resume-textarea"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume content here...

Example:
John Doe
john.doe@email.com | +1 (555) 123-4567 | San Francisco, CA
www.johndoe.com

PERSONAL STATEMENT
Experienced software engineer with 5+ years of experience...

WORK EXPERIENCE
Senior Software Engineer
Company Name | 2020 - Present
• Led development of...
• Implemented...
• Achieved...

Software Engineer
Previous Company | 2018 - 2020
• Developed...
• Collaborated...

SKILLS
JavaScript, React, Node.js, Python, AWS, Docker

EDUCATION
Bachelor of Science in Computer Science
University Name | 2015 - 2019"
          rows={25}
        />
        <div className="textarea-footer">
          <span className="char-count">{resumeText.length} characters</span>
          <button 
            className="clear-button"
            onClick={handleClear}
            disabled={!resumeText.trim()}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="parse-button"
          onClick={handleSubmit}
          disabled={!resumeText.trim() || isParsing}
        >
          {isParsing ? 'Parsing Resume...' : 'Parse & Identify Sections'}
        </button>
      </div>
    </div>
  )
}

export default NewResumeInput

