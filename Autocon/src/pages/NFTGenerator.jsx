import { useState } from 'react';
import { useNFT } from '../hooks/useNFT';
import toast from 'react-hot-toast';
import { useNetwork } from '../context/NetworkContext';
import { API_BASE } from '../config';
import { useAISuggestion } from '../hooks/useAISuggestion';
import { useTransactionStore, selectIsDeploying } from '../store/useTransactionStore';
import { useContractStore } from '../store/useContractStore';

import GeneratorHeader from '../components/generator/GeneratorHeader';
import GasEstimateCard from '../components/generator/GasEstimateCard';
import ContractDeployPanel from '../components/generator/ContractDeployPanel';
import ContractCodePreview from '../components/generator/ContractCodePreview';

import AIChatPanel from '../components/dashboard/AIChatPanel';
import DeploySuccessModal from '../components/deploy/DeploySuccessModal';
import IPFSUploader from '../components/ui/IPFSUploader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SuggestionInput } from '../components/ui/SuggestionInput';
import { Toggle } from '../components/ui/Toggle';

const NFT_FEATURES = ['Max Supply Cap', 'Mint Pricing', 'URI Storage', 'Burn Support', 'IPFS Upload', 'Owner Withdraw'];

const NFT_INFO = [
  { icon: '🖼️', title: 'ERC-721 Standard', desc: 'Full OpenZeppelin NFT implementation' },
  { icon: '📝', title: 'URI Storage',       desc: 'Individual token metadata per NFT' },
  { icon: '🔥', title: 'Burn Support',      desc: 'Token holders can burn their NFTs' },
  { icon: '💰', title: 'Paid Minting',      desc: 'Set a mint price or make it free' },
  { icon: '📦', title: 'Max Supply',        desc: 'Hard cap on total NFTs that can exist' },
  { icon: '🏦', title: 'Withdraw Funds',    desc: 'Owner can withdraw collected mint fees' },
];

