import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import { cn, calculateCardRarity, getCardTypeColor, getCardTexture } from '@/lib/utils';
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
  const [sparkleActive, setSparkleActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();
  const typeColor = card.type ? getCardTypeColor(card.type) : 'rgb(168, 167, 122)'; // Default to normal type
  const rarityLevel = calculateCardRarity(card);
  
  // Create automatic subtle animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkleActive(prev => !prev);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
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
    <motion.div 
      className={cn("relative cursor-pointer", className)}
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Card shadow that moves with tilt */}
      <div 
        className="absolute -inset-1 rounded-xl opacity-75 transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${coords.x}% ${coords.y}%, ${typeColor}40 0%, transparent 70%)`,
          filter: 'blur(8px)',
          transform: `perspective(1000px) rotateX(${rotateX * 0.7}deg) rotateY(${rotateY * 0.7}deg)`,
          opacity: isActive ? 0.8 : 0.3,
        }}
      />
      
      <div 
        className={cn(
          "relative h-full w-full overflow-hidden rounded-xl transition-all duration-300 border-2",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.2s ease-out',
          borderColor: `${typeColor}70`,
          boxShadow: isActive ? `0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1), 0 0 15px ${typeColor}50` : 'none',
        }}
      >
        {/* Holographic background based on card type */}
        <div 
          className="absolute inset-0 z-5" 
          style={{
            background: `linear-gradient(135deg, ${typeColor}10, ${typeColor}30)`,
          }}
        />
        
        {/* Fine holographic line pattern */}
        <div 
          className="absolute inset-0 z-10" 
          style={{
            backgroundImage: 'repeating-linear-gradient(95deg, transparent, transparent 3px, rgba(255,255,255,0.07) 3px, rgba(255,255,255,0.07) 5px)',
            backgroundSize: '10px 100%',
            opacity: isActive ? 0.6 : 0.3,
          }}
        />

        {/* Prismatic effect that changes with tilt */}
        <div 
          className="absolute inset-0 z-15 transition-opacity duration-200" 
          style={{
            background: `
              linear-gradient(
                ${45 + rotateY * 3}deg, 
                rgba(255, 0, 0, 0.1), 
                rgba(0, 255, 0, 0.1), 
                rgba(0, 0, 255, 0.1)
              )
            `,
            opacity: isActive ? 0.4 : 0.2,
            mixBlendMode: 'color',
          }}
        />

        {/* Dynamic light reflection that follows pointer/touch */}
        <div 
          className="absolute inset-0 z-20 transition-opacity duration-200"
          style={{
            background: `
              radial-gradient(circle at ${coords.x}% ${coords.y}%, 
              rgba(255, 255, 255, 0.8) 0%, 
              rgba(255, 255, 255, 0.1) 10%, 
              transparent 40%)
            `,
            opacity: isActive ? 0.5 : 0.2,
            mixBlendMode: 'overlay',
          }}
        />
        
        {/* Horizontal light sweep that moves with tilt */}
        <div 
          className="absolute inset-0 z-25 transition-all duration-150" 
          style={{
            background: `
              linear-gradient(
                ${90 + (rotateY * 2)}deg,
                transparent 0%,
                transparent ${40 - (rotateX * 2)}%,
                rgba(255, 255, 255, 0.5) 48%,
                rgba(255, 255, 255, 0.8) 50%,
                rgba(255, 255, 255, 0.5) 52%,
                transparent ${60 + (rotateX * 2)}%,
                transparent 100%
              )
            `,
            opacity: isActive ? 0.6 : sparkleActive ? 0.3 : 0.1,
            mixBlendMode: 'overlay',
            transform: `translateY(${rotateX/2}px)`,
          }}
        />
        
        {/* Dot pattern for extra holographic texture */}
        <div 
          className="absolute inset-0 z-30" 
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '8px 8px',
            opacity: isActive ? 0.4 : 0.2,
          }}
        />
        
        {/* Card content */}
        <div className="absolute inset-0 z-40 p-1"> {/* Added padding to prevent border cut-off */}
          <img 
            src={card.image} 
            alt={card.name || "Trading Card"} 
            className="h-full w-full object-scale-down rounded-lg" /* Changed to scale-down to ensure full card visibility */
            onLoad={() => setIsLoaded(true)}
            onError={(e) => {
              console.error(`Failed to load image for card: ${card.name}`);
              e.currentTarget.style.display = 'none';
              setIsLoaded(true); // Still mark as loaded to show effects
            }}
          />
        </div>
        
        {/* Card info overlay on hover */}
        <div 
          className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-3 transform transition-all duration-300"
          style={{
            opacity: isActive ? 1 : 0,
            transform: `translateY(${isActive ? '0' : '20px'})`,
          }}
        >
          <div className="text-white text-sm font-semibold">{card.name}</div>
          <div className="text-xs text-white/80">{card.rarity} • {card.type}</div>
        </div>
        
        {/* Shine effect - subtle */}
        {isActive && (
          <div 
            className="absolute inset-0 z-60 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${coords.x}% ${coords.y}%, rgba(255,255,255,0.8) 0%, transparent 25%)`,
              mixBlendMode: 'overlay',
              opacity: 0.4,
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default HolographicTiltCard;