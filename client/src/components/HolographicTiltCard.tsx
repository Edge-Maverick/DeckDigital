import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface HolographicTiltCardProps {
  card: CardType;
  className?: string;
}

const HolographicTiltCard: React.FC<HolographicTiltCardProps> = ({ card, className }) => {
  const [isActive, setIsActive] = useState(false);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();
  
  // Colors for different card types
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
  
  // Get the color scheme based on card type
  const getCardColorScheme = () => {
    if (!card.type) return cardColors.default;
    
    const type = card.type.toLowerCase();
    if (type.includes('psychic')) return cardColors.psychic;
    if (type.includes('fire')) return cardColors.fire;
    if (type.includes('water')) return cardColors.water;
    
    return cardColors.default;
  };
  
  const colorScheme = getCardColorScheme();
  
  // Update tilt values based on mouse/touch position
  const updateTilt = (clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate percentages for effects
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setCoords({ x, y });
    
    // Calculate tilt angles
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    
    // Normalized values from -1 to 1
    const normalizedX = (mouseX / centerX) - 1;
    const normalizedY = -((mouseY / centerY) - 1); // Invert Y axis
    
    // Apply tilt (reduced for mobile)
    const tiltFactor = isMobile ? 10 : 15;
    setRotateY(normalizedX * tiltFactor);
    setRotateX(normalizedY * tiltFactor);
  };
  
  // Handle mouse events
  const handleMouseEnter = () => {
    setIsActive(true);
    setScale(1.05);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateTilt(e.clientX, e.clientY);
  };
  
  const handleMouseLeave = () => {
    setIsActive(false);
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };
  
  // Handle touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsActive(true);
      setScale(1.03);
      updateTilt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      updateTilt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  
  const handleTouchEnd = () => {
    // Delay reset for better UX
    setTimeout(() => {
      setIsActive(false);
      setRotateX(0);
      setRotateY(0);
      setScale(1);
    }, 100);
  };
  
  return (
    <div 
      className={cn("relative", className)}
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className={cn(
          "relative h-full w-full overflow-hidden rounded-lg transition-all duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.2s ease-out',
        }}
      >
        {/* Fine holographic line pattern (diagonal lines like real cards) */}
        <div 
          className="absolute inset-0 z-10" 
          style={{
            backgroundImage: 'repeating-linear-gradient(95deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)',
            backgroundSize: '8px 100%',
            opacity: 0.8,
          }}
        />
        
        {/* Cross-hatched pattern overlay for authentic foil look */}
        <div 
          className="absolute inset-0 z-15" 
          style={{
            backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px), repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px)',
            backgroundSize: '6px 6px',
            opacity: 0.7,
          }}
        />

        {/* Type-specific color gradient (e.g., psychic purple for Alakazam) */}
        <div 
          className="absolute inset-0 z-20 transition-opacity duration-200" 
          style={{
            background: `radial-gradient(ellipse at ${coords.x}% ${coords.y}%, ${colorScheme.highlight} 0%, ${colorScheme.primary} 40%, ${colorScheme.accent} 80%)`,
            opacity: isActive ? 0.4 : 0.2,
            mixBlendMode: 'color-dodge',
          }}
        />
        
        {/* Dynamic light reflection that follows pointer/touch */}
        <div 
          className="absolute inset-0 z-25 transition-opacity duration-200"
          style={{
            background: `
              radial-gradient(circle at ${coords.x}% ${coords.y}%, 
              rgba(255, 255, 255, 0.9) 0%, 
              rgba(255, 255, 255, 0.3) 15%, 
              rgba(255, 255, 255, 0.1) 30%,
              transparent 60%)
            `,
            opacity: isActive ? 0.7 : 0.3,
            mixBlendMode: 'screen',
          }}
        />
        
        {/* Rainbow prism effect - animated - more subtle */}
        <motion.div 
          className="absolute inset-0 z-30" 
          style={{
            background: 'linear-gradient(45deg, rgba(255,0,0,0.15), rgba(255,165,0,0.15), rgba(255,255,0,0.15), rgba(0,255,0,0.15), rgba(0,255,255,0.15), rgba(0,0,255,0.15), rgba(128,0,128,0.15))',
            backgroundSize: '400% 400%',
            opacity: isActive ? 0.4 : 0.2,
            mixBlendMode: 'color-dodge',
            filter: 'contrast(1.3) saturate(1.3)',
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
        
        {/* Sharp horizontal light sweep that moves with tilt - more subtle */}
        <div 
          className="absolute inset-0 z-35 transition-all duration-150" 
          style={{
            background: `
              linear-gradient(
                ${90 + (rotateY * 2)}deg,
                transparent 0%,
                transparent ${40 - (rotateX * 2)}%,
                rgba(255, 255, 255, 0.6) 45%,
                rgba(255, 255, 255, 0.8) 50%,
                rgba(255, 255, 255, 0.6) 55%,
                transparent ${60 + (rotateX * 2)}%,
                transparent 100%
              )
            `,
            opacity: isActive ? 0.6 : 0.2,
            mixBlendMode: 'overlay',
            transform: `translateY(${rotateX}px)`,
          }}
        />
        
        {/* Sparkle effects like on real holos */}
        <div className="absolute inset-0 z-40 overflow-hidden">
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
        <div className="absolute inset-0 z-45">
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
    </div>
  );
};

export default HolographicTiltCard;