import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function getRandomCards(cards: any[], count: number): any[] {
  const shuffled = [...cards].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getCardTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC84C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD'
  };
  
  return typeColors[type.toLowerCase()] || '#A8A77A';
}

export function calculateCardRarity(card: any): number {
  const rarityScores: Record<string, number> = {
    'common': 1,
    'uncommon': 2,
    'rare': 3,
    'rare holo': 4,
    'ultra rare': 5,
    'secret rare': 6
  };
  
  // Handle case variations in rarity names
  const normalizedRarity = card.rarity.toLowerCase().replace(/\s+/g, ' ');
  
  // Check for partial matches if exact match isn't found
  if (rarityScores[normalizedRarity] !== undefined) {
    return rarityScores[normalizedRarity];
  }
  
  // Try to find a partial match
  for (const [key, score] of Object.entries(rarityScores)) {
    if (normalizedRarity.includes(key)) {
      return score;
    }
  }
  
  return 1; // Default to common
}

export function getCardTexture(rarityLevel: number): string {
  // Return different texture patterns based on rarity level
  switch (rarityLevel) {
    case 1: // Common
      return `
        repeating-linear-gradient(
          45deg,
          rgba(0, 0, 0, 0.03),
          rgba(0, 0, 0, 0.03) 1px,
          transparent 1px,
          transparent 10px
        )
      `; // Matte finish
    case 2: // Uncommon
      return `
        linear-gradient(
          to right,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(255, 255, 255, 0.1) 50%,
          rgba(255, 255, 255, 0.05) 100%
        )
      `; // Glossy finish
    case 3: // Rare
      return `
        repeating-linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.07),
          rgba(255, 255, 255, 0.07) 2px,
          rgba(255, 255, 255, 0.04) 2px,
          rgba(255, 255, 255, 0.04) 4px
        )
      `; // Linen texture
    case 4: // Rare Holo
      return `
        repeating-linear-gradient(
          -45deg,
          rgba(255, 255, 255, 0),
          rgba(255, 255, 255, 0.1) 1px,
          rgba(255, 255, 255, 0) 2px,
          rgba(255, 255, 255, 0) 6px
        )
      `; // Silk texture
    case 5: // Ultra Rare
      return `
        radial-gradient(
          circle at 50% 50%,
          rgba(255, 255, 255, 0.1) 0%,
          rgba(255, 255, 255, 0.05) 30%,
          rgba(255, 255, 255, 0.1) 60%,
          rgba(255, 255, 255, 0.05) 100%
        )
      `; // Brushed metal texture
    case 6: // Secret Rare
      return `
        repeating-conic-gradient(
          rgba(255, 255, 255, 0.2) 0deg 5deg,
          rgba(255, 255, 255, 0.1) 5deg 10deg,
          rgba(255, 255, 255, 0.05) 10deg 15deg,
          rgba(255, 255, 255, 0) 15deg 20deg
        )
      `; // Etched foil texture
    default:
      return ''; // No texture
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