export default function NFTGenerator() {
  const {
    formData, setFormData, generatedCode,
    connectWallet, generateNFT, deployNFT,
    estimateGas, gasEstimate, isEstimating,
    showSuccessModal, setShowSuccessModal,
  } = useNFT();

  const contractData      = useContractStore(s => s.contractData);
  const isDeploying       = useTransactionStore(selectIsDeploying);
  const deployStep        = useTransactionStore(s => s.step);
  const errorStep         = useTransactionStore(s => s.errorStep);
  const errorMessage      = useTransactionStore(s => s.errorMessage);
  const deployedAddress   = useTransactionStore(s => s.contractAddress);
  const deploymentReceipt = useTransactionStore(s => s.receipt);
  const providerInstance  = useTransactionStore(s => s.provider);
  const { network }       = useNetwork();
  const { isSuggesting, generateSuggestions, suggestions, reasoning } = useAISuggestion();

  const [metadataState, setMetadataState] = useState({
    status: 'idle', fileCID: '', imageUrl: '', name: '', description: '', error: '',
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiIntent, setAiIntent]     = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (file.size > MAX_FILE_SIZE) {
      setMetadataState(prev => ({ ...prev, status: 'error', error: 'File too large. Maximum 10MB allowed.' }));
      return toast.error('File too large. Maximum 10MB allowed.');
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMetadataState(prev => ({ ...prev, status: 'error', error: 'Invalid file type. Only JPG, PNG, GIF, WebP allowed.' }));
      return toast.error('Invalid file type. Only JPG, PNG, GIF, WebP allowed.');
    }
    setMetadataState(prev => ({ ...prev, status: 'uploading', error: '' }));
    const uploadToast = toast.loading('Uploading image to IPFS...');
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      const token = localStorage.getItem('autocon_token');
      const res = await fetch(`${API_BASE}/api/ipfs/upload-file`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formDataObj,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.loading('Auto-generating metadata...', { id: uploadToast });
      setMetadataState(prev => ({ ...prev, status: 'generating', fileCID: data.fileCID, imageUrl: data.fileUrl }));
      const defaultName = formData.name || 'AutoCon NFT';
      const defaultDesc = `NFT Collection for ${defaultName}`;
      const metaRes = await fetch(`${API_BASE}/api/ipfs/upload-metadata`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: { name: defaultName, description: defaultDesc, image: data.fileUrl } }),
      });
      const metaData = await metaRes.json();
      if (!metaData.success) throw new Error(metaData.error);
      setMetadataState(prev => ({ ...prev, status: 'ready', name: defaultName, description: defaultDesc }));
      setFormData(prev => ({ ...prev, baseURI: metaData.tokenURI }));
      toast.success('Metadata pinned to IPFS! 📌', { id: uploadToast });
    } catch (err) {
      setMetadataState(prev => ({ ...prev, status: 'error', error: err.message || 'Upload failed.' }));
      toast.error(err.message || 'Upload failed.', { id: uploadToast });
    }
  };

  const handleUpdateMetadata = async () => {
    setMetadataState(prev => ({ ...prev, status: 'updating', error: '' }));
    const updateToast = toast.loading('Updating metadata...');
    try {
      const token = localStorage.getItem('autocon_token');
      const metaRes = await fetch(`${API_BASE}/api/ipfs/upload-metadata`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: { name: metadataState.name, description: metadataState.description, image: metadataState.imageUrl } }),
      });
      const metaData = await metaRes.json();
      if (!metaData.success) throw new Error(metaData.error);
      setMetadataState(prev => ({ ...prev, status: 'ready' }));
      setFormData(prev => ({ ...prev, baseURI: metaData.tokenURI }));
      toast.success('Metadata updated successfully! ✨', { id: updateToast });
    } catch (err) {
      setMetadataState(prev => ({ ...prev, status: 'error', error: err.message || 'Update failed.' }));
      toast.error(err.message || 'Update failed.', { id: updateToast });
    }
  };

  return (
    <div className="container pt-3">

      {/* ── Header ── */}
      <GeneratorHeader
        icon="🎨"
        title="NFT"
        titleAccent="Generator"
        subtitle="Design and deploy custom ERC-721 NFT collections — no Solidity required."
        features={NFT_FEATURES}
        aiIntent={aiIntent}
        aiPlaceholder="Describe your NFT..."
        onAiIntentChange={setAiIntent}
        onAutoFill={() => generateSuggestions('NFT', setFormData, aiIntent, true)}
        isSuggesting={isSuggesting}
        onChatOpen={() => setIsChatOpen(true)}
        reasoning={reasoning}
      />

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Left: Form */}
        <Card variant="glass">
          <form onSubmit={generateNFT}>
            <Input
              label="Collection Name"
              name="name"
              value={formData?.name || ''}
              placeholder="e.g. AutoCon Genesis"
              onChange={handleChange}
              required
            />
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Input
                label="Symbol"
                name="symbol"
                value={formData?.symbol || ''}
                placeholder="e.g. ACG"
                onChange={handleChange}
                wrapperClassName="flex-1 !mb-0"
                required
              />
              <SuggestionInput
                label="Max Supply"
                name="maxSupply"
                type="number"
                placeholder="10000"
                value={formData?.maxSupply || ''}
                onChange={handleChange}
                wrapperClassName="flex-1 !mb-0"
                suggestions={suggestions?.maxSupply ? [suggestions.maxSupply.toString()] : []}
                helperText={Number(formData?.maxSupply) > 100000 ? '⚠️ A huge supply may lower rarity and floor price.' : ''}
                required
              />
            </div>

            <SuggestionInput
              label={`Mint Price (${network.currencySymbol || 'ETH'})`}
              name="mintPrice"
              type="number"
              step="0.001"
              placeholder="0.01"
              value={formData?.mintPrice || ''}
              onChange={handleChange}
              suggestions={suggestions?.mintPrice ? [suggestions.mintPrice.toString()] : []}
              helperText="Set to 0 for free minting. Owner can always mint for free."
            />

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Toggle name="isRevealed"   checked={formData?.isRevealed   || false} onChange={handleChange} label="Revealed"   description="Initial hidden metadata" />
              <Toggle name="isBurnable"   checked={formData?.isBurnable   || false} onChange={handleChange} label="Burnable"   description="Users can burn NFTs" />
              <Toggle name="isEnumerable" checked={formData?.isEnumerable || false} onChange={handleChange} label="Enumerable" description="List all NFTs" />
            </div>

            <IPFSUploader
              metadataState={metadataState}
              handleFileUpload={handleFileUpload}
              handleUpdateMetadata={handleUpdateMetadata}
              setMetadataState={setMetadataState}
              setFormData={setFormData}
            />

            <Input
              label="Base URI (Token URI)"
              name="baseURI"
              value={formData?.baseURI || ''}
              readOnly
              placeholder="Upload an image above to generate token URI"
              helperText={metadataState.status === 'ready'
                ? '✅ Automatically filled from your IPFS metadata.'
                : '⚠️ Required for deployment. Upload an image above.'}
              className="bg-[color:var(--surface)] text-[var(--outline)]"
            />

            <div className="mb-8">
              <label className="block text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">Owner Address</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  name="ownerAddress"
                  value={formData?.ownerAddress || ''}
                  className="w-full bg-[color:var(--surface-elevated)] text-[color:var(--text-primary)] border border-[var(--border-light)] rounded-[var(--radius-md)] px-4 py-3 text-sm outline-none font-mono text-[0.85rem] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-glow)]"
                  readOnly required
                  placeholder="Connect your wallet →"
                />
                <Button type="button" onClick={connectWallet} className="whitespace-nowrap">🦊 Connect</Button>
              </div>
            </div>

            <div className="form-actions-sticky">
              <Button type="submit" size="lg" className="w-full">Generate NFT Contract</Button>
            </div>
          </form>
        </Card>

        {/* Right: Info, Gas, Deploy, Code */}
        <div className="flex flex-col gap-6">
          {/* Contract info tiles */}
          <Card>
            <h3 className="text-[0.9rem] font-extrabold text-[var(--on-surface)] mb-3.5">📘 What Your NFT Contract Includes</h3>
            <div className="grid grid-cols-2 gap-3">
              {NFT_INFO.map(item => (
                <div key={item.title} className="p-3.5 rounded-xl bg-[var(--surface-highest)] border border-[var(--outline-variant)] flex gap-2.5 items-start">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-[0.82rem] font-bold text-[var(--on-surface)] mb-0.5">{item.title}</p>
                    <p className="text-[0.72rem] text-[var(--outline)] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Gas Estimate ── */}
          {generatedCode && (
            <GasEstimateCard
              gasEstimate={gasEstimate}
              onEstimate={estimateGas}
              isEstimating={isEstimating}
              label="NFT Gas Estimation"
            />
          )}

          {/* ── Deploy Panel ── */}
          {generatedCode && (
            <div className="animate-fade-in-up">
              <ContractDeployPanel
                generatedCode={generatedCode}
                isDeploying={isDeploying}
                deployStep={deployStep}
                errorStep={errorStep}
                errorMessage={errorMessage}
                onDeploy={deployNFT}
                deployLabel={`Deploy NFT to ${network.name}`}
                auditType="ERC721"
              />
            </div>
          )}

          {/* ── Code Preview ── */}
          {generatedCode && (
            <ContractCodePreview
              contractName={formData.name || 'NFTCollection'}
              contractLabel="Generated ERC-721 Contract"
              abi={contractData?.abi}
              nftMetadata={{
                name: metadataState.name,
                description: metadataState.description,
                image: metadataState.fileCID ? `ipfs://${metadataState.fileCID}` : '',
              }}
            />
          )}
        </div>
      </div>

      <DeploySuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        address={deployedAddress || ''}
        network={network.name}
        contractType="NFT"
        explorerUrl={network.explorer || 'https://sepolia.etherscan.io'}
        abi={contractData?.abi}
        contractName={formData.name || 'NFT'}
        receipt={deploymentReceipt}
        provider={providerInstance}
        sourceCode={generatedCode}
        compilerVersion={contractData?.compilerVersion}
        constructorArgs={contractData?.constructorArgs}
      />

      <AIChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        contractCode={generatedCode}
      />
    </div>
  );
}
