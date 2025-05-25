import { Card } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden transition transform hover:scale-105 duration-300">
        <img 
          src={card.image} 
          alt={card.name} 
          className="w-full h-40 object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = `https://via.placeholder.com/300x400/FF6B6B/FFFFFF.png?text=${encodeURIComponent(card.name)}`;
          }}
        />
        <div className="p-2">
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
