import React, { useMemo } from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

/**
 * Map extracted font names to React-PDF compatible fonts
 * React-PDF supports: Helvetica, Times-Roman, Courier
 * PDF internal font names (like g_d0_f6) are mapped to standard fonts
 */
function mapFontFamily(fontName) {
  if (!fontName) return 'Helvetica'
  
  const fontLower = fontName.toLowerCase()
  
  // Handle PDF internal font names (usually start with letters/numbers/underscores)
  // These are typically encoded font names and should default to Helvetica
  if (/^[a-z0-9_]+$/.test(fontLower) && fontLower.length < 10) {
    // Likely a PDF internal font name, default to Helvetica
    return 'Helvetica'
  }
  
  // Map common font names to React-PDF fonts
  if (fontLower.includes('helvetica') || fontLower.includes('arial') || fontLower.includes('sans')) {
    return 'Helvetica'
  }
  if (fontLower.includes('times') || fontLower.includes('serif')) {
    return 'Times-Roman'
  }
  if (fontLower.includes('courier') || fontLower.includes('mono')) {
    return 'Courier'
  }
  
  // Default to Helvetica for unknown fonts
  return 'Helvetica'
}

/**
 * Create dynamic styles based on reference template styling specs
 */
function createDynamicStyles(stylingSpecs) {
  const fonts = stylingSpecs?.fonts || {}
  const layout = stylingSpecs?.layout || {}
  const bullets = stylingSpecs?.bullets || {}
  const transforms = stylingSpecs?.transforms || {}
  const colors = stylingSpecs?.colors || {}

  return StyleSheet.create({
    page: {
      paddingTop: layout.margins?.top || 30, // Adequate top padding for professional spacing
      paddingBottom: layout.margins?.bottom || 15,
      paddingLeft: layout.margins?.left || 30,
      paddingRight: layout.margins?.right || 30,
      fontSize: fonts.body?.size || 11,
      fontFamily: mapFontFamily(fonts.body?.family || fonts.name?.family || 'Helvetica'),
      backgroundColor: colors.background || '#ffffff',
      color: colors.text || '#000000',
    },
    header: {
      marginTop: 0, // No top margin on header
      marginBottom: layout.sectionSpacing || 6, // Use adjusted spacing
      borderBottom: '2px solid #000000', // Black separator (removed purple)
      paddingBottom: 8, // Reduced for one-page fit
      alignItems: 'center', // Center content horizontally
    },
    name: {
      fontSize: fonts.name?.size || 24,
      fontWeight: fonts.name?.weight === 'bold' ? 'bold' : 'normal',
      fontStyle: fonts.name?.style === 'italic' ? 'italic' : 'normal',
      fontFamily: mapFontFamily(fonts.name?.family),
      color: colors.text || '#1a1a1a',
      marginBottom: 8, // Use reference margin
      letterSpacing: 0.5, // Use reference letter spacing
      textTransform: transforms.name === 'uppercase' ? 'uppercase' : 
                     transforms.name === 'lowercase' ? 'lowercase' : 'none',
      textAlign: 'center',
    },
    contactInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center', // Center contact items
      gap: 12,
      fontSize: fonts.contact?.size || 10,
      fontWeight: fonts.contact?.weight === 'bold' ? 'bold' : 'normal',
      fontStyle: fonts.contact?.style === 'italic' ? 'italic' : 'normal',
      color: colors.text || '#555',
    },
    contactItem: {
      marginRight: 0,
    },
    contactSeparator: {
      color: colors.text || '#555',
      fontWeight: 'normal',
    },
    section: {
      marginBottom: layout.sectionSpacing || 8, // Minimal spacing (less than 0.25 inch = 18pt)
      marginTop: 0, // No top margin on sections
    },
    sectionTitle: {
      fontSize: fonts.sectionTitle?.size || 14,
      fontWeight: fonts.sectionTitle?.weight === 'bold' ? 'bold' : 'normal',
      fontStyle: fonts.sectionTitle?.style === 'italic' ? 'italic' : 'normal',
      color: '#000000', // Black color for section titles
      marginBottom: 2, // Minimal spacing below title
      marginTop: 0, // No top margin
      textTransform: transforms.sectionTitle === 'uppercase' ? 'uppercase' :
                     transforms.sectionTitle === 'lowercase' ? 'lowercase' :
                     transforms.sectionTitle === 'capitalize' ? 'capitalize' : 'uppercase',
      letterSpacing: fonts.sectionTitle?.letterSpacing || 1, // Use reference if available
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: 2, // Minimal padding
    },
    summary: {
      fontSize: fonts.body?.size || 11,
      lineHeight: fonts.body?.lineHeight || 1.6, // Use reference line height
      fontWeight: fonts.body?.weight === 'bold' ? 'bold' : 'normal',
      fontStyle: fonts.body?.style === 'italic' ? 'italic' : 'normal',
      color: colors.text || '#333',
      textAlign: 'justify',
      marginBottom: 0, // No extra margin on summary text
      marginTop: 0,
    },
    experienceItem: {
      marginBottom: layout.paragraphSpacing || 3, // Use adjusted spacing (tight for one-page)
    },
    experienceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    companyName: {
      fontSize: fonts.companyName?.size || 12,
      fontWeight: fonts.companyName?.weight === 'bold' ? 'bold' : 'normal',
      fontStyle: fonts.companyName?.style === 'italic' ? 'italic' : 'normal',
      color: colors.text || '#1a1a1a',
      marginBottom: 2,
    },
    roleTitle: {
      fontSize: fonts.roleTitle?.size || 12,
      fontWeight: fonts.roleTitle?.weight === 'bold' ? 'bold' : 'normal',
      fontStyle: fonts.roleTitle?.style === 'italic' ? 'italic' : 'normal',
      color: colors.text || '#1a1a1a',
    },
    date: {
      fontSize: fonts.date?.size || 10,
      fontWeight: fonts.date?.weight === 'bold' ? 'bold' : 'normal',
      fontStyle: fonts.date?.style === 'italic' ? 'italic' : 'normal',
      color: colors.text || '#777',
    },
    location: {
      fontSize: fonts.date?.size || 10,
      color: colors.text || '#777',
      marginBottom: 2,
    },
    bulletsContainer: {
      marginTop: 4,
      paddingLeft: bullets.indentation || 10,
    },
    bulletPoint: {
      fontSize: fonts.bulletText?.size || fonts.body?.size || 10,
      fontWeight: fonts.bulletText?.weight === 'bold' ? 'bold' : 'normal',
      fontStyle: fonts.bulletText?.style === 'italic' ? 'italic' : 'normal',
      lineHeight: bullets.lineSpacing || 1.15, // Use adjusted line spacing (tight for one-page)
      color: colors.text || '#444',
      marginBottom: 1, // Reduced for one-page fit
    },
    bulletMarker: {
      marginRight: 4,
    },
    skills: {
      fontSize: fonts.skills?.size || fonts.body?.size || 10,
      fontWeight: fonts.skills?.weight === 'bold' ? 'bold' : 'normal',
      fontStyle: fonts.skills?.style === 'italic' ? 'italic' : 'normal',
      lineHeight: 1.6,
      color: colors.text || '#333',
    },
    education: {
      fontSize: fonts.education?.size || fonts.body?.size || 10,
      lineHeight: 1.5,
      color: colors.text || '#333',
    },
    educationItem: {
      marginBottom: layout.paragraphSpacing || 3, // Use adjusted spacing (tight for one-page)
    },
    degree: {
      fontWeight: 'bold',
      fontSize: fonts.education?.size || 11,
      color: colors.text || '#1a1a1a',
    },
    school: {
      fontSize: fonts.education?.size || 10,
      color: colors.text || '#555',
    },
    gpa: {
      fontSize: fonts.education?.size || 10,
      color: colors.text || '#555',
      fontStyle: 'italic',
    },
  })
}

