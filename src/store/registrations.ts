// src/store/registrations.ts
import { create } from 'zustand';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase';

// Define the shape of a team
interface Team {
  id: string;
  teamName: string;
}

// Define the state and actions for your store
interface RegistrationState {
  teams: Team[];
  capacity: number;
  isLoading: boolean;
  fetchTeams: () => Promise<void>;
  count: () => number;
  isClosed: () => boolean;
}

// Create the store
export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  teams: [],
  capacity: 16, // The tournament capacity
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
      set({ teams: teamsList, isLoading: false });
    } catch (error) {
      console.error("Error fetching teams:", error);
      set({ isLoading: false });
    }
  },

  // Getter for the current count of registered teams
  count: () => get().teams.length,

  // Getter to check if registration is closed
  isClosed: () => get().teams.length >= get().capacity,
}));