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
    
    // Create default packs
    const packs: InsertPack[] = [
      {
        packId: "standard",
        name: "Standard Pack",
        description: "5 random cards with at least one rare.",
        price: 500,
        image: "https://pixabay.com/get/g25ca5c113887885d1b2175aac99e5c3289a899e31464a173119752798e229f6b76bc730230cd09b61cee5e397dbed51b4b5a8738da10fbff93c050b18ba15861_1280.jpg",
        cardsPerPack: 5
      },
      {
        packId: "premium",
        name: "Premium Pack",
        description: "5 random cards with guaranteed ultra-rare.",
        price: 1000,
        image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
        cardsPerPack: 5
      },
      {
        packId: "cosmic",
        name: "Cosmic Eclipse",
        description: "Discover rare cosmic variants and holographic cards in this limited edition pack.",
        price: 1200,
        image: "https://images.unsplash.com/photo-1617854818583-09e7f077a156?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80",
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
        
        for (const tcgdexCard of tcgdexCards) {
          const card: InsertCard = this.mapTCGdexCardToInsertCard(tcgdexCard);
          await this.createCard(card);
        }
      }
    } catch (error) {
      console.error("Failed to prefetch cards from TCGdex API", error);
      
      // Fallback to mock cards if API fails
      await this.createMockCards();
    }
  }
  
  private mapTCGdexCardToInsertCard(tcgdexCard: TCGdexCard): InsertCard {
    // Transform the image URL to use the updated domain format
    let imageUrl = tcgdexCard.image || "";
    
    // Check if image URL contains the old domain and update it
    if (imageUrl && imageUrl.includes('assets.tcgdex.net')) {
      // Replace the old domain with the new one
      imageUrl = imageUrl.replace('assets.tcgdex.net', 'tcgdex.dev/assets');
    }
    
    // Use placeholder if no image is available
    if (!imageUrl) {
      imageUrl = "https://via.placeholder.com/300x400?text=Card+Image";
    }
    
    return {
      cardId: tcgdexCard.id,
      name: tcgdexCard.name.en,
      number: tcgdexCard.number,
      image: imageUrl,
      type: tcgdexCard.types?.[0] || "Normal",
      rarity: tcgdexCard.rarity || "Common",
      set: tcgdexCard.set?.name?.en || "Base Set",
      description: tcgdexCard.description?.en,
      releaseDate: new Date().toISOString().split('T')[0],
      abilities: tcgdexCard.abilities || []
    };
  }
  
  private async createMockCards() {
    const mockCards: InsertCard[] = [
      {
        cardId: "charizard",
        name: "Charizard",
        number: "006",
        image: "https://images.unsplash.com/photo-1605979257913-1704eb7b6246?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80",
        type: "Fire",
        rarity: "Holographic Rare",
        set: "Base Set",
        description: "Charizard flies around the sky in search of powerful opponents. It breathes fire of such great heat that it melts anything. However, it never turns its fiery breath on any opponent weaker than itself.",
        releaseDate: "1999-01-09",
        abilities: [
          {
            name: "Fire Spin",
            damage: "100",
            description: "Discard 2 Energy cards attached to Charizard in order to use this attack."
          }
        ]
      },
      {
        cardId: "blastoise",
        name: "Blastoise",
        number: "009",
        image: "https://images.unsplash.com/photo-1606041011872-596597976b25?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80",
        type: "Water",
        rarity: "Holographic Rare",
        set: "Base Set",
        description: "A brutal Pokémon with pressurized water jets on its shell. They are used for high-speed tackles.",
        releaseDate: "1999-01-09",
        abilities: [
          {
            name: "Hydro Pump",
            damage: "60+",
            description: "Does 60 damage plus 10 more damage for each Water Energy attached to Blastoise but not used to pay for this attack's Energy cost."
          }
        ]
      },
      {
        cardId: "venusaur",
        name: "Venusaur",
        number: "003",
        image: "https://pixabay.com/get/g7518408ed92e8587bb371e5e416d4408283dbb5ac3880c90dd0177a77a1e9fecc896e87a94a53f1dbedec98350f41a4c4133be823e6dffce824d301ab85a7f0e_1280.jpg",
        type: "Grass",
        rarity: "Holographic Rare",
        set: "Base Set",
        description: "The plant blooms when it is absorbing solar energy. It stays on the move to seek sunlight.",
        releaseDate: "1999-01-09",
        abilities: [
          {
            name: "Solar Beam",
            damage: "60",
            description: "No additional effect."
          }
        ]
      },
      {
        cardId: "pikachu",
        name: "Pikachu",
        number: "025",
        image: "https://pixabay.com/get/gb3f779830b568b001471ff10131c643dc5119ec0ff97e8ee58811f1bbe7dbffa9bbc848281b6193153cdfc102f1684f50c41de4a184e85813cbb94d09a4e4722_1280.jpg",
        type: "Electric",
        rarity: "Common",
        set: "Base Set",
        description: "When several of these Pokémon gather, their electricity could build and cause lightning storms.",
        releaseDate: "1999-01-09",
        abilities: [
          {
            name: "Thunder Shock",
            damage: "30",
            description: "Flip a coin. If heads, the Defending Pokémon is now Paralyzed."
          }
        ]
      },
      {
        cardId: "mewtwo",
        name: "Mewtwo",
        number: "150",
        image: "https://images.unsplash.com/photo-1614583224978-f05ce51ef5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80",
        type: "Psychic",
        rarity: "Holographic Rare",
        set: "Base Set",
        description: "A Pokémon created by recombining Mew's genes. It's said to have the most savage heart among Pokémon.",
        releaseDate: "1999-01-09",
        abilities: [
          {
            name: "Psychic",
            damage: "10+",
            description: "Does 10 damage plus 10 more damage for each Energy card attached to the Defending Pokémon."
          },
          {
            name: "Barrier",
            damage: "",
            description: "Discard 1 Psychic Energy card attached to Mewtwo in order to prevent all damage done to Mewtwo during your opponent's next turn."
          }
        ]
      },
      {
        cardId: "machamp",
        name: "Machamp",
        number: "068",
        image: "https://pixabay.com/get/gefde875c46dee89e279955f406b37ca3e66faa1627c1d8e2a42a96f5ca7a2d242f2f051c87dc52079466b106d7741410141e424eb70213f4ec0da3cd1fc442dc_1280.jpg",
        type: "Fighting",
        rarity: "Holographic Rare",
        set: "Base Set",
        description: "Using its heavy muscles, it throws powerful punches that can send the victim clear over the horizon.",
        releaseDate: "1999-01-09",
        abilities: [
          {
            name: "Seismic Toss",
            damage: "60",
            description: "No additional effect."
          }
        ]
      }
    ];
    
    for (const card of mockCards) {
      await this.createCard(card);
    }
    
    // Add some cards to the default user's collection for demo purposes
    const userId = 1;
    const cardIds = Array.from(this.cards.values()).map(card => card.id);
    
    for (let i = 0; i < Math.min(6, cardIds.length); i++) {
      this.collection.push({
        id: this.collectionIdCounter++,
        userId,
        cardId: cardIds[i],
        dateAcquired: new Date(),
        isFavorite: i === 0 // Make the first card a favorite
      });
    }
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
  
  // Card methods
  async getAllCards(): Promise<CardWithOwned[]> {
    // Convert to CardWithOwned format
    return Array.from(this.cards.values()).map(card => ({
      ...card,
      owned: this.getCardOwnedCount(1, card.id) // Using default user id 1
    }));
  }
  
  async getCardById(cardId: string): Promise<CardWithOwned | undefined> {
    const card = Array.from(this.cards.values()).find(card => card.cardId === cardId);
    if (!card) return undefined;
    
    return {
      ...card,
      owned: this.getCardOwnedCount(1, card.id) // Using default user id 1
    };
  }
  
  async createCard(insertCard: InsertCard): Promise<Card> {
    const id = this.cardIdCounter++;
    const card: Card = { ...insertCard, id };
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
    const pack: Pack = { ...insertPack, id };
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
    
    // Convert to CardWithOwned format
    return selectedCards.map(card => ({
      ...card,
      owned: this.getCardOwnedCount(1, card.id) // Using default user id 1
    }));
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
    const uniqueCardIds = [...new Set(userCollection.map(entry => entry.cardId))];
    
    // Get card details for each unique card
    const cardsWithOwned: CardWithOwned[] = [];
    
    for (const cardId of uniqueCardIds) {
      const card = Array.from(this.cards.values()).find(card => card.id === cardId);
      if (card) {
        cardsWithOwned.push({
          ...card,
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
