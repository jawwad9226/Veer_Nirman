import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  memory: '1GiB',
  timeoutSeconds: 300,
});

// Main API function
export const api = onRequest(
  {
    cors: true,
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      // Add CORS headers
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).send();
        return;
      }

      const path = req.path || '/';
      const method = req.method;

      // Route handling
      if (path === '/health' && method === 'GET') {
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'veer-nirman-backend',
          version: '2.0.0',
          environment: 'production'
        });
        return;
      }

      if (path === '/chat' && method === 'POST') {
        const { message } = req.body;
        if (!message) {
          res.status(400).json({ error: 'Message is required' });
          return;
        }
        
        // Your Gemini AI integration here
        const config = functions.config();
        const apiKey = config.gemini?.api_key;
        
        res.json({ 
          response: `AI Response to: ${message}`,
          apiKey: apiKey ? 'configured' : 'not configured'
        });
        return;
      }

      // Default response
      res.status(404).json({ error: 'Route not found' });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Health check function
export const health = onRequest(
  {
    cors: true,
  },
  async (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'veer-nirman-backend',
      version: '2.0.0',
      environment: 'production'
    });
  }
);

// Chat function
export const chat = onRequest(
  {
    cors: true,
  },
  async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      // Get Firebase Functions config
      const config = functions.config();
      const apiKey = config.gemini?.api_key;
      
      if (!apiKey) {
        res.status(500).json({ error: 'Gemini API key not configured' });
        return;
      }

      // Your Gemini AI integration here
      const response = `AI Response to: ${message}`;
      
      res.json({ response });
    } catch (error) {
      console.error('Chat Error:', error);
      res.status(500).json({ error: 'Chat service unavailable' });
    }
  }
);
