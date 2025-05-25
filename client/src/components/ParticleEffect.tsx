import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  opacity: number;
  life: number;
  maxLife: number;
}

interface ParticleEffectProps {
  active: boolean;
  type?: string;
  intensity?: 'low' | 'medium' | 'high';
  duration?: number;
  onComplete?: () => void;
}

export default function ParticleEffect({ 
  active, 
  type = 'normal',
  intensity = 'medium',
  duration = 1500,
  onComplete
}: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  
  const getParticleColor = (type: string) => {
    const typeColors: Record<string, string[]> = {
      normal: ['#A8A77A', '#C6C5B0', '#888877'],
      fire: ['#EE8130', '#FF9951', '#FFC297'],
      water: ['#6390F0', '#85ADFF', '#A9C5FF'],
      electric: ['#F7D02C', '#FFE75E', '#FFF19F'],
      grass: ['#7AC74C', '#8CE467', '#C6FFAB'],
      ice: ['#96D9D6', '#B8FFFC', '#E0FFFD'],
      fighting: ['#C22E28', '#E33E37', '#FF7975'],
      poison: ['#A33EA1', '#CF64CD', '#FF8FFA'],
      ground: ['#E2BF65', '#FFD677', '#FFEAB8'],
      flying: ['#A98FF3', '#C6B6FF', '#E1D9FF'],
      psychic: ['#F95587', '#FF77A8', '#FFADCB'],
      bug: ['#A6B91A', '#C6DD1E', '#E5FA3C'],
      rock: ['#B6A136', '#D8C245', '#F5DF52'],
      ghost: ['#735797', '#9370C8', '#B28EFF'],
      dragon: ['#6F35FC', '#8B58FF', '#B893FF'],
      dark: ['#705746', '#917254', '#BD9468'],
      steel: ['#B7B7CE', '#D8D8ED', '#F0F0FF'],
      fairy: ['#D685AD', '#FF9BC9', '#FFC1E0'],
    };
    
    // Default to normal if type not found
    return typeColors[type.toLowerCase()] || typeColors.normal;
  };
  
  const getParticleCount = () => {
    switch (intensity) {
      case 'low': return 30;
      case 'high': return 100;
      case 'medium':
      default: return 60;
    }
  };
  
  // Initialize particles when effect is activated
  useEffect(() => {
    if (!active) {
      particlesRef.current = [];
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      return;
    }
    
    setIsComplete(false);
    const colors = getParticleColor(type);
    const particleCount = getParticleCount();
    
    // Create particles
    particlesRef.current = Array.from({ length: particleCount }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      const maxLife = duration * (0.5 + Math.random() * 0.5);
      
      return {
        id: i,
        x: 0, // Will be set by canvas center
        y: 0, // Will be set by canvas center
        size: 2 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        opacity: 0.7 + Math.random() * 0.3,
        life: 0,
        maxLife
      };
    });
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas dimensions
        const resizeCanvas = () => {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
        };
        resizeCanvas();
        
        // Set initial positions from center
        particlesRef.current.forEach(particle => {
          particle.x = canvas.width / 2;
          particle.y = canvas.height / 2;
        });
        
        let startTime = performance.now();
        
        // Animation loop
        const animate = (time: number) => {
          const elapsed = time - startTime;
          if (elapsed >= duration) {
            setIsComplete(true);
            if (onComplete) onComplete();
            return;
          }
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Update and draw particles
          particlesRef.current.forEach(particle => {
            // Update position
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            
            // Update life
            particle.life += 16; // Approximately 16ms per frame at 60fps
            
            // Calculate fade based on life
            const lifeRatio = particle.life / particle.maxLife;
            const fadeOutStart = 0.7; // Start fading at 70% of life
            
            // Apply fade out
            if (lifeRatio > fadeOutStart) {
              particle.opacity = 1 - ((lifeRatio - fadeOutStart) / (1 - fadeOutStart));
            }
            
            // Apply gravity effect (slight downward acceleration)
            particle.velocity.y += 0.03;
            
            // Slow down particles over time
            particle.velocity.x *= 0.99;
            particle.velocity.y *= 0.99;
            
            // Draw the particle
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          });
          
          requestRef.current = requestAnimationFrame(animate);
        };
        
        startTime = performance.now();
        requestRef.current = requestAnimationFrame(animate);
      }
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [active, type, intensity, duration, onComplete]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ opacity: active && !isComplete ? 1 : 0, transition: 'opacity 0.3s' }}
    />
  );
}

