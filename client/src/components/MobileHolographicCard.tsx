import React, { useState, useRef } from 'react';
import { useSpring, a } from '@react-spring/web';
import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileHolographicCardProps {
  card: CardType;
  className?: string;
}

const MobileHolographicCard: React.FC<MobileHolographicCardProps> = ({ card, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // State for tracking touch/mouse position
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  // State for tracking if user is interacting with card
  const [isActive, setIsActive] = useState(false);
  
  // Colors for card types
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
    default: {
      primary: 'rgba(180, 180, 180, 0.9)',
      highlight: 'rgba(230, 230, 230, 1)',
      accent: 'rgba(120, 120, 120, 1)',
    },
  };
  
  // Determine color scheme based on card type
  const getCardColorScheme = () => {
    if (!card.type) return cardColors.default;
    
    const type = card.type.toLowerCase();
    if (type.includes('psychic')) return cardColors.psychic;
    if (type.includes('fire')) return cardColors.fire;
    if (type.includes('water')) return cardColors.water;
    
    return cardColors.default;
  };
  
  const colorScheme = getCardColorScheme();
  
  // Calculate card rotation and transform based on pointer/touch position
  const calculateRotation = (x: number, y: number) => {
    if (!cardRef.current) return { rotateX: 0, rotateY: 0 };
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Normalize coordinates relative to center (0, 0)
    const normalizedX = x - rect.left - centerX;
    const normalizedY = y - rect.top - centerY;
    
    // Calculate rotation (more subtle for mobile)
    const rotateY = isMobile ? normalizedX / centerX * 10 : normalizedX / centerX * 15;
    const rotateX = isMobile ? -normalizedY / centerY * 10 : -normalizedY / centerY * 15;
    
    return { rotateX, rotateY };
  };
  
  // Spring animation for smooth tilting
  const [springProps, springApi] = useSpring(() => ({ 
    rotateX: 0, 
    rotateY: 0, 
    scale: 1,
    config: { mass: 2, tension: 350, friction: 40 }
  }));
  
  // Handle touch events (mobile)
  const handleTouchStart = () => {
    setIsActive(true);
    // Scale up slightly on touch
    springApi.start({ scale: 1.03 });
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isActive || !cardRef.current || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate position as percentage for gradient effects
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setCoords({ x, y });
    
    // Calculate rotation for tilt effect
    const { rotateX, rotateY } = calculateRotation(touch.clientX, touch.clientY);
    springApi.start({ rotateX, rotateY });
  };
  
  const handleTouchEnd = () => {
    // Return to neutral position with a slight delay
    setTimeout(() => {
      setIsActive(false);
      springApi.start({ rotateX: 0, rotateY: 0, scale: 1 });
    }, 100);
  };
  
  // Handle mouse events (desktop)
  const handleMouseEnter = () => {
    setIsActive(true);
    springApi.start({ scale: 1.03 });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isActive || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate position as percentage for gradient effects
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoords({ x, y });
    
    // Calculate rotation for tilt effect
    const { rotateX, rotateY } = calculateRotation(e.clientX, e.clientY);
    springApi.start({ rotateX, rotateY });
  };
  
  const handleMouseLeave = () => {
    setIsActive(false);
    springApi.start({ rotateX: 0, rotateY: 0, scale: 1 });
  };
  
  return (
    <div 
      className={cn("relative preserve-3d", className)}
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <a.div
        style={{
          transform: springProps.rotateX.to((rx: number) => 
            springProps.rotateY.to((ry: number) => 
              springProps.scale.to((s: number) => 
                `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`))),
          transformStyle: 'preserve-3d',
        }}
        className={cn(
          "relative w-full h-full rounded-lg overflow-hidden transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Base card with diagonal line pattern (like real Pokémon cards) */}
        <div 
          className="absolute inset-0 z-10" 
          style={{
            backgroundImage: 'repeating-linear-gradient(95deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)',
            backgroundSize: '8px 100%',
            opacity: 0.8,
          }}
        />
        
        {/* Cross-hatched fine pattern like real holo foil */}
        <div 
          className="absolute inset-0 z-15" 
          style={{
            backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px), repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px)',
            backgroundSize: '6px 6px',
            opacity: 0.7,
          }}
        />
        
        {/* Type-specific color effect */}
        <div 
          className="absolute inset-0 z-20 transition-opacity duration-150" 
          style={{
            background: `radial-gradient(ellipse at ${coords.x}% ${coords.y}%, ${colorScheme.highlight} 0%, ${colorScheme.primary} 40%, ${colorScheme.accent} 80%)`,
            opacity: isActive ? 0.7 : 0.3,
            mixBlendMode: 'color-dodge',
          }}
        />
        
        {/* Dynamic light reflection */}
        <div 
          className="absolute inset-0 z-25 transition-opacity duration-150"
          style={{
            background: `
              radial-gradient(circle at ${coords.x}% ${coords.y}%, 
              rgba(255, 255, 255, 0.95) 0%, 
              rgba(255, 255, 255, 0.5) 15%, 
              rgba(255, 255, 255, 0.2) 30%,
              transparent 60%)
            `,
            opacity: isActive ? 1 : 0.5,
            mixBlendMode: 'screen',
          }}
        />
        
        {/* Rainbow prism effect */}
        <motion.div 
          className="absolute inset-0 z-30" 
          style={{
            background: 'linear-gradient(45deg, rgba(255,0,0,0.3), rgba(255,165,0,0.3), rgba(255,255,0,0.3), rgba(0,255,0,0.3), rgba(0,255,255,0.3), rgba(0,0,255,0.3), rgba(128,0,128,0.3))',
            backgroundSize: '400% 400%',
            opacity: isActive ? 0.6 : 0.3,
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
        
        {/* Horizontal light sweep - the key effect for realism */}
        <div 
          className="absolute inset-0 z-35 transition-all duration-100" 
          style={{
            background: `
              linear-gradient(
                ${90 + ((coords.x - 50) / 2)}deg,
                transparent 0%,
                transparent ${40 + (coords.y / 5)}%,
                rgba(255, 255, 255, 0.8) 45%,
                rgba(255, 255, 255, 1) 50%,
                rgba(255, 255, 255, 0.8) 55%,
                transparent ${60 - (coords.y / 5)}%,
                transparent 100%
              )
            `,
            opacity: isActive ? 0.9 : 0.3,
            mixBlendMode: 'overlay',
            transform: `translateY(${(coords.y - 50) / 10}px)`,
          }}
        />
        
        {/* Sparkle effects */}
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
      </animated.div>
    </div>
  );
};

export default MobileHolographicCard;