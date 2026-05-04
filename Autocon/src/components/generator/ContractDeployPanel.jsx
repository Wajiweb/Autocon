import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import DeploymentStatusBar from '../deploy/DeploymentStatusBar';
import DeploymentTimeline from '../deploy/DeploymentTimeline';

/**
 * ContractDeployPanel — Unified deploy section for all generators.
 *
 * Renders:
 *   - DeploymentStatusBar (always)
 *   - While deploying: DeploymentTimeline
 *   - Otherwise: Deploy button + Optional Audit CTA
 *
 * Props:
 *   generatedCode  string
 *   isDeploying    bool
 *   deployStep     number
 *   errorStep      number
 *   errorMessage   string
 *   onDeploy       fn
 *   deployLabel    string  — e.g. 'Deploy to Sepolia', 'Deploy NFT to Sepolia'
 *   auditType      string  — e.g. 'ERC20', 'ERC721', 'Auction'
 */
export default function ContractDeployPanel({
  generatedCode = '',
  isDeploying = false,
  deployStep = 0,
  errorStep = -1,
  errorMessage = '',
  onDeploy = () => {},
  deployLabel = 'Deploy Contract',
  auditType = 'ERC20',
}) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-4">
        <DeploymentStatusBar />
      </div>

      {isDeploying && deployStep >= 0 ? (
        <Card variant="glass" className="mb-4">
          <DeploymentTimeline
            currentStep={deployStep}
            errorStep={errorStep}
            errorMessage={errorMessage}
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            onClick={onDeploy}
            disabled={!generatedCode || isDeploying}
            className={`w-full ${(!generatedCode || isDeploying) ? '!bg-[var(--surface-highest)] !text-[var(--outline)]' : ''}`}
          >
            🚀 {deployLabel}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/audit', { state: { code: generatedCode, type: auditType } })}
            disabled={!generatedCode || isDeploying}
            className="w-full"
          >
            ⚑ Optional: Run AI Audit
          </Button>
        </div>
      )}
    </div>
  );
}
