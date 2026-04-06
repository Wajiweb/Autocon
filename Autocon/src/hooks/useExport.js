/**
 * useExport.js — Consolidated export utilities.
 * Merges: useABIExport.js + usePDFExport.js
 */
import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

// ─── ABI Export ──────────────────────────────────────────────────────────────

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

// ─── PDF Export ──────────────────────────────────────────────────────────────

/**
 * usePDFExport — hook for rendering the on-screen audit report to a PDF file.
 * Expects a DOM element with id="pdf-audit-report".
 */
export function usePDFExport() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (filename = 'AutoCon_Audit_Report.pdf') => {
    setIsGenerating(true);
    const loadingToast = toast.loading('Generating PDF Report...');

    try {
      const element = document.getElementById('pdf-audit-report');
      if (!element) {
        throw new Error('Audit report template not found in DOM');
      }

      // High-resolution canvas render
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#080c14'
      });

      const imgData = canvas.toDataURL('image/png');

      // jsPDF init — A4 portrait
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);

      toast.success('Report downloaded successfully!', { id: loadingToast });
    } catch (_error) {
      console.error('PDF Export error:', _error);
      toast.error('Failed to generate PDF.', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePDF, isGenerating };
}
