import React from 'react'
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer'

// Register standard fonts
Font.register({
  family: 'Times-Roman',
  src: 'https://fonts.gstatic.com/s/timesnewroman/v12/TimesNewRomanPSMT.ttf'
});

Font.register({
  family: 'Times-Bold',
  src: 'https://fonts.gstatic.com/s/timesnewroman/v12/TimesNewRomanPS-BoldMT.ttf'
});

const CoverLetterDocument = ({ data, styling = {} }) => {
  const {
    candidateName,
    candidateContact,
    companyDetails,
    content,
    subjectLine
  } = data

  // Merge default styling with provided styling
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      paddingTop: styling.margins?.top || 40,
      paddingBottom: styling.margins?.bottom || 40,
      paddingLeft: styling.margins?.left || 40,
      paddingRight: styling.margins?.right || 40,
      fontFamily: 'Times-Roman',
      fontSize: styling.fontSize || 11,
      lineHeight: styling.lineHeight || 1.5
    },
    header: {
      marginBottom: 20,
      borderBottom: '1pt solid #000',
      paddingBottom: 10
    },
    candidateName: {
      fontSize: (styling.fontSize || 11) + 5, // Proportional to body font
      fontFamily: 'Times-Bold',
      marginBottom: 4,
      textTransform: 'uppercase'
    },
    candidateContact: {
      fontSize: (styling.fontSize || 11) - 1, // Slightly smaller than body
      color: '#333'
    },
    date: {
      marginBottom: 20,
      marginTop: 10,
      fontSize: styling.fontSize || 11
    },
    recipientBlock: {
      marginBottom: 20
    },
    recipientText: {
      fontSize: styling.fontSize || 11
    },
    subjectLine: {
      fontFamily: 'Times-Bold',
      marginBottom: 15,
      textDecoration: 'underline',
      fontSize: styling.fontSize || 11
    },
    body: {
      marginBottom: 20,
      textAlign: 'justify'
    },
    paragraph: {
      marginBottom: styling.paragraphSpacing || 10,
      textIndent: 20,
      fontSize: styling.fontSize || 11
    },
    signOff: {
      marginTop: 20
    },
    signature: {
      marginTop: 30,
      fontFamily: 'Times-Bold',
      fontSize: styling.fontSize || 11
    }
  })

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Split content into paragraphs if it comes as a single string
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.candidateName}>{candidateName || 'Candidate Name'}</Text>
          <Text style={styles.candidateContact}>{candidateContact || 'Email | Phone | Location'}</Text>
        </View>

        {/* Date */}
        <Text style={styles.date}>{currentDate}</Text>

        {/* Recipient Details */}
        <View style={styles.recipientBlock}>
          <Text style={styles.recipientText}>{companyDetails.hiringManager || 'Hiring Manager'}</Text>
          <Text style={styles.recipientText}>{companyDetails.jobTitle ? `Hiring Team for ${companyDetails.jobTitle}` : 'Hiring Team'}</Text>
          <Text style={styles.recipientText}>{companyDetails.companyName}</Text>
          {companyDetails.companyAddress && (
            <Text style={styles.recipientText}>{companyDetails.companyAddress}</Text>
          )}
        </View>

        {/* Subject Line */}
        {subjectLine && (
          <Text style={styles.subjectLine}>RE: {subjectLine}</Text>
        )}

        {/* Salutation */}
        <Text style={{ marginBottom: 10, fontSize: styling.fontSize || 11 }}>
          Dear {companyDetails.hiringManager || 'Hiring Manager'},
        </Text>

        {/* Body Content */}
        <View style={styles.body}>
          {paragraphs.map((para, index) => (
            <Text key={index} style={styles.paragraph}>
              {para}
            </Text>
          ))}
        </View>

        {/* Sign-off */}
        <View style={styles.signOff}>
          <Text style={{ fontSize: styling.fontSize || 11 }}>Sincerely,</Text>
          <Text style={styles.signature}>{candidateName || 'Candidate'}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default CoverLetterDocument
