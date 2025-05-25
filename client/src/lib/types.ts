export interface Card {
  id: string;
  name: string;
  number: string;
  image: string;
  type: string;
  rarity: string;
  set: string;
  description?: string;
  releaseDate?: string;
  abilities?: Ability[];
  owned: number;
}

export interface Ability {
  name: string;
  damage?: string;
  description?: string;
}

export interface PackType {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  cardsPerPack: number;
}

export interface UserState {
  gems: number;
  packInventory: { [packId: string]: number };
  lastDailyReward?: string;
}

export interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  completion: number;
}

export interface CollectionFilters {
  type: string;
  searchTerm: string;
  sortBy: string;
}
