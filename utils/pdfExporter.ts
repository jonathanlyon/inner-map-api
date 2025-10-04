import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPdf = async (elementId: string, fileName: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      backgroundColor: '#F9F6F0', // Match the app's background color
    });

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in 'pt' (points) are 595.28 x 841.89
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const ratio = canvasWidth / canvasHeight;
    const height = pdfWidth / ratio;
    
    // If the content is taller than one page, split it
    if (height > pdfHeight) {
        let position = 0;
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = (pdfHeight * canvasWidth) / pdfWidth;

        let srcY = 0;
        while(srcY < canvasHeight) {
            const SlicedHeight = Math.min(pageCanvas.height, canvasHeight - srcY);
            const slicedCanvas = document.createElement('canvas');
            slicedCanvas.width = canvasWidth;
            slicedCanvas.height = SlicedHeight;
            const slicedCtx = slicedCanvas.getContext('2d');
            slicedCtx?.drawImage(canvas, 0, srcY, canvasWidth, SlicedHeight, 0, 0, canvasWidth, SlicedHeight);
            
            if (srcY > 0) {
                pdf.addPage();
            }
            pdf.addImage(slicedCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, (pdfWidth * SlicedHeight) / canvasWidth);
            srcY += pageCanvas.height;
        }

    } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
    }
    
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};