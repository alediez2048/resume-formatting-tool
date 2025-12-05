import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large base64 images

// Proxy endpoint for OpenAI API
app.post('/api/openai/chat', async (req, res) => {
  const { apiKey, ...requestBody } = req.body;

  if (!apiKey) {
    return res.status(400).json({ 
      error: { message: 'API key is required' } 
    });
  }

  try {
    console.log('Proxying request to OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return res.status(response.status).json(data);
    }

    console.log('OpenAI API request successful');
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: { 
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to proxy OpenAI API requests`);
});

