import { useState } from 'react'
import './ParsedContentReview.css'

const ParsedContentReview = ({ parsedContent, onConfirm, onEdit }) => {
  const [editedContent, setEditedContent] = useState(parsedContent)

  if (!parsedContent || !parsedContent.success) {
    return null
  }

  const handleFieldChange = (section, field, value, index = null) => {
    setEditedContent(prev => {
      const updated = { ...prev }
      
      if (index !== null) {
        // Update array item
        updated[section] = [...updated[section]]
        updated[section][index] = {
          ...updated[section][index],
          [field]: value
        }
      } else {
        // Update single field
        updated[section] = value
      }
      
      return updated
    })
  }

  const handleBulletChange = (expIndex, bulletIndex, value) => {
    setEditedContent(prev => {
      const updated = { ...prev }
      updated.workExperience = [...updated.workExperience]
      updated.workExperience[expIndex] = {
        ...updated.workExperience[expIndex],
        bullets: [...updated.workExperience[expIndex].bullets]
      }
      updated.workExperience[expIndex].bullets[bulletIndex] = value
      return updated
    })
  }

  const handleAddBullet = (expIndex) => {
    setEditedContent(prev => {
      const updated = { ...prev }
      updated.workExperience = [...updated.workExperience]
      updated.workExperience[expIndex] = {
        ...updated.workExperience[expIndex],
        bullets: [...updated.workExperience[expIndex].bullets, '']
      }
      return updated
    })
  }

  const handleRemoveBullet = (expIndex, bulletIndex) => {
    setEditedContent(prev => {
      const updated = { ...prev }
      updated.workExperience = [...updated.workExperience]
      updated.workExperience[expIndex] = {
        ...updated.workExperience[expIndex],
        bullets: updated.workExperience[expIndex].bullets.filter((_, i) => i !== bulletIndex)
      }
      return updated
    })
  }

  const handleConfirm = () => {
    onConfirm(editedContent)
  }

  return (
    <div className="parsed-content-review">
      <div className="review-header">
        <h2>Review Parsed Content</h2>
        <p className="instruction-text">
          Review and edit the parsed content below. Make any corrections needed, then proceed to format 
          this content using your reference resume's styling.
        </p>
      </div>

      <div className="review-content">
        {/* Contact Information */}
        <div className="content-section">
          <h3>Contact Information</h3>
          <div className="form-fields">
            <div className="form-field">
              <label>Name</label>
              <input
                type="text"
                value={editedContent.contactInfo?.name || ''}
                onChange={(e) => handleFieldChange('contactInfo', 'name', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                value={editedContent.contactInfo?.email || ''}
                onChange={(e) => handleFieldChange('contactInfo', 'email', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input
                type="text"
                value={editedContent.contactInfo?.phone || ''}
                onChange={(e) => handleFieldChange('contactInfo', 'phone', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Location</label>
              <input
                type="text"
                value={editedContent.contactInfo?.location || ''}
                onChange={(e) => handleFieldChange('contactInfo', 'location', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Website</label>
              <input
                type="url"
                value={editedContent.contactInfo?.website || ''}
                onChange={(e) => handleFieldChange('contactInfo', 'website', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Personal Statement */}
        {editedContent.personalStatement && (
          <div className="content-section">
            <h3>Personal Statement</h3>
            <textarea
              value={editedContent.personalStatement}
              onChange={(e) => handleFieldChange('personalStatement', null, e.target.value)}
              rows={4}
              className="content-textarea"
            />
          </div>
        )}

        {/* Work Experience */}
        {editedContent.workExperience && editedContent.workExperience.length > 0 && (
          <div className="content-section">
            <h3>Work Experience</h3>
            {editedContent.workExperience.map((exp, expIndex) => (
              <div key={expIndex} className="experience-item">
                <div className="form-fields">
                  <div className="form-field">
                    <label>Job Title</label>
                    <input
                      type="text"
                      value={exp.title || ''}
                      onChange={(e) => handleFieldChange('workExperience', 'title', e.target.value, expIndex)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Company</label>
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => handleFieldChange('workExperience', 'company', e.target.value, expIndex)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Date</label>
                    <input
                      type="text"
                      value={exp.date || ''}
                      onChange={(e) => handleFieldChange('workExperience', 'date', e.target.value, expIndex)}
                      placeholder="2020 - Present"
                    />
                  </div>
                </div>
                <div className="bullets-section">
                  <label>Bullet Points</label>
                  {exp.bullets && exp.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="bullet-item">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleBulletChange(expIndex, bulletIndex, e.target.value)}
                        className="bullet-input"
                      />
                      <button
                        className="remove-bullet-button"
                        onClick={() => handleRemoveBullet(expIndex, bulletIndex)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    className="add-bullet-button"
                    onClick={() => handleAddBullet(expIndex)}
                  >
                    + Add Bullet Point
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {editedContent.skills && (
          <div className="content-section">
            <h3>Skills</h3>
            <textarea
              value={editedContent.skills}
              onChange={(e) => handleFieldChange('skills', null, e.target.value)}
              rows={editedContent.skills.includes('\n') ? 8 : 3}
              className="content-textarea"
              placeholder="JavaScript, React, Node.js, Python...&#10;Or categorized:&#10;LLM & AI Tools: OpenAI API, Gemini...&#10;Creative Tools: Final Cut Pro, After Effects..."
            />
            <p className="skills-hint">
              {editedContent.skills.includes(':') 
                ? 'Categorized skills detected. Each line can be a category: "Category: skill1, skill2"' 
                : 'Enter skills as comma-separated or one per line. For categories, use format: "Category: skills"'}
            </p>
          </div>
        )}

        {/* Education */}
        {editedContent.education && editedContent.education.length > 0 && (
          <div className="content-section">
            <h3>Education</h3>
            {editedContent.education.map((edu, eduIndex) => (
              <div key={eduIndex} className="education-item">
                <div className="form-fields">
                  <div className="form-field">
                    <label>School</label>
                    <input
                      type="text"
                      value={edu.school || ''}
                      onChange={(e) => handleFieldChange('education', 'school', e.target.value, eduIndex)}
                      placeholder="University Name"
                    />
                  </div>
                  <div className="form-field">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => handleFieldChange('education', 'degree', e.target.value, eduIndex)}
                      placeholder="B.S. Computer Science"
                    />
                  </div>
                  <div className="form-field">
                    <label>Date</label>
                    <input
                      type="text"
                      value={edu.date || ''}
                      onChange={(e) => handleFieldChange('education', 'date', e.target.value, eduIndex)}
                      placeholder="2015 - 2019"
                    />
                  </div>
                  <div className="form-field">
                    <label>GPA</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) => handleFieldChange('education', 'gpa', e.target.value, eduIndex)}
                      placeholder="3.8"
                    />
                  </div>
                  {edu.certificate && (
                    <div className="form-field">
                      <label>Certificate</label>
                      <input
                        type="text"
                        value={edu.certificate || ''}
                        onChange={(e) => handleFieldChange('education', 'certificate', e.target.value, eduIndex)}
                        placeholder="Certificate Name"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="review-actions">
        <button
          className="edit-button"
          onClick={onEdit}
        >
          ← Back to Edit
        </button>
        <button
          className="confirm-button"
          onClick={handleConfirm}
        >
          Confirm & Format Resume
        </button>
      </div>
    </div>
  )
}

export default ParsedContentReview

