import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, PackType } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

export const useTCGdex = () => {
  // Get cards from API
  const fetchCards = async (): Promise<Card[]> => {
    const response = await apiRequest("GET", "/api/cards", undefined);
    return response.json();
  };

  // Get a single card
  const fetchCard = async (id: string): Promise<Card> => {
    const response = await apiRequest("GET", `/api/cards/${id}`, undefined);
    return response.json();
  };

  // Get available packs
  const fetchPacks = async (): Promise<PackType[]> => {
    const response = await apiRequest("GET", "/api/packs", undefined);
    return response.json();
  };

  // Open a pack
  const openPack = async (packId: string): Promise<Card[]> => {
    const response = await apiRequest("POST", `/api/packs/${packId}/open`, undefined);
    return response.json();
  };

  // Query hooks
  const useCards = () => {
    return useQuery({
      queryKey: ["/api/cards"],
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const useCard = (id: string) => {
    return useQuery({
      queryKey: ["/api/cards", id],
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  const usePacks = () => {
    return useQuery({
      queryKey: ["/api/packs"],
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    fetchCards,
    fetchCard,
    fetchPacks,
    openPack,
    useCards,
    useCard,
    usePacks
  };
};
