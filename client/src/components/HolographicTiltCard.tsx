import React, { useState, useRef, useEffect } from 'react';
import { Tilt } from 'react-tilt';
import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HolographicTiltCardProps {
  card: CardType;
  className?: string;
}

const HolographicTiltCard: React.FC<HolographicTiltCardProps> = ({ card, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Colors for psychic type (like Alakazam)
  const cardColors = {
    psychic: {
      primary: 'rgba(214, 133, 219, 0.9)',
      highlight: 'rgba(252, 200, 254, 1)',
      accent: 'rgba(163, 97, 168, 1)',
    },
    fire: {
      primary: 'rgba(240, 128, 48, 0.9)',
      highlight: 'rgba(255, 200, 100, 1)',
      accent: 'rgba(200, 80, 40, 1)',
    },
    water: {
      primary: 'rgba(104, 144, 240, 0.9)',
      highlight: 'rgba(130, 200, 255, 1)',
      accent: 'rgba(40, 100, 180, 1)',
    },
    // Default fallback
    default: {
      primary: 'rgba(180, 180, 180, 0.9)',
      highlight: 'rgba(230, 230, 230, 1)',
      accent: 'rgba(120, 120, 120, 1)',
    },
  };
  
  // Determine card color scheme based on type
  const getCardColorScheme = () => {
    if (!card.type) return cardColors.default;
    
    const type = card.type.toLowerCase();
    if (type.includes('psychic')) return cardColors.psychic;
    if (type.includes('fire')) return cardColors.fire;
    if (type.includes('water')) return cardColors.water;
    
    return cardColors.default;
  };
  
  const colorScheme = getCardColorScheme();
  
  // Track mouse position for lighting effects
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };
  
  // Handle touch events for mobile
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length === 0) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
    setIsHovered(true); // Keep effects active during touch
  };
  
  const handleTouchEnd = () => {
    // Add a slight delay before removing hover state for better UX
    setTimeout(() => setIsHovered(false), 500);
  };
  
  return (
    <div 
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={cardRef}
    >
      <Tilt 
        className="h-full w-full"
        options={{
          max: 20, // Increased max tilt rotation (degrees)
          perspective: 800, // Lower for more extreme tilt
          scale: 1.05,
          speed: 800, // Slightly faster response
          transition: true,
          axis: null,
          reset: true,
          easing: "cubic-bezier(.03,.98,.52,.99)",
          glare: true,
          maxGlare: 0.5,
        }}
      >
        <div 
          className={cn(
            "relative h-full w-full preserve-3d overflow-hidden rounded-lg transition-all duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Holographic background pattern - finer scanlines that mimic real cards */}
          <div 
            className="absolute inset-0 z-10" 
            style={{
              backgroundImage: 'repeating-linear-gradient(95deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)',
              backgroundSize: '8px 100%',
              opacity: 0.8,
            }}
          />
          
          {/* Cross-hatched pattern overlay - mimics the fine pattern on real holo cards */}
          <div 
            className="absolute inset-0 z-15" 
            style={{
              backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px), repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px)',
              backgroundSize: '6px 6px',
              opacity: 0.7,
            }}
          />

          {/* Psychic-type specific holo effect (pink/purple shimmer like on Alakazam) */}
          <div 
            className="absolute inset-0 z-20" 
            style={{
              background: `radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, ${colorScheme.highlight} 0%, ${colorScheme.primary} 40%, ${colorScheme.accent} 80%)`,
              opacity: isHovered ? 0.7 : 0.3,
              mixBlendMode: 'color-dodge',
            }}
          />
          
          {/* Dynamic light reflection that follows pointer/touch */}
          <div 
            className="absolute inset-0 z-25 transition-opacity duration-100"
            style={{
              background: `
                radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                rgba(255, 255, 255, 0.95) 0%, 
                rgba(255, 255, 255, 0.5) 15%, 
                rgba(255, 255, 255, 0.2) 30%,
                transparent 60%)
              `,
              opacity: isHovered ? 1 : 0.5,
              mixBlendMode: 'screen',
            }}
          />
          
          {/* Rainbow prism effect - simulates light diffraction */}
          <motion.div 
            className="absolute inset-0 z-25" 
            style={{
              background: 'linear-gradient(45deg, rgba(255,0,0,0.3), rgba(255,165,0,0.3), rgba(255,255,0,0.3), rgba(0,255,0,0.3), rgba(0,255,255,0.3), rgba(0,0,255,0.3), rgba(128,0,128,0.3))',
              backgroundSize: '400% 400%',
              opacity: isHovered ? 0.6 : 0.3,
              mixBlendMode: 'color-dodge',
              filter: 'contrast(1.5) saturate(1.5)',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%']
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: 'mirror'
            }}
          />
          
          {/* Sharp horizontal sweep light effect - mimics tilting a real card */}
          <div 
            className="absolute inset-0 z-30 transition-all duration-100" 
            style={{
              background: `
                linear-gradient(
                  ${90 + ((mousePosition.x - 50) / 2)}deg,
                  transparent 0%,
                  transparent ${40 + (mousePosition.y / 5)}%,
                  rgba(255, 255, 255, 0.8) 45%,
                  rgba(255, 255, 255, 1) 50%,
                  rgba(255, 255, 255, 0.8) 55%,
                  transparent ${60 - (mousePosition.y / 5)}%,
                  transparent 100%
                )
              `,
              opacity: isHovered ? 0.9 : 0.3,
              mixBlendMode: 'overlay',
              transform: `translateY(${(mousePosition.y - 50) / 10}px)`,
            }}
          />
          
          {/* Star sparkle effects - like those seen on holos */}
          <div className="absolute inset-0 z-35 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0,
                  filter: 'blur(0.5px)',
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  repeatDelay: Math.random() * 8,
                }}
              />
            ))}
          </div>
          
          {/* Card content */}
          <div className="absolute inset-0 z-40">
            <img 
              src={card.image} 
              alt={card.name || "Pokémon Card"} 
              className="h-full w-full object-contain"
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                console.error(`Failed to load image for card: ${card.name}`);
                e.currentTarget.style.display = 'none';
                setIsLoaded(true); // Still mark as loaded to show effects
              }}
            />
          </div>
        </div>
      </Tilt>
    </div>
  );
};

export default HolographicTiltCard;