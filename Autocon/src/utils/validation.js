/**
 * validation.js
 * Parameter validation rules for smart contract configurations.
 */
export function validate(type, params) {
  if (!type) return {};
  const e = {};
  if (type === 'ERC20') {
    if (!params.name?.trim())   e.name   = 'Required';
    if (!params.symbol?.trim()) e.symbol = 'Required';
    if (!params.supply || Number(params.supply) <= 0) e.supply = 'Must be positive';
    if (params.hasTax && (isNaN(+params.taxRate) || +params.taxRate < 0 || +params.taxRate > 25)) e.taxRate = '0–25%';
  }
  if (type === 'ERC721') {
    if (!params.name?.trim())   e.name   = 'Required';
    if (!params.symbol?.trim()) e.symbol = 'Required';
    if (!params.maxSupply || Number(params.maxSupply) <= 0) e.maxSupply = 'Must be positive';
    if (isNaN(+params.mintPrice)) e.mintPrice = 'Invalid';
  }
  if (type === 'Auction') {
    if (!params.name?.trim())     e.name     = 'Required';
    if (!params.itemName?.trim()) e.itemName = 'Required';
    if (+params.duration < 60)   e.duration = 'Min 60s';
    if (isNaN(+params.minimumBid)) e.minimumBid = 'Invalid';
  }
  return e;
}
