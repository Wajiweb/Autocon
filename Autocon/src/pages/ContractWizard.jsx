import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useJobPoller } from '../hooks/useJobPoller';
import { useAuth } from '../context/AuthContext';
import { useWizardStore } from '../store/useWizardStore';
import { Button, GlassCard } from '../components/ui';
import { Stepper } from '../components/wizard/Stepper';
import { StepType } from '../components/wizard/StepType';
import { StepParams } from '../components/wizard/StepParams';
import { StepReview } from '../components/wizard/StepReview';
import { StepDeploy } from '../components/wizard/StepDeploy';
import { validate } from '../utils/validation';
import { CONTRACT_TYPES } from '../constants/contract';
import { compileContract } from '../services/contractApi';
import './wizard.css';
import '../components/dashboard/styles/dashboard.css';

export default function ContractWizard() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Wizard global state
  const { session, drafts, setStep, setContractType, setParams, setGenerated, resetSession, saveDraft, loadDraft, deleteDraft } = useWizardStore();
  const { step, direction, contractType, params, generatedCode, contractData, deployResult } = session;

  const [isGenerating, setIsGenerating] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const toastIdRef = useRef(null);

  const { status: compileStatus, result: compileResult, error: compileError, startPolling: startCompilePolling } = useJobPoller();

  useEffect(() => {
    if (!isGenerating || !compileStatus) return;

    if (compileStatus === 'completed' && compileResult) {
      setTimeout(() => {
        setGenerated(compileResult.sourceCode, {
          abi: compileResult.abi,
          bytecode: compileResult.bytecode,
          contractName: compileResult.contractName,
          compilerVersion: compileResult.compilerVersion,
          sourceFile: compileResult.sourceFile || (contractType === 'ERC20' ? 'Token.sol' : contractType === 'ERC721' ? 'NFT.sol' : 'Auction.sol'),
          ast: compileResult.ast,
        });
        if (toastIdRef.current) {
          toast.success('Contract compiled successfully!', { id: toastIdRef.current });
          toastIdRef.current = null;
        }
        setIsGenerating(false);
        saveDraft();
      }, 0);
    } else if (compileStatus === 'failed') {
      setTimeout(() => {
        if (toastIdRef.current) {
          toast.error(compileError || 'Compilation failed', { id: toastIdRef.current });
          toastIdRef.current = null;
        }
        setIsGenerating(false);
      }, 0);
    }
  }, [compileStatus, compileResult, compileError, isGenerating, contractType, setGenerated, saveDraft]);

  // Handle ?type= query param — fires whenever the sidebar generator link changes.
  // NOTE: We keep ?type in the URL (don't delete it) so the sidebar
  // can highlight the correct generator link while on this page.
  useEffect(() => {
    const typeQuery = searchParams.get('type');
    if (typeQuery && CONTRACT_TYPES.find(t => t.id === typeQuery)) {
      // Always apply the selected type + jump to params step,
      // even if the wizard is already open mid-flow.
      // This lets sidebar generator links act as independent entry points.
      setContractType(typeQuery);
      setStep(1, 'forward');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('type')]);  // only re-run when the type param itself changes

  // Auto-save draft on params or step change
  useEffect(() => {
    if (step > 0 && !deployResult) {
      saveDraft();
    }
  }, [step, params, contractType, saveDraft, deployResult]);

  const goTo = (nextStep) => setStep(nextStep, nextStep > step ? 'forward' : 'back');

  const handleTypeSelect = (id) => {
    setContractType(id);
    goTo(1);
  };

  const handleNext = () => {
    if (step === 0 && !contractType) { toast.error('Select a contract type'); return; }
    if (step === 1) {
      const errs = validate(contractType, params);
      if (Object.keys(errs).length) { toast.error('Fix validation errors'); return; }
    }
    if (step === 2 && !generatedCode) { toast.error('Generate the contract first'); return; }
    goTo(step + 1);
  };

  const handleBack = () => goTo(step - 1);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const toastId = toast.loading('Generating contract code...');
    toastIdRef.current = toastId;
    try {
      const data = await compileContract(authFetch, contractType, params);
      setGenerated(data.contractCode, {
        contractName: data.contractName,
        sourceFile: data.sourceFile,
      });
      toast.loading('Compiling contract (background)...', { id: toastId });
      startCompilePolling(data.jobId);
    } catch (e) {
      toast.error(e.message || 'Server error', { id: toastId });
      setIsGenerating(false);
    }
  };

  const startNew = () => {
    resetSession();
    setShowDrafts(false);
  };

  return (
    <div className="dashboard-theme db-content" style={{ position: 'relative' }}>
      
      {/* Top action bar */}
      <div style={{ position: 'absolute', top: 20, right: 30, display: 'flex', gap: 10, zIndex: 10 }}>
        {drafts.length > 0 && (
          <Button variant="secondary" size="sm" onClick={() => setShowDrafts(!showDrafts)}>
            {showDrafts ? 'Close Drafts' : `Drafts (${drafts.length})`}
          </Button>
        )}
        {(step > 0 || deployResult) && (
          <Button variant="secondary" size="sm" onClick={startNew}>+ New Contract</Button>
        )}
      </div>

      <GlassCard className="wz-wrap" delay={0.15} padding="lg">
        {showDrafts && (
          <GlassCard hoverable={false} padding="md" style={{ marginBottom: 24, animation: 'wz-slideIn .3s ease' }}>
            <div className="wz-card-title">Saved Drafts</div>
            <div className="wz-card-sub">Resume your uncompleted contracts.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {drafts.map(d => {
                const meta = CONTRACT_TYPES.find(t => t.id === d.contractType);
                return (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-elevated)', padding: '12px 16px', borderRadius: 8, border: '.5px solid var(--border-dark)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{d.params.name || 'Unnamed'} ({meta?.name})</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Step {d.step + 1} • Last updated {new Date(d.lastUpdated).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="primary" size="sm" onClick={() => { loadDraft(d.id); setShowDrafts(false); }}>Resume</Button>
                      <Button variant="danger" size="sm" onClick={() => deleteDraft(d.id)}>Delete</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        <div className="wz-header">
          <div className="wz-header-title">Create <em>Smart Contract</em></div>
          <div className="wz-header-sub">Follow the guided steps to generate and deploy your contract on-chain. Progress auto-saves.</div>
        </div>

        <Stepper current={step} />

        <div className="wz-stage">
          <div className={`wz-panel${direction === 'back' ? ' reverse' : ''}`} key={step}>
            {step === 0 && <StepType selected={contractType} onSelect={handleTypeSelect} />}
            {step === 1 && <StepParams type={contractType} params={params} onChange={setParams} errors={validate(contractType, params)} />}
            {step === 2 && <StepReview type={contractType} params={params} code={generatedCode} isGenerating={isGenerating} onGenerate={handleGenerate} />}
            {step === 3 && <StepDeploy type={contractType} params={params} contractData={contractData} code={generatedCode} onSuccess={() => {}} />}
          </div>
        </div>

        <div className="wz-nav">
          <Button variant="ghost" onClick={step === 0 ? () => navigate('/dashboard') : handleBack}>
            {step === 0 ? '← Dashboard' : '← Back'}
          </Button>
          
          {step < 3 && (
            <Button variant="primary" onClick={handleNext}>
              {step === 2 && !generatedCode ? 'Generate First' : step === 2 ? 'Proceed to Deploy →' : 'Continue →'}
            </Button>
          )}
          
          {step === 3 && deployResult && (
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Go to Dashboard →</Button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
