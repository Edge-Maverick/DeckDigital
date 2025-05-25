import { ReactNode, useState } from "react";
import NavBar from "./NavBar";
import CardDetailModal from "./CardDetailModal";
import { Card } from "@/lib/types";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCardDetail = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const closeCardDetail = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      <header className="bg-gradient-to-r from-gray-900/90 via-primary/30 to-gray-900/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-gradient-to-br from-accent via-secondary to-primary rounded-full blur-sm opacity-70 animate-pulse-slow"></div>
              <svg className="w-10 h-10 text-white relative" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <div>
              <h1 className="text-white font-poppins font-bold text-xl bg-gradient-to-r from-white via-primary-foreground to-secondary-foreground bg-clip-text text-transparent">TCG Collection</h1>
              <div className="text-xs text-gray-400">Collect • Trade • Battle</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-gray-800/70 rounded-full px-3 py-1 flex items-center border border-white/10">
              <span className="text-accent font-bold mr-1">1000</span>
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      <NavBar />

      {isModalOpen && selectedCard && (
        <CardDetailModal 
          card={selectedCard} 
          isOpen={isModalOpen} 
          onClose={closeCardDetail}
        />
      )}
    </div>
  );
}

export const useCardDetail = () => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCardDetail = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const closeCardDetail = () => {
    setIsModalOpen(false);
  };

  return {
    selectedCard,
    isModalOpen,
    openCardDetail,
    closeCardDetail
  };
};
