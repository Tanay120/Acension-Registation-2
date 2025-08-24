// src/store/registrations.ts
import { create } from 'zustand';
import { supabase } from '@/supabase';

interface Team {
  id: string;
  teamName: string;
}

interface RegistrationState {
  teams: Team[];
  capacity: number;
  isLoading: boolean;
  count: number;
  isClosed: boolean;
  fetchTeams: () => Promise<void>;
  addTeam: (newTeam: Team) => void;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  teams: [],
  capacity: 16,
  isLoading: true,
  count: 0,
  isClosed: false,

  fetchTeams: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id, teamName')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (data) {
        const teamCount = data.length;
        const capacity = get().capacity;
        set({
          teams: data,
          count: teamCount,
          isClosed: teamCount >= capacity,
          isLoading: false
        });
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      set({ isLoading: false });
    }
  },

  addTeam: (newTeam: Team) => {
    set((state) => {
      const newCount = state.teams.length + 1;
      const newIsClosed = newCount >= state.capacity;
      return {
        teams: [...state.teams, newTeam],
        count: newCount,
        isClosed: newIsClosed,
      };
    });
  },
}));