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
  
  // Transforms for 3D rotation - more dramatic tilt for authentic TCG feel
  const rotateX = useTransform(y, [-300, 300], [25, -25]);
  const rotateY = useTransform(x, [-300, 300], [-25, 25]);
  
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
  
  // Make sure we have valid card properties
  const cardType = card?.type || 'normal';
  const cardRarity = card?.rarity || 'Common';
  
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
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center (normalized to -1 to 1 range)
    const normalizedX = (event.clientX - centerX) / (rect.width / 2);
    const normalizedY = (event.clientY - centerY) / (rect.height / 2);
    
    // Scale for effect intensity
    x.set(normalizedX * 300);
    y.set(normalizedY * 300);
  };
  
  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    // Prevent scrolling when interacting with the card
    event.preventDefault();
    
    const touch = event.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center (normalized to -1 to 1 range)
    const normalizedX = (touch.clientX - centerX) / (rect.width / 2);
    const normalizedY = (touch.clientY - centerY) / (rect.height / 2);
    
    // Scale for effect intensity
    x.set(normalizedX * 300);
    y.set(normalizedY * 300);
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
  
  // Touch handlers for mobile
  const handleTouchStart = () => {
    setIsHovering(true);
  };
  
  const handleTouchEnd = () => {
    setTimeout(() => {
      x.set(0);
      y.set(0);
      setIsHovering(false);
    }, 50); // Small delay for smoother transition
  };
  
  // Remove click handler to prevent modal from opening
  const handleClick = () => {
    // Do nothing - just for interaction without opening modal
  };

  // Card type color for the holographic effects
  const typeColor = getCardTypeColor(cardType);
  
  return (
    <div 
      className={cn("card-container perspective-1000", className)} 
      onClick={handleClick}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={() => setIsHovering(true)}
      onTouchEnd={() => {
        setTimeout(() => {
          x.set(0);
          y.set(0);
          setIsHovering(false);
        }, 50);
      }}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <motion.div 
        className="relative w-full h-full preserve-3d overflow-hidden cursor-pointer"
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
        {/* Primary holographic overlay - dynamic lighting effect */}
        <motion.div 
          className="absolute inset-0 z-10 mix-blend-overlay pointer-events-none"
          style={{
            background: `linear-gradient(
              ${shineX}deg, 
              transparent 0%, 
              ${typeColor}11 20%, 
              ${typeColor}44 40%, 
              ${typeColor}88 50%, 
              ${typeColor}44 60%, 
              ${typeColor}11 80%,
              transparent 100%
            )`,
            filter: `hue-rotate(${hueRotate}deg) brightness(1.5)`,
            opacity: 0.4 + (0.6 * intensityFactor),
            boxShadow: `inset 0 0 ${40 * intensityFactor}px rgba(255, 255, 255, 0.9)`,
          }}
        />
        
        {/* Secondary holographic pattern - subtle pattern */}
        <motion.div 
          className="absolute inset-0 z-11 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiPjwvcmVjdD4KPC9zdmc+')",
            backgroundSize: "4px 4px",
            opacity: rarityLevel > 2 ? 0.2 * intensityFactor : 0,
          }}
        />
        
        {/* Rainbow effect for rare cards - more dynamic and vibrant */}
        {rarityLevel > 3 && (
          <motion.div 
            className="absolute inset-0 z-12 mix-blend-color-dodge pointer-events-none"
            style={{
              background: "linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff)",
              backgroundSize: "400% 400%",
              opacity: 0.15 + (0.25 * (rarityLevel - 3) / 3),
              filter: `hue-rotate(${hueRotate}deg) contrast(1.2)`,
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        )}
        
        {/* Ultra Rare specific foil texture */}
        {rarityLevel > 4 && (
          <motion.div 
            className="absolute inset-0 z-13 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCwwIEwyMCwyMCBNMjAsMCBMMCwyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4zIj48L3BhdGg+Cjwvc3ZnPg==')",
              backgroundSize: "10px 10px",
              opacity: 0.4,
              filter: `hue-rotate(${hueRotate}deg) brightness(2)`,
            }}
          />
        )}
        
        {/* Card content - no white background/border, just the card image */}
        <div className="relative z-20 h-full overflow-hidden">
          {/* Card image - full size with no details */}
          <div className="relative overflow-hidden h-full">
            <img 
              src={card.image} 
              alt={card.name} 
              className="w-full h-full object-contain z-20"
              style={{ transform: "scale(1.25)" }} /* Scale up to remove white borders */
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