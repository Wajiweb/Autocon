import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useWizardStore } from '../store/useWizardStore';
import { Stepper, StepType, StepParams, StepReview, StepDeploy, validate, API_ENDPOINT, CONTRACT_TYPES } from './WizardComponents';
import './wizard.css';
import '../components/dashboard/styles/dashboard.css';

export default function ContractWizard() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  // Wizard global state
  const { session, drafts, setStep, setContractType, setParams, setGenerated, resetSession, saveDraft, loadDraft, deleteDraft } = useWizardStore();
  const { step, direction, contractType, params, generatedCode, contractData, deployResult } = session;

  const [isGenerating, setIsGenerating] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);

  // Auto-save draft on params or step change
  useEffect(() => {
    if (step > 0 && !deployResult) {
      saveDraft();
    }
  }, [step, params, contractType, saveDraft, deployResult]);

  const goTo = (nextStep) => setStep(nextStep, nextStep > step ? 'forward' : 'back');

  const handleTypeSelect = (id) => {
    setContractType(id);
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
    const toastId = toast.loading('Compiling contract...');
    try {
      const endpoint = API_ENDPOINT[contractType];
      // Use a dummy address for initial compilation if wallet not connected yet, to preview code
      const bodyParams = { ...params, ownerAddress: '0x0000000000000000000000000000000000000001' };
      
      const res = await authFetch(endpoint, { method: 'POST', body: JSON.stringify(bodyParams) });
      const data = await res.json();
      
      if (data.success && data.data) {
        setGenerated(data.data.contractCode, { abi: data.data.abi, bytecode: data.data.bytecode });
        toast.success('Contract compiled!', { id: toastId });
        saveDraft(); // explicitly save after generating
      } else {
        toast.error(data.error || 'Compilation failed', { id: toastId });
      }
    } catch (e) {
      toast.error(e.message || 'Server error', { id: toastId });
    } finally {
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
          <button className="db-btn" onClick={() => setShowDrafts(!showDrafts)}>
            {showDrafts ? 'Close Drafts' : `Drafts (${drafts.length})`}
          </button>
        )}
        {(step > 0 || deployResult) && (
          <button className="db-btn" onClick={startNew}>+ New Contract</button>
        )}
      </div>

      <div className="wz-wrap">
        {showDrafts && (
          <div className="wz-card" style={{ marginBottom: 24, animation: 'wz-slideIn .3s ease' }}>
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
                      <button className="wz-btn wz-btn-primary" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => { loadDraft(d.id); setShowDrafts(false); }}>Resume</button>
                      <button className="wz-btn wz-btn-ghost" style={{ padding: '6px 12px', fontSize: 11, color: 'var(--error)', borderColor: 'rgba(220,38,38,.2) !important' }} onClick={() => deleteDraft(d.id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
            {step === 3 && <StepDeploy type={contractType} params={params} contractData={contractData} onSuccess={() => {}} />}
          </div>
        </div>

        <div className="wz-nav">
          <button className="wz-btn wz-btn-ghost" onClick={step === 0 ? () => navigate('/dashboard') : handleBack}>
            {step === 0 ? '← Dashboard' : '← Back'}
          </button>
          
          {step < 3 && (
            <button className="wz-btn wz-btn-primary" onClick={handleNext}>
              {step === 2 && !generatedCode ? 'Generate First' : step === 2 ? 'Proceed to Deploy →' : 'Continue →'}
            </button>
          )}
          
          {step === 3 && deployResult && (
            <button className="wz-btn wz-btn-ghost" onClick={() => navigate('/dashboard')}>Go to Dashboard →</button>
          )}
        </div>
      </div>
    </div>
  );
}
