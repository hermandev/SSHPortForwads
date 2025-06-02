import { create } from "zustand";
import type { Server } from "../type";

type State = {
  search: string;
  modalAdd: boolean;
  server: Server[];
  modalUpdate: boolean;
  selectedData: Server | null;
};

type Action = {
  openModalAdd: (state: boolean) => void;
  handleSearch: (state: string) => void;
  setServerData: (state: Server[]) => void;
  openModalUpdate: (state: boolean, item: Server | null) => void;
};

const initialState = {
  search: "",
  modalAdd: false,
  server: [],
  modalUpdate: false,
  selectedData: null,
};

export const useStore = create<State & Action>()((set) => ({
  ...initialState,
  openModalAdd: (state: boolean) => {
    set({ modalAdd: state });
  },
  handleSearch: (state: string) => {
    set({ search: state });
  },
  setServerData: (state: Server[]) => {
    set({ server: state });
  },
  openModalUpdate: (state: boolean, item: Server | null) => {
    set({ modalUpdate: state, selectedData: item });
  },
}));
