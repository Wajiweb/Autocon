import { create } from 'zustand';

export const useContractStore = create((set) => ({
  contractType: null, // 'Token', 'NFT', 'Auction'
  generatedCode: '',
  originalCode: '',
  contractData: null, // { abi, bytecode, compilerVersion, constructorArgs }
  isEditingEnabled: false,
  snapshots: [], // { id: string, code: string, timestamp: number }

  // Set the code initially from a generator
  setGeneratedCode: (code, type, contractData = null) => set({
    generatedCode: code,
    originalCode: code,
    contractType: type,
    contractData,
    isEditingEnabled: false, // Reset editing state on new generation
    snapshots: []
  }),

  // Update compiled contract data (useful after re-compiling custom code)
  setContractData: (data) => set((state) => ({
    contractData: { ...state.contractData, ...data }
  })),

  // Update code manually from Monaco Editor
  updateManualCode: (code) => set({
    generatedCode: code
  }),

  // Save current code to snapshots (max 5)
  saveSnapshot: () => set((state) => {
    const newSnapshot = {
        id: Math.random().toString(36).substr(2, 9),
        code: state.generatedCode,
        timestamp: Date.now()
    };
    const newSnapshots = [newSnapshot, ...state.snapshots].slice(0, 5);
    return { snapshots: newSnapshots };
  }),

  // Restore snapshot by ID
  restoreSnapshot: (id) => set((state) => {
    const snapshot = state.snapshots.find(s => s.id === id);
    if (!snapshot) return state;
    return { generatedCode: snapshot.code };
  }),

  // Reset the code back to the original template
  resetCode: () => set((state) => ({
    generatedCode: state.originalCode
  })),

  // Toggle Developer/Manual Edit mode
  toggleEditing: (enabled) => set({
    isEditingEnabled: enabled
  }),

  // Clear everything
  clearStore: () => set({
    contractType: null,
    generatedCode: '',
    originalCode: '',
    contractData: null,
    isEditingEnabled: false,
    snapshots: []
  })
}));
