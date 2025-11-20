/**
 * Visual Analyzer
 * Renders PDF pages as images and performs visual analysis
 * to extract granular design specifications
 */

import * as pdfjsLib from 'pdfjs-dist'

/**
 * Render PDF page to canvas and extract visual specifications
 * @param {Object} page - PDF.js page object
 * @param {Object} viewport - PDF viewport
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Visual analysis results
 */
export async function analyzePDFVisual(page, viewport, onProgress) {
  try {
    if (onProgress) onProgress(0, 'Rendering PDF to canvas...')
    
    // Create canvas for rendering
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    // Set canvas dimensions (lower scale for faster analysis)
    const scale = 1.0 // Lower resolution for faster analysis
    const scaledViewport = page.getViewport({ scale })
    canvas.width = scaledViewport.width
    canvas.height = scaledViewport.height
    
    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport
    }
    
    await page.render(renderContext).promise
    
    if (onProgress) onProgress(30, 'Analyzing visual elements...')
    
    // Extract visual specifications
    const visualSpecs = await extractVisualSpecs(canvas, context, scaledViewport, onProgress)
    
    // Convert canvas to image data for potential AI analysis
    const imageData = canvas.toDataURL('image/png')
    
    return {
      success: true,
      visualSpecs,
      imageData,
      canvas,
      dimensions: {
        width: scaledViewport.width,
        height: scaledViewport.height
      }
    }
  } catch (error) {
    console.error('Error in visual analysis:', error)
    return {
      success: false,
      error: error.message || 'Failed to analyze PDF visually'
    }
  }
}

/**
 * Extract visual specifications from canvas
 * @param {HTMLCanvasElement} canvas - Rendered canvas
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {Object} viewport - Scaled viewport
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Visual specifications
 */
async function extractVisualSpecs(canvas, context, viewport, onProgress) {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  if (onProgress) onProgress(40, 'Detecting colors...')
  
  // Extract dominant colors
  const colors = extractColors(imageData, data)
  
  if (onProgress) onProgress(60, 'Analyzing layout...')
  
  // Analyze layout structure
  const layout = analyzeLayout(imageData, data, viewport)
  
  if (onProgress) onProgress(80, 'Detecting visual elements...')
  
  // Detect visual elements (lines, borders, etc.)
  const elements = detectVisualElements(imageData, data, viewport)
  
  if (onProgress) onProgress(100, 'Visual analysis complete')
  
  return {
    colors,
    layout,
    elements,
    imageData: canvas.toDataURL('image/png')
  }
}

/**
 * Extract dominant colors from the image
 */
function extractColors(imageData, data) {
  const colorMap = new Map()
  const sampleSize = 500 // Sample every Nth pixel for performance (much larger for speed)
  
  // Sample pixels to find dominant colors
  for (let i = 0; i < data.length; i += sampleSize * 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Skip transparent/white pixels
    if (a < 255 || (r > 250 && g > 250 && b > 250)) continue
    
    const color = `rgb(${r}, ${g}, ${b})`
    colorMap.set(color, (colorMap.get(color) || 0) + 1)
  }
  
  // Get top colors
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([color]) => color)
  
  // Identify text color (usually darkest non-black)
  const textColor = sortedColors.find(c => {
    const match = c.match(/rgb\((\d+), (\d+), (\d+)\)/)
    if (!match) return false
    const [, r, g, b] = match.map(Number)
    const brightness = (r + g + b) / 3
    return brightness < 100 && brightness > 0
  }) || 'rgb(0, 0, 0)'
  
  // Identify accent color (usually most saturated non-text color)
  const accentColor = sortedColors.find(c => {
    const match = c.match(/rgb\((\d+), (\d+), (\d+)\)/)
    if (!match) return false
    const [, r, g, b] = match.map(Number)
    const saturation = Math.max(r, g, b) - Math.min(r, g, b)
    return saturation > 50 && c !== textColor
  }) || sortedColors[1] || 'rgb(102, 126, 234)'
  
  return {
    text: textColor,
    accent: accentColor,
    background: 'rgb(255, 255, 255)',
    dominant: sortedColors
  }
}

/**
 * Analyze layout structure
 */
function analyzeLayout(imageData, data, viewport) {
  const width = imageData.width
  const height = imageData.height
  
  // Detect margins by finding content boundaries
  const margins = detectMargins(imageData, data, width, height)
  
  // Detect line spacing
  const lineSpacing = detectLineSpacing(imageData, data, width, height)
  
  // Detect section spacing
  const sectionSpacing = detectSectionSpacing(imageData, data, width, height)
  
  return {
    margins,
    lineSpacing,
    sectionSpacing,
    pageWidth: viewport.width,
    pageHeight: viewport.height
  }
}

