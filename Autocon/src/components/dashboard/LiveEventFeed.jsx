import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Activity, Image as ImageIcon, Flame } from 'lucide-react';
import { useLiveEvents } from '../../hooks/useLiveEvents';

/**
 * Helper to truncate Ethereum addresses
 */
const truncateHex = (hex, len = 4) => {
  if (!hex || typeof hex !== 'string') return '';
  return `${hex.substring(0, len + 2)}...${hex.substring(hex.length - len)}`;
};

/**
 * Returns icon and colors based on standard contract event names
 */
const getEventDetails = (type) => {
  switch (type.toLowerCase()) {
    case 'transfer':
      return { Icon: ArrowRightLeft, color: '#67e8f9', bg: 'rgba(103, 232, 249, 0.15)' }; // Cyan
    case 'mint':
      return { Icon: ImageIcon, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }; // Green
    case 'burn':
      return { Icon: Flame, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }; // Red
    default:
      return { Icon: Activity, color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' }; // Purple
  }
};

/**
 * LiveEventFeed
 * Displays a real-time list of blockchain events using WebSocket logs.
 * @param {Array} contracts - Array of mapped { contractAddress, abi } objects.
 */
export default function LiveEventFeed({ contracts }) {
  const { latestEvents, isConnected } = useLiveEvents(contracts);

  return (
    <div className="flex flex-col w-full h-96 rounded-2xl border border-white/5 overflow-hidden" 
         style={{ background: 'rgba(22, 29, 43, 0.8)', backdropFilter: 'blur(12px)' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
        <h3 className="font-bold text-lg text-white font-['Space_Grotesk'] tracking-tight flex items-center gap-2">
          <Activity size={18} color="#a78bfa" /> Live Network Feed
        </h3>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 border border-white/5">
          <div className="relative flex h-2 w-2">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>
          <span className="text-xs font-semibold text-gray-300">
            {isConnected ? 'WSS Connected' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* Feed Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
        {latestEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Activity className="opacity-20 mb-2" size={32} />
            <p className="text-sm">Listening for smart contract events...</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {latestEvents.map((event) => {
              const { Icon, color, bg } = getEventDetails(event.type);
              
              return (
                <motion.div
                  key={event.id} // Standard transactionHash
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, type: 'spring', bounce: 0.25 }}
                  className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-black/40 transition-colors"
                >
                  {/* Event Icon */}
                  <div className="p-3 rounded-xl flex-shrink-0 mt-1" style={{ background: bg, boxShadow: `0 0 15px ${bg}` }}>
                    <Icon size={18} color={color} />
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 min-w-0 font-['Inter']">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-white text-sm tracking-wide">
                        {event.type}
                      </h4>
                      <span className="text-xs text-gray-500 font-medium">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    {/* From / To Addresses */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 font-mono mb-2">
                      <a href={`https://sepolia.etherscan.io/address/${event.from}`} target="_blank" rel="noreferrer" 
                         className="hover:text-[#67e8f9] transition-colors">{truncateHex(event.from)}</a>
                      <span className="text-gray-600">→</span>
                      <a href={`https://sepolia.etherscan.io/address/${event.to}`} target="_blank" rel="noreferrer" 
                         className="hover:text-[#67e8f9] transition-colors">{truncateHex(event.to)}</a>
                    </div>

                    {/* Amount & TxLink */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      {event.amount && (
                        <div className="text-xs font-bold text-gray-300">
                          Qty: <span className="text-white bg-white/10 px-1.5 py-0.5 rounded">{event.amount}</span>
                        </div>
                      )}
                      
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${event.id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[0.65rem] font-bold text-[#a78bfa] hover:text-white transition-colors ml-auto flex items-center gap-1"
                      >
                        View Tx ↗
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
