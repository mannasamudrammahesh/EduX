import React, { useRef, useState } from 'react';
import { Award, Loader2, Download } from 'lucide-react';
import { User, Course } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateProps {
  user: User;
  course: Course;
}

const Certificate: React.FC<CertificateProps> = ({ user, course }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Helper function to temporarily boost image quality
  const enhanceImages = (): (() => void) => {
    const images = document.querySelectorAll('img');
    const originalSrcs: string[] = [];
    
    images.forEach((img, index) => {
      const originalSrc = img.src;
      originalSrcs[index] = originalSrc;
      
      // Try to get higher resolution version if available
      if (originalSrc.includes('picsum.photos')) {
        // For picsum photos, we can request a larger size
        const sizeMatch = originalSrc.match(/\/\d+\/\d+/);
        if (sizeMatch) {
          const newSize = sizeMatch[0].replace(/\d+/g, (num) => (parseInt(num) * 2).toString());
          img.src = originalSrc.replace(sizeMatch[0], newSize);
        }
      }
      // Force image load
      img.loading = 'eager';
    });
    
    return () => {
      images.forEach((img, index) => {
        if (originalSrcs[index]) {
          img.src = originalSrcs[index];
        }
      });
    };
  };

  const handleDownloadPDF = async () => {
    const element = certificateRef.current;
    if (!element) return;

    setIsGenerating(true);
    
    // Create a clone of the element for processing
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = '1200px'; // Fixed high resolution
    clone.style.height = 'auto';
    clone.style.opacity = '1';
    clone.style.zIndex = '9999';
    document.body.appendChild(clone);

    try {
      // Enhance images in the clone
      const restoreImages = enhanceImages();
      
      const canvas = await html2canvas(clone, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: true,
        onclone: (clonedDoc) => {
          // Ensure all fonts are loaded
          const style = clonedDoc.createElement('style');
          style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Dancing+Script:wght@700&display=swap');
            * { 
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      restoreImages();
      
      // Create PDF with proper dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate PDF dimensions for A4 paper (landscape)
      const pdfWidth = 842; // A4 width in points (landscape)
      const pdfHeight = 595; // A4 height in points (landscape)
      
      // Calculate scaling to fit within A4
      const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      // Center the image on the page
      const xOffset = (pdfWidth - scaledWidth) / 2;
      const yOffset = (pdfHeight - scaledHeight) / 2;
      
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
      
      // Add metadata
      pdf.setProperties({
        title: `Certificate - ${user.name}`,
        subject: `Course Completion: ${course.title}`,
        creator: 'Edux Platform',
        author: user.name
      });
      
      pdf.save(`Certificate_${user.name.replace(/ /g, '_')}_${Date.now()}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Could not download PDF. Please try again.');
    } finally {
      // Clean up
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative group mb-16">
      <div 
        ref={certificateRef}
        className="bg-white border-4 border-slate-300 p-8 rounded-lg shadow-lg max-w-3xl mx-auto relative overflow-hidden cursor-default hover:shadow-xl transition-shadow duration-300"
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Award size={400} />
        </div>

        <div className="border-2 border-slate-400 p-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white shadow-md">
              <Award size={32} />
            </div>
          </div>
          
          <h1 className="text-4xl font-serif text-slate-800 mb-2">Certificate of Completion</h1>
          <p className="text-slate-500 uppercase tracking-widest text-sm mb-8">This certifies that</p>
          
          <h2 className="text-3xl font-bold text-blue-900 mb-2 font-cursive border-b border-slate-300 inline-block px-8 pb-2">
            {user.name}
          </h2>
          
          <p className="text-slate-600 mt-6 mb-2">has successfully completed the course</p>
          <h3 className="text-2xl font-bold text-slate-800 mb-8">{course.title}</h3>
          
          <div className="flex justify-between items-end mt-12 px-12">
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-2"></div>
              <p className="text-xs text-slate-500 uppercase font-bold">Date</p>
              <p className="text-sm">{new Date().toLocaleDateString()}</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center mb-2">
                <span className="text-[8px] text-center leading-none">QR CODE<br/>VERIFIED</span>
              </div>
              <span className="text-[10px] text-slate-400">
                ID: {`CERT-${Date.now().toString(36).toUpperCase()}`}
              </span>
            </div>

            <div className="text-center">
              <img 
                src="https://picsum.photos/200/80?random=sig&grayscale" 
                className="h-12 mx-auto mb-2 opacity-90"
                alt="Signature" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
                      <text x="50%" y="50%" font-family="Brush Script MT, cursive" font-size="24" text-anchor="middle" dy=".3em" fill="#374151">${course.instructor}</text>
                    </svg>
                  `);
                }}
              />
              <div className="w-32 border-b border-slate-400 mb-2"></div>
              <p className="text-xs text-slate-500 uppercase font-bold">Instructor</p>
              <p className="text-sm">{course.instructor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button Container - Positioned at bottom center below certificate */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-20">
        <div className="relative group/button">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
              flex items-center justify-center gap-3 px-8 py-4 rounded-lg shadow-lg
              transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0
              ${isGenerating 
                ? 'bg-gradient-to-r from-slate-500 to-slate-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }
              text-white font-semibold tracking-wide
              border border-white/20
              backdrop-blur-sm bg-opacity-95
              min-w-[220px]
              group-hover/button:shadow-xl
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 group-hover/button:scale-110 transition-transform duration-200" />
                <span>Download Certificate</span>
              </>
            )}
          </button>
          
          {/* Tooltip - Positioned above button */}
          <div className={`
            absolute -top-12 left-1/2 transform -translate-x-1/2
            bg-gradient-to-r from-slate-800 to-slate-900 text-white text-xs px-3 py-2 rounded-lg
            transition-all duration-200 pointer-events-none
            ${isHovered && !isGenerating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}
            whitespace-nowrap shadow-lg border border-slate-700/50
            after:content-[''] after:absolute after:top-full after:left-1/2 
            after:-translate-x-1/2 after:border-4 after:border-transparent
            after:border-t-slate-800
          `}>
            Click to download high-quality PDF
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="font-medium">Generating High-Quality PDF...</p>
            <p className="text-sm text-slate-500">This may take a moment</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificate;