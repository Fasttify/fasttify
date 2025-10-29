import { create } from 'zustand';

interface StudioState {
  openSections: string[];
  toggleSection: (id: string) => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  openSections: [],
  toggleSection: (id) => {
    const exists = get().openSections.includes(id);
    set({ openSections: exists ? get().openSections.filter((s) => s !== id) : [...get().openSections, id] });
  },
}));
