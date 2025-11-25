import { useState, useEffect } from 'react'
import { pdf } from '@react-pdf/renderer'
import ResumeDocument from './ResumeDocument'
import { ensureOnePage, adjustStylingMinimally, getCompactLayoutPreset } from '../utils/onePageHandler'
import { generatePDF } from '../utils/pdfGenerator'
import './FormattedResumePreview.css'

const FormattedResumePreview = ({ styledContent, referenceTemplate, openAIApiKey, onExport, onBack, targetJobDetails }) => {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedContent, setOptimizedContent] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [adjustedStyling, setAdjustedStyling] = useState(null)

  // Initialize with styledContent immediately when component mounts or content changes
  useEffect(() => {
    if (styledContent && referenceTemplate) {
      console.log('📝 Initializing preview with styledContent')
      // Set optimized content immediately so preview can generate
      setOptimizedContent(styledContent)
      
      // Default to standard styling initially
      if (referenceTemplate?.stylingSpecs) {
        setAdjustedStyling(referenceTemplate.stylingSpecs)
      }
    }
  }, [styledContent, referenceTemplate])

  // Automatically optimize for one page in background (non-blocking) - DEPRECATED, user manual control preferred
  // Leaving basic content check but removing auto-optimization call to avoid overriding user choice immediately
  useEffect(() => {
    if (styledContent && referenceTemplate && optimizedContent) {
        // No-op: waiting for user to click "Fit to One Page"
    }
  }, [styledContent, referenceTemplate])

  // Generate preview when optimizedContent, referenceTemplate, or adjustedStyling changes
  useEffect(() => {
    if (optimizedContent && referenceTemplate) {
      console.log('🔄 Generating preview...')
      generatePreview()
    }
  }, [optimizedContent, referenceTemplate, adjustedStyling])

  const generatePreview = async () => {
    if (!optimizedContent) {
      setError('No content available for preview')
      return
    }

    if (!referenceTemplate || !referenceTemplate.stylingSpecs) {
      setError('Reference template styling is missing')
      return
    }

    setError(null)
    setIsGeneratingPreview(true)
    
    try {
      const dataToRender = {
        contactInfo: optimizedContent.contactInfo || {},
        personalStatement: optimizedContent.personalStatement || null, 
        workExperience: optimizedContent.workExperience || [],
        skills: optimizedContent.skills || '',
        education: optimizedContent.education || []
      }
      
      // Use adjustedStyling if available (e.g., after "Fit to One Page" is clicked), else default to template
      const stylingToUse = adjustedStyling || referenceTemplate.stylingSpecs

      console.log('📄 Rendering with Styling:', stylingToUse.layout?.margins)

      const blob = await pdf(
        <ResumeDocument 
          data={dataToRender} 
          stylingSpecs={stylingToUse}
        />
      ).toBlob()
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (error) {
      console.error('Error generating preview:', error)
      setError(`Error generating preview: ${error.message}`)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const handleFitOnePage = async () => {
    setIsOptimizing(true)
    setError(null)

    try {
        // Apply the robust Compact Preset directly
        const compactStyling = getCompactLayoutPreset(referenceTemplate.stylingSpecs)
        
        // Update state to trigger re-render
        setAdjustedStyling(compactStyling)
        
        alert('Compact layout applied! Font sizes and spacing have been optimized to fit one page.')
    } catch (error) {
      console.error('Error optimizing content:', error)
      setError('Error optimizing content. Please try again.')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleExport = async () => {
    try {
      const stylingToUse = adjustedStyling || referenceTemplate?.stylingSpecs
      
      let filename = 'resume.pdf'
      if (targetJobDetails && targetJobDetails.companyName) {
        const company = targetJobDetails.companyName.replace(/[^a-z0-9]/gi, '_')
        const title = targetJobDetails.jobTitle ? targetJobDetails.jobTitle.replace(/[^a-z0-9]/gi, '_') : ''
        filename = `${company}_${title}_Resume.pdf`.replace(/_+/g, '_')
      }
      
      const blob = await pdf(
        <ResumeDocument 
          data={{
            contactInfo: optimizedContent.contactInfo || {},
            personalStatement: optimizedContent.personalStatement || null,
            workExperience: optimizedContent.workExperience || [],
            skills: optimizedContent.skills || '',
            education: optimizedContent.education || []
          }} 
          stylingSpecs={stylingToUse}
        />
      ).toBlob()
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error exporting PDF. Please check the console.')
    }
  }

  return (
    <div className="formatted-preview">
      <div className="preview-header">
        <h2>Formatted Resume Preview</h2>
        <p className="instruction-text">
          Review your formatted resume below. Use the "Fit to One Page" button to automatically adjust fonts and spacing.
        </p>
        {isOptimizing && (
          <p className="optimizing-note" style={{ color: '#667eea', fontWeight: '600', marginTop: '0.5rem' }}>
            ⚙️ Optimizing layout...
          </p>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={generatePreview}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry Preview
          </button>
        </div>
      )}

      <div className="preview-controls">
        <button
          className="control-button optimize-button"
          onClick={handleFitOnePage}
          disabled={isOptimizing}
        >
          {isOptimizing ? 'Adjusting...' : 'Fit to One Page'}
        </button>
        <button
          className="control-button export-button"
          onClick={handleExport}
        >
          Export PDF
        </button>
      </div>

      <div className="preview-container">
        {isGeneratingPreview ? (
          <div className="preview-loading">
            <p>Generating preview...</p>
          </div>
        ) : previewUrl ? (
          <iframe
            src={previewUrl}
            className="preview-iframe"
            title="Resume Preview"
          />
        ) : (
          <div className="preview-loading">
            <p>No preview available</p>
          </div>
        )}
      </div>

      <div className="preview-actions">
        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to Edit
        </button>
      </div>
    </div>
  )
}

export default FormattedResumePreview
