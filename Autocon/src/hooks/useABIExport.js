/**
 * useABIExport — hook providing a one-click ABI JSON download.
 */
export function useABIExport() {
  const downloadABI = (abi, contractName) => {
    if (!abi || !contractName) return;
    const blob = new Blob([JSON.stringify(abi, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${contractName}_ABI.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return { downloadABI };
}
