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
              <span className="spec-label">Name:</span>
              <span className="spec-value">
                {fonts.name?.size || 'N/A'}pt, {fonts.name?.weight || 'N/A'}, {fonts.name?.style || 'normal'}, {fonts.name?.family || 'N/A'}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Section Titles:</span>
              <span className="spec-value">
                {fonts.sectionTitle?.size || 'N/A'}pt, {fonts.sectionTitle?.weight || 'N/A'}, {fonts.sectionTitle?.style || 'normal'}, {fonts.sectionTitle?.transform || 'N/A'}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Subtitles:</span>
              <span className="spec-value">
                {fonts.subtitle?.size || 'N/A'}pt, {fonts.subtitle?.weight || 'N/A'}, {fonts.subtitle?.style || 'normal'}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Company Names:</span>
              <span className="spec-value">
                {fonts.companyName?.size || 'N/A'}pt, {fonts.companyName?.weight || 'N/A'}, {fonts.companyName?.style || 'normal'}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Role Titles:</span>
              <span className="spec-value">
                {fonts.roleTitle?.size || 'N/A'}pt, {fonts.roleTitle?.weight || 'N/A'}, {fonts.roleTitle?.style || 'normal'}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Dates:</span>
              <span className="spec-value">
                {fonts.date?.size || 'N/A'}pt, {fonts.date?.weight || 'N/A'}, {fonts.date?.style || 'normal'}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Body Text:</span>
              <span className="spec-value">
                {fonts.body?.size || 'N/A'}pt, {fonts.body?.weight || 'N/A'}, {fonts.body?.style || 'normal'}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Bullet Text:</span>
              <span className="spec-value">
                {fonts.bulletText?.size || 'N/A'}pt, {fonts.bulletText?.weight || 'N/A'}, {fonts.bulletText?.style || 'normal'}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Contact Info:</span>
              <span className="spec-value">
                {fonts.contact?.size || 'N/A'}pt, {fonts.contact?.weight || 'N/A'}, {fonts.contact?.style || 'normal'}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Skills:</span>
              <span className="spec-value">
                {fonts.skills?.size || 'N/A'}pt, {fonts.skills?.weight || 'N/A'}, {fonts.skills?.style || 'normal'}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Education:</span>
              <span className="spec-value">
                {fonts.education?.size || 'N/A'}pt, {fonts.education?.weight || 'N/A'}, {fonts.education?.style || 'normal'}
              </span>
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
            <div className="spec-item">
              <span className="spec-label">Line Spacing:</span>
              <span className="spec-value">{bullets.lineSpacing || 'N/A'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Character Spacing:</span>
              <span className="spec-value">{bullets.characterSpacing || 'N/A'}pt</span>
            </div>
          </div>
        </div>

        {/* Links */}
        {specs.links && (
          <div className="spec-section">
            <h3>Links & URLs</h3>
            <div className="spec-details">
              <div className="spec-item">
                <span className="spec-label">Links Found:</span>
                <span className="spec-value">{specs.links.links?.length || 0}</span>
              </div>
              {specs.links.links && specs.links.links.length > 0 && (
                <div className="spec-item">
                  <span className="spec-label">URLs:</span>
                  <span className="spec-value">
                    {specs.links.links.map((link, idx) => (
                      <span key={idx} style={{ display: 'block', marginTop: '0.25rem' }}>
                        {link.url} {link.isClickable ? '(clickable)' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              )}
              <div className="spec-item">
                <span className="spec-label">Link Formatting:</span>
                <span className="spec-value">
                  Color: {specs.links.defaultFormatting?.color || 'N/A'}, 
                  Underline: {specs.links.defaultFormatting?.underline ? 'Yes' : 'No'}, 
                  Clickable: {specs.links.defaultFormatting?.isClickable ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Text Transforms */}
        {specs.transforms && (
          <div className="spec-section">
            <h3>Text Transforms</h3>
            <div className="spec-details">
              <div className="spec-item">
                <span className="spec-label">Section Titles:</span>
                <span className="spec-value">{specs.transforms.sectionTitle || 'none'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Name:</span>
                <span className="spec-value">{specs.transforms.name || 'none'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Company Names:</span>
                <span className="spec-value">{specs.transforms.companyName || 'none'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Role Titles:</span>
                <span className="spec-value">{specs.transforms.roleTitle || 'none'}</span>
              </div>
            </div>
          </div>
        )}

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

