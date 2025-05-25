import express from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = express.Router();
  
  // Get all cards
  apiRouter.get("/cards", async (_req, res) => {
    try {
      const cards = await storage.getAllCards();
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  // Get card by ID
  apiRouter.get("/cards/:id", async (req, res) => {
    try {
      const card = await storage.getCardById(req.params.id);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      res.json(card);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch card" });
    }
  });

  // Get all packs
  apiRouter.get("/packs", async (_req, res) => {
    try {
      const packs = await storage.getAllPacks();
      res.json(packs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packs" });
    }
  });

  // Open a pack (get random cards)
  apiRouter.post("/packs/:id/open", async (req, res) => {
    try {
      const packId = req.params.id;
      const cards = await storage.openPack(packId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to open pack" });
    }
  });

  // Get user collection
  apiRouter.get("/collection", async (_req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      // For now, use a default user ID
      const userId = 1;
      const collection = await storage.getUserCollection(userId);
      res.json(collection);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  // Add cards to collection
  apiRouter.post("/collection", async (req, res) => {
    try {
      const schema = z.object({
        cards: z.array(z.object({
          id: z.string(),
          name: z.string(),
          number: z.string(),
          image: z.string(),
          type: z.string(),
          rarity: z.string(),
          set: z.string(),
          description: z.string().optional(),
          releaseDate: z.string().optional(),
          abilities: z.array(z.object({
            name: z.string(),
            damage: z.string().optional(),
            description: z.string().optional()
          })).optional(),
          owned: z.number().optional()
        }))
      });

      const { cards } = schema.parse(req.body);
      
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      await storage.addCardsToCollection(userId, cards);
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add cards to collection" });
    }
  });

  // Filter collection
  apiRouter.get("/collection/filter", async (req, res) => {
    try {
      const type = req.query.type as string || "all";
      const search = req.query.search as string || "";
      
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      const filtered = await storage.filterUserCollection(userId, type, search);
      res.json(filtered);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter collection" });
    }
  });

  // Sort collection
  apiRouter.get("/collection/sort", async (req, res) => {
    try {
      const sortBy = req.query.by as string || "name";
      
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      const sorted = await storage.sortUserCollection(userId, sortBy);
      res.json(sorted);
    } catch (error) {
      res.status(500).json({ message: "Failed to sort collection" });
    }
  });

  // Get collection stats
  apiRouter.get("/collection/stats", async (_req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      const stats = await storage.getUserCollectionStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collection stats" });
    }
  });

  // User gems and daily rewards
  apiRouter.get("/user/gems", async (_req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      const gems = await storage.getUserGems(userId);
      res.json({ gems });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user gems" });
    }
  });

  apiRouter.post("/user/claim-daily", async (_req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      const result = await storage.claimDailyReward(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to claim daily reward" });
    }
  });

  // Mount the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
