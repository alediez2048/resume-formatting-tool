import { useState, useRef } from 'react'
import { parsePDF } from '../../utils/pdfParser'
import './CoverLetterInput.css'

const CoverLetterInput = ({ onGenerate, isGenerating, openAIApiKey }) => {
  const [resumeMode, setResumeMode] = useState('upload') // 'upload' or 'text'
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [companyDetails, setCompanyDetails] = useState({
    companyName: '',
    hiringManager: '',
    jobTitle: '',
    companyAddress: ''
  })
  const [error, setError] = useState(null)
  
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setResumeFile(file)
      setError(null)
      
      // Optional: Parse immediately to verify readability
      try {
        const result = await parsePDF(file, (progress) => console.log(progress), openAIApiKey)
        setResumeText(JSON.stringify(result))
      } catch (err) {
        console.error('Error parsing PDF:', err)
        setError('Error reading PDF file. Please try pasting text instead.')
      }
    } else {
      setError('Please upload a valid PDF file.')
    }
  }

  const handleCompanyChange = (field, value) => {
    setCompanyDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = () => {
    if (!resumeText && !resumeFile) {
      setError('Please provide your resume (upload or paste text).')
      return
    }
    if (!jobDescription) {
      setError('Please paste the job description.')
      return
    }
    if (!companyDetails.companyName) {
      setError('Please enter the company name.')
      return
    }

    onGenerate({
      resumeText, // If uploaded, this will be the parsed content
      jobDescription,
      companyDetails
    })
  }

  return (
    <div className="cover-letter-input-container">
      <h2>Create Custom Cover Letter</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="input-section">
        <h3>1. Your Resume</h3>
        <div className="tabs">
          <div 
            className={`tab ${resumeMode === 'upload' ? 'active' : ''}`}
            onClick={() => setResumeMode('upload')}
          >
            Upload PDF
          </div>
          <div 
            className={`tab ${resumeMode === 'text' ? 'active' : ''}`}
            onClick={() => setResumeMode('text')}
          >
            Paste Text
          </div>
        </div>

        {resumeMode === 'upload' ? (
          <div 
            className={`file-upload-area ${resumeFile ? 'active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              style={{ display: 'none' }}
            />
            <p>{resumeFile ? `Selected: ${resumeFile.name}` : 'Click to upload Resume PDF'}</p>
          </div>
        ) : (
          <textarea
            className="text-input-area"
            placeholder="Paste your resume content here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        )}
      </div>

      <div className="input-section">
        <h3>2. Job Details</h3>
        <div className="company-details-grid">
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              value={companyDetails.companyName}
              onChange={(e) => handleCompanyChange('companyName', e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              value={companyDetails.jobTitle}
              onChange={(e) => handleCompanyChange('jobTitle', e.target.value)}
              placeholder="e.g. Senior Developer"
            />
          </div>
          <div className="form-group">
            <label>Hiring Manager (Optional)</label>
            <input
              type="text"
              value={companyDetails.hiringManager}
              onChange={(e) => handleCompanyChange('hiringManager', e.target.value)}
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div className="form-group">
            <label>Company Address (Optional)</label>
            <input
              type="text"
              value={companyDetails.companyAddress}
              onChange={(e) => handleCompanyChange('companyAddress', e.target.value)}
              placeholder="e.g. 123 Tech Lane, San Francisco, CA"
            />
          </div>
        </div>
      </div>

      <div className="input-section">
        <h3>3. Job Description</h3>
        <textarea
          className="text-input-area"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          style={{ minHeight: '150px' }}
        />
      </div>

      <button 
        className="generate-button"
        onClick={handleSubmit}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating Cover Letter...' : 'Generate Cover Letter'}
      </button>
    </div>
  )
}

export default CoverLetterInput


