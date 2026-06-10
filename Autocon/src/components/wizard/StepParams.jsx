import React, { useState, useRef, useEffect } from 'react';
import { Field, Toggle, Inp } from './WizardFields';
import { useAuth } from '../../context/AuthContext';
import { uploadFileToIPFS, uploadMetadataToIPFS } from '../../services/ipfsApi';
import toast from 'react-hot-toast';
import { UploadCloud, Sparkles, CheckCircle, Trash2 } from 'lucide-react';

export function StepParams({ type, params, onChange, errors }) {
  const { authFetch, isAuthenticated } = useAuth();
  const I = (k, ph, t) => <Inp params={params} k={k} placeholder={ph} type={t} onChange={onChange} errors={errors} />;
  const T = (k, l) => <Toggle key={k} label={l} value={!!params[k]} onChange={v => onChange({ ...params, [k]: v })} />;

  // IPFS Assistant State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [metadataName, setMetadataName] = useState('');
  const [metadataDesc, setMetadataDesc] = useState('');
  const [ipfsStatus, setIpfsStatus] = useState(''); // uploading_file, uploading_metadata, success, error
  const [ipfsError, setIpfsError] = useState('');
  const [ipfsResult, setIpfsResult] = useState(null);

  const fileInputRef = useRef(null);

  // Sync default name with Collection Name if empty
  useEffect(() => {
    if (params.name && !metadataName && !selectedFile) {
      setMetadataName(`${params.name} Item #1`);
    }
  }, [params.name]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file);
      } else {
        toast.error('Only image files are allowed.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (!metadataName) {
      setMetadataName(params.name ? `${params.name} #1` : file.name.split('.')[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setIpfsStatus('');
    setIpfsResult(null);
  };

  const handleUploadAndConvert = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in or connect your wallet first.');
      return;
    }
    if (!selectedFile) return;

    setIpfsStatus('uploading_file');
    setIpfsError('');

    try {
      // 1. Upload File
      const fileUploadRes = await uploadFileToIPFS(authFetch, selectedFile);
      const fileCID = fileUploadRes.fileCID;
      const fileUrl = fileUploadRes.fileUrl; // ipfs://...

      // 2. Upload Metadata
      setIpfsStatus('uploading_metadata');
      const metadataObj = {
        name: metadataName || params.name || 'AutoCon NFT Item',
        description: metadataDesc || 'Created with AutoCon NFT Generator.',
        image: fileUrl,
      };

      const metaUploadRes = await uploadMetadataToIPFS(authFetch, metadataObj);
      const metadataCID = metaUploadRes.metadataCID;
      const tokenURI = metaUploadRes.tokenURI; // ipfs://...

      // 3. Complete
      setIpfsStatus('success');
      setIpfsResult({
        fileCID,
        fileUrl,
        metadataCID,
        tokenURI
      });

      // Populate baseURI parameter automatically!
      onChange({ ...params, baseURI: tokenURI });
      toast.success('Asset and Metadata successfully pinned to Pinata IPFS!');
    } catch (err) {
      console.error(err);
      setIpfsStatus('error');
      setIpfsError(err.message || 'An error occurred during upload.');
      toast.error(err.message || 'IPFS upload failed.');
    }
  };

  return (
    <div className="wz-card">
      <div className="wz-card-title">Configure Parameters</div>
      <div className="wz-card-sub">
        {type === 'ERC20'   && 'Configure your ERC-20 fungible token.'}
        {type === 'ERC721'  && 'Configure your NFT collection.'}
        {type === 'Auction' && 'Configure your auction contract.'}
      </div>

      {type === 'ERC20' && <>
        <div className="wz-field-grid">
          <Field label="Token Name" required error={errors.name}>{I('name','e.g. My Token')}</Field>
          <Field label="Symbol" required error={errors.symbol}>{I('symbol','e.g. MTK')}</Field>
          <Field label="Total Supply" required error={errors.supply}>{I('supply','1000000','number')}</Field>
          <Field label="Decimals" hint="Standard is 18">{I('decimals','18','number')}</Field>
        </div>
        <div className="wz-toggles-title">Optional Features</div>
        <div className="wz-toggle-grid">
          {[['isMintable','Mintable'],['isBurnable','Burnable'],['isPausable','Pausable'],['isCapped','Capped'],['hasAntiWhale','Anti-Whale'],['hasTax','Tax']].map(([k,l]) => T(k,l))}
        </div>
        {params.hasTax && <div className="wz-field-grid"><Field label="Tax Rate (%)" required hint="0–25" error={errors.taxRate}>{I('taxRate','2','number')}</Field></div>}
      </>}

      {type === 'ERC721' && <>
        <div className="wz-field-grid">
          <Field label="Collection Name" required error={errors.name}>{I('name','e.g. Cool Apes')}</Field>
          <Field label="Symbol" required error={errors.symbol}>{I('symbol','e.g. APE')}</Field>
          <Field label="Max Supply" required error={errors.maxSupply}>{I('maxSupply','10000','number')}</Field>
          <Field label="Mint Price (ETH)" required error={errors.mintPrice}>{I('mintPrice','0.05')}</Field>
          <Field label="Base URI" hint="IPFS prefix" span2>{I('baseURI','ipfs://...')}</Field>
        </div>
        <div className="wz-toggles-title">Optional Features</div>
        <div className="wz-toggle-grid">
          {[['isBurnable','Burnable'],['isEnumerable','Enumerable'],['isRevealed','Reveal Mechanic']].map(([k,l]) => T(k,l))}
        </div>

        {/* Pinata IPFS Assistant Section */}
        <div className="ipfs-assistant">
          <div className="ipfs-title-row">
            <Sparkles size={14} color="#38bdf8" />
            <h4>Pinata IPFS Assistant</h4>
            <span className="ipfs-badge">Pinata Cloud</span>
          </div>

          <div className="wz-hint" style={{ marginBottom: 16, display: 'block', lineHeight: 1.4 }}>
            Upload an image, automatically generate standard ERC-721 metadata JSON, and pin it to Pinata IPFS. The resulting URI will automatically populate the Base URI field.
          </div>

          {/* Upload progress & status overlays */}
          {ipfsStatus === 'uploading_file' && (
            <div className="ipfs-status-overlay">
              <div className="ipfs-spinner" />
              <div className="ipfs-status-text">Uploading Asset to IPFS...</div>
              <div className="ipfs-status-sub">Uploading image and pinning to Pinata nodes.</div>
            </div>
          )}

          {ipfsStatus === 'uploading_metadata' && (
            <div className="ipfs-status-overlay">
              <div className="ipfs-spinner" />
              <div className="ipfs-status-text">Generating & Pinning Metadata...</div>
              <div className="ipfs-status-sub">Packaging JSON metadata standard and uploading to IPFS.</div>
            </div>
          )}

          {ipfsStatus === 'error' && (
            <div className="ipfs-status-overlay">
              <div style={{ color: 'var(--error)', fontSize: 32, marginBottom: 8 }}>⚠️</div>
              <div className="ipfs-status-text">Upload Failed</div>
              <div className="ipfs-status-sub" style={{ color: 'var(--error)', maxWidth: '90%' }}>{ipfsError}</div>
              <button type="button" className="ipfs-success-action" style={{ marginTop: 12 }} onClick={() => setIpfsStatus('')}>Try Again</button>
            </div>
          )}

          {/* Success card */}
          {ipfsStatus === 'success' && ipfsResult && (
            <div className="ipfs-success-card">
              <div className="ipfs-success-header">
                <CheckCircle size={18} className="ipfs-success-icon" />
                <span className="ipfs-success-title">Successfully Pinned to IPFS!</span>
              </div>
              <div className="ipfs-success-body">
                <div className="ipfs-cid-row">
                  <span className="ipfs-cid-label">Asset URL</span>
                  <span className="ipfs-cid-value">{ipfsResult.fileUrl}</span>
                </div>
                <div className="ipfs-cid-row">
                  <span className="ipfs-cid-label">Metadata URI</span>
                  <span className="ipfs-cid-value">{ipfsResult.tokenURI}</span>
                </div>
              </div>
              <button
                type="button"
                className="ipfs-success-action"
                onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${ipfsResult.metadataCID}`, '_blank')}
              >
                View Metadata JSON in Gateway →
              </button>
              <button
                type="button"
                className="ipfs-success-action"
                style={{ color: 'var(--text-muted)', textDecoration: 'none', alignSelf: 'center', marginTop: 6 }}
                onClick={handleRemoveImage}
              >
                Upload Another Asset
              </button>
            </div>
          )}

          {/* Idle / Input states */}
          {ipfsStatus === '' && (
            <>
              {!selectedFile ? (
                <div
                  className={`ipfs-dropzone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <UploadCloud className="ipfs-upload-icon" />
                  <span className="ipfs-upload-text">Drag & drop your NFT image here, or browse</span>
                  <span className="ipfs-upload-subtext">Supports PNG, JPG, GIF, WEBP, SVG (max 10MB)</span>
                </div>
              ) : (
                <div className="ipfs-preview-wrap">
                  <div className="ipfs-preview-box">
                    <img src={previewUrl} alt="NFT Preview" className="ipfs-preview-img" />
                    <button type="button" className="ipfs-preview-remove" onClick={handleRemoveImage} title="Remove image">
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="ipfs-meta-fields">
                    <div>
                      <label className="wz-label" style={{ marginBottom: 4, display: 'block' }}>NFT Item Name</label>
                      <input
                        type="text"
                        className="ipfs-input"
                        placeholder="e.g. Cool Ape #1"
                        value={metadataName}
                        onChange={(e) => setMetadataName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="wz-label" style={{ marginBottom: 4, display: 'block' }}>Description</label>
                      <textarea
                        className="ipfs-input ipfs-textarea"
                        placeholder="Describe what makes this NFT special..."
                        value={metadataDesc}
                        onChange={(e) => setMetadataDesc(e.target.value)}
                      />
                    </div>
                    <div className="ipfs-btn-row">
                      <button
                        type="button"
                        className="wz-wallet-connect"
                        style={{ border: 'none', background: 'var(--primary)', color: 'hsl(0 0% 7%)' }}
                        onClick={handleUploadAndConvert}
                      >
                        Upload Asset & Generate Metadata
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </>}

      {type === 'Auction' && <>
        <div className="wz-field-grid">
          <Field label="Auction Name" required error={errors.name}>{I('name','e.g. Rare Item Auction')}</Field>
          <Field label="Item Name" required error={errors.itemName}>{I('itemName','e.g. Rare Sword')}</Field>
          <Field label="Duration (seconds)" required hint="86400 = 1 day" error={errors.duration}>{I('duration','86400','number')}</Field>
          <Field label="Minimum Bid (ETH)" required error={errors.minimumBid}>{I('minimumBid','0.01')}</Field>
          <Field label="Reserve Price (ETH)" hint="Optional">{I('reservePrice','0.5')}</Field>
          <Field label="Item Description" hint="Optional">{I('itemDescription','Describe the item...')}</Field>
        </div>
        <div className="wz-toggles-title">Optional Features</div>
        <div className="wz-toggle-grid">
          {[['hasExtension','Time Extension'],['hasAntiSnipe','Anti-Snipe']].map(([k,l]) => T(k,l))}
        </div>
      </>}
    </div>
  );
}

export default StepParams;
