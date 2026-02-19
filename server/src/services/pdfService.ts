import puppeteer from 'puppeteer';
import { DemoRequest } from '@prisma/client';

export const generatePDF = async (request: any) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Basic HTML Template including new fields
    const content = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #333; }
          .section { margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .field { margin: 5px 0; }
          .label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>Demo Request #${request.id.slice(0, 8)}</h1>
        
        <div class="section">
          <h3>Request Details</h3>
          <div class="field"><span class="label">Status:</span> ${request.status}</div>
          <div class="field"><span class="label">Salesperson:</span> ${request.salesperson?.name} (${request.salesperson?.email})</div>
          <div class="field"><span class="label">Distributor:</span> ${request.distributor?.name}</div>
          <div class="field"><span class="label">Machine:</span> ${request.machine?.name} (${request.model})</div>
          <div class="field"><span class="label">Demo Type:</span> ${request.demoType}</div>
          <div class="field"><span class="label">Proposed Date:</span> ${request.proposedDate}</div>
          <div class="field"><span class="label">Expected Duration:</span> ${request.expectedDuration}</div>
          <div class="field"><span class="label">Sales Potential:</span> ${request.businessPotential}</div>
          <div class="field"><span class="label">Expected Purchase Date:</span> ${request.expectedPurchaseDate ? new Date(request.expectedPurchaseDate).toLocaleDateString() : 'N/A'}</div>
        </div>

        <div class="section">
          <h3>Logistics & Machine Details</h3>
          <div class="field"><span class="label">Machine Serial No:</span> ${request.machineSerialNumber || 'Not Assigned'}</div>
          <div class="field"><span class="label">Dispatched By:</span> ${request.dispatchedBy || 'N/A'}</div>
          <div class="field"><span class="label">Dispatch Date:</span> ${request.dispatchDate || 'N/A'}</div>
          <div class="field"><span class="label">Tracking No:</span> ${request.trackingNumber || 'N/A'}</div>
        </div>

        <div class="section">
          <h3>Kit Items</h3>
          <table>
            <thead>
              <tr>
                <th>Kit Name</th>
                <th>Quantity</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              ${JSON.parse(request.kitItems || '[]').map((k: any) => `
                <tr>
                  <td>${k.kitName}</td>
                  <td>${k.quantity}</td>
                  <td>${k.unit || 'Units'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>Approvals</h3>
          <div class="field"><span class="label">Regional Manager:</span> ${request.regionalManagerApproval ? 'Yes (' + request.regionalManagerName + ')' : 'No'}</div>
          <div class="field"><span class="label">Approval Date:</span> ${request.approvalDate || 'N/A'}</div>
        </div>
      </body>
    </html>
  `;

    await page.setContent(content);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    return pdfBuffer;
};
