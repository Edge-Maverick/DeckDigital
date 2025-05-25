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
  
  // Track mouse position for lighting effects
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };
  
  return (
    <div 
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      ref={cardRef}
    >
      <Tilt 
        className="h-full w-full"
        options={{
          max: 15, // max tilt rotation (degrees)
          perspective: 1000, // transform perspective, the lower the more extreme the tilt gets
          scale: 1.05, // 2 = 200%, 1.5 = 150%, etc..
          speed: 1000, // Speed of the enter/exit transition
          transition: true, // Set a transition on enter/exit
          axis: null, // What axis should be disabled. Can be X or Y
          reset: true, // If the tilt effect has to be reset on exit
          easing: "cubic-bezier(.03,.98,.52,.99)", // Easing on enter/exit
        }}
      >
        <div className="relative h-full w-full preserve-3d overflow-hidden rounded-lg">
          {/* Base gradient for depth */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 z-10"
          />
          
          {/* Horizontal holo lines */}
          <div 
            className="absolute inset-0 z-20 opacity-70" 
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05), rgba(255,255,255,0.2) 1px, transparent 1px, transparent 6px)',
              backgroundSize: '100% 6px'
            }}
          />
          
          {/* Moving highlight based on mouse position */}
          <div 
            className="absolute inset-0 z-30 transition-opacity duration-300"
            style={{
              background: `
                radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                rgba(255, 255, 255, 0.8) 0%, 
                rgba(255, 255, 255, 0.3) 25%, 
                transparent 50%)
              `,
              opacity: isHovered ? 0.9 : 0.4,
              mixBlendMode: 'screen'
            }}
          />
          
          {/* Rainbow holographic effect */}
          <div 
            className="absolute inset-0 z-25 transition-opacity duration-300" 
            style={{
              background: 'linear-gradient(45deg, rgba(255,0,0,0.3), rgba(255,255,0,0.3), rgba(0,255,0,0.3), rgba(0,255,255,0.3), rgba(0,0,255,0.3), rgba(255,0,255,0.3))',
              backgroundSize: '600% 600%',
              opacity: isHovered ? 0.6 : 0.4,
              mixBlendMode: 'color-dodge'
            }}
          >
            <motion.div
              className="w-full h-full"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%']
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: 'mirror'
              }}
            />
          </div>
          
          {/* Reflective gradient that moves with tilt */}
          <div 
            className="absolute inset-0 z-30 transition-opacity duration-300" 
            style={{
              background: `
                linear-gradient(
                  ${90 + ((mousePosition.x - 50) / 5)}deg,
                  transparent 0%,
                  rgba(255, 255, 255, 0.2) 30%,
                  rgba(255, 255, 255, 0.9) 45%,
                  rgba(255, 255, 255, 1) 50%,
                  rgba(255, 255, 255, 0.9) 55%,
                  rgba(255, 255, 255, 0.2) 70%,
                  transparent 100%
                )
              `,
              opacity: isHovered ? 0.9 : 0.5,
              mixBlendMode: 'overlay'
            }}
          />
          
          {/* Card content */}
          <div className="absolute inset-0 z-40">
            <img 
              src={card.image} 
              alt={card.name || "Pokémon Card"} 
              className="h-full w-full object-contain"
              onError={(e) => {
                console.error(`Failed to load image for card: ${card.name}`);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </Tilt>
    </div>
  );
};

export default HolographicTiltCard;