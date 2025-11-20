import { useState } from 'react'
import './OpenAISettings.css'

const OpenAISettings = ({ onApiKeySet, currentApiKey }) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '')
  const [showInput, setShowInput] = useState(!currentApiKey)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    try {
      // Save to localStorage
      if (apiKey.trim()) {
        localStorage.setItem('openai_api_key', apiKey.trim())
        onApiKeySet(apiKey.trim())
        setShowInput(false)
      } else {
        localStorage.removeItem('openai_api_key')
        onApiKeySet('')
        setShowInput(false)
      }
    } catch (error) {
      console.error('Error saving API key:', error)
      alert('Error saving API key')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = () => {
    setApiKey('')
    localStorage.removeItem('openai_api_key')
    onApiKeySet('')
    setShowInput(true)
  }

  if (!showInput && currentApiKey) {
    return (
      <div className="openai-settings">
        <div className="api-key-status">
          <span className="status-icon">✓</span>
          <span className="status-text">OpenAI API key configured</span>
          <button className="edit-button" onClick={() => setShowInput(true)}>
            Edit
          </button>
          <button className="remove-button" onClick={handleRemove}>
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="openai-settings">
      <div className="settings-header">
        <h3>OpenAI Vision API (Required)</h3>
        <p className="settings-description">
          OpenAI API key is required for resume analysis. The AI-powered visual analysis provides 
          accurate font detection, color extraction, layout analysis, and granular styling specifications.
        </p>
      </div>
      
      <div className="api-key-input-group">
        <input
          type="password"
          className="api-key-input"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isSaving}
        />
        <div className="api-key-actions">
          <button
            className="save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          {currentApiKey && (
            <button
              className="cancel-button"
              onClick={() => {
                setApiKey(currentApiKey)
                setShowInput(false)
              }}
              disabled={isSaving}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      <p className="api-key-note">
        Your API key is stored locally and never sent to our servers.
        <a 
          href="https://platform.openai.com/api-keys" 
          target="_blank" 
          rel="noopener noreferrer"
          className="api-key-link"
        >
          Get your API key here
        </a>
      </p>
    </div>
  )
}

export default OpenAISettings

