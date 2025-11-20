import { useState } from 'react'
import './TemplateReview.css'
import { saveTemplate } from '../utils/templateStorage'

const TemplateReview = ({ template, onConfirm, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false)

  if (!template) {
    return null
  }

  const handleConfirm = async () => {
    setIsSaving(true)
    try {
      const result = saveTemplate(template)
      if (result.success) {
        onConfirm(template)
      } else {
        alert('Error saving template. Please try again.')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error saving template. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const specs = template.stylingSpecs || {}
  const contactInfo = template.parsedResume?.contactInfo || {}
  const sections = specs.sections || {}
  const fonts = specs.fonts || {}
  const layout = specs.layout || {}
  const bullets = specs.bullets || {}
  const constraints = specs.constraints || {}

  return (
    <div className="template-review">
      <div className="review-header">
        <h2>Step 2: Review Extracted Specifications</h2>
        <p className="instruction-text">
          Review the styling specifications extracted from your reference resume. 
          These will be applied to all future resumes you format.
        </p>
        {template.metadata?.sourceType === 'pdf' && (
          <p className="source-badge">
            ✓ Extracted from PDF - Font sizes, margins, and spacing measured from actual document
          </p>
        )}
      </div>

      <div className="review-content">
        {/* Contact Information */}
        <div className="spec-section">
          <h3>Contact Information</h3>
          <div className="spec-details">
            {contactInfo.name && (
              <div className="spec-item">
                <span className="spec-label">Name:</span>
                <span className="spec-value">{contactInfo.name}</span>
              </div>
            )}
            {contactInfo.email && (
              <div className="spec-item">
                <span className="spec-label">Email:</span>
                <span className="spec-value">{contactInfo.email}</span>
              </div>
            )}
            {contactInfo.phone && (
              <div className="spec-item">
                <span className="spec-label">Phone:</span>
                <span className="spec-value">{contactInfo.phone}</span>
              </div>
            )}
            {contactInfo.location && (
              <div className="spec-item">
                <span className="spec-label">Location:</span>
                <span className="spec-value">{contactInfo.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Font Specifications */}
        <div className="spec-section">
          <h3>Font Specifications</h3>
          <div className="spec-details">
            <div className="spec-item">
              <span className="spec-label">Name Font Size:</span>
              <span className="spec-value">{fonts.name?.size || 'N/A'}pt</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Section Title Size:</span>
              <span className="spec-value">{fonts.sectionTitle?.size || 'N/A'}pt ({fonts.sectionTitle?.transform || 'N/A'})</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Body Text Size:</span>
              <span className="spec-value">{fonts.body?.size || 'N/A'}pt</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Contact Info Size:</span>
              <span className="spec-value">{fonts.contact?.size || 'N/A'}pt</span>
            </div>
          </div>
        </div>

        {/* Layout Specifications */}
        <div className="spec-section">
          <h3>Layout Specifications</h3>
          <div className="spec-details">
            <div className="spec-item">
              <span className="spec-label">Margins:</span>
              <span className="spec-value">
                Top: {layout.margins?.top || 'N/A'}pt, 
                Bottom: {layout.margins?.bottom || 'N/A'}pt, 
                Left: {layout.margins?.left || 'N/A'}pt, 
                Right: {layout.margins?.right || 'N/A'}pt
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Section Spacing:</span>
              <span className="spec-value">{layout.sectionSpacing || 'N/A'}pt</span>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="spec-section">
          <h3>Detected Sections</h3>
          <div className="spec-details">
            <div className="spec-item">
              <span className="spec-label">Section Order:</span>
              <span className="spec-value">{sections.order?.join(' → ') || 'None detected'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Section Titles:</span>
              <span className="spec-value">{sections.titles?.join(', ') || 'None detected'}</span>
            </div>
          </div>
        </div>

        {/* Bullet Points */}
        <div className="spec-section">
          <h3>Bullet Point Style</h3>
          <div className="spec-details">
            <div className="spec-item">
              <span className="spec-label">Bullet Character:</span>
              <span className="spec-value">{bullets.style || '•'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Indentation:</span>
              <span className="spec-value">{bullets.indentation || 'N/A'}pt</span>
            </div>
          </div>
        </div>

        {/* Constraints */}
        <div className="spec-section">
          <h3>Constraints</h3>
          <div className="spec-details">
            <div className="spec-item">
              <span className="spec-label">One Page:</span>
              <span className="spec-value">{constraints.onePage ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="review-actions">
        <button
          className="cancel-button"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          className="confirm-button"
          onClick={handleConfirm}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Confirm & Save Template'}
        </button>
      </div>
    </div>
  )
}

export default TemplateReview

