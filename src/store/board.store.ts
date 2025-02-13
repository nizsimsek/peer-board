import { create } from "zustand";

type Tool = string | null;

interface Element {
  id: string;
  [key: string]: any;
}

interface BoardState {
  tool: Tool;
  elements: Element[];
  setTool: (tool: Tool) => void;
  updateElement: (element: Element) => void;
  setElements: (elements: Element[]) => void;
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
  setElements: (elements) => set({ elements }),
}));
