import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { PackType } from "@/lib/types";

interface CardPackProps {
  pack: PackType;
  onBuy: (pack: PackType) => void;
}

export function CardPack({ pack, onBuy }: CardPackProps) {
  const handleBuy = () => {
    onBuy(pack);
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-900/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden flex flex-col h-full border border-white/20 dark:border-gray-700/30"
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="relative overflow-hidden h-40 bg-gradient-to-br from-secondary/20 to-primary/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <img 
          src={pack.image} 
          alt={pack.name} 
          className="w-full h-full object-contain p-2 drop-shadow-lg transform transition-transform duration-500 hover:scale-110"
          onError={(e) => {
            console.error(`Failed to load image for pack: ${pack.name}`);
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute top-2 right-2 bg-accent/90 text-black text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
          NEW
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-poppins font-semibold text-lg mb-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{pack.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-grow">{pack.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold flex items-center gap-1">
            <span className="text-primary">{pack.price}</span> 
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <motion.button 
            className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-teal-500 text-white font-semibold py-2 px-5 rounded-full transition-all duration-300 touch-ripple min-w-[44px] min-h-[44px] shadow-md hover:shadow-lg"
            onClick={handleBuy}
            whileTap={{ scale: 0.95 }}
          >
            Buy Pack
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

interface FeaturedPackProps {
  pack: PackType;
  onBuy: (pack: PackType) => void;
}

export function FeaturedPack({ pack, onBuy }: FeaturedPackProps) {
  const handleBuy = () => {
    onBuy(pack);
  };

  return (
    <motion.div 
      className="relative overflow-hidden mb-8 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background with pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/20 bg-dot-pattern"></div>
      
      {/* Featured badge */}
      <div className="absolute top-4 right-4 bg-accent text-black text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm z-10 shadow-md">
        FEATURED
      </div>
      
      <div className="relative flex flex-col md:flex-row bg-gray-900/80 backdrop-blur-sm overflow-hidden shadow-2xl border border-white/10">
        {/* Pack Image */}
        <div className="relative md:w-1/3 h-48 md:h-auto overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent md:bg-gradient-to-l"></div>
          <img 
            src={pack.image} 
            alt={`Featured card pack: ${pack.name}`} 
            className="w-full h-full object-contain p-4 relative z-0 transform transition-transform duration-700 hover:scale-110"
            onError={(e) => {
              console.error(`Failed to load image for featured pack: ${pack.name}`);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        {/* Pack Details */}
        <div className="p-6 md:w-2/3 relative z-10">
          <h3 className="font-rajdhani font-bold text-2xl mb-2 text-white text-shadow-sm bg-gradient-to-r from-white via-accent to-white bg-clip-text">
            {pack.name}
          </h3>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mb-3 opacity-80"></div>
          <p className="text-gray-300 mb-4">{pack.description}</p>
          
          {/* Pack Info and Buy Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-auto">
            <div>
              <div className="text-xs uppercase text-gray-400 mb-1">Pack Price</div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-white">{pack.price}</span>
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            
            <motion.button 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-red-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 touch-ripple min-w-[44px] min-h-[44px] shadow-lg shadow-primary/20 flex items-center gap-2"
              onClick={handleBuy}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Buy Now</span>
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </div>
          
          {/* Cards per pack info */}
          <div className="absolute bottom-3 right-6 bg-gray-800/50 backdrop-blur-sm text-xs text-gray-300 px-2 py-1 rounded-full border border-white/10">
            {pack.cardsPerPack} cards per pack
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface UnOpenedPackProps {
  pack: PackType;
  onOpen: () => void;
}

export function UnOpenedPack({ pack, onOpen }: UnOpenedPackProps) {
  return (
    <div className="flex flex-col items-center justify-center my-8">
      <motion.div 
        className="relative w-72 h-96 cursor-pointer touch-ripple mx-auto"
        onClick={onOpen}
        animate={{ 
          y: [0, -10, 0],
          rotateZ: [-1, 1, -1] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Glowing backdrop */}
        <div className="absolute -inset-2 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 rounded-2xl blur-lg opacity-70 animate-pulse-slow"></div>
        
        {/* Card Pack Container */}
        <div className="relative bg-gray-900 h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10">
          {/* Background patterns */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
          
          {/* Pack image */}
          <div className="h-3/4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
            <img 
              src={pack.image} 
              alt={`Unopened ${pack.name}`} 
              className="w-full h-full object-contain p-6"
              onError={(e) => {
                console.error(`Failed to load image for unopened pack: ${pack.name}`);
                e.currentTarget.style.display = 'none';
              }}
            />
            
            {/* Light beam effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: [-200, 400],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 3.5,
                repeatDelay: 2
              }}
            />
          </div>
          
          {/* Pack info */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white bg-gradient-to-t from-gray-900 to-gray-900/40">
            <p className="font-rajdhani font-bold text-xl mb-1 text-shadow-sm">{pack.name}</p>
            <p className="text-sm text-white/80 mb-3 line-clamp-2">{pack.description}</p>
            <motion.button 
              className="w-full bg-gradient-to-r from-accent to-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg shadow-lg shadow-accent/20 flex items-center justify-center gap-2 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Open Pack</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      {/* Pack instructions */}
      <motion.div 
        className="text-center mt-6 text-gray-400 max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm">
          Tap the pack to open it and reveal {pack.cardsPerPack} random cards!
        </p>
      </motion.div>
    </div>
  );
}
