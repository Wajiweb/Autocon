import React from 'react';
import { Field, Toggle, Inp } from './WizardFields';

export function StepParams({ type, params, onChange, errors }) {
  const I = (k, ph, t) => <Inp params={params} k={k} placeholder={ph} type={t} onChange={onChange} errors={errors} />;
  const T = (k, l) => <Toggle key={k} label={l} value={!!params[k]} onChange={v => onChange({ ...params, [k]: v })} />;

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