// Sparkling effect component for card reveals
export function CardSparkleEffect({ 
  active, 
  rarity = 'Common',
  type = 'normal',
  position = 'around',
  onComplete
}: {
  active: boolean;
  rarity?: string;
  type?: string;
  position?: 'around' | 'center' | 'top';
  onComplete?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sparkles, setSparkles] = useState<{ id: number, x: number, y: number, size: number, delay: number, color: string }[]>([]);
  
  useEffect(() => {
    if (!active) {
      setSparkles([]);
      return;
    }
    
    // Different effects based on rarity
    const count = rarity === 'Rare' ? 12 : rarity === 'Uncommon' ? 8 : 5;
    const colors = getParticleColor(type);
    
    // Generate sparkle positions
    const newSparkles = Array.from({ length: count }).map((_, i) => {
      let x = 0, y = 0;
      
      // Position differently based on position prop
      if (position === 'around') {
        // Distribute sparkles around the perimeter
        const angle = (i / count) * Math.PI * 2;
        const radius = 40 + Math.random() * 30;
        x = 50 + Math.cos(angle) * radius;
        y = 50 + Math.sin(angle) * radius;
      } else if (position === 'center') {
        // Cluster in the center
        x = 50 + (Math.random() * 30 - 15);
        y = 50 + (Math.random() * 30 - 15);
      } else if (position === 'top') {
        // Across the top
        x = (i / (count - 1)) * 100;
        y = 10 + Math.random() * 20;
      }
      
      return {
        id: i,
        x,
        y,
        size: 3 + Math.random() * (rarity === 'Rare' ? 8 : 5),
        delay: i * 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    });
    
    setSparkles(newSparkles);
    
    // Call onComplete after animation
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [active, rarity, type, position, onComplete]);
  
  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10">
      {sparkles.map(sparkle => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            backgroundColor: sparkle.color,
            boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.color}`
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 1.2,
            delay: sparkle.delay,
            ease: "easeInOut",
            times: [0, 0.2, 1]
          }}
        />
      ))}
    </div>
  );
}

// Helper function to get colors from type
function getParticleColor(type: string) {
  const typeColors: Record<string, string[]> = {
    normal: ['#A8A77A', '#C6C5B0', '#888877'],
    fire: ['#EE8130', '#FF9951', '#FFC297'],
    water: ['#6390F0', '#85ADFF', '#A9C5FF'],
    electric: ['#F7D02C', '#FFE75E', '#FFF19F'],
    grass: ['#7AC74C', '#8CE467', '#C6FFAB'],
    ice: ['#96D9D6', '#B8FFFC', '#E0FFFD'],
    fighting: ['#C22E28', '#E33E37', '#FF7975'],
    poison: ['#A33EA1', '#CF64CD', '#FF8FFA'],
    ground: ['#E2BF65', '#FFD677', '#FFEAB8'],
    flying: ['#A98FF3', '#C6B6FF', '#E1D9FF'],
    psychic: ['#F95587', '#FF77A8', '#FFADCB'],
    bug: ['#A6B91A', '#C6DD1E', '#E5FA3C'],
    rock: ['#B6A136', '#D8C245', '#F5DF52'],
    ghost: ['#735797', '#9370C8', '#B28EFF'],
    dragon: ['#6F35FC', '#8B58FF', '#B893FF'],
    dark: ['#705746', '#917254', '#BD9468'],
    steel: ['#B7B7CE', '#D8D8ED', '#F0F0FF'],
    fairy: ['#D685AD', '#FF9BC9', '#FFC1E0'],
  };
  
  // Default to normal if type not found
  return typeColors[type.toLowerCase()] || typeColors.normal;
}