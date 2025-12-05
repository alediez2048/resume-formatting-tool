/**
 * PDF Parser Utility
 * Extracts text, styling, and layout information from PDF files
 */

// Import PDF.js - use the default import for compatibility
import * as pdfjsLib from 'pdfjs-dist'
import { analyzePDFVisual, analyzeWithOpenAI } from './visualAnalyzer'
import { extractEnhancedStyling } from './enhancedStylingExtractor'

// Get PDF.js version for CDN worker
const PDFJS_VERSION = pdfjsLib.version || '5.4.394'

// Worker sources - use unpkg CDN (more reliable than cdnjs for newer versions)
// Fallback to public folder if CDN fails
const CDN_WORKER_SRC = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`
const PUBLIC_WORKER_SRC = '/pdf.worker.min.mjs'

// Always pass workerSrc directly to getDocument (more reliable than GlobalWorkerOptions)
// Set GlobalWorkerOptions as a fallback, but don't rely on it
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = CDN_WORKER_SRC
  console.log('✅ Set GlobalWorkerOptions.workerSrc:', CDN_WORKER_SRC)
} catch (e) {
  console.warn('⚠️ Could not set GlobalWorkerOptions.workerSrc:', e.message)
}

/**
 * Add timeout wrapper to promises
 */
function withTimeout(promise, timeoutMs, errorMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ])
}

/**
 * Parse PDF file and extract text with styling information
 * @param {File} file - The PDF file to parse
 * @param {Function} onProgress - Optional progress callback (progress, stage)
 * @returns {Promise<Object>} Parsed PDF data with text and styling
 */
export async function parsePDF(file, onProgress, openAIApiKey) {
  if (!openAIApiKey || !openAIApiKey.trim()) {
    throw new Error('OpenAI API key is required')
  }
  // Declare openAIAnalysis at function scope to ensure it's always available
  let openAIAnalysis = null
  
  try {
    // Stage 1: Loading PDF file
    if (onProgress) onProgress(10, 'Loading PDF file...')
    
    const arrayBuffer = await file.arrayBuffer()
    
    // Stage 2: Parsing PDF document
    if (onProgress) onProgress(25, 'Parsing PDF document...')
    
    console.log('Starting PDF parsing...', {
      fileSize: arrayBuffer.byteLength,
      workerSrc: CDN_WORKER_SRC,
      pdfjsVersion: PDFJS_VERSION
    })
    
    // Add timeout to PDF parsing (30 seconds max)
    // Use unpkg CDN worker (verified accessible) with public folder fallback
    let pdf
    try {
      pdf = await withTimeout(
        pdfjsLib.getDocument({ 
          data: arrayBuffer,
          workerSrc: CDN_WORKER_SRC, // unpkg CDN (verified accessible)
          verbosity: 0, // Reduce logging
          stopAtErrors: false // Continue even with errors
        }).promise,
        30000,
        'PDF parsing timed out. The PDF may be corrupted or too complex. Please try a different PDF file.'
      )
      console.log('✅ PDF parsed successfully with unpkg CDN worker')
    } catch (workerError) {
      // If unpkg CDN worker fails, try public folder as fallback
      const errorMsg = workerError?.message || String(workerError)
      const isWorkerError = errorMsg.includes('worker') || 
                           errorMsg.includes('Failed to fetch') ||
                           errorMsg.includes('readonly') ||
                           errorMsg.includes('network') ||
                           errorMsg.includes('CORS') ||
                           errorMsg.includes('MIME') ||
                           errorMsg.includes('Invalid PDF structure') ||
                           errorMsg.includes('Setting up fake worker')
      
      if (isWorkerError) {
        console.warn('⚠️ unpkg CDN worker failed, trying public folder worker...')
        console.warn('CDN error:', errorMsg)
        console.warn('Attempting fallback to:', PUBLIC_WORKER_SRC)
        
        try {
          pdf = await withTimeout(
            pdfjsLib.getDocument({ 
              data: arrayBuffer,
              workerSrc: PUBLIC_WORKER_SRC, // Try public folder
              verbosity: 0,
              stopAtErrors: false
            }).promise,
            30000,
            'PDF parsing timed out. The PDF may be corrupted or too complex. Please try a different PDF file.'
          )
          console.log('✅ PDF parsed successfully with public folder worker fallback')
        } catch (publicError) {
          const publicErrorMsg = publicError?.message || String(publicError)
          console.error('❌ Both unpkg CDN and public folder workers failed')
          console.error('CDN (unpkg) error:', errorMsg)
          console.error('Public folder error:', publicErrorMsg)
          console.error('Full error details:', { 
            cdnError: workerError, 
            publicError: publicError 
          })
          
          throw new Error(
            `PDF.js worker failed to load from both unpkg CDN (${CDN_WORKER_SRC}) and local (${PUBLIC_WORKER_SRC}) sources. ` +
            `This may be due to:\n` +
            `1. No internet connection (for CDN)\n` +
            `2. Firewall or proxy blocking worker files\n` +
            `3. Browser security restrictions or CORS policies\n` +
            `4. PDF.js version mismatch\n\n` +
            `Please check the browser console (F12) for detailed error messages. ` +
            `CDN error: ${errorMsg}\n` +
            `Local error: ${publicErrorMsg}`
          )
        }
      } else {
        // Not a worker error, rethrow
        throw workerError
      }
    }
    console.log('PDF parsed successfully', { numPages: pdf.numPages })
    
    const numPages = pdf.numPages
    if (numPages > 1) {
      console.warn('PDF has multiple pages. Analyzing first page only.')
    }

    // Stage 3: Extracting page content
    if (onProgress) onProgress(40, 'Extracting page content...')
    
    // Get first page
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.0 })

    // Stage 4: Reading text content
    if (onProgress) onProgress(55, 'Reading text content...')
    
    // Extract text content with styling
    const textContent = await page.getTextContent()
    
    // Stage 5: Processing text items
    if (onProgress) onProgress(70, 'Processing text items...')
    
    // Extract text items with positions and styling (including font properties)
    const textItems = textContent.items.map(item => {
      const fontName = item.fontName || 'Helvetica'
      // Extract font properties from font name
      const isBold = fontName.toLowerCase().includes('bold') || 
                     fontName.toLowerCase().includes('black') || 
                     fontName.toLowerCase().includes('heavy')
      const isItalic = fontName.toLowerCase().includes('italic') || 
                       fontName.toLowerCase().includes('oblique')
      
      return {
        text: item.str,
        x: item.transform[4], // X position
        y: item.transform[5], // Y position
        width: item.width || 0,
        height: item.height || 0,
        fontName: fontName,
        fontSize: item.height || 11, // Approximate font size from height
        isBold: isBold,
        isItalic: isItalic,
        pageWidth: viewport.width,
        pageHeight: viewport.height
      }
    })

    // Stage 6: Visual analysis
    if (onProgress) onProgress(75, 'Performing visual analysis...')
    const visualAnalysis = await analyzePDFVisual(page, viewport, (progress, stage) => {
      if (onProgress) {
        // Map visual analysis progress (0-100) to our overall progress (75-90)
        const mappedProgress = 75 + (progress * 0.15)
        onProgress(mappedProgress, stage)
      }
    })
    
    // Stage 7: Required OpenAI Vision API analysis
    if (!openAIApiKey || !openAIApiKey.trim()) {
      throw new Error('OpenAI API key is required for resume analysis')
    }

    if (!visualAnalysis?.success || !visualAnalysis.imageData) {
      throw new Error('Visual analysis failed. Cannot proceed with AI analysis.')
    }

    if (onProgress) onProgress(88, 'Running AI-powered analysis...')
    
    openAIAnalysis = await analyzeWithOpenAI(visualAnalysis.imageData, openAIApiKey)
    
    // Handle OpenAI analysis - if it fails but returns success with null specs, continue
    if (!openAIAnalysis) {
      throw new Error('OpenAI analysis failed: No response received')
    }
    
    if (!openAIAnalysis.success) {
      // If it's a JSON parse error, we can continue with programmatic extraction
      if (openAIAnalysis.error && openAIAnalysis.error.includes('JSON')) {
        console.warn('OpenAI returned invalid JSON, continuing with programmatic extraction')
        // Continue without AI specs
      } else {
        throw new Error(`OpenAI analysis failed: ${openAIAnalysis.error || 'Unknown error'}`)
      }
    } else if (openAIAnalysis.specs) {
      // Merge OpenAI specs with visual analysis if available
      visualAnalysis.openAISpecs = openAIAnalysis.specs
    } else {
      console.warn('OpenAI analysis succeeded but returned no specs, using programmatic extraction')
    }
    
    // Stage 8: Extracting structured content (needed for enhanced styling)
    if (onProgress) onProgress(90, 'Extracting structured content...')
    
    // Extract structured content
    const structuredContent = extractStructuredContent(textItems)
    
    // Stage 9: Analyzing styling specifications (combine text + visual + AI + enhanced)
    if (onProgress) onProgress(92, 'Combining all analysis results...')
    
    // Analyze layout and extract styling specifications
    const stylingSpecs = analyzePDFStyling(textItems, viewport, visualAnalysis, openAIAnalysis, structuredContent)
    
    // Stage 10: Finalizing
    if (onProgress) onProgress(100, 'Finalizing...')

    return {
      success: true,
      textItems,
      stylingSpecs,
      structuredContent,
      visualAnalysis: visualAnalysis.success ? visualAnalysis : null,
      viewport: {
        width: viewport.width,
        height: viewport.height
      },
      rawText: textItems.map(item => item.text).join('\n')
    }
  } catch (error) {
    console.error('Error parsing PDF:', error)
    
    // Provide helpful error messages
    let errorMessage = 'Failed to parse PDF'
    
    if (error.message.includes('timeout')) {
      errorMessage = error.message
    } else if (error.message.includes('Invalid PDF')) {
      errorMessage = 'Invalid PDF file. Please ensure the file is not corrupted.'
    } else if (error.message.includes('worker') || error.message.includes('readonly')) {
      // Worker error - provide helpful diagnostics
      console.error('Worker loading diagnostics:', {
        workerSrc: CDN_WORKER_SRC,
        pdfjsVersion: PDFJS_VERSION,
        globalWorkerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
        errorMessage: error.message,
        errorStack: error.stack
      })
      
      // Check if it's a network/CORS error
      const isNetworkError = error.message.includes('Failed to fetch') || 
                            error.message.includes('network') ||
                            error.message.includes('CORS')
      
      if (isNetworkError) {
        errorMessage = `PDF.js worker failed to load from CDN (${CDN_WORKER_SRC}). ` +
                      `This is likely due to:\n` +
                      `1. No internet connection\n` +
                      `2. Firewall or proxy blocking CDN access\n` +
                      `3. Browser security restrictions\n\n` +
                      `Please check your internet connection and try again. If the problem persists, check the browser console (F12) for details.`
      } else {
        errorMessage = `PDF.js worker failed to load. ` +
                      `Worker source: ${CDN_WORKER_SRC}\n` +
                      `Please refresh the page and try again. ` +
                      `If the problem persists, check the browser console (F12) for details.\n` +
                      `Error: ${error.message}`
      }
    } else {
      errorMessage = error.message || 'Failed to parse PDF. Please ensure the file is a valid PDF.'
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Analyze PDF text items to extract styling specifications
 * @param {Array} textItems - Array of text items with positions
 * @param {Object} viewport - PDF viewport dimensions
 * @param {Object} visualAnalysis - Optional visual analysis results
 * @param {Object} openAIAnalysis - Optional OpenAI analysis results
 * @param {Object} structuredContent - Parsed structured content
 * @returns {Object} Styling specifications
 */
function analyzePDFStyling(textItems, viewport, visualAnalysis = null, openAIAnalysis = null, structuredContent = null) {
  if (!textItems || textItems.length === 0) {
    return getDefaultSpecs()
  }

  // Calculate margins (find minimum x, y positions and maximum x, y positions)
  const xPositions = textItems.map(item => item.x).filter(x => x > 0)
  const yPositions = textItems.map(item => item.y).filter(y => y > 0)
  
  const minX = Math.min(...xPositions)
  const maxX = Math.max(...xPositions)
  const minY = Math.min(...yPositions)
  const maxY = Math.max(...yPositions)

  // Convert to points (PDF coordinates are in points, 1 point = 1/72 inch)
  // Assuming standard A4 page (612 x 792 points)
  const pageWidth = viewport.width || 612
  const pageHeight = viewport.height || 792

  // Use visual analysis margins if available (more accurate)
  let margins
  if (visualAnalysis?.success && visualAnalysis.visualSpecs?.layout?.margins) {
    margins = visualAnalysis.visualSpecs.layout.margins
  } else {
    margins = {
      left: Math.round(minX),
      right: Math.round(pageWidth - maxX),
      top: Math.round(pageHeight - maxY), // Y is from bottom in PDF coordinates
      bottom: Math.round(minY)
    }
  }

  // Analyze font sizes
  const fontSizes = textItems.map(item => item.fontSize).filter(size => size > 0)
  const uniqueFontSizes = [...new Set(fontSizes)].sort((a, b) => b - a)
  
  // Identify font sizes for different elements
  // Largest is usually name, second largest might be section titles, etc.
  let nameSize = uniqueFontSizes[0] || 24
  let sectionTitleSize = uniqueFontSizes[1] || uniqueFontSizes[0] * 0.6 || 14
  let bodySize = uniqueFontSizes[uniqueFontSizes.length - 1] || 11
  let contactSize = bodySize * 0.9 || 10

  // Analyze spacing between text items (section spacing)
  const yPositionsSorted = [...new Set(yPositions)].sort((a, b) => b - a)
  const gaps = []
  for (let i = 0; i < yPositionsSorted.length - 1; i++) {
    const gap = yPositionsSorted[i] - yPositionsSorted[i + 1]
    if (gap > 15) { // Significant gap (likely section spacing)
      gaps.push(gap)
    }
  }
  
  // Use visual analysis spacing if available
  let avgSectionSpacing
  if (visualAnalysis?.success && visualAnalysis.visualSpecs?.layout?.sectionSpacing) {
    avgSectionSpacing = visualAnalysis.visualSpecs.layout.sectionSpacing
  } else {
    avgSectionSpacing = gaps.length > 0 
      ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
      : 20
  }
  
  // Extract colors from visual analysis or OpenAI if available
  let colors = {
    text: '#000000',
    accent: '#667eea',
    background: '#ffffff'
  }
  
  // Prioritize OpenAI analysis if available
  if (openAIAnalysis?.success && openAIAnalysis.specs?.colors) {
    const aiColors = openAIAnalysis.specs.colors
    colors = {
      text: aiColors.text || colors.text,
      accent: aiColors.accent || colors.accent,
      background: aiColors.background || colors.background
    }
  } else if (visualAnalysis?.success && visualAnalysis.visualSpecs?.colors) {
    const visualColors = visualAnalysis.visualSpecs.colors
    colors = {
      text: visualColors.text || colors.text,
      accent: visualColors.accent || colors.accent,
      background: visualColors.background || colors.background
    }
  }
  
  // Use OpenAI specs if available for more accurate measurements
  if (openAIAnalysis?.success && openAIAnalysis.specs) {
    const aiSpecs = openAIAnalysis.specs
    if (aiSpecs.margins) margins = aiSpecs.margins
    if (aiSpecs.sectionSpacing) avgSectionSpacing = aiSpecs.sectionSpacing
    if (aiSpecs.fonts) {
      // Use AI-detected font sizes if available
      if (aiSpecs.fonts.name?.size) nameSize = aiSpecs.fonts.name.size
      if (aiSpecs.fonts.sectionTitle?.size) sectionTitleSize = aiSpecs.fonts.sectionTitle.size
      if (aiSpecs.fonts.body?.size) bodySize = aiSpecs.fonts.body.size
      if (aiSpecs.fonts.contact?.size) contactSize = aiSpecs.fonts.contact.size
    }
  }

  // Detect bullet points
  const bulletStyle = detectBulletStyle(textItems)

  // Extract enhanced styling specifications
  const enhancedStyling = extractEnhancedStyling(textItems, structuredContent)
  
  // Merge enhanced fonts with basic fonts (enhanced takes precedence)
  const mergedFonts = {
    name: {
      ...enhancedStyling.fonts.name,
      size: enhancedStyling.fonts.name.size || Math.round(nameSize),
      weight: enhancedStyling.fonts.name.weight || 'bold'
    },
    sectionTitle: {
      ...enhancedStyling.fonts.sectionTitle,
      size: enhancedStyling.fonts.sectionTitle.size || Math.round(sectionTitleSize),
      weight: enhancedStyling.fonts.sectionTitle.weight || 'bold',
      transform: enhancedStyling.transforms.sectionTitle || 'uppercase'
    },
    subtitle: enhancedStyling.fonts.subtitle,
    companyName: enhancedStyling.fonts.companyName,
    roleTitle: enhancedStyling.fonts.roleTitle,
    date: enhancedStyling.fonts.date,
    body: {
      ...enhancedStyling.fonts.body,
      size: enhancedStyling.fonts.body.size || Math.round(bodySize),
      lineHeight: 1.5
    },
    bulletText: enhancedStyling.fonts.bulletText,
    contact: {
      ...enhancedStyling.fonts.contact,
      size: enhancedStyling.fonts.contact.size || Math.round(contactSize)
    },
    skills: enhancedStyling.fonts.skills,
    education: enhancedStyling.fonts.education
  }

  return {
    fonts: mergedFonts,
    layout: {
      margins: margins,
      sectionSpacing: avgSectionSpacing,
      paragraphSpacing: 8
    },
    bullets: {
      ...enhancedStyling.bullets,
      style: enhancedStyling.bullets.style || bulletStyle
    },
    links: enhancedStyling.links,
    transforms: enhancedStyling.transforms,
    constraints: {
      onePage: true,
      maxCharactersPerLine: 80
    },
    colors: colors,
    visualElements: visualAnalysis?.success ? visualAnalysis.visualSpecs.elements : null
  }
}

/**
 * Extract structured content from text items
 * @param {Array} textItems - Array of text items
 * @returns {Object} Structured content
 */
function extractStructuredContent(textItems) {
  const lines = []
  let currentLine = { text: '', y: null, fontSize: null }

  // Group text items by Y position (same line)
  const linesByY = {}
  textItems.forEach(item => {
    const y = Math.round(item.y)
    if (!linesByY[y]) {
      linesByY[y] = []
    }
    linesByY[y].push(item)
  })

  // Sort by Y position (top to bottom)
  const sortedYs = Object.keys(linesByY).sort((a, b) => b - a)

  // Build lines
  sortedYs.forEach(y => {
    const items = linesByY[y].sort((a, b) => a.x - b.x) // Sort by X position
    const lineText = items.map(item => item.text).join(' ')
    const avgFontSize = items.reduce((sum, item) => sum + item.fontSize, 0) / items.length

    lines.push({
      text: lineText.trim(),
      y: parseFloat(y),
      fontSize: avgFontSize
    })
  })

  // Extract contact info (usually first few lines)
  const headerLines = lines.slice(0, 5)
  const contactInfo = extractContactFromLines(headerLines)

  // Identify sections
  const sections = identifySections(lines)

  return {
    lines,
    contactInfo,
    sections
  }
}

/**
 * Extract contact information from header lines
 */
function extractContactFromLines(headerLines) {
  const contact = {
    name: null,
    email: null,
    phone: null,
    location: null,
    website: null
  }

  if (headerLines.length === 0) return contact

  // First line is usually the name (largest font)
  const nameLine = headerLines.reduce((largest, line) => 
    line.fontSize > largest.fontSize ? line : largest
  )
  contact.name = nameLine.text

  // Extract email
  const allText = headerLines.map(l => l.text).join(' ')
  const emailMatch = allText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  if (emailMatch) {
    contact.email = emailMatch[0]
  }

  // Extract phone
  const phonePatterns = [
    /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\+?\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/
  ]
  for (const pattern of phonePatterns) {
    const match = allText.match(pattern)
    if (match) {
      contact.phone = match[0]
      break
    }
  }

  // Extract website
  const urlMatch = allText.match(/https?:\/\/[^\s]+|www\.[^\s]+/i)
  if (urlMatch) {
    contact.website = urlMatch[0]
  }

  // Extract location
  const locationPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*[A-Z]{2}/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+)/
  ]
  for (const pattern of locationPatterns) {
    const match = allText.match(pattern)
    if (match) {
      contact.location = match[0]
      break
    }
  }

  return contact
}

/**
 * Identify sections in the resume
 */
function identifySections(lines) {
  const sections = {
    personalStatement: null,
    workExperience: null,
    skills: null,
    education: null
  }

  const sectionPatterns = {
    personalStatement: /^(personal\s+statement|summary|professional\s+summary|about|profile)$/i,
    workExperience: /^(work\s+experience|experience|employment|professional\s+experience|career\s+history)$/i,
    skills: /^(skills|technical\s+skills|core\s+competencies|competencies)$/i,
    education: /^(education|academic\s+background|qualifications)$/i
  }

  let currentSection = null
  let sectionContent = []

  lines.forEach((line, index) => {
    // Check if this is a section header
    let isSectionHeader = false
    for (const [sectionKey, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line.text)) {
        // Save previous section
        if (currentSection && sectionContent.length > 0) {
          sections[currentSection] = sectionContent.map(l => l.text).join('\n')
        }
        currentSection = sectionKey
        sectionContent = []
        isSectionHeader = true
        break
      }
    }

    if (!isSectionHeader && currentSection) {
      sectionContent.push(line)
    }
  })

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    sections[currentSection] = sectionContent.map(l => l.text).join('\n')
  }

  return sections
}

/**
 * Detect bullet point style from text items
 */
function detectBulletStyle(textItems) {
  const text = textItems.map(item => item.text).join(' ')
  if (text.includes('•')) return '•'
  if (text.includes('-')) return '-'
  if (text.includes('*')) return '*'
  return '•'
}

/**
 * Get default styling specifications
 */
function getDefaultSpecs() {
  return {
    fonts: {
      name: { family: 'Helvetica', size: 24, weight: 'bold' },
      sectionTitle: { family: 'Helvetica', size: 14, weight: 'bold', transform: 'uppercase' },
      body: { family: 'Helvetica', size: 11, lineHeight: 1.5 },
      contact: { family: 'Helvetica', size: 10 }
    },
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      sectionSpacing: 20,
      paragraphSpacing: 8
    },
    bullets: {
      style: '•',
      indentation: 10,
      lineSpacing: 1.5
    },
    constraints: {
      onePage: true,
      maxCharactersPerLine: 80
    }
  }
}

