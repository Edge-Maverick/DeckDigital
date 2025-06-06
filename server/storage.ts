import { 
  User, InsertUser, 
  Card, InsertCard, 
  Pack, InsertPack, 
  Collection, InsertCollection, 
  PackInventory, InsertPackInventory 
} from "@shared/schema";
import axios from "axios";

// Types for TCGdex API integration
interface TCGdexCard {
  id: string;
  name: {
    en: string;
  };
  number: string;
  image: string;
  types: string[];
  rarity: string;
  set: {
    id: string;
    name: {
      en: string;
    };
  };
  description?: {
    en: string;
  };
  abilities?: {
    name: string;
    damage?: string;
    description?: string;
  }[];
}

// Collection stats type
interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  completion: number;
}

// Card with owned count type
interface CardWithOwned extends Card {
  owned: number;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserGems(userId: number): Promise<number>;
  updateUserGems(userId: number, gems: number): Promise<void>;
  claimDailyReward(userId: number): Promise<{ success: boolean; gems: number; message: string }>;
  
  // Card methods
  getAllCards(): Promise<CardWithOwned[]>;
  getCardById(cardId: string): Promise<CardWithOwned | undefined>;
  createCard(card: InsertCard): Promise<Card>;
  
  // Pack methods
  getAllPacks(): Promise<Pack[]>;
  getPackById(packId: string): Promise<Pack | undefined>;
  createPack(pack: InsertPack): Promise<Pack>;
  openPack(packId: string): Promise<CardWithOwned[]>;
  
  // Collection methods
  getUserCollection(userId: number): Promise<CardWithOwned[]>;
  addCardsToCollection(userId: number, cards: any[]): Promise<void>;
  filterUserCollection(userId: number, type: string, search: string): Promise<CardWithOwned[]>;
  sortUserCollection(userId: number, sortBy: string): Promise<CardWithOwned[]>;
  getUserCollectionStats(userId: number): Promise<CollectionStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cards: Map<string, Card>;
  private packs: Map<string, Pack>;
  private collection: Collection[];
  private packInventory: PackInventory[];
  
  private userIdCounter: number;
  private cardIdCounter: number;
  private packIdCounter: number;
  private collectionIdCounter: number;
  private packInventoryIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.cards = new Map();
    this.packs = new Map();
    this.collection = [];
    this.packInventory = [];
    
    this.userIdCounter = 1;
    this.cardIdCounter = 1;
    this.packIdCounter = 1;
    this.collectionIdCounter = 1;
    this.packInventoryIdCounter = 1;
    
