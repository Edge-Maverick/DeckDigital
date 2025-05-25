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
  
  // Transforms for 3D rotation - authentic Pokémon TCG feel
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
  
  // Make sure we have valid card properties
  const cardType = card?.type || 'psychic';
  const cardRarity = card?.rarity || 'Rare';
  
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
        {/* Primary holographic overlay - dynamic lighting effect */}
        <motion.div 
          className="absolute inset-0 z-10 mix-blend-overlay pointer-events-none"
          style={{
            background: `linear-gradient(
              ${shineX}deg, 
              transparent 0%, 
              rgba(255, 255, 255, 0.1) 30%, 
              rgba(255, 255, 255, 0.5) 48%, 
              rgba(255, 255, 255, 0.6) 50%, 
              rgba(255, 255, 255, 0.5) 52%, 
              rgba(255, 255, 255, 0.1) 70%,
              transparent 100%
            )`,
            filter: `hue-rotate(${hueRotate}deg)`,
            opacity: 0.7,
            mixBlendMode: 'color-dodge',
          }}
        />
        
        {/* Pokémon card foil pattern - horizontal lines */}
        <motion.div 
          className="absolute inset-0 z-11 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.1),
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px,
              transparent 4px
            )`,
            opacity: 0.5,
          }}
        />
        
        {/* Major dramatic light reflection - follows mouse/touch exactly */}
        <motion.div 
          className="absolute inset-0 z-15 mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 5%, rgba(255, 255, 255, 0.3) 20%, transparent 60%)
            `,
            opacity: 1,
          }}
        />
        
        {/* Sharp horizontal light sweep */}
        <motion.div 
          className="absolute inset-0 z-14 mix-blend-overlay pointer-events-none"
          style={{
            background: `linear-gradient(
              to bottom,
              transparent 0%,
              transparent ${shineY.get() - 2}%,
              rgba(255, 255, 255, 0.4) ${shineY.get() - 1}%,
              rgba(255, 255, 255, 0.9) ${shineY.get()}%,
              rgba(255, 255, 255, 0.4) ${shineY.get() + 1}%,
              transparent ${shineY.get() + 2}%,
              transparent 100%
            )`,
            opacity: 0.8,
          }}
        />
        
        {/* Diagonal light sweep */}
        <motion.div 
          className="absolute inset-0 z-13 mix-blend-overlay pointer-events-none"
          style={{
            background: `linear-gradient(
              ${(shineY.get() - 50) * 1.8}deg,
              transparent 0%,
              transparent 30%,
              rgba(255, 255, 255, 0.1) 40%,
              rgba(255, 255, 255, 0.7) 49%,
              rgba(255, 255, 255, 1) 50%,
              rgba(255, 255, 255, 0.7) 51%,
              rgba(255, 255, 255, 0.1) 60%,
              transparent 70%,
              transparent 100%
            )`,
            opacity: 0.9,
          }}
        />
        
        {/* Rainbow color refraction - classic Pokémon holofoil */}
        <motion.div 
          className="absolute inset-0 z-13 mix-blend-color-dodge pointer-events-none overflow-hidden"
          style={{
            background: "linear-gradient(45deg, rgba(255,0,0,0.4), rgba(255,255,0,0.4), rgba(0,255,0,0.4), rgba(0,255,255,0.4), rgba(0,0,255,0.4), rgba(255,0,255,0.4))",
            backgroundSize: "600% 600%",
            opacity: 0.5,
            filter: `brightness(1.5)`,
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
        
        {/* Gradient reflection that changes with viewing angle */}
        <motion.div 
          className="absolute inset-0 z-16 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                ${rotateY.get() * 5}deg,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.1) 10%,
                rgba(255, 255, 255, 0.2) 20%,
                rgba(255, 255, 255, 0.5) 30%,
                rgba(255, 255, 255, 0.7) 40%,
                rgba(255, 255, 255, 0.8) 50%,
                rgba(255, 255, 255, 0.7) 60%,
                rgba(255, 255, 255, 0.5) 70%,
                rgba(255, 255, 255, 0.2) 80%,
                rgba(255, 255, 255, 0.1) 90%,
                rgba(255, 255, 255, 0) 100%
              )
            `,
            opacity: 0.6,
            mixBlendMode: 'overlay',
          }}
        />
        
        {/* Card content */}
        <div className="relative z-20 bg-white dark:bg-gray-800 h-full rounded-lg overflow-hidden">
          {/* Card image - full size with no details */}
          <div className="relative overflow-hidden h-full">
            <img 
              src={card.image} 
              alt={card.name} 
              className="w-full h-full object-contain z-20"
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
            
            {/* Removed rarity indicator circle */}
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