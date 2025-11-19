import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Professional resume styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #667eea',
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    fontSize: 10,
    color: '#555',
  },
  contactItem: {
    marginRight: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: 5,
  },
  summary: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#333',
    textAlign: 'justify',
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  company: {
    fontSize: 11,
    color: '#555',
    fontStyle: 'italic',
  },
  date: {
    fontSize: 10,
    color: '#777',
  },
  description: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#444',
    marginTop: 4,
    paddingLeft: 10,
  },
  bulletPoint: {
    marginBottom: 3,
  },
  skills: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#333',
  },
  education: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333',
  },
  educationItem: {
    marginBottom: 8,
  },
  degree: {
    fontWeight: 'bold',
    fontSize: 11,
    color: '#1a1a1a',
  },
  school: {
    fontSize: 10,
    color: '#555',
  },
})

const ResumeDocument = ({ data }) => {
  // Helper function to parse experience text into structured format
  const parseExperience = (text) => {
    if (!text) return []
    const entries = text.split('\n\n').filter(entry => entry.trim())
    return entries.map(entry => {
      const lines = entry.split('\n').filter(line => line.trim())
      const firstLine = lines[0] || ''
      const parts = firstLine.split('|').map(s => s.trim())
      const title = parts[0] || ''
      const company = parts[1] || ''
      const date = parts[2] || ''
      const description = lines.slice(1).join('\n')
      return { title, company, date, description }
    })
  }

  // Helper function to parse education text
  const parseEducation = (text) => {
    if (!text) return []
    return text.split('\n\n').filter(entry => entry.trim()).map(entry => {
      const lines = entry.split('\n').filter(line => line.trim())
      return {
        degree: lines[0] || '',
        school: lines.slice(1).join('\n') || ''
      }
    })
  }

  const experienceItems = parseExperience(data.experience)
  const educationItems = parseEducation(data.education)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name || 'Your Name'}</Text>
          <View style={styles.contactInfo}>
            {data.email && (
              <Text style={styles.contactItem}>{data.email}</Text>
            )}
            {data.phone && (
              <Text style={styles.contactItem}>{data.phone}</Text>
            )}
            {data.location && (
              <Text style={styles.contactItem}>{data.location}</Text>
            )}
          </View>
        </View>

        {/* Professional Summary */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {data.experience && experienceItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {experienceItems.map((item, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    {item.company && (
                      <Text style={styles.company}>{item.company}</Text>
                    )}
                  </View>
                  {item.date && (
                    <Text style={styles.date}>{item.date}</Text>
                  )}
                </View>
                {item.description && (
                  <Text style={styles.description}>
                    {item.description.split('\n').map((line, i) => (
                      <Text key={i}>
                        {line.trim() && '• '}
                        {line.trim()}
                        {'\n'}
                      </Text>
                    ))}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skills}>{data.skills}</Text>
          </View>
        )}

        {/* Education */}
        {data.education && educationItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {educationItems.map((item, index) => (
              <View key={index} style={styles.educationItem}>
                <Text style={styles.degree}>{item.degree}</Text>
                {item.school && (
                  <Text style={styles.school}>{item.school}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}

export default ResumeDocument

