import { useState, useEffect } from 'react'
import ResumeForm from './components/ResumeForm'
import ReferenceInput from './components/ReferenceInput'
import TemplateReview from './components/TemplateReview'
import { generatePDF } from './utils/pdfGenerator'
import { parsePDF } from './utils/pdfParser'
import { extractStylingSpecs, createReferenceTemplate } from './utils/stylingExtractor'
import { loadTemplate } from './utils/templateStorage'
import './App.css'

function App() {
  // App view state: 'landing' | 'reference-setup' | 'reference-review' | 'formatting'
  const [currentView, setCurrentView] = useState('landing')
  const [referenceTemplate, setReferenceTemplate] = useState(null)
  const [analyzedTemplate, setAnalyzedTemplate] = useState(null)
  
  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: '',
    skills: '',
    education: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)

  // Check for existing template on mount
  useEffect(() => {
    const savedTemplate = loadTemplate()
    if (savedTemplate) {
      setReferenceTemplate(savedTemplate)
      setCurrentView('formatting')
    } else {
      setCurrentView('landing')
    }
  }, [])

  const handleInputChange = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAnalyzeReference = async (pdfFile, onProgress, openAIApiKey) => {
    try {
      // Parse the PDF file with progress callback
      const parsed = await parsePDF(pdfFile, onProgress, openAIApiKey)
      if (!parsed.success || parsed.error) {
        alert(`Error parsing PDF: ${parsed.error || 'Unknown error'}`)
        return
      }

      // Extract styling specifications (PDF parser already includes this)
      if (onProgress) onProgress(100, 'Creating template...')
      const stylingSpecs = extractStylingSpecs(parsed)
      if (stylingSpecs.error) {
        alert(`Error extracting styling: ${stylingSpecs.error}`)
        return
      }

      // Create template object
      const template = createReferenceTemplate(parsed, stylingSpecs)
      console.log('Template created:', template)
      
      // Validate template before setting
      if (!template || !template.stylingSpecs) {
        throw new Error('Failed to create template: missing styling specifications')
      }
      
      setAnalyzedTemplate(template)
      setCurrentView('reference-review')
    } catch (error) {
      console.error('Error analyzing reference PDF:', error)
      alert(`Error analyzing reference PDF: ${error.message || 'Please make sure it is a valid PDF file.'}`)
    }
  }

  const handleConfirmTemplate = (template) => {
    setReferenceTemplate(template)
    setAnalyzedTemplate(null)
    setCurrentView('formatting')
    alert('Reference template saved successfully! You can now format new resumes.')
  }

  const handleCancelTemplate = () => {
    setAnalyzedTemplate(null)
    setCurrentView('reference-setup')
  }

  const handleExportPDF = async () => {
    setIsGenerating(true)
    try {
      await generatePDF(resumeData)
      alert('PDF exported successfully to output/resume.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please check the console.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStartReferenceSetup = () => {
    setCurrentView('reference-setup')
  }

  const handleStartFormatting = () => {
    if (referenceTemplate) {
      setCurrentView('formatting')
    } else {
      alert('Please set up a reference resume first')
      setCurrentView('reference-setup')
    }
  }

  // Landing page
  if (currentView === 'landing') {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Resume Formatting Tool</h1>
          <p>Format your resume to match a reference template perfectly</p>
        </header>
        <main className="app-main">
          <div className="landing-page">
            <div className="landing-content">
              <h2>Welcome to Resume Formatting Tool</h2>
              <p className="landing-description">
                This tool helps you format new resume content to match the exact styling 
                of a reference resume. Set up your reference resume once, then format 
                unlimited resumes with consistent styling.
              </p>
              
              <div className="landing-actions">
                {!referenceTemplate ? (
                  <button 
                    className="landing-button primary"
                    onClick={handleStartReferenceSetup}
                  >
                    Set Up Reference Resume
                  </button>
                ) : (
                  <>
                    <div className="template-status">
                      <p className="status-text">✓ Reference template loaded</p>
                      <p className="status-subtext">You can format new resumes or update the reference</p>
                    </div>
                    <div className="landing-buttons">
                      <button 
                        className="landing-button primary"
                        onClick={handleStartFormatting}
                      >
                        Format New Resume
                      </button>
                      <button 
                        className="landing-button secondary"
                        onClick={handleStartReferenceSetup}
                      >
                        Update Reference
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Reference setup view
  if (currentView === 'reference-setup') {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Resume Formatting Tool</h1>
          <p>Set up your reference resume template</p>
        </header>
        <main className="app-main">
          <ReferenceInput onAnalyze={handleAnalyzeReference} />
        </main>
      </div>
    )
  }

  // Reference review view
  if (currentView === 'reference-review') {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Resume Formatting Tool</h1>
          <p>Review extracted specifications</p>
        </header>
        <main className="app-main">
          <TemplateReview 
            template={analyzedTemplate}
            onConfirm={handleConfirmTemplate}
            onCancel={handleCancelTemplate}
          />
        </main>
      </div>
    )
  }

  // Formatting view (original functionality)
  return (
    <div className="app">
      <header className="app-header">
        <h1>Resume Formatting Tool</h1>
        <p>Format your resume content</p>
        {referenceTemplate && (
          <p className="template-indicator">
            Using reference template: {referenceTemplate.name}
          </p>
        )}
      </header>
      <main className="app-main">
        <div className="view-controls">
          <button 
            className="view-button"
            onClick={() => setCurrentView('landing')}
          >
            ← Back to Home
          </button>
          {referenceTemplate && (
            <button 
              className="view-button"
              onClick={handleStartReferenceSetup}
            >
              Update Reference
            </button>
          )}
        </div>
        <ResumeForm 
          resumeData={resumeData}
          onInputChange={handleInputChange}
        />
        <div className="export-section">
          <button 
            className="export-button"
            onClick={handleExportPDF}
            disabled={isGenerating || !resumeData.name}
          >
            {isGenerating ? 'Generating PDF...' : 'Export PDF'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default App


