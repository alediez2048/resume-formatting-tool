import { useState } from 'react'
import './NewResumeInput.css'

const NewResumeInput = ({ onParse }) => {
  const [resumeText, setResumeText] = useState('')
  const [jobDetails, setJobDetails] = useState({ companyName: '', jobTitle: '' })
  const [isParsing, setIsParsing] = useState(false)

  const handleSubmit = async () => {
    if (!resumeText.trim()) {
      alert('Please paste your resume content')
      return
    }

    setIsParsing(true)
    try {
      await onParse(resumeText, jobDetails)
    } catch (error) {
      console.error('Error parsing resume:', error)
      alert('Error parsing resume. Please check the console.')
    } finally {
      setIsParsing(false)
    }
  }

  const handleClear = () => {
    setResumeText('')
    setJobDetails({ companyName: '', jobTitle: '' })
  }

  return (
    <div className="new-resume-input">
      <div className="input-header">
        <h2>Paste Your New Resume Content</h2>
        <p className="instruction-text">
          Paste your new resume text below. Also provide the target Company and Job Title to customize the file name.
        </p>
      </div>

      <div className="job-details-section" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568', fontWeight: '500' }}>Target Company Name</label>
          <input
            type="text"
            value={jobDetails.companyName}
            onChange={(e) => setJobDetails(prev => ({ ...prev, companyName: e.target.value }))}
            placeholder="e.g. Rippling"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568', fontWeight: '500' }}>Job Title</label>
          <input
            type="text"
            value={jobDetails.jobTitle}
            onChange={(e) => setJobDetails(prev => ({ ...prev, jobTitle: e.target.value }))}
            placeholder="e.g. AI Search Manager"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
          />
        </div>
      </div>

      <div className="textarea-container">
        <textarea
          className="resume-textarea"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume content here..."
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
