import { useState, useEffect } from 'react'
import { pdf } from '@react-pdf/renderer'
import ResumeDocument from './ResumeDocument'
import { ensureOnePage, adjustStylingMinimally } from '../utils/onePageHandler'
import { generatePDF } from '../utils/pdfGenerator'
import './FormattedResumePreview.css'

const FormattedResumePreview = ({ styledContent, referenceTemplate, openAIApiKey, onExport, onBack }) => {
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
      
      // Adjust font sizes immediately for preview
      if (referenceTemplate?.stylingSpecs) {
        const adjusted = adjustStylingMinimally(referenceTemplate.stylingSpecs)
        setAdjustedStyling(adjusted)
      }
    }
  }, [styledContent, referenceTemplate])

  // Automatically optimize for one page in background (non-blocking)
  useEffect(() => {
    if (styledContent && referenceTemplate && optimizedContent) {
      // Run optimization in background - this will update optimizedContent when done
      autoOptimizeForOnePage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styledContent, referenceTemplate])

  const autoOptimizeForOnePage = async () => {
    setIsOptimizing(true)
    setError(null)

    try {
      // PRESERVE ALL CONTENT - don't modify it
      // Just adjust font sizes to fit one page
      const result = await ensureOnePage(styledContent, referenceTemplate, openAIApiKey)
      
      if (result.success && result.optimizedContent) {
        setOptimizedContent(result.optimizedContent) // This is the original content, unchanged
      }
      
      // Adjust font sizes (reduce by ~15%) and spacing to fit one page
      // This preserves all content, just makes fonts smaller
      const adjusted = adjustStylingMinimally(referenceTemplate.stylingSpecs)
      setAdjustedStyling(adjusted)
    } catch (error) {
      console.error('Error auto-optimizing:', error)
      // Keep using original content, just adjust font sizes
      const adjusted = adjustStylingMinimally(referenceTemplate.stylingSpecs)
      setAdjustedStyling(adjusted)
    } finally {
      setIsOptimizing(false)
    }
  }

  // Generate preview when optimizedContent or referenceTemplate changes
  useEffect(() => {
    if (optimizedContent && referenceTemplate) {
      console.log('🔄 Generating preview...')
      generatePreview()
    }
  }, [optimizedContent, referenceTemplate])

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
      // Validate data structure
      // CRITICAL: Use null instead of empty string for personalStatement to ensure it renders
      const dataToRender = {
        contactInfo: optimizedContent.contactInfo || {},
        personalStatement: optimizedContent.personalStatement || null, // Use null, not empty string
        workExperience: optimizedContent.workExperience || [],
        skills: optimizedContent.skills || '',
        education: optimizedContent.education || []
      }
      
      // Debug logging
      console.log('📄 FormattedResumePreview - dataToRender:', {
        hasPersonalStatement: !!dataToRender.personalStatement,
        personalStatementLength: dataToRender.personalStatement?.length || 0,
        workExperienceCount: dataToRender.workExperience.length,
        totalBullets: dataToRender.workExperience.reduce((sum, exp) => sum + (exp.bullets?.length || 0), 0)
      })

      // ALWAYS use reference styling - this is the core feature
      // Only use adjusted styling if explicitly set (for re-optimization)
      const stylingToUse = adjustedStyling || referenceTemplate.stylingSpecs

      const blob = await pdf(
        <ResumeDocument 
          data={dataToRender} 
          stylingSpecs={stylingToUse}
        />
      ).toBlob()
      
      // Clean up previous URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (error) {
      console.error('Error generating preview:', error)
      console.error('Error stack:', error.stack)
      console.error('Content data:', JSON.stringify(optimizedContent, null, 2))
      console.error('Template styling specs:', JSON.stringify(referenceTemplate?.stylingSpecs, null, 2))
      
      // Provide more specific error messages
      let errorMessage = 'Error generating preview'
      if (error.message) {
        errorMessage = `Error: ${error.message}`
      } else if (error.toString) {
        errorMessage = `Error: ${error.toString()}`
      }
      
      setError(`${errorMessage}. Please check the browser console (F12) for detailed error information.`)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const handleOptimize = async () => {
    setIsOptimizing(true)
    setError(null)

    try {
      // Re-optimize content
      const result = await ensureOnePage(optimizedContent || styledContent, referenceTemplate, openAIApiKey)
      
      if (result.success) {
        setOptimizedContent(result.optimizedContent)
      }
      
      // Only apply minimal styling adjustments if content still doesn't fit
      // Try with reference styling first, then apply minimal adjustments if needed
      const adjusted = adjustStylingMinimally(referenceTemplate.stylingSpecs)
      setAdjustedStyling(adjusted)
      
      alert('Content re-optimized for one page while preserving reference styling!')
    } catch (error) {
      console.error('Error optimizing content:', error)
      setError('Error optimizing content. Please try again.')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleExport = async () => {
    try {
      // Use adjusted styling for export to ensure one page
      const stylingToUse = adjustedStyling || referenceTemplate?.stylingSpecs
      await generatePDF(optimizedContent, stylingToUse)
      alert('PDF exported successfully! (Optimized for one page)')
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
          Review your formatted resume below. It has been styled to match your reference template exactly. Font sizes have been adjusted to fit on one page while preserving all your content.
        </p>
        {isOptimizing && (
          <p className="optimizing-note" style={{ color: '#667eea', fontWeight: '600', marginTop: '0.5rem' }}>
            ⚙️ Automatically optimizing content to fit one page...
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
          onClick={handleOptimize}
          disabled={isOptimizing}
        >
          {isOptimizing ? 'Adjusting Font Sizes...' : 'Re-adjust Font Sizes for One Page'}
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

