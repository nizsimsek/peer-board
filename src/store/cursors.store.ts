import { create } from "zustand";

interface Cursor {
  userId: string;
  x: number;
  y: number;
  name: string;
  color: string;
}

interface CursorState {
  cursors: Cursor[];
  updateCursorPosition: (cursor: Cursor) => void;
  removeCursorPosition: (userId: string) => void;
  clearCursors: () => void;
}

export const useCursorStore = create<CursorState>()((set) => ({
  cursors: [],
  updateCursorPosition: ({ userId, x, y, name, color }) =>
    set((state) => {
      if (!userId) return { cursors: state.cursors };

      const index = state.cursors.findIndex((c) => c.userId === userId);

      if (index !== -1) {
        const newCursors = [...state.cursors];
        newCursors[index] = { userId, x, y, name, color };
        return { cursors: newCursors };
      }

      return { cursors: [...state.cursors, { userId, x, y, name, color }] };
    }),
  removeCursorPosition: (userId) =>
    set((state) => ({
      cursors: state.cursors.filter((c) => c.userId !== userId),
    })),
  clearCursors: () => set({ cursors: [] }),
}));
