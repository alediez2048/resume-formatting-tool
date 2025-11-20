/**
 * Template Storage Utility
 * Handles saving and loading reference templates from localStorage
 */

const STORAGE_KEY = 'resume_reference_template'

/**
 * Save reference template to localStorage
 * @param {Object} template - The reference template object
 * @returns {boolean} Success status
 */
export function saveTemplate(template) {
  try {
    const templateData = JSON.stringify(template)
    localStorage.setItem(STORAGE_KEY, templateData)
    return { success: true }
  } catch (error) {
    console.error('Error saving template:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Load reference template from localStorage
 * @returns {Object|null} The saved template or null if not found
 */
export function loadTemplate() {
  try {
    const templateData = localStorage.getItem(STORAGE_KEY)
    if (!templateData) {
      return null
    }
    return JSON.parse(templateData)
  } catch (error) {
    console.error('Error loading template:', error)
    return null
  }
}

/**
 * Check if a template exists
 * @returns {boolean}
 */
export function hasTemplate() {
  return loadTemplate() !== null
}

/**
 * Delete the saved template
 * @returns {boolean} Success status
 */
export function deleteTemplate() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return { success: true }
  } catch (error) {
    console.error('Error deleting template:', error)
    return { success: false, error: error.message }
  }
}

