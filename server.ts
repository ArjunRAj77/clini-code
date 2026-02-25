import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock Analyze API
  app.post("/api/analyze", (req, res) => {
    // Simulate processing delay
    setTimeout(() => {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      // Mock response based on simple keyword matching for demonstration
      // In a real app, this would call an AI model
      const entities = [];
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes("diabetes")) {
        const index = lowerText.indexOf("diabetes");
        entities.push({
          term: "diabetes",
          start: index,
          end: index + 8,
          icd10: "E11.9",
          description: "Type 2 diabetes mellitus without complications",
          confidence: 0.95
        });
      }
      
      if (lowerText.includes("hypertension")) {
        const index = lowerText.indexOf("hypertension");
        entities.push({
          term: "hypertension",
          start: index,
          end: index + 12,
          icd10: "I10",
          description: "Essential (primary) hypertension",
          confidence: 0.88
        });
      }

      if (lowerText.includes("headache")) {
        const index = lowerText.indexOf("headache");
        entities.push({
          term: "headache",
          start: index,
          end: index + 8,
          icd10: "R51",
          description: "Headache",
          confidence: 0.75
        });
      }

      // If no keywords found, return a generic mock if text is long enough
      if (entities.length === 0 && text.length > 10) {
         entities.push({
          term: text.substring(0, 5),
          start: 0,
          end: 5,
          icd10: "Z00.00",
          description: "Encounter for general adult medical examination without abnormal findings",
          confidence: 0.60
        });
      }

      res.json({ entities });
    }, 1500); // 1.5s delay
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving would go here
    // app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