/**
 * Detect page margins by analyzing content boundaries
 */
function detectMargins(imageData, data, width, height) {
  // Use much larger sample rate for speed
  const sampleRate = 50 // Sample every 50th pixel
  let leftMargin = width
  let rightMargin = 0
  let topMargin = height
  let bottomMargin = 0
  
  // Scan for content (non-white pixels) - much faster with larger sample rate
  for (let y = 0; y < height; y += sampleRate) {
    for (let x = 0; x < width; x += sampleRate) {
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const a = data[idx + 3]
      
      // If pixel is not white/transparent, it's content
      if (a > 0 && (r < 250 || g < 250 || b < 250)) {
        if (x < leftMargin) leftMargin = x
        if (x > rightMargin) rightMargin = x
        if (y < topMargin) topMargin = y
        if (y > bottomMargin) bottomMargin = y
      }
    }
  }
  
  // Convert to points (scale is 1.0 now)
  const scale = 1.0
  return {
    left: Math.round(leftMargin / scale),
    right: Math.round((width - rightMargin) / scale),
    top: Math.round(topMargin / scale),
    bottom: Math.round((height - bottomMargin) / scale)
  }
}

/**
 * Detect line spacing by analyzing vertical gaps
 */
function detectLineSpacing(imageData, data, width, height) {
  // Simplified: analyze vertical distribution of text
  // This is a basic implementation - could be enhanced
  const verticalDensity = new Array(Math.floor(height / 20)).fill(0) // Larger bins for speed
  
  for (let y = 0; y < height; y += 20) { // Larger step for speed
    let hasContent = false
    for (let x = 0; x < width; x += 20) { // Larger step for speed
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      
      if (r < 250 || g < 250 || b < 250) {
        hasContent = true
        break
      }
    }
    if (hasContent) {
      verticalDensity[Math.floor(y / 10)]++
    }
  }
  
  // Find average gap between content lines
  let gaps = []
  let lastContent = -1
  for (let i = 0; i < verticalDensity.length; i++) {
      if (verticalDensity[i] > 0) {
        if (lastContent >= 0) {
          gaps.push((i - lastContent) * 20) // Adjusted for larger bins
        }
        lastContent = i
      }
    }
  
  const avgGap = gaps.length > 0 
    ? gaps.reduce((a, b) => a + b, 0) / gaps.length
    : 12
  
  return Math.round(avgGap / 1.0) // Scale is 1.0 now
}

/**
 * Detect section spacing
 */
function detectSectionSpacing(imageData, data, width, height) {
  // Similar to line spacing but looking for larger gaps
  // This is simplified - could use more sophisticated algorithms
  return detectLineSpacing(imageData, data, width, height) * 2
}

/**
 * Detect visual elements like lines, borders, dividers
 */
function detectVisualElements(imageData, data, viewport) {
  const elements = {
    horizontalLines: [],
    verticalLines: [],
    borders: []
  }
  
  // Detect horizontal lines (section dividers, underlines)
  // Scan for continuous horizontal lines of similar color
  const width = imageData.width
  const height = imageData.height
  
  // Sample horizontal lines - much sparser for speed
  for (let y = 0; y < height; y += 20) { // Larger step
    let lineLength = 0
    let lineStart = -1
    const lineColor = { r: 0, g: 0, b: 0 }
    
    for (let x = 0; x < width; x += 5) { // Sample every 5th pixel
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      
      // Detect dark lines (potential dividers)
      if (r < 200 && g < 200 && b < 200) {
        if (lineStart === -1) {
          lineStart = x
          lineColor.r = r
          lineColor.g = g
          lineColor.b = b
        }
        lineLength++
      } else {
        if (lineLength > width * 0.3) {
          // Significant horizontal line found
          elements.horizontalLines.push({
            y: y / 1.0, // Scale is 1.0 now
            x: lineStart / 1.0,
            length: lineLength / 1.0,
            color: `rgb(${lineColor.r}, ${lineColor.g}, ${lineColor.b})`
          })
        }
        lineLength = 0
        lineStart = -1
      }
    }
  }
  
  return elements
}

/**
 * Analyze PDF with OpenAI Vision API (required)
 * @param {string} imageData - Base64 image data
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object>} AI analysis results
 */
