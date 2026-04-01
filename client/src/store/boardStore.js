import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_HISTORY = 50;

// Separate persisted UI preferences store
export const useUIStore = create(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: 'wb-ui-prefs' }
  )
);

export const useBoardStore = create((set, get) => ({
  // Board meta
  boardId: null,
  title: 'Untitled Board',
  role: 'owner',
  background: '#ffffff',
  gridEnabled: false,

  // Elements
  elements: [],
  selectedIds: [],

  // History
  history: [],
  historyIndex: -1,

  // Tool state
  activeTool: 'select',
  strokeColor: '#000000',
  fillColor: 'transparent',
  strokeWidth: 2,
  fontSize: 16,
  opacity: 1,

  // Canvas state
  stageScale: 1,
  stagePos: { x: 0, y: 0 },

  // Collaboration
  roomUsers: [],
  remoteCursors: {},

  setBoardMeta: (meta) => set(meta),
  setTitle: (title) => set({ title }),
  setActiveTool: (tool) => set({ activeTool: tool, selectedIds: [] }),
  setStrokeColor: (c) => set({ strokeColor: c }),
  setFillColor: (c) => set({ fillColor: c }),
  setStrokeWidth: (w) => set({ strokeWidth: w }),
  setFontSize: (s) => set({ fontSize: s }),
  setOpacity: (o) => set({ opacity: o }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  setStageScale: (s) => set({ stageScale: s }),
  setStagePos: (p) => set({ stagePos: p }),
  setRoomUsers: (users) => set({ roomUsers: users }),
  toggleGrid: () => set((s) => ({ gridEnabled: !s.gridEnabled })),

  setRemoteCursor: (socketId, data) =>
    set((s) => ({ remoteCursors: { ...s.remoteCursors, [socketId]: data } })),
  removeRemoteCursor: (socketId) =>
    set((s) => {
      const c = { ...s.remoteCursors };
      delete c[socketId];
      return { remoteCursors: c };
    }),

  setElements: (elements, pushHistory = true) => {
    const { history, historyIndex } = get();
    if (pushHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(elements);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      set({ elements, history: newHistory, historyIndex: newHistory.length - 1 });
    } else {
      set({ elements });
    }
  },

  addElement: (el) => {
    const elements = [...get().elements, el];
    get().setElements(elements);
  },

  updateElement: (id, updates) => {
    const elements = get().elements.map((el) => (el.id === id ? { ...el, ...updates } : el));
    get().setElements(elements);
  },

  deleteSelected: () => {
    const { selectedIds, elements } = get();
    if (!selectedIds.length) return;
    get().setElements(elements.filter((el) => !selectedIds.includes(el.id)));
    set({ selectedIds: [] });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ elements: history[newIndex], historyIndex: newIndex });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ elements: history[newIndex], historyIndex: newIndex });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  groupSelected: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length < 2) return;
    const groupId = `group_${Date.now()}`;
    const updated = elements.map((el) =>
      selectedIds.includes(el.id) ? { ...el, groupId } : el
    );
    get().setElements(updated);
  },

  ungroupSelected: () => {
    const { selectedIds, elements } = get();
    const updated = elements.map((el) =>
      selectedIds.includes(el.id) ? { ...el, groupId: undefined } : el
    );
    get().setElements(updated);
  },

  moveLayerUp: (id) => {
    const elements = [...get().elements];
    const idx = elements.findIndex((e) => e.id === id);
    if (idx < elements.length - 1) {
      [elements[idx], elements[idx + 1]] = [elements[idx + 1], elements[idx]];
      get().setElements(elements);
    }
  },

  moveLayerDown: (id) => {
    const elements = [...get().elements];
    const idx = elements.findIndex((e) => e.id === id);
    if (idx > 0) {
      [elements[idx], elements[idx - 1]] = [elements[idx - 1], elements[idx]];
      get().setElements(elements);
    }
  },
}));
