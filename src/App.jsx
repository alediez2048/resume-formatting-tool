import { useState, useEffect } from 'react'
import ResumeForm from './components/ResumeForm'
import ReferenceInput from './components/ReferenceInput'
import TemplateReview from './components/TemplateReview'
import NewResumeInput from './components/NewResumeInput'
import ParsedContentReview from './components/ParsedContentReview'
import FormattedResumePreview from './components/FormattedResumePreview'
import CoverLetterInput from './components/CoverLetter/CoverLetterInput'
import CoverLetterPreview from './components/CoverLetter/CoverLetterPreview'
import { generatePDF } from './utils/pdfGenerator'
import { parsePDF } from './utils/pdfParser'
import { parseResumeContent } from './utils/contentParser'
import { applyStylingWithAI } from './utils/styleMatcher'
import { extractStylingSpecs, createReferenceTemplate } from './utils/stylingExtractor'
import { loadTemplate } from './utils/templateStorage'
import { generateCoverLetter } from './utils/coverLetterGenerator'
import './App.css'

function App() {
  // App view state: 'landing' | 'reference-setup' | 'reference-review' | 'formatting' | 'parsed-content-review' | 'formatted-preview' | 'cover-letter-input' | 'cover-letter-preview'
  const [currentView, setCurrentView] = useState('landing')
  const [referenceTemplate, setReferenceTemplate] = useState(null)
  const [analyzedTemplate, setAnalyzedTemplate] = useState(null)
  const [parsedContent, setParsedContent] = useState(null)
  const [styledContent, setStyledContent] = useState(null)
  const [isApplyingStyling, setIsApplyingStyling] = useState(false)
  const [targetJobDetails, setTargetJobDetails] = useState(null) // Store target job details for filename
  
  // Cover Letter State
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)
  const [coverLetterData, setCoverLetterData] = useState(null)

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
      // Stay on landing, user can choose what to do
      setCurrentView('landing')
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
    if (!openAIApiKey || !openAIApiKey.trim()) {
      alert('OpenAI API key is required. Please configure it in the settings above.')
      return
    }

    try {
      // Parse the PDF file with progress callback (OpenAI is now required)
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
    setCurrentView('landing')
    alert('Reference template saved successfully! You can now format new resumes or create a cover letter.')
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
      setParsedContent(null) // Reset parsed content
      setTargetJobDetails(null) // Reset job details
    } else {
      alert('Please set up a reference resume first')
      setCurrentView('reference-setup')
    }
  }

  const handleStartCoverLetter = () => {
    setCurrentView('cover-letter-input')
  }

  const handleParseContent = async (resumeText, jobDetails) => {
    try {
      // Store job details if provided
      if (jobDetails) {
        setTargetJobDetails(jobDetails)
      }

      // Get OpenAI API key for AI-powered parsing
      const openAIApiKey = localStorage.getItem('openai_api_key') || ''
      
      // parseResumeContent is now async and accepts OpenAI API key
      const parsed = await parseResumeContent(resumeText, openAIApiKey)
      if (parsed.error) {
        alert(`Error parsing resume: ${parsed.error}`)
        return
      }
      setParsedContent(parsed)
      setCurrentView('parsed-content-review')
    } catch (error) {
      console.error('Error parsing resume content:', error)
      alert(`Error parsing resume content: ${error.message || 'Please check the console.'}`)
    }
  }

  const handleConfirmParsedContent = async (content) => {
    setParsedContent(content)
    
    if (!referenceTemplate) {
      alert('Reference template is required. Please set up a reference resume first.')
      setCurrentView('reference-setup')
      return
    }

    const openAIApiKey = localStorage.getItem('openai_api_key')
    if (!openAIApiKey) {
      alert('OpenAI API key is required for styling. Please configure it first.')
      setCurrentView('reference-setup')
      return
    }

    setIsApplyingStyling(true)
    setCurrentView('formatted-preview')

    try {
      // Apply styling using AI (this should NOT modify content, only add styling)
      const result = await applyStylingWithAI(content, referenceTemplate, openAIApiKey)
      
      if (result.success) {
        // Ensure we're using the original content, not AI-modified content
        const styledContent = {
          ...content, // Use original content
          styling: referenceTemplate.stylingSpecs // Add styling specs
        }
        setStyledContent(styledContent)
      } else {
        // Use original content with reference styling
        setStyledContent({
          ...content,
          styling: referenceTemplate.stylingSpecs
        })
      }
    } catch (error) {
      console.error('Error applying styling:', error)
      // Use original content with reference styling
      setStyledContent({
        ...content,
        styling: referenceTemplate.stylingSpecs
      })
    } finally {
      setIsApplyingStyling(false)
    }
  }

  const handleEditParsedContent = () => {
    setCurrentView('formatting')
  }

  const handleGenerateCoverLetter = async (inputData) => {
    const openAIApiKey = localStorage.getItem('openai_api_key')
    if (!openAIApiKey) {
      alert('OpenAI API key is required. Please configure it first.')
      return
    }

    setIsGeneratingCoverLetter(true)
    try {
      const result = await generateCoverLetter({
        resume: inputData.resumeText,
        jobDescription: inputData.jobDescription,
        companyDetails: inputData.companyDetails,
        apiKey: openAIApiKey
      })

      setCoverLetterData({
        ...result,
        companyDetails: inputData.companyDetails,
        candidateName: result.extractedCandidateName, // Fallbacks if needed handled in component
        candidateContact: result.extractedCandidateContact
      })
      setCurrentView('cover-letter-preview')
    } catch (error) {
      console.error('Error generating cover letter:', error)
      alert('Failed to generate cover letter. Please check your API key and try again.')
    } finally {
      setIsGeneratingCoverLetter(false)
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
                  <div className="landing-buttons-container">
                    <button 
                      className="landing-button primary"
                      onClick={handleStartReferenceSetup}
                    >
                      Set Up Reference Resume
                    </button>
                    <button 
                      className="landing-button secondary"
                      onClick={handleStartCoverLetter}
                      style={{ marginLeft: '1rem', backgroundColor: '#2b6cb0', color: 'white' }}
                    >
                      Create Cover Letter
                    </button>
                  </div>
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
                        onClick={handleStartCoverLetter}
                        style={{ marginLeft: '1rem', backgroundColor: '#2b6cb0', color: 'white' }}
                      >
                        Create Cover Letter
                      </button>
                      <button 
                        className="landing-button outline"
                        onClick={handleStartReferenceSetup}
                        style={{ marginLeft: '1rem' }}
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

  // Formatting view - New resume input
  if (currentView === 'formatting') {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Resume Formatting Tool</h1>
          <p>Format your new resume content</p>
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
          <NewResumeInput onParse={handleParseContent} />
        </main>
      </div>
    )
  }

  // Parsed content review view
  if (currentView === 'parsed-content-review') {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Resume Formatting Tool</h1>
          <p>Review parsed content</p>
        </header>
        <main className="app-main">
          <ParsedContentReview
            parsedContent={parsedContent}
            onConfirm={handleConfirmParsedContent}
            onEdit={handleEditParsedContent}
          />
        </main>
      </div>
    )
  }

  // Formatted preview view
  if (currentView === 'formatted-preview') {
    const openAIApiKey = localStorage.getItem('openai_api_key') || ''
    
    return (
      <div className="app">
        <header className="app-header">
          <h1>Resume Formatting Tool</h1>
          <p>Preview formatted resume</p>
        </header>
        <main className="app-main">
          {isApplyingStyling ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="loading-spinner">
                <p>Applying reference styling with AI...</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                  This may take a few moments
                </p>
              </div>
            </div>
          ) : styledContent ? (
            <FormattedResumePreview
              styledContent={styledContent}
              referenceTemplate={referenceTemplate}
              openAIApiKey={openAIApiKey}
              onBack={() => setCurrentView('parsed-content-review')}
              targetJobDetails={targetJobDetails}
            />
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Loading preview...</p>
            </div>
          )}
        </main>
      </div>
    )
  }

  // Cover Letter Input View
  if (currentView === 'cover-letter-input') {
    const openAIApiKey = localStorage.getItem('openai_api_key')
    return (
      <div className="app">
        <header className="app-header">
          <h1>Cover Letter Generator</h1>
          <p>Create a custom tailored cover letter</p>
        </header>
        <main className="app-main">
          <div className="view-controls" style={{ marginBottom: '1rem' }}>
            <button className="view-button" onClick={() => setCurrentView('landing')}>
              ← Back to Home
            </button>
          </div>
          <CoverLetterInput 
            onGenerate={handleGenerateCoverLetter} 
            isGenerating={isGeneratingCoverLetter}
            openAIApiKey={openAIApiKey}
          />
        </main>
      </div>
    )
  }

  // Cover Letter Preview View
  if (currentView === 'cover-letter-preview') {
    return (
      <div className="app">
        <CoverLetterPreview 
          generatedData={coverLetterData}
          onBack={() => setCurrentView('cover-letter-input')}
        />
      </div>
    )
  }

  // Fallback (should not reach here)
  return null
}

export default App
