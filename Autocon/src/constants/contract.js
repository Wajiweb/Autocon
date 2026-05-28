import { Coins, Image as ImageIcon, Gavel } from 'lucide-react';
import { NETWORKS as CONTEXT_NETWORKS } from '../context/NetworkContext';

export const CONTRACT_TYPES = [
  { id: 'ERC20',   icon: Coins, name: 'ERC-20 Token',   tag: 'Fungible',    desc: 'Mintable, burnable & pausable fungible tokens with tax and anti-whale support.' },
  { id: 'ERC721',  icon: ImageIcon, name: 'NFT Collection', tag: 'ERC-721',     desc: 'Full NFT collection with reveal mechanics, enumerable supply and IPFS metadata.' },
  { id: 'Auction', icon: Gavel, name: 'Auction',        tag: 'English Bid', desc: 'Trustless on-chain auction with reserve price, anti-snipe and time extension.' },
];

export const STEPS = ['Select Type', 'Parameters', 'Review', 'Deploy'];

export const NETWORKS = Object.values(CONTEXT_NETWORKS).map(n => ({
  id: n.key,
  name: n.name,
  color: n.color,
  explorer: n.explorer
}));

export const DEPLOY_STEPS_DEF = [
  { id: 'wallet',  name: 'Connect Wallet',      sub: 'Authorise MetaMask to sign' },
  { id: 'confirm', name: 'Confirm Transaction', sub: 'Review & approve in MetaMask' },
  { id: 'mine',    name: 'Mining Block',        sub: 'Waiting for on-chain confirmation' },
  { id: 'save',    name: 'Saving to Registry',  sub: 'Persisting to your account' },
];

export const SEV = {
  CRITICAL: { bg: 'rgba(239,68,68,.10)',   border: 'rgba(239,68,68,.25)',   text: '#ef4444', badge: 'red'    },
  HIGH:     { bg: 'rgba(249,115,22,.10)',  border: 'rgba(249,115,22,.25)',  text: '#f97316', badge: 'amber'  },
  MEDIUM:   { bg: 'rgba(167,139,250,.10)', border: 'rgba(167,139,250,.25)', text: '#a78bfa', badge: 'purple' },
  LOW:      { bg: 'rgba(96,165,250,.10)',  border: 'rgba(96,165,250,.25)',  text: '#60a5fa', badge: 'blue'   },
};

export const RISK_TO_SCORE = { LOW: 95, MEDIUM: 70, HIGH: 40, CRITICAL: 10 };

export const STATUS_LABEL = {
  pending:    'Queued…',
  processing: 'Running Slither + AI analysis…',
  completed:  'Analysis complete',
  failed:     'Analysis failed',
};

export const scoreColor = (s) => s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : s >= 40 ? '#f97316' : '#ef4444';

export const scoreGrad = (s) => s >= 80
  ? 'linear-gradient(135deg,#22c55e,#16a34a)'
  : s >= 60 ? 'linear-gradient(135deg,#f59e0b,#f97316)'
  : s >= 40 ? 'linear-gradient(135deg,#f97316,#ef4444)'
  : 'linear-gradient(135deg,#ef4444,#dc2626)';
