import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, useAnimation } from "framer-motion";
import { Card as CardType } from "@/lib/types";
import { cn, calculateCardRarity, getCardTypeColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface HolographicCardProps {
  card: CardType;
  onClick?: (card: CardType) => void;
  className?: string;
  showDetails?: boolean;
}

export default function HolographicCard({ 
  card, 
  onClick, 
  className,
  showDetails = true 
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Motion values for tracking mouse/touch position
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Effect intensity based on rarity
  const rarityLevel = calculateCardRarity(card);
  const intensityFactor = rarityLevel / 6; // Normalize to 0-1 range
  
  // Transforms for 3D rotation
  const rotateX = useTransform(y, [-300, 300], [15, -15]);
  const rotateY = useTransform(x, [-300, 300], [-15, 15]);
  
  // Apply spring physics for smooth animation - adjust based on rarity
  const springStiffness = 150 - (rarityLevel * 15); // Higher rarity = softer springs
  const springDamping = 20 - (rarityLevel * 2); // Higher rarity = less damping
  
  const springConfig = { 
    stiffness: Math.max(80, springStiffness), 
    damping: Math.max(10, springDamping) 
  };
  
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  
  // Shine effect based on mouse position
  const shineX = useTransform(x, [-300, 300], [0, 100]);
  const shineY = useTransform(y, [-300, 300], [0, 100]);
  
  // Holographic color shifts based on mouse position
  const hueRotate = useTransform(
    x, 
    [-300, 300], 
    [0, 360 * intensityFactor]
  );
  
  // State for hover detection
  const [isHovering, setIsHovering] = useState(false);
  
  // Animation for floating effect when not hovering
  const floatVariants = {
    float: {
      rotateY: [0, 2, 0, -2, 0],
      rotateX: [0, 1, 0, -1, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        repeatType: "mirror" as const
      }
    },
    rest: {
      rotateX: 0,
      rotateY: 0
    }
  };
  
  // Handle mouse/touch movement
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };
  
  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const touch = event.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(touch.clientX - centerX);
    y.set(touch.clientY - centerY);
  };

  // Reset position when not interacting
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovering(false);
  };
  
  const handleMouseEnter = () => {
    setIsHovering(true);
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  // Card type color for the holographic effects
  const typeColor = getCardTypeColor(card.type);
  
  return (
    <div 
      className={cn("card-container perspective-1000", className)} 
      onClick={handleClick}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <motion.div 
        className="relative w-full h-full preserve-3d rounded-lg overflow-hidden cursor-pointer"
        style={{
          rotateX: isHovering ? springRotateX : 0,
          rotateY: isHovering ? springRotateY : 0,
          transformPerspective: 1000,
          boxShadow: rarityLevel > 3 ? "0 0 15px rgba(255, 255, 255, 0.5)" : "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
        variants={floatVariants}
        animate={!isHovering && !isMobile ? "float" : "rest"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Holographic overlay */}
        {rarityLevel > 2 && (
          <motion.div 
            className="absolute inset-0 z-10 mix-blend-overlay pointer-events-none"
            style={{
              background: `linear-gradient(
                ${shineX}deg, 
                transparent 20%, 
                ${typeColor}22 40%, 
                ${typeColor}44 50%, 
                ${typeColor}22 60%, 
                transparent 80%
              )`,
              filter: `hue-rotate(${hueRotate}deg)`,
              opacity: 0.6 * intensityFactor,
            }}
          />
        )}
        
        {/* Rainbow effect for rare cards */}
        {rarityLevel > 4 && (
          <motion.div 
            className="absolute inset-0 z-10 mix-blend-color-dodge pointer-events-none"
            style={{
              background: "linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff)",
              backgroundSize: "200% 200%",
              opacity: 0.2 * intensityFactor,
              filter: `hue-rotate(${hueRotate}deg)`,
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        )}
        
        {/* Card content */}
        <div className="relative z-20 bg-white dark:bg-gray-800 h-full rounded-lg overflow-hidden">
          {/* Card image */}
          <div className="relative overflow-hidden">
            <img 
              src={card.image} 
              alt={card.name} 
              className="w-full h-40 object-contain z-20"
              loading="lazy"
              onError={(e) => {
                console.error(`Failed to load image for card: ${card.name}`);
                e.currentTarget.style.display = 'none';
              }}
            />
            
            {/* Sparkle effect for higher rarity cards */}
            {rarityLevel > 3 && (
              <motion.div 
                className="absolute inset-0 pointer-events-none z-30"
                style={{
                  background: `radial-gradient(circle at ${shineX.get()}% ${shineY.get()}%, ${typeColor}55 0%, transparent 60%)`,
                  opacity: 0.4 * intensityFactor,
                }}
              />
            )}
          </div>
          
          {/* Card details */}
          {showDetails && (
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
              
              {/* Rarity indicator for high rarity cards */}
              {rarityLevel > 3 && (
                <div className="absolute top-1 right-1 z-30">
                  <motion.div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: typeColor }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function HolographicCardGrid({ 
  cards, 
  onCardClick 
}: { 
  cards: CardType[]; 
  onCardClick: (card: CardType) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <HolographicCard
          key={card.id}
          card={card}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}