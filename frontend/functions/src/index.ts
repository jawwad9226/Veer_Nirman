import {onRequest} from "firebase-functions/v2/https";
import {setGlobalOptions} from "firebase-functions/v2";
import * as admin from "firebase-admin";

// Import API handlers
import * as authApi from "./api/auth";
import * as quizApi from "./api/quiz";
import * as syllabusApi from "./api/syllabus";
import * as videosApi from "./api/videos";
import * as pdfApi from "./api/pdf";
import * as progressApi from "./api/progress";

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  memory: "1GiB",
  timeoutSeconds: 300,
});

// Main API function with comprehensive routing
export const api = onRequest(
  {
    cors: true,
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      // Add CORS headers
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS");
      res.set("Access-Control-Allow-Headers",
        "Content-Type, Authorization");

      // Handle preflight requests
      if (req.method === "OPTIONS") {
        res.status(200).send("");
        return;
      }

      const {method, path} = req;
      
      // Health check routes
      if (path === "/" || path === "/health") {
        res.json({
          message: "Veer Nirman API v2.0",
          status: "healthy",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Auth routes
      if (path === "/api/auth/login" && method === "POST") {
        await authApi.login(req, res);
        return;
      }
      if (path === "/api/auth/register" && method === "POST") {
        await authApi.register(req, res);
        return;
      }
      if (path === "/api/user/profile" && method === "GET") {
        await authApi.getProfile(req, res);
        return;
      }

      // Quiz routes
      if (path?.startsWith("/api/quiz") && method === "GET") {
        if (path === "/api/quiz/history") {
          await quizApi.getQuizHistory(req, res);
        } else {
          await quizApi.getQuiz(req, res);
        }
        return;
      }
      if (path === "/api/quiz/submit" && method === "POST") {
        await quizApi.submitQuiz(req, res);
        return;
      }

      // Syllabus routes
      if (path === "/api/syllabus" && method === "GET") {
        await syllabusApi.getSyllabus(req, res);
        return;
      }
      if (path === "/api/syllabus/progress" && method === "POST") {
        await syllabusApi.updateSyllabusProgress(req, res);
        return;
      }
      if (path === "/api/syllabus/progress" && method === "GET") {
        await syllabusApi.getUserSyllabusProgress(req, res);
        return;
      }

      // Video routes
      if (path === "/api/videos" && method === "GET") {
        await videosApi.getVideos(req, res);
        return;
      }
      if (path?.startsWith("/api/videos/") && method === "GET") {
        await videosApi.getVideoById(req, res);
        return;
      }
      if (path === "/api/videos" && method === "POST") {
        await videosApi.addVideo(req, res);
        return;
      }
      if (path === "/api/videos/progress" && method === "POST") {
        await videosApi.updateVideoProgress(req, res);
        return;
      }

      // PDF routes
      if (path === "/api/pdf" && method === "GET") {
        await pdfApi.getPDFs(req, res);
        return;
      }
      if (path?.startsWith("/api/pdf/") && method === "GET") {
        if (path.includes("/download/")) {
          await pdfApi.downloadPDF(req, res);
        } else if (path.includes("/search")) {
          await pdfApi.searchPDF(req, res);
        } else {
          await pdfApi.getPDFById(req, res);
        }
        return;
      }

      // Progress routes
      if (path === "/api/progress" && method === "GET") {
        await progressApi.getUserProgress(req, res);
        return;
      }
      if (path === "/api/progress" && method === "POST") {
        await progressApi.updateUserProgress(req, res);
        return;
      }
      if (path === "/api/progress/stats" && method === "GET") {
        await progressApi.getProgressStats(req, res);
        return;
      }

      // 404 for unmatched routes
      res.status(404).json({error: "Route not found"});
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);

// Health check function
export const health = onRequest(
  {
    cors: true,
    maxInstances: 5,
  },
  (req, res) => {
    res.json({
      status: "healthy",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
    });
  }
);

// Chat function (with Gemini AI integration)
export const chat = onRequest(
  {
    cors: true,
    maxInstances: 3,
  },
  async (req, res) => {
    try {
      // Add CORS headers
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

      // Handle preflight requests
      if (req.method === "OPTIONS") {
        res.status(200).send("");
        return;
      }

      // Get environment variables (Firebase Functions v2)
      const geminiApiKey = process.env.GEMINI_API_KEY;
      
      if (!geminiApiKey) {
        res.status(500).json({error: "Gemini API key not configured"});
        return;
      }

      const {message} = req.body;
      
      if (!message) {
        res.status(400).json({error: "Message is required"});
        return;
      }

      // Simple response for now
      const response = `You said: ${message}. This is a response from ` +
        "Veer Nirman AI assistant.";
      
      res.json({
        response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);