    // Initialize with seed data
    this.initializeData();
  }
  
  private async initializeData() {
    // Create default user
    const defaultUser: InsertUser = {
      username: "user",
      password: "password"
    };
    
    await this.createUser(defaultUser);
    
    // Create default packs with placeholder assets
    const packs: InsertPack[] = [
      {
        packId: "standard",
        name: "Base Set Pack",
        description: "5 random cards with at least one rare.",
        price: 500,
        image: "https://images.unsplash.com/photo-1627627242449-e647449d6a80?w=400&q=80",
        cardsPerPack: 5
      },
      {
        packId: "premium",
        name: "Sword & Shield Pack",
        description: "5 random cards with guaranteed ultra-rare.",
        price: 1000,
        image: "https://images.unsplash.com/photo-1614271762795-2b2bd5b67b8b?w=400&q=80",
        cardsPerPack: 5
      },
      {
        packId: "cosmic",
        name: "Cosmic Eclipse",
        description: "Discover rare cosmic variants and holographic cards in this limited edition pack.",
        price: 1200,
        image: "https://images.unsplash.com/photo-1540206395-68808572332f?w=400&q=80",
        cardsPerPack: 5
      }
    ];
    
    for (const pack of packs) {
      await this.createPack(pack);
    }
    
    // Pre-fetch some cards from TCGdex API
    await this.prefetchCards();
  }
  
  private async prefetchCards() {
    try {
      // Fetch cards from the TCGdex API (using a proxy service or direct if allowed)
      const response = await axios.get("https://api.tcgdex.net/v2/en/cards");
      
      if (response.data && Array.isArray(response.data)) {
        // Process only the first 100 cards to avoid overloading
        const tcgdexCards = response.data.slice(0, 100);
        
        let successCount = 0;
        for (const tcgdexCard of tcgdexCards) {
          try {
            // Only process cards with valid TCGdex images
            if (tcgdexCard.image && tcgdexCard.image.includes('assets.tcgdex.net')) {
              const card: InsertCard = this.mapTCGdexCardToInsertCard(tcgdexCard);
              await this.createCard(card);
              successCount++;
            }
          } catch (cardError) {
            // Skip cards that don't have valid data
            console.log(`Skipping card due to invalid data: ${tcgdexCard.id || 'unknown'}`);
          }
        }
        
        console.log(`Successfully added ${successCount} cards from TCGdex API`);
      }
    } catch (error) {
      console.error("Failed to prefetch cards from TCGdex API", error);
      // No fallback to mock cards - we only use authentic TCGdex data
    }
  }
  
  private mapTCGdexCardToInsertCard(tcgdexCard: TCGdexCard): InsertCard {
    // Skip cards without valid TCGdex images
    if (!tcgdexCard.image || !tcgdexCard.image.includes('assets.tcgdex.net')) {
      throw new Error("Card does not have a valid TCGdex image");
    }
    
    // Format the image URL with high quality and png extension
    // Original format: https://assets.tcgdex.net/en/swsh/swsh3/136/high.png
    // Extract the base path by removing any existing quality/extension
    const baseUrlParts = tcgdexCard.image.split('/');
    // Remove the last part (which might have quality.extension)
    baseUrlParts.pop();
    // Add our specified quality and extension
    const formattedImageUrl = `${baseUrlParts.join('/')}/high.png`;
    
    return {
      cardId: tcgdexCard.id,
      name: tcgdexCard.name.en,
      number: tcgdexCard.number,
      image: formattedImageUrl,
      type: tcgdexCard.types?.[0] || "Normal",
      rarity: tcgdexCard.rarity || "Common",
      set: tcgdexCard.set?.name?.en || "Base Set",
      description: tcgdexCard.description?.en,
      releaseDate: new Date().toISOString().split('T')[0],
      abilities: tcgdexCard.abilities || []
    };
  }
  
  private async createMockCards() {
    console.log("Not creating mock cards - only using authentic TCGdex data");
    
    // No mock cards are created - we'll only use authentic TCGdex data
    // This empty method is kept to maintain code structure
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      gems: 2500, 
      lastDailyReward: null 
    };
    this.users.set(id, user);
    return user;
  }
  
  async getUserGems(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user.gems;
  }
  
  async updateUserGems(userId: number, gems: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.gems = gems;
    this.users.set(userId, user);
  }
  
  async claimDailyReward(userId: number): Promise<{ success: boolean; gems: number; message: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const now = new Date();
    
    // Check if user has already claimed today's reward
    if (user.lastDailyReward) {
      const lastClaim = new Date(user.lastDailyReward);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const claimDate = new Date(lastClaim.getFullYear(), lastClaim.getMonth(), lastClaim.getDate());
      
      if (today.getTime() === claimDate.getTime()) {
        return {
          success: false,
          gems: user.gems,
          message: "You have already claimed your daily reward today"
        };
      }
    }
    
    // Grant reward - 500 gems and a standard pack
    const rewardGems = 500;
    user.gems += rewardGems;
    user.lastDailyReward = now;
    
    // Add a standard pack to inventory
    const standardPack = Array.from(this.packs.values()).find(pack => pack.packId === "standard");
    if (standardPack) {
      const existingInventory = this.packInventory.find(
        inv => inv.userId === userId && inv.packId === standardPack.id
      );
      
      if (existingInventory) {
        existingInventory.quantity += 1;
      } else {
        this.packInventory.push({
          id: this.packInventoryIdCounter++,
          userId,
          packId: standardPack.id,
          quantity: 1
        });
      }
    }
    
    this.users.set(userId, user);
    
    return {
      success: true,
      gems: user.gems,
      message: "You received 500 gems and 1 Standard Pack!"
    };
  }
  
  // Format TCGdex image URLs to use high quality and WebP format
  private formatTCGdexImageUrl(imageUrl: string, cardId?: string): string {
    if (imageUrl && imageUrl.includes('assets.tcgdex.net')) {
      try {
        // For card images, we need to construct the URL differently
        if (cardId && cardId.includes('-')) {
          const [setCode, cardNumber] = cardId.split('-');
          
          // If we're dealing with a card image, format it properly
          if (setCode && cardNumber) {
            // TCGdex URL structure: https://assets.tcgdex.net/en/[series]/[set]/[number]/[quality].[format]
            // Extract the series from the URL (e.g., 'base', 'sm', 'swsh')
            const urlParts = imageUrl.split('/');
            const seriesIndex = urlParts.findIndex(part => part === 'en') + 1;
            const series = seriesIndex < urlParts.length ? urlParts[seriesIndex] : '';
            
            if (series) {
              return `https://assets.tcgdex.net/en/${series}/${setCode}/${cardNumber}/high.webp`;
            }
          }
        }
        
        // For pack images or when we can't extract card info, use a simpler approach
        // Just ensure the URL ends with high.webp
        const baseUrl = imageUrl.split('/high.')[0]; // Remove any existing quality/format suffix
        return `${baseUrl}/high.webp`;
      } catch (error) {
        console.error('Error formatting TCGdex URL:', error);
        return imageUrl; // Return original URL if there's an error
      }
    }
    return imageUrl;
  }

  // Card methods
  async getAllCards(): Promise<CardWithOwned[]> {
    // Convert to CardWithOwned format and update image URLs
    return Array.from(this.cards.values()).map(card => ({
      ...card,
      image: this.formatTCGdexImageUrl(card.image, card.cardId),
      owned: this.getCardOwnedCount(1, card.id) // Using default user id 1
    }));
  }
  
  async getCardById(cardId: string): Promise<CardWithOwned | undefined> {
    const card = Array.from(this.cards.values()).find(card => card.cardId === cardId);
    if (!card) return undefined;
    
    return {
      ...card,
      image: this.formatTCGdexImageUrl(card.image, card.cardId),
      owned: this.getCardOwnedCount(1, card.id) // Using default user id 1
    };
  }
  
  async createCard(insertCard: InsertCard): Promise<Card> {
    const id = this.cardIdCounter++;
    // Properly type and transform the abilities array
    const abilities = insertCard.abilities ? 
      insertCard.abilities.map((ability: any) => ({
        name: ability.name,
        damage: ability.damage || undefined,
        description: ability.description || undefined
      })) : 
      null;
      
    const card: Card = { 
      ...insertCard, 
      id,
      description: insertCard.description || null,
      releaseDate: insertCard.releaseDate || null,
      abilities: abilities
    };
    this.cards.set(insertCard.cardId, card);
    return card;
  }
  
  // Pack methods
  async getAllPacks(): Promise<Pack[]> {
    return Array.from(this.packs.values());
  }
  
  async getPackById(packId: string): Promise<Pack | undefined> {
    return Array.from(this.packs.values()).find(pack => pack.packId === packId);
  }
  
  async createPack(insertPack: InsertPack): Promise<Pack> {
    const id = this.packIdCounter++;
    const pack: Pack = { 
      ...insertPack, 
      id,
      cardsPerPack: insertPack.cardsPerPack || 5 // Default to 5 cards per pack
    };
    this.packs.set(insertPack.packId, pack);
    return pack;
  }
  
  async openPack(packId: string): Promise<CardWithOwned[]> {
    const pack = await this.getPackById(packId);
    if (!pack) {
      throw new Error("Pack not found");
    }
    
    // Get all cards
    const allCards = Array.from(this.cards.values());
    
    // Ensure we have enough cards
    if (allCards.length < pack.cardsPerPack) {
      throw new Error("Not enough cards available");
    }
    
    // Shuffle cards and pick random ones
    const shuffled = [...allCards].sort(() => 0.5 - Math.random());
    const selectedCards = shuffled.slice(0, pack.cardsPerPack);
    
    // Assign varied rarities based on pack type
    const rarityDistribution = this.getRarityDistributionForPack(packId);
    
    // Apply rarity distribution to the cards
    const enhancedCards = selectedCards.map((card, index) => {
      // Determine rarity based on the distribution and index
      const assignedRarity = rarityDistribution[index] || "Common";
      
      return {
        ...card,
        rarity: assignedRarity, // Override with our assigned rarity
        image: this.formatTCGdexImageUrl(card.image, card.cardId),
        owned: this.getCardOwnedCount(1, card.id) // Using default user id 1
      };
    });
    
    return enhancedCards;
  }
  
  // Collection methods
  async getUserCollection(userId: number): Promise<CardWithOwned[]> {
    // Get all collection entries for the user
    const userCollection = this.collection.filter(entry => entry.userId === userId);
    
    // Map of cardId to count
    const cardCounts = new Map<number, number>();
    
    // Count occurrences of each card
    userCollection.forEach(entry => {
      const count = cardCounts.get(entry.cardId) || 0;
      cardCounts.set(entry.cardId, count + 1);
    });
    
    // Get unique cards
    const uniqueCardIds = Array.from(new Set(userCollection.map(entry => entry.cardId)));
    
    // Get card details for each unique card
    const cardsWithOwned: CardWithOwned[] = [];
    
    for (const cardId of uniqueCardIds) {
      const card = Array.from(this.cards.values()).find(card => card.id === cardId);
      if (card) {
        cardsWithOwned.push({
          ...card,
          image: this.formatTCGdexImageUrl(card.image, card.cardId),
          owned: cardCounts.get(cardId) || 0
        });
      }
    }
    
    return cardsWithOwned;
  }
  
  async addCardsToCollection(userId: number, cards: any[]): Promise<void> {
    for (const cardData of cards) {
      // Find the actual card in storage
      const card = Array.from(this.cards.values()).find(c => c.cardId === cardData.id);
      
      if (card) {
        // Add to collection
        this.collection.push({
          id: this.collectionIdCounter++,
          userId,
          cardId: card.id,
          dateAcquired: new Date(),
          isFavorite: false
        });
      }
    }
  }
  
  async filterUserCollection(userId: number, type: string, search: string): Promise<CardWithOwned[]> {
    // Get the user's collection
    let collection = await this.getUserCollection(userId);
    
    // Filter by type if specified
    if (type && type !== "all") {
      collection = collection.filter(card => 
        card.type.toLowerCase() === type.toLowerCase()
      );
    }
    
    // Filter by search term if specified
    if (search) {
      const searchLower = search.toLowerCase();
      collection = collection.filter(card =>
        card.name.toLowerCase().includes(searchLower) ||
        card.number.includes(searchLower) ||
        card.set.toLowerCase().includes(searchLower)
      );
    }
    
    return collection;
  }
  
  async sortUserCollection(userId: number, sortBy: string): Promise<CardWithOwned[]> {
    // Get the user's collection
    const collection = await this.getUserCollection(userId);
    
    // Sort based on criteria
    switch (sortBy) {
      case "name":
        return collection.sort((a, b) => a.name.localeCompare(b.name));
      case "number":
        return collection.sort((a, b) => a.number.localeCompare(b.number));
      case "rarity":
        return collection.sort((a, b) => this.getRarityWeight(b.rarity) - this.getRarityWeight(a.rarity));
      case "date":
        // Sort by most recently acquired
        return collection.sort((a, b) => {
          const aDate = this.getLatestAcquisitionDate(userId, a.id);
          const bDate = this.getLatestAcquisitionDate(userId, b.id);
          return bDate.getTime() - aDate.getTime();
        });
      default:
        return collection;
    }
  }
  
  async getUserCollectionStats(userId: number): Promise<CollectionStats> {
    // Get user collection
    const userCollection = this.collection.filter(entry => entry.userId === userId);
    
    // Calculate stats
    const totalCards = userCollection.length;
    const uniqueCards = new Set(userCollection.map(entry => entry.cardId)).size;
    
    // Estimate completion percentage (assuming 500 total possible cards)
    const totalPossibleCards = Math.max(500, this.cards.size);
    const completion = Math.round((uniqueCards / totalPossibleCards) * 100);
    
    return {
      totalCards,
      uniqueCards,
      completion
    };
  }
  
  // Helper methods
  private getCardOwnedCount(userId: number, cardId: number): number {
    return this.collection.filter(
      entry => entry.userId === userId && entry.cardId === cardId
    ).length;
  }
  
  private getRarityWeight(rarity: string): number {
    const rarityWeights: Record<string, number> = {
      "Common": 1,
      "Uncommon": 2,
      "Rare": 3,
      "Holographic Rare": 4,
      "Ultra Rare": 5,
      "Secret Rare": 6
    };
    
    return rarityWeights[rarity] || 0;
  }
  
  private getRarityDistributionForPack(packId: string): string[] {
    // Different rarity distributions based on pack type
    switch (packId) {
      case "standard":
        // Standard pack: 3 common, 1 uncommon, 1 rare
        return [
          "Common", 
          "Common", 
          "Common", 
          "Uncommon", 
          "Rare"
        ];
        
      case "premium":
        // Premium pack: 2 common, 1 uncommon, 1 rare, 1 ultra rare
        return [
          "Common",
          "Common",
          "Uncommon",
          "Rare Holo",
          "Ultra Rare"
        ];
        
      case "cosmic":
        // Cosmic pack: 1 common, 2 uncommon, 1 rare holo, 1 secret rare
        return [
          "Common",
          "Uncommon",
          "Uncommon",
          "Rare Holo",
          "Secret Rare"
        ];
        
      default:
        // Default distribution for unknown pack types
        return [
          "Common",
          "Common",
          "Common",
          "Uncommon",
          "Rare"
        ];
    }
  }
  
  private getLatestAcquisitionDate(userId: number, cardId: number): Date {
    const entries = this.collection.filter(
      entry => entry.userId === userId && entry.cardId === cardId
    );
    
    if (entries.length === 0) return new Date(0);
    
    return entries.reduce((latest, entry) => {
      const entryDate = new Date(entry.dateAcquired);
      return entryDate > latest ? entryDate : latest;
    }, new Date(0));
  }
}

export const storage = new MemStorage();