const ResumeDocument = ({ data, stylingSpecs }) => {
  // Validate inputs
  if (!data) {
    return (
      <Document>
        <Page>
          <Text>Error: No data provided</Text>
        </Page>
      </Document>
    )
  }

  // Ensure stylingSpecs exists
  const safeStylingSpecs = stylingSpecs || {
    fonts: {},
    layout: {},
    bullets: {},
    transforms: {},
    colors: {}
  }

  // Memoize styles to prevent React-PDF Config errors
  // This ensures StyleSheet.create() is only called when styling specs actually change
  const styles = useMemo(() => {
    try {
      return createDynamicStyles(safeStylingSpecs)
    } catch (error) {
      console.error('Error creating styles:', error)
      // Return default styles if there's an error
      return StyleSheet.create({
        page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
        name: { fontSize: 24, fontWeight: 'bold' },
        contactInfo: { fontSize: 10 },
        section: { marginBottom: 20 },
        sectionTitle: { fontSize: 14, fontWeight: 'bold' },
        summary: { fontSize: 11 },
        experienceItem: { marginBottom: 12 },
        companyName: { fontSize: 12, fontWeight: 'bold' },
        roleTitle: { fontSize: 12 },
        date: { fontSize: 10 },
        bulletPoint: { fontSize: 10, marginBottom: 3 },
        skills: { fontSize: 10 },
        educationItem: { marginBottom: 8 },
        degree: { fontSize: 11, fontWeight: 'bold' },
        school: { fontSize: 10 }
      })
    }
  }, [JSON.stringify(safeStylingSpecs)])

  // Helper to get bullet character
  const getBulletChar = () => {
    return safeStylingSpecs?.bullets?.style || '•'
  }

  // Safely get contact info
  const contactInfo = data.contactInfo || {}
  const workExperience = Array.isArray(data.workExperience) ? data.workExperience : []
  const education = Array.isArray(data.education) ? data.education : []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{contactInfo.name || data.name || 'Your Name'}</Text>
          <View style={styles.contactInfo}>
            {/* ATS-friendly: Use explicit separator (|) between contact items */}
            {contactInfo.email && (
              <Text style={styles.contactItem}>{String(contactInfo.email)}</Text>
            )}
            {contactInfo.email && (contactInfo.phone || contactInfo.location || contactInfo.website) && (
              <Text style={styles.contactSeparator}> | </Text>
            )}
            {contactInfo.phone && (
              <Text style={styles.contactItem}>{String(contactInfo.phone)}</Text>
            )}
            {contactInfo.phone && (contactInfo.location || contactInfo.website) && (
              <Text style={styles.contactSeparator}> | </Text>
            )}
            {contactInfo.location && (
              <Text style={styles.contactItem}>{String(contactInfo.location)}</Text>
            )}
            {contactInfo.location && contactInfo.website && (
              <Text style={styles.contactSeparator}> | </Text>
            )}
            {contactInfo.website && (
              <Text style={styles.contactItem}>{String(contactInfo.website)}</Text>
            )}
          </View>
        </View>

        {/* Personal Statement */}
        {data.personalStatement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.summary}>{String(data.personalStatement)}</Text>
          </View>
        )}

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>
            {workExperience.map((item, index) => {
              if (!item) return null
              const bullets = Array.isArray(item.bullets) ? item.bullets : []
              return (
                <View key={index} style={styles.experienceItem}>
                  {item.company && (
                    <Text style={styles.companyName}>{String(item.company)}</Text>
                  )}
                  {item.title && (
                    <Text style={styles.roleTitle}>{String(item.title)}</Text>
                  )}
                  {(item.location || item.date) && (
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                      {item.location && (
                        <Text style={styles.location}>{String(item.location)}</Text>
                      )}
                      {item.date && (
                        <Text style={styles.date}>{String(item.date)}</Text>
                      )}
                    </View>
                  )}
                  {bullets.length > 0 && (
                    <View style={styles.bulletsContainer}>
                      {bullets.map((bullet, bulletIndex) => {
                        if (!bullet) return null
                        return (
                          <Text key={bulletIndex} style={styles.bulletPoint}>
                            <Text style={styles.bulletMarker}>{getBulletChar()} </Text>
                            {String(bullet)}
                          </Text>
                        )
                      })}
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        )}

        {/* Skills */}
        {data.skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            <Text style={styles.skills}>{String(data.skills)}</Text>
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            {education.map((item, index) => {
              if (!item) return null
              
              // Determine if this is a certificate-only entry (no degree, has certificate)
              const isCertificateOnly = !item.degree && item.certificate
              
              return (
                <View key={index} style={styles.educationItem}>
                  {item.school && (
                    <Text style={styles.school}>{String(item.school)}</Text>
                  )}
                  {item.degree && (
                    <Text style={styles.degree}>{String(item.degree)}</Text>
                  )}
                  {isCertificateOnly && item.certificate && (
                    <Text style={styles.degree}>{String(item.certificate)}</Text>
                  )}
                  {item.gpa && (
                    <Text style={styles.gpa}>GPA: {String(item.gpa)}</Text>
                  )}
                  {item.certificate && item.degree && (
                    <Text style={styles.school}>{String(item.certificate)}</Text>
                  )}
                  {item.date && (
                    <Text style={styles.school}>{String(item.date)}</Text>
                  )}
                </View>
              )
            })}
          </View>
        )}
      </Page>
    </Document>
  )
}

export default ResumeDocument
