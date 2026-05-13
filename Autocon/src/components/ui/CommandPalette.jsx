import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Terminal, 
  Coins, 
  Image as ImageIcon, 
  Gavel, 
  ShieldCheck, 
  Code2, 
  LayoutDashboard, 
  Library,
  User,
  Settings,
  X
} from 'lucide-react';

const commands = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', section: 'Platform' },
  { id: 'tokens', title: 'Deploy Token', icon: Coins, path: '/tokens', section: 'Generators' },
  { id: 'nfts', title: 'Deploy NFT', icon: ImageIcon, path: '/nfts', section: 'Generators' },
  { id: 'auctions', title: 'Deploy Auction', icon: Gavel, path: '/auctions', section: 'Generators' },
  { id: 'wizard', title: 'Contract Wizard', icon: Terminal, path: '/create', section: 'Generators' },
  { id: 'audit', title: 'Security Audit', icon: ShieldCheck, path: '/audit', section: 'Tools' },
  { id: 'ast', title: 'AST Analysis', icon: Code2, path: '/ast', section: 'Tools' },
  { id: 'templates', title: 'Template Library', icon: Library, path: '/templates', section: 'Resources' },
  { id: 'profile', title: 'User Profile', icon: User, path: '/profile', section: 'Platform' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Toggle on Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCommands = query === '' 
    ? commands 
    : commands.filter((command) => 
        command.title.toLowerCase().includes(query.toLowerCase()) || 
        command.section.toLowerCase().includes(query.toLowerCase())
      );

  // Keyboard navigation within the palette
  useEffect(() => {
    const handleNavigation = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          navigate(filteredCommands[selectedIndex].path);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, filteredCommands, selectedIndex, navigate]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-[var(--bg)]/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4 pointer-events-none"
          >
            <div 
              className="w-full max-w-xl bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border)'
              }}
            >
              <div className="flex items-center px-4 py-3 border-b border-[var(--border)]">
                <Search className="w-5 h-5 text-[var(--on-surface-variant)] mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] text-lg"
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-[var(--surface)] text-[var(--on-surface-variant)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="py-14 text-center text-[var(--on-surface-variant)]">
                    No results found for "{query}"
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredCommands.map((command, index) => {
                      const isSelected = index === selectedIndex;
                      const Icon = command.icon;
                      
                      return (
                        <div
                          key={command.id}
                          onMouseEnter={() => setSelectedIndex(index)}
                          onClick={() => {
                            navigate(command.path);
                            setIsOpen(false);
                          }}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-[var(--primary-subtle)] text-[var(--primary)]' 
                              : 'text-[var(--on-surface)] hover:bg-[var(--surface)]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'}`} />
                            <span className="font-medium">{command.title}</span>
                          </div>
                          <span className={`text-xs ${isSelected ? 'text-[var(--primary)]/70' : 'text-[var(--on-surface-variant)]'}`}>
                            {command.section}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="px-4 py-3 bg-[var(--surface)] border-t border-[var(--border)] flex items-center gap-4 text-xs text-[var(--on-surface-variant)]">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-[var(--bg)] border border-[var(--border)] rounded shadow-sm text-[var(--on-surface)]">↑</kbd>
                  <kbd className="px-2 py-1 bg-[var(--bg)] border border-[var(--border)] rounded shadow-sm text-[var(--on-surface)]">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-[var(--bg)] border border-[var(--border)] rounded shadow-sm text-[var(--on-surface)]">Enter</kbd>
                  to select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-[var(--bg)] border border-[var(--border)] rounded shadow-sm text-[var(--on-surface)]">Esc</kbd>
                  to close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
