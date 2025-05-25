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
    <div className="flex flex-col min-h-screen">
      <header className="bg-gradient-to-r from-primary to-secondary shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <svg className="w-10 h-10 text-white mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <h1 className="text-white font-poppins font-bold text-xl">TCG Collection</h1>
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
