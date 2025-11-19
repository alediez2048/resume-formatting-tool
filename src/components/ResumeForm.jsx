import './ResumeForm.css'

const ResumeForm = ({ resumeData, onInputChange }) => {
  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'John Doe', required: true },
    { key: 'email', label: 'Email', placeholder: 'john.doe@email.com' },
    { key: 'phone', label: 'Phone', placeholder: '+1 (555) 123-4567' },
    { key: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
    { 
      key: 'summary', 
      label: 'Professional Summary', 
      placeholder: 'Experienced software engineer with 5+ years...',
      textarea: true,
      rows: 4
    },
    { 
      key: 'experience', 
      label: 'Work Experience', 
      placeholder: 'Senior Software Engineer | Company Name | 2020 - Present\n• Led development of...',
      textarea: true,
      rows: 8
    },
    { 
      key: 'skills', 
      label: 'Skills', 
      placeholder: 'JavaScript, React, Node.js, Python, AWS...',
      textarea: true,
      rows: 3
    },
    { 
      key: 'education', 
      label: 'Education', 
      placeholder: 'Bachelor of Science in Computer Science\nUniversity Name | 2015 - 2019',
      textarea: true,
      rows: 4
    }
  ]

  return (
    <div className="resume-form">
      <div className="form-grid">
        {fields.map(field => (
          <div key={field.key} className="form-field">
            <label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            {field.textarea ? (
              <textarea
                id={field.key}
                value={resumeData[field.key]}
                onChange={(e) => onInputChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows}
                className="form-input"
              />
            ) : (
              <input
                type="text"
                id={field.key}
                value={resumeData[field.key]}
                onChange={(e) => onInputChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="form-input"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResumeForm

