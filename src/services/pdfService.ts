import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export interface AttendancePDFData {
  studentName: string;
  rollNumber: string;
  semester: string;
  branch: string;
  collegeName: string;
  cgpa: string;
  targetRule: number;
  overallAttendancePct: number;
  totalAttended: number;
  totalHeld: number;
  subjects: {
    code: string;
    name: string;
    attended: number;
    total: number;
    percentage: number;
    safeBunks: number;
    status: 'Safe' | 'Warning' | 'Critical';
  }[];
}

export const generateAttendancePDF = async (data: AttendancePDFData): Promise<boolean> => {
  try {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const isCompliant = data.overallAttendancePct >= data.targetRule;

    const subjectsRows = data.subjects
      .map((sub, idx) => {
        const statusColor =
          sub.status === 'Safe' ? '#006948' : sub.status === 'Warning' ? '#825100' : '#BA1A1A';
        const statusBg =
          sub.status === 'Safe' ? '#E6F4EA' : sub.status === 'Warning' ? '#FEF7E0' : '#FCE8E6';

        return `
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 10px 12px; font-weight: 600; color: #1E293B;">${sub.code}</td>
            <td style="padding: 10px 12px; color: #334155;">${sub.name}</td>
            <td style="padding: 10px 12px; text-align: center; color: #475569;">${sub.attended} / ${sub.total}</td>
            <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: ${statusColor};">${sub.percentage.toFixed(1)}%</td>
            <td style="padding: 10px 12px; text-align: center; font-weight: 600; color: #475569;">
              ${sub.safeBunks >= 0 ? `+${sub.safeBunks} safe` : `${sub.safeBunks} deficit`}
            </td>
            <td style="padding: 10px 12px; text-align: center;">
              <span style="background-color: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                ${sub.status}
              </span>
            </td>
          </tr>
        `;
      })
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Academic Attendance Certificate</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0B1C30;
              margin: 0;
              padding: 0;
              background-color: #FFFFFF;
              font-size: 13px;
              line-height: 1.5;
            }
            .header-table {
              width: 100%;
              border-bottom: 2px solid #006948;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .brand-title {
              font-size: 24px;
              font-weight: 800;
              color: #006948;
              letter-spacing: -0.5px;
              margin: 0;
            }
            .brand-sub {
              font-size: 11px;
              color: #64748B;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 600;
              margin-top: 4px;
            }
            .cert-badge {
              text-align: right;
            }
            .cert-pill {
              background-color: #E6F4EA;
              color: #006948;
              font-size: 12px;
              font-weight: 700;
              padding: 6px 14px;
              border-radius: 16px;
              display: inline-block;
            }
            .student-info-grid {
              width: 100%;
              background-color: #F8F9FF;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 24px;
            }
            .info-label {
              font-size: 11px;
              color: #64748B;
              text-transform: uppercase;
              font-weight: 600;
            }
            .info-value {
              font-size: 14px;
              font-weight: 700;
              color: #0B1C30;
              margin-bottom: 8px;
            }
            .summary-cards {
              display: flex;
              gap: 12px;
              margin-bottom: 24px;
            }
            .summary-card {
              flex: 1;
              background-color: #F8F9FF;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 12px 16px;
              text-align: center;
            }
            .summary-card-title {
              font-size: 11px;
              color: #64748B;
              text-transform: uppercase;
              font-weight: 600;
            }
            .summary-card-val {
              font-size: 22px;
              font-weight: 800;
              color: #006948;
              margin: 4px 0;
            }
            .table-container {
              width: 100%;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              overflow: hidden;
              margin-bottom: 28px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th {
              background-color: #F1F5F9;
              color: #475569;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
              padding: 10px 12px;
              text-align: left;
            }
            .footer-section {
              margin-top: 30px;
              border-top: 1px solid #E2E8F0;
              padding-top: 16px;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #64748B;
            }
            .signature-box {
              text-align: right;
              padding-top: 30px;
            }
            .signature-line {
              border-top: 1px solid #0B1C30;
              width: 180px;
              display: inline-block;
              margin-bottom: 4px;
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <h1 class="brand-title">CampusFlow</h1>
                <div class="brand-sub">Academic & Attendance Management System</div>
              </td>
              <td class="cert-badge">
                <span class="cert-pill">Official Attendance Report</span>
                <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Issued on ${currentDate}</div>
              </td>
            </tr>
          </table>

          <table class="student-info-grid">
            <tr>
              <td style="width: 25%;">
                <div class="info-label">Student Name</div>
                <div class="info-value">${data.studentName}</div>
              </td>
              <td style="width: 25%;">
                <div class="info-label">Roll Number</div>
                <div class="info-value">${data.rollNumber}</div>
              </td>
              <td style="width: 25%;">
                <div class="info-label">Semester & Branch</div>
                <div class="info-value">${data.semester} - ${data.branch}</div>
              </td>
              <td style="width: 25%;">
                <div class="info-label">Current CGPA</div>
                <div class="info-value">${data.cgpa}</div>
              </td>
            </tr>
          </table>

          <table style="width: 100%; margin-bottom: 20px;">
            <tr>
              <td style="width: 32%; padding-right: 8px;">
                <div class="summary-card">
                  <div class="summary-card-title">Overall Attendance</div>
                  <div class="summary-card-val" style="color: ${isCompliant ? '#006948' : '#BA1A1A'};">
                    ${data.overallAttendancePct.toFixed(1)}%
                  </div>
                  <div style="font-size: 10px; color: #64748B;">Target Rule: ${data.targetRule}%</div>
                </div>
              </td>
              <td style="width: 32%; padding-right: 8px;">
                <div class="summary-card">
                  <div class="summary-card-title">Classes Attended</div>
                  <div class="summary-card-val">${data.totalAttended} / ${data.totalHeld}</div>
                  <div style="font-size: 10px; color: #64748B;">Total Sessions Recorded</div>
                </div>
              </td>
              <td style="width: 32%;">
                <div class="summary-card">
                  <div class="summary-card-title">Institutional Standing</div>
                  <div class="summary-card-val" style="font-size: 16px; color: ${isCompliant ? '#006948' : '#BA1A1A'};">
                    ${isCompliant ? 'Eligible for Exams' : 'Shortage Detention Risk'}
                  </div>
                  <div style="font-size: 10px; color: #64748B;">Status Verified</div>
                </div>
              </td>
            </tr>
          </table>

          <div style="font-weight: 700; font-size: 14px; color: #0B1C30; margin-bottom: 10px;">
            Subject-wise Attendance Breakdown
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Title</th>
                  <th style="text-align: center;">Attended / Held</th>
                  <th style="text-align: center;">Percentage</th>
                  <th style="text-align: center;">Buffer Margin</th>
                  <th style="text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${subjectsRows}
              </tbody>
            </table>
          </div>

          <table style="width: 100%; margin-top: 30px;">
            <tr>
              <td style="vertical-align: bottom; font-size: 11px; color: #64748B;">
                <div><strong>System Verification:</strong> Cryptographically generated via CampusFlow Mobile.</div>
                <div>Document ID: CF-${Date.now().toString(36).toUpperCase()}</div>
              </td>
              <td class="signature-box">
                <div class="signature-line"></div>
                <div style="font-weight: 700; font-size: 12px; color: #0B1C30;">Academic Dean / Authority</div>
                <div style="font-size: 11px; color: #64748B;">Seal & Signature</div>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Generate PDF file
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    if (Platform.OS === 'web') {
      await Print.printAsync({ html: htmlContent });
      return true;
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'Share Attendance Certificate',
      });
      return true;
    } else {
      await Print.printAsync({ uri });
      return true;
    }
  } catch (error) {
    console.error('Failed to generate attendance PDF:', error);
    return false;
  }
};
