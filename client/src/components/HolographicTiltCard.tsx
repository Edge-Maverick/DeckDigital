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
        {/* Fine holographic line pattern (diagonal lines like real cards) - more subtle */}
        <div 
          className="absolute inset-0 z-10" 
          style={{
            backgroundImage: 'repeating-linear-gradient(95deg, transparent, transparent 3px, rgba(255,255,255,0.05) 3px, rgba(255,255,255,0.05) 6px)',
            backgroundSize: '12px 100%',
            opacity: 0.5,
          }}
        />

        {/* Dynamic light reflection that follows pointer/touch - very subtle */}
        <div 
          className="absolute inset-0 z-25 transition-opacity duration-200"
          style={{
            background: `
              radial-gradient(circle at ${coords.x}% ${coords.y}%, 
              rgba(255, 255, 255, 0.5) 0%, 
              rgba(255, 255, 255, 0.1) 20%, 
              transparent 50%)
            `,
            opacity: isActive ? 0.4 : 0.1,
            mixBlendMode: 'screen',
          }}
        />
        
        {/* Extremely subtle light sweep that moves with tilt */}
        <div 
          className="absolute inset-0 z-35 transition-all duration-150" 
          style={{
            background: `
              linear-gradient(
                ${90 + (rotateY * 2)}deg,
                transparent 0%,
                transparent ${40 - (rotateX * 2)}%,
                rgba(255, 255, 255, 0.2) 45%,
                rgba(255, 255, 255, 0.3) 50%,
                rgba(255, 255, 255, 0.2) 55%,
                transparent ${60 + (rotateX * 2)}%,
                transparent 100%
              )
            `,
            opacity: isActive ? 0.3 : 0.1,
            mixBlendMode: 'overlay',
            transform: `translateY(${rotateX/2}px)`,
          }}
        />
        
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