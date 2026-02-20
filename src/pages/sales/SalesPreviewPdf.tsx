import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Printer, MessageCircle, FileText, ArrowLeft, Download } from 'lucide-react';
import type { DemoRequest } from '@/context/AppDataContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

// Branding & Style Constants
// Branding & Style Constants
const STYLES = {
  primary: '#1d4ed8',   // Royal Blue (QuickLab Blue) - HSL 215 90% 35% converted
  secondary: '#16a34a', // Vibrant Green (QuickLab Green) - HSL 145 80% 35% converted
  textHeader: '#0f172a',// Slate 900
  label: '#64748b',     // Slate 500
  text: '#334155',      // Slate 700
  border: '#e2e8f0',    // Slate 200
  accentBg: '#eff6ff',  // Blue 50
};

// Layout Components
const Section: React.FC<{ title: string; children: React.ReactNode; fullWidth?: boolean }> = ({ title, children, fullWidth }) => (
  <div className={`break-inside-avoid mb-4 ${fullWidth ? 'col-span-2' : ''}`}>
    {/* Replaced Dot with Border Left for perfect alignment */}
    {/* Fixed Green Line Alignment */}
    <div className="flex items-center mb-2 border-b border-slate-200 pb-2">
      <div className="green-bar-print w-1 h-3 mr-2 rounded-sm" style={{ backgroundColor: STYLES.secondary }}></div>
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 leading-none">
        {title}
      </h3>
    </div>
    <div className={`px-1 ${fullWidth ? '' : 'grid grid-cols-1 gap-y-1'}`}>
      {children}
    </div>
  </div>
);

const Field: React.FC<{ label: string; value?: string | number | null; className?: string }> = ({ label, value, className }) => (
  <div className={`flex flex-col ${className || ''}`}>
    <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wide">
      {label}
    </span>
    <span className="text-[11px] font-semibold text-slate-800 leading-snug break-words">
      {value || '—'}
    </span>
  </div>
);