export async function analyzeWithOpenAI(imageData, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('OpenAI API key is required')
  }

  try {
    // Convert base64 to format OpenAI expects
    const base64Image = imageData.split(',')[1]
    
    if (!base64Image) {
      throw new Error('Invalid image data provided to OpenAI')
    }
    
    console.log('Calling OpenAI Vision API with model: gpt-4o')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Updated to current vision model
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this resume PDF image and extract detailed design specifications in JSON format. Include:

FONTS (for each element type):
- Name: size, weight (bold/normal), style (italic/normal), family
- Section Titles: size, weight, style, family, transform (uppercase/lowercase/capitalize/none)
- Subtitles: size, weight, style, family
- Company Names: size, weight, style, family
- Role Titles: size, weight, style, family
- Dates: size, weight, style, family
- Body Text: size, weight, style, family, lineHeight
- Bullet Text: size, weight, style, family
- Contact Info: size, weight, style, family
- Skills: size, weight, style, family
- Education: size, weight, style, family

LAYOUT:
- Precise margins (top, bottom, left, right) in points
- Line spacing and paragraph spacing
- Section spacing

BULLETS:
- Bullet character (•, -, *, etc.)
- Indentation in points
- Line spacing
- Character spacing

LINKS:
- URLs found in the resume
- Link formatting (color, underline, clickable)
- Font styling for links

TRANSFORMS:
- Text transforms for section titles, name, company names, role titles

COLORS:
- Text color, accent color, background color

VISUAL ELEMENTS:
- Lines, borders, dividers
- Layout structure and alignment

Return a JSON object with these specifications.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      // Handle error response
      let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = `OpenAI API error: ${errorData.error.message || errorData.error.code || errorData.error.type || 'Unknown error'}`
          if (errorData.error.code === 'invalid_api_key') {
            errorMessage = 'Invalid OpenAI API key. Please check your API key and try again.'
          } else if (errorData.error.code === 'rate_limit_exceeded') {
            errorMessage = 'OpenAI API rate limit exceeded. Please try again in a moment.'
          } else if (errorData.error.code === 'insufficient_quota') {
            errorMessage = 'OpenAI API quota exceeded. Please check your account billing.'
          } else if (errorData.error.code === 'model_not_found') {
            errorMessage = 'OpenAI model not found. The API may have changed. Please contact support.'
          }
        }
      } catch (e) {
        // If we can't parse error response, use status text
        console.error('Error parsing OpenAI error response:', e)
        errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const analysisText = data.choices?.[0]?.message?.content
    
    if (!analysisText) {
      throw new Error('OpenAI API returned empty response')
    }
    
    // Try to extract and parse JSON from the response
    let specs = null
    
    // First, try to find JSON in the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        let jsonString = jsonMatch[0]
        
        // Clean up common JSON issues
        // Remove markdown code blocks if present
        jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '')
        
        // Try to fix common JSON issues
        // Fix unquoted property names (e.g., {name: "value"} -> {"name": "value"})
        jsonString = jsonString.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
        
        // Parse the cleaned JSON
        specs = JSON.parse(jsonString)
      } catch (parseError) {
        console.warn('Failed to parse OpenAI JSON response:', parseError)
        console.warn('Raw response:', analysisText)
        console.warn('Extracted JSON:', jsonMatch[0])
        
        // Try alternative parsing methods
        try {
          // Try to extract just the JSON object more carefully
          const cleaned = analysisText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim()
          
          // Find the first { and last }
          const firstBrace = cleaned.indexOf('{')
          const lastBrace = cleaned.lastIndexOf('}')
          
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonSubstring = cleaned.substring(firstBrace, lastBrace + 1)
            specs = JSON.parse(jsonSubstring)
          }
        } catch (secondTryError) {
          console.error('Second attempt to parse JSON also failed:', secondTryError)
          // Return null specs - we'll use programmatic extraction
        }
      }
    }
    
    return {
      success: true,
      specs,
      rawResponse: analysisText
    }
  } catch (error) {
    console.error('OpenAI Vision API error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // If it's a JSON parse error, provide more helpful message and continue without AI specs
    if (error.message && (error.message.includes('JSON') || error.message.includes('parse'))) {
      console.warn('JSON parsing failed, continuing without AI specs. Will use programmatic extraction.')
      // Return success but with null specs - the system will use programmatic extraction
      return {
        success: true,
        specs: null,
        rawResponse: null,
        error: 'AI analysis returned invalid JSON, using programmatic extraction instead'
      }
    }
    
    // For other errors, throw as before (since OpenAI is required)
    throw error
  }
}

