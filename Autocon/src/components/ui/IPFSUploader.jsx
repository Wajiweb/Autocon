export default function IPFSUploader({ metadataState, handleFileUpload, handleUpdateMetadata, setMetadataState, setFormData }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <label className="block text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">
        NFT Asset & Metadata
      </label>

      <div className={`p-5 rounded-[var(--radius-lg)] border-2 transition-all duration-200 ${metadataState.status === 'ready' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[var(--border-dark)] border-dashed bg-[var(--surface)]'}`}>
        {metadataState.status === 'idle' || metadataState.status === 'error' ? (
          <label className="cursor-pointer block text-center">
            <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileUpload} className="hidden" />
            <span className="text-3xl block mb-2">Image</span>
            <p className="text-sm text-[var(--on-surface-variant)] font-semibold">Click to upload image</p>
            <p className="text-xs text-[var(--on-surface-muted)] mt-1">JPG, PNG, max 10MB</p>
            {metadataState.error && <p className="text-xs text-red-500 mt-2">{metadataState.error}</p>}
          </label>
        ) : metadataState.status === 'uploading' || metadataState.status === 'generating' ? (
          <div className="flex items-center gap-2 justify-center text-center">
            <svg className="animate-spin h-4 w-4 text-[var(--ai-accent)]" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-30" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-sm text-[var(--on-surface-variant)]">
              {metadataState.status === 'uploading' ? 'Uploading image to IPFS...' : 'Auto-generating metadata...'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-start">
              <div className="w-20 h-20 rounded-xl bg-[var(--surface-elevated)] overflow-hidden border border-[var(--border-light)] shrink-0">
                <img src={`https://gateway.pinata.cloud/ipfs/${metadataState.fileCID}`} alt="NFT Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="subtle-label text-emerald-500">Metadata Ready</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMetadataState({ status: 'idle', fileCID: '', imageUrl: '', name: '', description: '', error: '' });
                      setFormData(prev => ({ ...prev, baseURI: '' }));
                    }}
                    className="text-xs text-[var(--on-surface-muted)] bg-transparent border-none cursor-pointer underline"
                  >
                    Remove
                  </button>
                </div>
                <input
                  value={metadataState.name}
                  onChange={e => setMetadataState(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-xs mb-2 outline-none focus:border-[var(--primary)]"
                  placeholder="NFT Name"
                />
                <input
                  value={metadataState.description}
                  onChange={e => setMetadataState(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--primary)]"
                  placeholder="NFT Description"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleUpdateMetadata}
              disabled={metadataState.status === 'updating'}
              className="w-full bg-[var(--card-active)] border border-[var(--border-dark)] text-[var(--text-dark-primary)] rounded-xl py-2 text-sm font-semibold hover:border-[var(--primary)]/30 transition-colors"
            >
              {metadataState.status === 'updating' ? 'Updating...' : 'Save Metadata Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
