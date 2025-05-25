import { useState, useEffect } from "react";
import { useCollectionQuery } from "@/hooks/use-collection";
import { Card, CollectionFilters } from "@/lib/types";
import { CollectionCardGrid } from "@/components/CardItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CardDetailModal from "@/components/CardDetailModal";
import { debounce } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Loader2 } from "lucide-react";

export default function CollectionPage() {
  const [filters, setFilters] = useState<CollectionFilters>({
    type: "all",
    searchTerm: "",
    sortBy: "name"
  });
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: cards, isLoading, isError } = useCollectionQuery(
    filters.type,
    filters.searchTerm,
    filters.sortBy
  );
  
  const collectionStats = {
    totalCards: cards?.length || 0,
    uniqueCards: cards ? new Set(cards.map(card => card.id)).size : 0,
    completion: cards ? Math.round((new Set(cards.map(card => card.id)).size / 500) * 100) : 0
  };
  
  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleSearchChange = debounce((value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  }, 300);
  
  const handleTypeFilter = (type: string) => {
    setFilters(prev => ({ ...prev, type }));
  };
  
  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
  };
  
  const handleLoadMore = () => {
    // This would load more cards in a real app
    // For now just show a message
    alert("More cards would load here in a production app");
  };
  
  return (
    <div className="flex flex-col">
      <h2 className="font-poppins font-bold text-2xl mb-4 text-center">Your Collection</h2>
      
      {/* Collection Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Cards</p>
            <p className="font-bold text-lg">{collectionStats.totalCards}</p>
          </div>
          <div className="p-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Unique Cards</p>
            <p className="font-bold text-lg">{collectionStats.uniqueCards}</p>
          </div>
          <div className="p-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Completion</p>
            <p className="font-bold text-lg">{collectionStats.completion}%</p>
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search cards..."
              className="w-full py-2 pl-10 pr-4 rounded-full border"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              size="sm"
              variant={filters.type === "all" ? "default" : "outline"}
              className="rounded-full bg-secondary text-white whitespace-nowrap min-w-[44px] min-h-[44px] touch-ripple"
              onClick={() => handleTypeFilter("all")}
            >
              All Types
            </Button>
            <Button
              size="sm"
              variant={filters.type === "fire" ? "default" : "outline"}
              className="rounded-full bg-red-500 text-white whitespace-nowrap min-w-[44px] min-h-[44px] touch-ripple"
              onClick={() => handleTypeFilter("fire")}
            >
              Fire
            </Button>
            <Button
              size="sm"
              variant={filters.type === "water" ? "default" : "outline"}
              className="rounded-full bg-blue-500 text-white whitespace-nowrap min-w-[44px] min-h-[44px] touch-ripple"
              onClick={() => handleTypeFilter("water")}
            >
              Water
            </Button>
            <Button
              size="sm"
              variant={filters.type === "grass" ? "default" : "outline"}
              className="rounded-full bg-green-500 text-white whitespace-nowrap min-w-[44px] min-h-[44px] touch-ripple"
              onClick={() => handleTypeFilter("grass")}
            >
              Grass
            </Button>
            <Button
              size="sm"
              variant={filters.type === "electric" ? "default" : "outline"}
              className="rounded-full bg-yellow-500 text-white whitespace-nowrap min-w-[44px] min-h-[44px] touch-ripple"
              onClick={() => handleTypeFilter("electric")}
            >
              Electric
            </Button>
            <Button
              size="sm"
              variant={filters.type === "psychic" ? "default" : "outline"}
              className="rounded-full bg-purple-500 text-white whitespace-nowrap min-w-[44px] min-h-[44px] touch-ripple"
              onClick={() => handleTypeFilter("psychic")}
            >
              Psychic
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
            <Select defaultValue={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rarity">Rarity</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date Acquired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Error State */}
      {isError && (
        <div className="text-center py-8 text-red-500">
          Error loading your collection. Please try again.
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && cards && cards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-medium">No cards found</h3>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {filters.searchTerm || filters.type !== "all" 
              ? "Try changing your search or filters"
              : "Your collection is empty. Open some packs to get started!"}
          </p>
          {filters.searchTerm || filters.type !== "all" ? (
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ type: "all", searchTerm: "", sortBy: "name" });
              }}
            >
              Clear Filters
            </Button>
          ) : null}
        </div>
      )}
      
      {/* Card Grid */}
      {!isLoading && cards && cards.length > 0 && (
        <CollectionCardGrid cards={cards} onCardClick={handleCardClick} />
      )}
      
      {/* Load More */}
      {!isLoading && cards && cards.length > 0 && (
        <div className="text-center mb-6">
          <Button 
            variant="secondary" 
            className="rounded-full"
            onClick={handleLoadMore}
          >
            Load More Cards
          </Button>
        </div>
      )}
      
      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
