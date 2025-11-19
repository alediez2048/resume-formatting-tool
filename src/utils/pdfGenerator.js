import React from 'react'
import { pdf } from '@react-pdf/renderer'
import ResumeDocument from '../components/ResumeDocument'

export const generatePDF = async (resumeData) => {
  const doc = React.createElement(ResumeDocument, { data: resumeData })
  const asPdf = pdf(doc)
  const blob = await asPdf.toBlob()
  
  // Trigger download in browser
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'resume.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

