import { Button } from '../ui/Button';

/**
 * GeneratorHeader — Unified page header for all three contract generators.
 *
 * Props:
 *   icon        string   — Emoji icon for the generator (e.g. '🪙')
 *   title       string   — Page title (e.g. 'ERC-20')
 *   titleAccent string   — Gradient-accented suffix (e.g. 'Generator')
 *   subtitle    string   — Descriptive tagline
 *   features    string[] — Feature pill labels
 *   aiIntent    string
 *   aiPlaceholder string
 *   onAiIntentChange fn
 *   onAutoFill  fn
 *   isSuggesting bool
 *   onChatOpen  fn
 *   reasoning   string   — Optional AI reasoning note to display
 */
export default function GeneratorHeader({
  icon = '📄',
  title = 'Contract',
  titleAccent = 'Generator',
  subtitle = 'Deploy smart contracts in minutes — no Solidity required.',
  features = [],
  aiIntent = '',
  aiPlaceholder = 'Describe your contract idea...',
  onAiIntentChange = () => {},
  onAutoFill = () => {},
  isSuggesting = false,
  onChatOpen = () => {},
  reasoning = '',
}) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-2 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[var(--primary-gradient)] rounded-xl flex items-center justify-center text-[22px] shadow-[var(--shadow-ambient)]">
            {icon}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--on-surface)]">
            {title}{' '}
            <span className="text-transparent bg-clip-text bg-[var(--primary-gradient)]">
              {titleAccent}
            </span>
          </h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder={aiPlaceholder}
            value={aiIntent}
            onChange={(e) => onAiIntentChange(e.target.value)}
            className="w-[200px] text-[13px] px-3 py-2 bg-[color:var(--surface-elevated)] border border-[var(--border-light)] rounded-full text-[color:var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-glow)]"
            onKeyDown={(e) => { if (e.key === 'Enter') onAutoFill(); }}
          />
          <Button
            variant="secondary"
            onClick={onAutoFill}
            isLoading={isSuggesting}
            className="rounded-full !py-2 !px-4"
          >
            ✨ Auto-Fill
          </Button>
          <Button
            variant="ai"
            onClick={onChatOpen}
            className="rounded-full !py-2 !px-4"
          >
            💬 AI Chat
          </Button>
        </div>
      </div>

      {reasoning && (
        <div className="mt-2 px-3 py-2 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-lg text-sm text-[var(--on-surface)]">
          💡 {reasoning}
        </div>
      )}

      <p className="text-[var(--on-surface-variant)] text-[0.95rem]">{subtitle}</p>

      {features.length > 0 && (
        <div className="flex gap-2 mt-3.5 flex-wrap">
          {features.map((f) => (
            <span key={f} className="subtle-label">{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}
