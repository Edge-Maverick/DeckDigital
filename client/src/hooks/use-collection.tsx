import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Card } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Context for global collection state
interface CollectionContextType {
  addCardsToCollection: (cards: Card[]) => void;
  getCollection: () => Promise<Card[]>;
  filterCollection: (filter: string, searchTerm: string) => Promise<Card[]>;
  sortCollection: (sortBy: string) => Promise<Card[]>;
  collectionStats: {
    totalCards: number;
    uniqueCards: number;
    completion: number;
  };
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

interface CollectionProviderProps {
  children: ReactNode;
}

export const CollectionProvider = ({ children }: CollectionProviderProps) => {
  const queryClient = useQueryClient();
  const [collectionStats, setCollectionStats] = useState({
    totalCards: 0,
    uniqueCards: 0,
    completion: 0
  });

  // Fetch collection from API
  const getCollection = async (): Promise<Card[]> => {
    const response = await apiRequest("GET", "/api/collection", undefined);
    const data = await response.json();
    return data;
  };

  // Add cards to collection
  const addCardsToCollection = async (cards: Card[]) => {
    await apiRequest("POST", "/api/collection", { cards });
    queryClient.invalidateQueries({ queryKey: ["/api/collection"] });
  };

  // Filter collection by type, name, etc.
  const filterCollection = async (filter: string, searchTerm: string): Promise<Card[]> => {
    const url = `/api/collection/filter?type=${filter}&search=${searchTerm}`;
    const response = await apiRequest("GET", url, undefined);
    return response.json();
  };

  // Sort collection
  const sortCollection = async (sortBy: string): Promise<Card[]> => {
    const response = await apiRequest("GET", `/api/collection/sort?by=${sortBy}`, undefined);
    return response.json();
  };

  // Update collection stats whenever collection changes
  useEffect(() => {
    const updateStats = async () => {
      try {
        const response = await apiRequest("GET", "/api/collection/stats", undefined);
        const stats = await response.json();
        setCollectionStats(stats);
      } catch (error) {
        console.error("Failed to fetch collection stats:", error);
      }
    };

    updateStats();
  }, [queryClient]);

  const value = {
    addCardsToCollection,
    getCollection,
    filterCollection,
    sortCollection,
    collectionStats
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error("useCollection must be used within a CollectionProvider");
  }
  return context;
};

// Hook for the collection query
export const useCollectionQuery = (filter = 'all', searchTerm = '', sortBy = 'name') => {
  return useQuery({
    queryKey: ["/api/collection", filter, searchTerm, sortBy],
    staleTime: 60 * 1000, // 1 minute
  });
};
