import { Card } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import HolographicTiltCard from "./HolographicTiltCard";

interface CardItemProps {
  card: Card;
  onClick?: (card: Card) => void;
  className?: string;
}

export default function CardItem({ card, onClick, className }: CardItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  return (
    <div 
      className={cn("card-container cursor-pointer", className)} 
      onClick={handleClick}
    >
      <div className="flex flex-col">
        {/* Holographic card image with 3D effect */}
        <div className="h-48 relative">
          <HolographicTiltCard 
            card={card} 
            className="w-full h-full mb-1"
          />
        </div>
        
        {/* Card details below the holographic image */}
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-2 mt-1">
          <p className="font-medium text-sm truncate">{card.name}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">#{card.number}</span>
            <Badge 
              variant={card.type.toLowerCase() as any} 
              className="capitalize"
            >
              {card.type}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CollectionCardGridProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
}

export function CollectionCardGrid({ cards, onCardClick }: CollectionCardGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
