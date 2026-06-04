import { create } from "zustand";
import { BoardElement } from "@/types";

type Tool = string | null;

interface BoardState {
  tool: Tool;
  elements: BoardElement[];
  setTool: (tool: Tool) => void;
  updateElement: (element: BoardElement) => void;
  removeElement: (id: string) => void;
  setElements: (elements: BoardElement[]) => void;
}

export const useBoardStore = create<BoardState>()((set) => ({
  tool: null,
  elements: [],
  setTool: (tool) => set({ tool }),
  updateElement: (element) =>
    set((state) => {
      const index = state.elements.findIndex((el) => el.id === element.id);
      if (index === -1) {
        return { elements: [...state.elements, element] };
      } else {
        const newElements = [...state.elements];
        newElements[index] = element;
        return { elements: newElements };
      }
    }),
  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
    })),
  setElements: (elements) => set({ elements }),
}));
