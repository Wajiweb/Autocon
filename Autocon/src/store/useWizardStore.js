/**
 * useWizardStore.js
 *
 * Zustand store for the multi-step Contract Wizard.
 * Persists wizard state to localStorage so users can leave and return.
 * Manages: active session, draft list, and deployed contract registry.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_PARAMS = {
  ERC20:   { name: '', symbol: '', supply: '1000000', decimals: '18', isMintable: false, isBurnable: false, isPausable: false, isCapped: false, hasAntiWhale: false, hasTax: false, taxRate: '' },
  ERC721:  { name: '', symbol: '', maxSupply: '10000', mintPrice: '0.05', baseURI: '', isBurnable: false, isEnumerable: false, isRevealed: false },
  Auction: { name: '', itemName: '', itemDescription: '', duration: '86400', minimumBid: '0.01', reservePrice: '', hasExtension: false, hasAntiSnipe: false },
};

const INITIAL_SESSION = {
  step: 0,
  direction: 'forward',
  contractType: 'ERC20',
  params: DEFAULT_PARAMS['ERC20'],
  generatedCode: '',
  contractData: null,   // { abi, bytecode }
  deployResult: null,   // { address, txHash, network, savedAt }
  deployError: null,
};

export const useWizardStore = create(
  persist(
    (set, get) => ({
      // ── Active wizard session ──────────────────────────
      session: { ...INITIAL_SESSION },

      // ── Drafts list ────────────────────────────────────
      drafts: [],

      // ── Deployed contracts registry ────────────────────
      deployedContracts: [],

      // ── Session actions ────────────────────────────────
      setStep: (step, direction = 'forward') =>
        set(state => ({ session: { ...state.session, step, direction } })),

      setContractType: (contractType) =>
        set(state => ({
          session: {
            ...state.session,
            contractType,
            params: DEFAULT_PARAMS[contractType],
            generatedCode: '',
            contractData: null,
            deployResult: null,
            deployError: null,
          }
        })),

      setParams: (params) =>
        set(state => ({ session: { ...state.session, params } })),

      setGenerated: (generatedCode, contractData) =>
        set(state => ({ session: { ...state.session, generatedCode, contractData, deployResult: null, deployError: null } })),

      setDeployResult: (deployResult) =>
        set(state => ({ session: { ...state.session, deployResult, deployError: null } })),

      setDeployError: (deployError) =>
        set(state => ({ session: { ...state.session, deployError } })),

      clearDeployError: () =>
        set(state => ({ session: { ...state.session, deployError: null } })),

      resetSession: () =>
        set({ session: { ...INITIAL_SESSION, params: DEFAULT_PARAMS['ERC20'] } }),

      // ── Draft actions ──────────────────────────────────
      saveDraft: () => {
        const { session, drafts } = get();
        const existing = drafts.find(d => d.id === session.draftId);
        const now = Date.now();

        if (existing) {
          set({
            drafts: drafts.map(d => d.id === session.draftId
              ? { ...d, contractType: session.contractType, params: session.params, step: session.step, lastUpdated: now }
              : d
            )
          });
        } else {
          const id = `draft_${now}`;
          set({
            drafts: [
              { id, contractType: session.contractType, params: session.params, step: session.step, lastUpdated: now },
              ...drafts,
            ].slice(0, 10), // Keep last 10 drafts
            session: { ...session, draftId: id },
          });
        }
      },

      loadDraft: (draftId) => {
        const { drafts } = get();
        const draft = drafts.find(d => d.id === draftId);
        if (!draft) return;
        set({
          session: {
            ...INITIAL_SESSION,
            contractType: draft.contractType,
            params: { ...DEFAULT_PARAMS[draft.contractType], ...draft.params },
            step: draft.step,
            draftId: draft.id,
            generatedCode: '',
            contractData: null,
          }
        });
      },

      deleteDraft: (draftId) =>
        set(state => ({ drafts: state.drafts.filter(d => d.id !== draftId) })),

      // ── Deployed registry ──────────────────────────────
      addDeployedContract: (contract) =>
        set(state => ({
          deployedContracts: [
            { ...contract, deployedAt: Date.now() },
            ...state.deployedContracts,
          ].slice(0, 50)
        })),
    }),
    {
      name: 'autocon-wizard-store',
      partialize: (state) => ({
        session: {
          ...state.session,
          // Don't persist large bytecode blobs — re-generate on resume
          contractData: state.session.contractData
            ? { abi: state.session.contractData.abi }
            : null,
        },
        drafts: state.drafts,
        deployedContracts: state.deployedContracts,
      }),
    }
  )
);
