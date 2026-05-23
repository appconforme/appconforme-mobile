/**
 * Global state do BottomSheet do FAB "Registrar" — qualquer tab pode abrir
 * o sheet via `useFabStore.getState().open()`. O sheet é renderizado
 * uma única vez em `(tabs)/_layout.tsx` para evitar montagens duplicadas.
 */
import { create } from 'zustand';

interface FabState {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

export const useFabStore = create<FabState>((set, get) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
  toggle: () => set({ open: !get().open }),
}));