const SalesPreviewPdf: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get ID from URL
  const { data } = useAppData();
  const { user } = useAuth();
  const { toast } = useToast();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [request, setRequest] = useState<DemoRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try to get from State (Navigation)
    if (location.state?.request) {
      setRequest(location.state.request);
      setLoading(false);
      return;
    }

    // 2. Try to get from URL ID (Refresh/Direct Link)
    if (id) {
      const found = data.demoRequests.find(r => r.id === id);
      if (found) {
        setRequest(found);
      }
      setLoading(false);
    }
  }, [id, location.state, data.demoRequests]);

  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const mobile = window.innerWidth < 820;
        setIsMobile(mobile);
        // Target width is 794px (A4 at 96 DPI approx)
        // If container is smaller, scale down.
        // If container is larger (desktop), we can either cap it or scale up.
        // Usually, we want to cap it at 100% (scale 1) on desktop, but fill width on mobile.

        const newScale = containerWidth < 820 ? containerWidth / 794 : 1;
        setScale(newScale);
      }
    };

    // Initial calc
    updateScale();

    // Use ResizeObserver for robust updates
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleBack = () => {
    if (user?.role === 'admin') {
      navigate('/admin/requests');
    } else {
      navigate('/sales/my-requests');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading request details...</div>;
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded shadow">
          <p className="text-slate-500 mb-4">No request data found.</p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const sp = data.salespersons.find(s => s.id === request.salespersonId);
  const dist = data.distributors.find(d => d.id === request.distributorId);
  const machine = data.machines.find(m => m.id === request.machineId);

  const generatePDF = async () => {
    const element = pdfRef.current;
    if (!element) return null;

    try {
      toast({ title: "Generating PDF...", description: "Formatting document..." });

      // Remove shadow for clean capture
      element.classList.remove('shadow-2xl');
      element.style.margin = '0';

      // Temporarily reset transform for capture? 
      // html2canvas helps, but sometimes transform interacts poorly.
      // We are capturing the INNER element which has no transform, so it should be fine.
      // But we need to ensure it is visible.

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('pdf-content');
          if (clonedElement) {
            // Force Desktop Styles
            clonedElement.style.padding = '35px';
            clonedElement.style.width = '794px';
            // Let height be auto to capture full content
            clonedElement.style.height = 'auto';

            // Fix Green Bar Dimensions
            const greenBars = clonedElement.querySelectorAll('.green-bar-print');
            greenBars.forEach((bar: any) => {
              bar.style.height = '12px';
              bar.style.setProperty('height', '12px', 'important');
              bar.style.marginTop = '2px';
            });
          }
        }
      });

      // Restore styles
      element.classList.add('shadow-2xl');
      element.style.margin = 'auto';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First Page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add extra pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // position goes negative to show lower part of image
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      return pdf;
    } catch (err) {
      console.error("PDF Generation failed", err);
      toast({ title: "PDF Generation Failed", variant: "destructive" });
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      const filename = `${sp?.name || 'Sales'}-${request.readableId || request.id}.pdf`;
      pdf.save(filename);
    }
  };

  const handleWhatsApp = async () => {
    await handleDownloadPDF();
    const text = encodeURIComponent(`Demo Request: ${machine?.name} ${request?.model}\nPlease check the downloaded PDF.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Print-specific Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { 
            background: white !important; 
            margin: 0 !important;
            padding: 0 !important;
          }
          .min-h-screen { background: white !important; min-height: 0 !important; padding: 0 !important; }
          .flex.justify-center { padding: 0 !important; display: block !important; }
          
          /* Force the preview to be full size and readable */
          .print-content-root {
            transform: none !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            min-height: 0 !important;
          }

          #pdf-content {
            padding: 40px !important;
            width: 100% !important;
            height: auto !important;
            min-height: 297mm !important; /* A4 Height */
          }

          @page {
            size: A4;
            margin: 0;
          }

          /* Ensure green bars appear in print */
          .green-bar-print {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: ${STYLES.secondary} !important;
          }
        }
      `}</style>

      {/* Top Navigation Bar */}
      <div className="bg-white border-b sticky top-0 z-20 no-print px-4 py-3 flex items-center justify-between shadow-sm">
        <Button variant="ghost" size="sm" onClick={handleBack} className="text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Print</span>
          </Button>
          <Button className="bg-sky-600 hover:bg-sky-700 text-white" size="sm" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Download</span>
          </Button>
          <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white" size="sm" onClick={handleWhatsApp}>
            <MessageCircle className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">WhatsApp</span>
          </Button>
        </div>
      </div>

      {/* PDF Viewport Area */}
      <div className="flex justify-center w-full p-0 md:p-8 bg-gray-100/50 min-h-[calc(100vh-60px)]">

        {/* Responsive Container Wrapper */}
        <div
          ref={containerRef}
          className="relative w-full md:w-auto"
          style={{
            height: scale < 1 ? `${1123 * scale}px` : 'auto', // Reserve exact height
            maxWidth: '794px' // Cap max width on desktop
          }}
        >
          {/* Scaled Content */}
          <div
            className={`origin-top-left transition-transform duration-300 ease-in-out bg-white shadow-2xl print-content-root ${scale < 1 ? '' : 'mx-auto'}`}
            style={{
              width: '794px',
              minHeight: '1123px', // Changed to minHeight to prevent cutoff in preview
              transform: `scale(${scale})`,
              // On desktop (scale 1), we let flex center it. On mobile, we force left origin to fit width.
              transformOrigin: 'top left',
              marginBottom: '0'
            }}
          >
            {/* The Actual PDF Content */}
            <div
              ref={pdfRef}
              id="pdf-content"
              className="flex flex-col h-full w-full"
              style={{
                padding: isMobile ? '20px' : '35px',
                boxSizing: 'border-box',
                color: '#334155',
                backgroundColor: '#ffffff'
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-100 pb-4 mb-6">
                <div className="flex flex-col">
                  {/* Logo Construction */}
                  <div className="text-3xl font-extrabold tracking-tight leading-none flex items-center">
                    <span style={{ color: STYLES.secondary }}>Q</span>
                    <span style={{ color: STYLES.primary }}>UICK</span>
                    <span style={{ color: STYLES.secondary }}>LAB</span>
                    <span className="ml-2 px-2 py-0.5 rounded text-sm bg-blue-50 text-blue-700 tracking-normal font-bold">Demo Pro</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-[0.2em]">Medical Device Demo Request</p>
                </div>
                <div className="text-right">
                  <div className="inline-block text-right">
                    <span className="block text-[9px] uppercase font-bold text-slate-400">Request ID</span>
                    <span className="block text-2xl font-mono font-bold text-slate-800 tracking-tight">{request.readableId || request.id.slice(0, 6)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Date: {formatDate(request.createdAt)}</p>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-2 gap-x-6 md:gap-x-12 gap-y-4 items-start">

                {/* Left Column */}
                <div className="flex flex-col">
                  <Section title="Sales Representative">
                    <Field label="Name" value={sp?.name} />
                    <Field label="Region / Zone" value={sp?.region} />
                  </Section>

                  <Section title="Distributor Details">
                    <Field label="Distributor Name" value={dist?.name} />
                    <Field label="Contact Person" value={dist?.contactPerson} />
                    <Field label="Phone Number" value={dist?.phone} />
                  </Section>

                  <Section title="Commercial Information">
                    <Field label="Business Potential" value={request.businessPotential} />
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Field label="Exp. Purchase" value={formatDate(request.expectedPurchaseDate)} />
                      <Field label="Sample Vol" value={request.sampleVolume} />
                    </div>
                    <div className="mt-2">
                      <Field label="Competitor Info" value={request.competitorDetails} />
                    </div>
                  </Section>
                </div>

                {/* Right Column */}
                <div className="flex flex-col">
                  <Section title="Instrument Configuration">
                    <Field label="Instrument" value={machine?.name} />
                    <Field label="Model" value={request.model} />
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Field label="Demo Type" value={request.demoType} />
                      <Field label="Duration" value={request.expectedDuration} />
                    </div>
                    <div className="mt-2">
                      <Field label="Proposed Date" value={formatDate(request.proposedDate)} />
                    </div>
                  </Section>

                  <Section title="Customer & Location">
                    <Field label="Doctor Name" value={request.doctorName} />
                    <Field label="Department" value={request.doctorDepartment} />
                    <Field label="Hospital / Lab" value={request.hospitalName} />
                    <Field label="City / Location" value={request.location} />
                  </Section>

                  <Section title="Approval Status">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded ${request.regionalManagerApproval ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {request.regionalManagerApproval ? 'APPROVED' : 'PENDING'}
                      </span>
                    </div>
                    <Field label="Regional Manager" value={request.regionalManagerName} />
                    <Field label="Approval Date" value={formatDate(request.approvalDate)} />
                  </Section>
                </div>
              </div>

              {/* Kits Section */}
              <div className="mt-2 text-sm">
                <Section title="Requested Kits & Consumables" fullWidth>
                  {(() => { // Robust Kit Parsing
                    const kits = (() => {
                      try {
                        if (!request.kitItems) return [];
                        if (Array.isArray(request.kitItems)) return request.kitItems;
                        if (typeof request.kitItems === 'string') return JSON.parse(request.kitItems);
                        return [];
                      } catch (e) {
                        console.error("Failed to parse kitItems", e);
                        return [];
                      }
                    })();

                    // Fallback for empty kits
                    if (!kits || kits.length === 0) return <p className="text-xs text-slate-400 italic">No kits requested.</p>;

                    return (
                      <div className="grid grid-cols-4 gap-3 font-medium">
                        {kits.map((k: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 border-l-2 pl-2 border-sky-400 bg-slate-50/50 py-1 rounded-r-sm">
                            <span className="text-[10px] text-slate-800 truncate" title={k.kitName}>{k.kitName}</span>
                            <span className="text-[10px] text-slate-400">-</span>
                            <span className="font-bold text-[10px]" style={{ color: STYLES.primary }}>{k.quantity} {k.unit}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <div className="mt-3 grid grid-cols-2 gap-8 border-t border-slate-100 pt-2">
                    <Field label="Special Requirements" value={request.specialRequirements} />
                    <Field label="Reason For Demo" value={request.reasonForDemo} />
                  </div>
                </Section>
              </div>

              {/* Logistics Section - Adaptive (Moves up if space allows) */}
              <div className="mt-4">
                <div className="bg-slate-50 p-4 rounded border border-slate-100">
                  <div className="flex items-center mb-3 pb-2 border-b border-slate-200">
                    <div className="w-1 h-3 mr-2 rounded-sm bg-slate-400"></div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 leading-none">Logistics & Dispatch</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <Field label="Dispatched By" value={request.dispatchedBy} />
                    <Field label="Dispatch Date" value={formatDate(request.dispatchDate)} />
                    <Field label="Courier" value={request.courierDetails} />
                    <Field label="Tracking No" value={request.trackingNumber} />
                  </div>
                  {request.remarks && (
                    <div className="mt-3 pt-2 border-t border-slate-200">
                      <Field label="Remarks" value={request.remarks} />
                    </div>
                  )}
                </div>
              </div>

              {/* Signature - Pushed to bottom of page */}
              <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-end">
                <div className="text-[9px] text-slate-400">
                  <p className="font-bold text-slate-600">QuickLab Asia Pvt Ltd</p>
                  <p>Generated: {new Date().toLocaleString()}</p>
                </div>

                <div className="flex gap-12">
                  <div className="text-center">
                    <div className="w-24 border-b border-slate-300 mb-1"></div>
                    <span className="text-[8px] font-bold uppercase text-slate-400">Authorized Signatory</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPreviewPdf;
