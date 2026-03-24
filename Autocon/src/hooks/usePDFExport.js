import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export function usePDFExport() {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async (filename = 'AutoCon_Audit_Report.pdf') => {
        setIsGenerating(true);
        const loadingToast = toast.loading('Generating PDF Report...');

        try {
            const element = document.getElementById('pdf-audit-report');
            if (!element) {
                throw new Error("Audit report template not found in DOM");
            }

            // High-resolution canvas render
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#080c14' // match the solid space background
            });

            const imgData = canvas.toDataURL('image/png');

            // jsPDF init A4 portrait
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(filename);

            toast.success('Report downloaded successfully!', { id: loadingToast });
        } catch (error) {
            console.error("PDF Export error:", error);
            toast.error('Failed to generate PDF.', { id: loadingToast });
        } finally {
            setIsGenerating(false);
        }
    };

    return { generatePDF, isGenerating };
}
