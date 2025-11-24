/**
 * Utilities for handling one-page constraint for cover letters
 * Uses font scaling and spacing adjustments only
 */

/**
 * Adjust styling specs to fit content on one page
 * @param {Object} currentStyling - Current styling object
 * @returns {Object} Adjusted styling object with reduced fonts/spacing
 */
export function adjustCoverLetterStyling(currentStyling) {
  // Default styling if none provided
  const baseStyling = currentStyling || {
    fontSize: 11,
    lineHeight: 1.5,
    paragraphSpacing: 10,
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40
    }
  }

  // Create deep copy
  const adjusted = JSON.parse(JSON.stringify(baseStyling))

  // Reduction strategy:
  // 1. Reduce font size (down to 9pt)
  // 2. Reduce line height (down to 1.2)
  // 3. Reduce paragraph spacing (down to 6pt)
  // 4. Reduce margins (down to 30pt)

  // Decrease font size by 0.5pt, min 9pt
  if (adjusted.fontSize > 9) {
    adjusted.fontSize = Math.max(9, adjusted.fontSize - 0.5)
  }
  
  // Decrease line height, min 1.2
  if (adjusted.lineHeight > 1.2) {
    adjusted.lineHeight = Math.max(1.2, adjusted.lineHeight - 0.1)
  }

  // Decrease paragraph spacing, min 4pt
  if (adjusted.paragraphSpacing > 4) {
    adjusted.paragraphSpacing = Math.max(4, adjusted.paragraphSpacing - 2)
  }

  // Decrease margins if font/spacing reduction isn't aggressive enough
  // Only reduce margins if we're already at small font sizes
  if (adjusted.fontSize <= 10.5) {
    adjusted.margins = {
      top: Math.max(30, adjusted.margins.top - 5),
      bottom: Math.max(30, adjusted.margins.bottom - 5),
      left: Math.max(30, adjusted.margins.left - 5),
      right: Math.max(30, adjusted.margins.right - 5)
    }
  }

  return adjusted
}

