import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/**
 * GasEstimateCard — Unified gas estimation display for all generators.
 *
 * Props:
 *   gasEstimate   { gasUnits, gasPriceGwei, estimatedCostETH } | null
 *   onEstimate    fn
 *   isEstimating  bool
 *   label         string — Optional section label override
 */
export default function GasEstimateCard({
  gasEstimate = null,
  onEstimate = () => {},
  isEstimating = false,
  label = 'Gas Estimation',
}) {
  return (
    <Card>
      <div className={`flex justify-between items-center ${gasEstimate ? 'mb-5' : ''}`}>
        <div>
          <h3 className="text-base font-bold text-[var(--on-surface)] mb-1">⛽ {label}</h3>
          <p className="text-xs text-[var(--outline)]">Estimate deployment cost before spending ETH</p>
        </div>
        <Button
          variant="secondary"
          onClick={onEstimate}
          isLoading={isEstimating}
        >
          Estimate Gas
        </Button>
      </div>

      {gasEstimate && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
            <p className="text-[0.65rem] font-bold text-[var(--outline)] uppercase mb-1.5">Gas Units</p>
            <p className="text-lg font-extrabold text-[var(--primary)]">
              {parseInt(gasEstimate.gasUnits).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-[0.65rem] font-bold text-[var(--outline)] uppercase mb-1.5">Gas Price</p>
            <p className="text-lg font-extrabold text-amber-500">
              {gasEstimate.gasPriceGwei} Gwei
            </p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[0.65rem] font-bold text-[var(--outline)] uppercase mb-1.5">Est. Cost</p>
            <p className="text-lg font-extrabold text-[var(--success)]">
              {gasEstimate.estimatedCostETH} ETH
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
