// src/store/registrations.ts
import { create } from 'zustand';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase';

// Define the shape of a team object
interface Team {
  id: string;
  teamName: string;
}

// Define the shape of the store's state and actions
interface RegistrationState {
  teams: Team[];
  capacity: number;
  isLoading: boolean;
  fetchTeams: () => Promise<void>;
  addTeam: (newTeam: Team) => void;
  count: () => number;
  isClosed: () => boolean;
}

// Create the Zustand store
export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  // Initial state
  teams: [],
  capacity: 16,
  isLoading: true,

  // Action to fetch all teams from Firestore
  fetchTeams: async () => {
    set({ isLoading: true });
    try {
      const q = query(collection(db, "registrations"), orderBy("registeredAt", "asc"));
      const querySnapshot = await getDocs(q);
      const teamsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        teamName: doc.data().teamName,
      })) as Team[];
      set({ teams: teamsList });
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      // Always set loading to false after the fetch attempt is complete
      set({ isLoading: false });
    }
  },

  // Action to add a new team to the local state optimistically
  addTeam: (newTeam: Team) => {
    set((state) => ({
      teams: [...state.teams, newTeam],
      // This is the fix: ensure isLoading is false after adding a team
      isLoading: false,
    }));
  },

  // Getter to calculate the current number of registered teams
  count: () => get().teams.length,

  // Getter to check if the registration capacity has been reached
  isClosed: () => get().teams.length >= get().capacity,
}));
