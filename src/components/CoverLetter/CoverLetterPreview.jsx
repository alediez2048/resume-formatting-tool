import { useState, useEffect } from 'react'
import { pdf } from '@react-pdf/renderer'
import CoverLetterDocument from '../CoverLetterDocument'
import { adjustCoverLetterStyling } from '../../utils/coverLetterOnePageHandler'
import './CoverLetterPreview.css'

const CoverLetterPreview = ({ generatedData, onBack }) => {
  const [editableContent, setEditableContent] = useState(generatedData.content)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [styling, setStyling] = useState(null) // Stores font/spacing overrides

  // Update preview when content or styling changes
  useEffect(() => {
    const updatePreview = async () => {
      setIsUpdating(true)
      try {
        const dataToRender = {
          ...generatedData,
          content: editableContent
        }

        const blob = await pdf(<CoverLetterDocument data={dataToRender} styling={styling} />).toBlob()
        
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
        
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
      } catch (error) {
        console.error('Error updating preview:', error)
      } finally {
        setIsUpdating(false)
      }
    }

    // Debounce update to avoid flashing
    const timeoutId = setTimeout(updatePreview, 500)
    return () => clearTimeout(timeoutId)
  }, [editableContent, generatedData, styling])

  const handleFitToPage = () => {
    // Apply font scaling logic
    const currentStyling = styling || {
      fontSize: 11,
      lineHeight: 1.5,
      paragraphSpacing: 10,
      margins: { top: 40, bottom: 40, left: 40, right: 40 }
    }
    
    const newStyling = adjustCoverLetterStyling(currentStyling)
    setStyling(newStyling)
  }

  const handleDownload = async () => {
    try {
      const dataToRender = {
        ...generatedData,
        content: editableContent
      }
      
      const filename = `${generatedData.companyDetails.companyName.replace(/[^a-z0-9]/gi, '_')}_${generatedData.companyDetails.jobTitle.replace(/[^a-z0-9]/gi, '_')}_Cover_Letter.pdf`
      
      const blob = await pdf(<CoverLetterDocument data={dataToRender} styling={styling} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF')
    }
  }

  return (
    <div className="cover-letter-preview-container">
      <header className="preview-header">
        <div className="header-left">
          <button className="action-button edit" onClick={onBack}>
            ← Back to Edit Inputs
          </button>
          <h2 style={{ marginLeft: '1rem', display: 'inline-block' }}>
            Review Cover Letter
          </h2>
        </div>
        <div className="preview-actions">
          <button 
            className="action-button edit" 
            onClick={handleFitToPage}
            title="Reduces font size and spacing to fit one page"
            style={{ marginRight: '0.5rem', backgroundColor: '#667eea', color: 'white' }}
          >
            Fit to One Page
          </button>
          <button className="action-button download" onClick={handleDownload}>
            Download PDF
          </button>
        </div>
      </header>

      <div className="preview-content">
        {/* Left Side: Editor */}
        <div className="editor-pane">
          <h3>Edit Content</h3>
          <textarea
            className="content-textarea"
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            spellCheck="false"
          />
          <div className="regenerate-section">
            <p style={{ fontSize: '0.9rem', color: '#718096', fontStyle: 'italic' }}>
              Edits here update the PDF automatically.
            </p>
          </div>
        </div>

        {/* Right Side: PDF Preview */}
        <div className="pdf-pane">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="pdf-viewer"
              title="Cover Letter Preview"
            />
          ) : (
            <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
              Generating Preview...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CoverLetterPreview
