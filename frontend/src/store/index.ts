import { create } from "zustand";
import type { Server } from "../type";

type State = {
  search: string;
  modalAdd: boolean;
  server: Server[];
  modalUpdate: boolean;
  selectedData: Server | null;
  loadConnect: boolean;
  loadId: number;
};

type Action = {
  openModalAdd: (state: boolean) => void;
  handleSearch: (state: string) => void;
  setServerData: (state: Server[]) => void;
  openModalUpdate: (state: boolean, item: Server | null) => void;
  setLoadConnect: (load: boolean, id: number) => void;
};

const initialState = {
  search: "",
  modalAdd: false,
  server: [],
  modalUpdate: false,
  selectedData: null,
  loadConnect: false,
  loadId: 0,
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
  setLoadConnect: (load: boolean, id: number) => {
    set({ loadConnect: load, loadId: id });
  },
}));
