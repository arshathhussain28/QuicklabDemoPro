import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Printer, MessageCircle, ArrowLeft, Download } from 'lucide-react';
import type { DemoRequest } from '@/context/AppDataContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

// Branding & Style Constants
const STYLES = {
  primary: '#1d4ed8',   // Royal Blue (QuickLab Blue)
  secondary: '#16a34a', // Vibrant Green (QuickLab Green)
};

// Layout Components
const Section: React.FC<{ title: string; children: React.ReactNode; fullWidth?: boolean }> = ({ title, children, fullWidth }) => (
  <div className={`break-inside-avoid mb-4 ${fullWidth ? 'col-span-2' : ''}`}>
    <div className="section-title">
      <div className="indicator" style={{ backgroundColor: STYLES.secondary }}></div>
      <h3 className="section-title-text">{title}</h3>
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
  const { id } = useParams<{ id: string }>();
  const { data } = useAppData();
  const { user } = useAuth();
  const { toast } = useToast();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [request, setRequest] = useState<DemoRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.request) {
      setRequest(location.state.request);
      setLoading(false);
      return;
    }
    if (id) {
      const found = data.demoRequests.find(r => r.id === id);
      if (found) {
        setRequest(found);
      }
      setLoading(false);
    }
  }, [id, location.state, data.demoRequests]);

  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = containerWidth < 820 ? containerWidth / 794 : 1;
        setScale(newScale);
      }
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleBack = () => {
    if (user?.role === 'admin') {
      navigate('/admin/requests');
    } else {
      navigate('/sales/my-requests');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading request details...</div>;
  if (!request) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded shadow">
        <p className="text-slate-500 mb-4">No request data found.</p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    </div>
  );

  const sp = data.salespersons.find(s => s.id === request.salespersonId);
  const dist = data.distributors.find(d => d.id === request.distributorId);
  const machine = data.machines.find(m => m.id === request.machineId);

  const generatePDF = async () => {
    const element = document.getElementById("pdf-print-container");
    if (!element) return null;

    try {
      toast({ title: "Generating PDF...", description: "Formatting document..." });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
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
    <div className="min-h-screen bg-gray-100 pb-12 print-bg-reset overflow-visible">
      <style>{`
        /* Core Print Isolation */
        @media print {
          button,
          .pdf-screen-controls {
            display: none !important;
          }
          
          body, html {
            margin: 0;
            padding: 0;
            overflow: hidden !important;
          }
          
          .print-bg-reset {
            background: white !important;
            padding: 0 !important;
            min-height: 0 !important;
          }

          #pdf-print-container {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            overflow: hidden;
          }

          .pdf-page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            box-sizing: border-box;
            overflow: hidden !important;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }

        /* Standardized Screen & Print Typography */
        #pdf-print-container {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          overflow: hidden;
        }

        .pdf-page {
          width: 210mm;
          height: 297mm;
          padding: 20mm;
          box-sizing: border-box;
          overflow: hidden;
          line-height: 1.4;
          color: #334155;
          background-color: #ffffff;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #e2e8f0;
        }

        .section-title .indicator {
          width: 4px;
          height: 16px;
          flex-shrink: 0;
          border-radius: 2px;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .section-title-text {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #1e293b;
          margin: 0;
          padding: 0;
          line-height: 1.2;
        }
      `}</style>

      {/* Top Navigation Bar - Explicitly Marked as pdf-screen-controls */}
      <div className="pdf-screen-controls bg-white border-b sticky top-0 z-20 px-4 py-3 flex items-center justify-between shadow-sm">
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

      {/* Wrapper to center content gracefully strictly for viewing layout */}
      <div className="flex justify-center w-full p-0 md:p-8 overflow-visible" ref={containerRef}>

        {/* Transform applied purely based on screen size; does not infect structural bounds in pure DOM styling */}
        <div
          className="relative transition-transform duration-300 ease-in-out origin-top-left md:origin-top"
          style={{ transform: `scale(${scale})` }}
        >
          {/* Print container locks to A4 format internally preventing layout shift */}
          <div ref={pdfRef} id="pdf-print-container" className="bg-white shadow-2xl mx-auto" style={{ width: '794px', height: '1123px' }}>

            <div className="pdf-page flex flex-col h-full w-full" style={{ padding: '20mm', boxSizing: 'border-box' }}>

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
                  {(() => {
                    const kits = (() => {
                      try {
                        if (!request.kitItems) return [];
                        if (Array.isArray(request.kitItems)) return request.kitItems;
                        if (typeof request.kitItems === 'string') return JSON.parse(request.kitItems);
                        return [];
                      } catch (e) {
                        return [];
                      }
                    })();

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

              {/* Logistics Section */}
              <div className="mt-4">
                <div className="bg-slate-50 p-4 rounded border border-slate-100">
                  <div className="flex items-center mb-3 pb-2 border-b border-slate-200">
                    <div className="w-1 h-3 mr-2 rounded-sm bg-slate-400"></div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 leading-none m-0">Logistics & Dispatch</h3>
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

              {/* Signature */}
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
