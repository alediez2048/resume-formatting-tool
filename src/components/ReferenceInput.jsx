import { useState, useRef } from 'react'
import OpenAISettings from './OpenAISettings'
import './ReferenceInput.css'

const ReferenceInput = ({ onAnalyze }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressStage, setProgressStage] = useState('')
  const [openAIApiKey, setOpenAIApiKey] = useState(() => {
    return localStorage.getItem('openai_api_key') || ''
  })
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB')
      return
    }

    setError(null)
    setSelectedFile(file)
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file')
      return
    }

    if (!openAIApiKey || !openAIApiKey.trim()) {
      setError('OpenAI API key is required. Please configure it above.')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setProgress(0)
    setProgressStage('')
    
    try {
      await onAnalyze(selectedFile, (progressValue, stage) => {
        setProgress(progressValue)
        setProgressStage(stage)
      }, openAIApiKey)
    } catch (error) {
      console.error('Error analyzing PDF:', error)
      const errorMessage = error.message || 'Error analyzing PDF. Please make sure it is a valid PDF file.'
      setError(errorMessage)
      setProgress(0)
      setProgressStage('')
    } finally {
      setIsAnalyzing(false)
      // Keep progress at 100% briefly before clearing
      setTimeout(() => {
        setProgress(0)
        setProgressStage('')
      }, 500)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="reference-input">
      <div className="reference-input-header">
        <h2>Step 1: Upload Reference Resume PDF</h2>
        <p className="instruction-text">
          Upload a PDF of your reference resume. This resume will be used as a template 
          for styling all future resumes. The system will extract fonts, spacing, margins, 
          layout, and formatting specifications from this PDF using advanced visual analysis.
        </p>
      </div>

      <OpenAISettings 
        onApiKeySet={setOpenAIApiKey}
        currentApiKey={openAIApiKey}
      />

      <div className="upload-container">
        <div className="file-upload-area">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="file-input"
            id="pdf-upload"
            disabled={isAnalyzing}
          />
          <label htmlFor="pdf-upload" className="file-upload-label">
            <div className="upload-icon">📄</div>
            <div className="upload-text">
              {selectedFile ? (
                <>
                  <strong>{selectedFile.name}</strong>
                  <span className="file-size">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </>
              ) : (
                <>
                  <strong>Click to select PDF</strong>
                  <span>or drag and drop</span>
                </>
              )}
            </div>
          </label>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {selectedFile && (
          <div className="file-actions">
            <button 
              className="clear-button"
              onClick={handleClear}
              disabled={isAnalyzing}
            >
              Remove File
            </button>
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button
          className="analyze-button"
          onClick={handleSubmit}
          disabled={!selectedFile || !openAIApiKey || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing PDF...' : 'Analyze Reference Resume'}
        </button>
        {!openAIApiKey && (
          <p className="api-key-required-note">
            ⚠️ OpenAI API key is required to analyze resumes
          </p>
        )}
      </div>

      {isAnalyzing && (
        <div className="analyzing-indicator">
          <div className="progress-container">
            <div className="progress-header">
              <span className="progress-stage">{progressStage || 'Starting analysis...'}</span>
              <span className="progress-percentage">{progress}%</span>
            </div>
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReferenceInput

