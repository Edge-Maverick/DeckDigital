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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
      <img 
        src={pack.image} 
        alt={pack.name} 
        className="w-full h-32 object-cover"
      />
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-poppins font-medium text-lg mb-1">{pack.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-grow">{pack.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-primary">{pack.price} <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>
          <button 
            className="bg-secondary hover:bg-teal-500 text-white font-semibold py-2 px-4 rounded-full transition duration-300 touch-ripple min-w-[44px] min-h-[44px]"
            onClick={handleBuy}
          >
            Buy Pack
          </button>
        </div>
      </div>
    </div>
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
      <img 
        src={pack.image} 
        alt={`Featured card pack: ${pack.name}`} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-poppins font-semibold text-xl mb-2">Featured Pack: {pack.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{pack.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-primary">{pack.price} <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>
          <button 
            className="bg-primary hover:bg-red-500 text-white font-semibold py-2 px-6 rounded-full transition duration-300 touch-ripple min-w-[44px] min-h-[44px]"
            onClick={handleBuy}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

interface UnOpenedPackProps {
  pack: PackType;
  onOpen: () => void;
}

export function UnOpenedPack({ pack, onOpen }: UnOpenedPackProps) {
  return (
    <motion.div 
      className="relative w-64 h-96 mb-8 cursor-pointer touch-ripple shadow-xl rounded-xl mx-auto"
      onClick={onOpen}
      animate={{ y: [0, -10, 0] }}
      transition={{ 
        repeat: Infinity, 
        duration: 3,
        ease: "easeInOut"
      }}
    >
      <img 
        src={pack.image} 
        alt={`Unopened ${pack.name}`} 
        className="w-full h-full object-cover rounded-xl"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 rounded-xl"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-center">
        <p className="font-poppins font-semibold text-lg mb-1">{pack.name}</p>
        <p className="text-sm text-white/80">{pack.description}</p>
        <button className="mt-3 bg-accent hover:bg-amber-400 text-textColor font-semibold py-2 px-6 rounded-full transition duration-300 min-w-[44px] min-h-[44px]">
          Open Pack
        </button>
      </div>
    </motion.div>
  );
}
