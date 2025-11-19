import { useState } from 'react'
import ResumeForm from './components/ResumeForm'
import { generatePDF } from './utils/pdfGenerator'
import './App.css'

function App() {
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

  const handleInputChange = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      [field]: value
    }))
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Resume Formatting Tool</h1>
        <p>Paste your resume content and export a perfectly formatted PDF</p>
      </header>
      <main className="app-main">
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

