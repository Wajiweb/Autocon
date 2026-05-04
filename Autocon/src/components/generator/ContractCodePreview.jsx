import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import CodeViewer from '../dashboard/CodeViewer';
import ExportCenter from '../dashboard/ExportCenter';
import DeveloperToggle from '../dashboard/DeveloperToggle';

/**
 * ContractCodePreview — Unified code preview section for all generators.
 *
 * Renders:
 *   - Section header: label + DeveloperToggle + ExportCenter + optional AST button
 *   - Monaco-based CodeViewer
 *
 * Props:
 *   contractName  string  — Used by ExportCenter for filename
 *   contractLabel string  — Display title, e.g. 'Generated Solidity', 'Generated ERC-721 Contract'
 *   abi           any     — ABI data for ExportCenter
 *   nftMetadata   object  — Optional: { name, description, image } for NFT ExportCenter
 *   ast           any     — Optional: if present shows AST button
 */
export default function ContractCodePreview({
  contractName = 'Contract',
  contractLabel = 'Generated Solidity',
  abi = null,
  nftMetadata = null,
  ast = null,
}) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--on-surface)]">
            📄 {contractLabel}
          </span>
          <span className="subtle-label">Compiled ✓</span>
        </div>
        <div className="flex items-center gap-2">
          <DeveloperToggle />
          <ExportCenter
            contractName={contractName}
            abi={abi}
            {...(nftMetadata ? { nftMetadata } : {})}
          />
          {ast && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/ast', { state: { ast } })}
            >
              🌳 AST
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-[var(--outline-variant)]">
        <CodeViewer />
      </div>
    </div>
  );
}
