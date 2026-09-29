import { jsPDF } from 'jspdf';
import { Candidate, ElectionSettings, Voter, Vote } from '../types';
import { DEFAULT_OSIS_EMBLEM } from './sampleData';

interface GeneratePdfOptions {
  settings: ElectionSettings;
  candidates: Candidate[];
  votes: Vote[];
  voters: Voter[];
  totalVoters: number;
  votedCount: number;
  unvotedCount: number;
  participationRate: number;
}

/**
 * Convert image URL to a clean PNG Base64 data URL via canvas
 */
const getImageDataUrl = async (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      if (!url) {
        resolve(null);
        return;
      }

      // If it's already a base64 png or jpeg, verify and return
      if (url.startsWith('data:image/png;base64,') || url.startsWith('data:image/jpeg;base64,')) {
        resolve(url);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 120;
          canvas.height = img.naturalHeight || img.height || 120;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = url;
    } catch {
      resolve(null);
    }
  });
};

/**
 * Generate and download the official election results PDF report
 */
export const downloadElectionReportPdf = async (options: GeneratePdfOptions): Promise<void> => {
  const {
    settings,
    candidates,
    votes,
    voters,
    totalVoters,
    votedCount,
    unvotedCount,
    participationRate,
  } = options;

  // Initialize jsPDF (A4 Portrait, millimeters)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174mm

  let currentY = 16;

  // 1. KOP SURAT RESMI (Official School Letterhead)
  // Try loading school logo, fallback to default OSIS emblem
  const logoUrlToUse = settings.schoolLogoUrl || DEFAULT_OSIS_EMBLEM;
  let logoBase64: string | null = null;
  try {
    logoBase64 = await getImageDataUrl(logoUrlToUse);
    if (!logoBase64 && logoUrlToUse !== DEFAULT_OSIS_EMBLEM) {
      logoBase64 = await getImageDataUrl(DEFAULT_OSIS_EMBLEM);
    }
  } catch {
    logoBase64 = null;
  }

  // Draw Logo if loaded
  const logoSize = 22; // 22mm x 22mm
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, currentY, logoSize, logoSize);
    } catch {
      // If addImage fails, draw elegant emblem placeholder
      doc.setFillColor(30, 58, 138);
      doc.roundedRect(margin, currentY, logoSize, logoSize, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('OSIS', margin + logoSize / 2, currentY + logoSize / 2 + 1, { align: 'center' });
    }
  }

  // Kop Text (Right of logo or centered)
  const textLeft = logoBase64 ? margin + logoSize + 6 : margin;
  const textWidth = logoBase64 ? contentWidth - logoSize - 6 : contentWidth;
  const textCenter = textLeft + textWidth / 2;

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ORGANISASI SISWA INTRA SEKOLAH (OSIS)', textCenter, currentY + 4, { align: 'center' });

  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(settings.schoolName.toUpperCase(), textCenter, currentY + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('PANITIA PEMILIHAN UMUM KETUA & WAKIL KETUA OSIS DIGITAL', textCenter, currentY + 15, { align: 'center' });
  doc.text(`Tahun Pelaksanaan / Masa Bakti: ${settings.electionYear}`, textCenter, currentY + 19.5, { align: 'center' });

  currentY += 25;

  // Double horizontal separator line (Standard Indonesian Kop Surat)
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY, margin + contentWidth, currentY);

  doc.setLineWidth(0.2);
  doc.line(margin, currentY + 1, margin + contentWidth, currentY + 1);

  currentY += 7;

  // 2. JUDUL DOKUMEN & METADATA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('BERITA ACARA & LAPORAN HASIL PERHITUNGAN SUARA', margin + contentWidth / 2, currentY, { align: 'center' });

  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  doc.text(`Dokumen Resmi OSIS VOTE • Dicetak pada: ${dateFormatted} pukul ${timeFormatted}`, margin + contentWidth / 2, currentY, { align: 'center' });

  currentY += 7;

  // 3. KOTAK RINGKASAN STATISTIK PEMILIHAN (Summary KPI Cards)
  const boxHeight = 16;
  const colWidth = contentWidth / 4;

  const kpis = [
    { label: 'TOTAL DPT SISWA', value: `${totalVoters} Siswa`, color: [30, 41, 59] },
    { label: 'SUARA MASUK (SAH)', value: `${votedCount} Suara`, color: [16, 149, 106] },
    { label: 'BELUM MEMILIH', value: `${unvotedCount} Siswa`, color: [217, 119, 6] },
    { label: 'PARTISIPASI SUARA', value: `${participationRate}%`, color: [37, 99, 235] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * colWidth;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x + 1, currentY, colWidth - 2, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + colWidth / 2, currentY + 5, { align: 'center' });

    doc.setFontSize(10.5);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + colWidth / 2, currentY + 11.5, { align: 'center' });
  });

  currentY += boxHeight + 8;

  // 4. TABEL REKAPITULASI PEROLEHAN SUARA PASANGAN CALON
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('I. REKAPITULASI PEROLEHAN SUARA PASANGAN CALON', margin, currentY);

  currentY += 4.5;

  // Table Header
  const tableX = margin;
  const tableHeaders = [
    { title: 'NO', width: 14, align: 'center' as const },
    { title: 'PASANGAN CALON (KETUA & WAKIL KETUA)', width: 84, align: 'left' as const },
    { title: 'JUMLAH SUARA', width: 36, align: 'center' as const },
    { title: 'PERSENTASE', width: 40, align: 'center' as const },
  ];

  const rowHeight = 7.5;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(tableX, currentY, contentWidth, rowHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  let currentHeaderX = tableX;
  tableHeaders.forEach((th) => {
    const textX = th.align === 'center' ? currentHeaderX + th.width / 2 : currentHeaderX + 3;
    doc.text(th.title, textX, currentY + 5, { align: th.align });
    currentHeaderX += th.width;
  });

  currentY += rowHeight;

  // Calculate vote counts per candidate
  const totalEnteredVotes = votes.length;
  const candidateStats = candidates.map(c => {
    const count = votes.filter(v => v.candidateNumber === c.number).length;
    const pct = totalEnteredVotes > 0 ? (count / totalEnteredVotes) * 100 : 0;
    return {
      candidate: c,
      count,
      pct,
    };
  });

  // Find winner if any votes entered
  const maxVotes = Math.max(...candidateStats.map(s => s.count), 0);

  // Table Body Rows
  candidateStats.forEach((stat, idx) => {
    const isEven = idx % 2 === 0;
    const isWinner = totalEnteredVotes > 0 && stat.count === maxVotes && maxVotes > 0;

    doc.setFillColor(isWinner ? 240 : isEven ? 255 : 248, isWinner ? 253 : isEven ? 255 : 250, isWinner ? 244 : 252);
    doc.setDrawColor(226, 232, 240);
    const itemHeight = 12;
    doc.rect(tableX, currentY, contentWidth, itemHeight, 'FD');

    let rowX = tableX;

    // Col 1: Number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text(`0${parseInt(stat.candidate.number, 10) || idx + 1}`, rowX + tableHeaders[0].width / 2, currentY + 7, { align: 'center' });
    rowX += tableHeaders[0].width;

    // Col 2: Candidates names
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(stat.candidate.chairmanName, rowX + 3, currentY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Wakil: ${stat.candidate.viceChairmanName}`, rowX + 3, currentY + 8.5);
    rowX += tableHeaders[1].width;

    // Col 3: Vote Count
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${stat.count} Suara`, rowX + tableHeaders[2].width / 2, currentY + 7, { align: 'center' });
    rowX += tableHeaders[2].width;

    // Col 4: Percentage + Winner Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    const pctText = `${stat.pct.toFixed(1)}%`;
    doc.text(pctText, rowX + tableHeaders[3].width / 2, currentY + (isWinner ? 5.5 : 7), { align: 'center' });
    if (isWinner) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(16, 149, 106);
      doc.text('★ SUARA TERBANYAK', rowX + tableHeaders[3].width / 2, currentY + 9.5, { align: 'center' });
    }

    currentY += itemHeight;
  });

  // Table Total Row
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(tableX, currentY, contentWidth, 7, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL SUARA SAH MASUK', tableX + tableHeaders[0].width + 3, currentY + 4.8);
  doc.text(`${totalEnteredVotes} Suara`, tableX + tableHeaders[0].width + tableHeaders[1].width + tableHeaders[2].width / 2, currentY + 4.8, { align: 'center' });
  doc.text('100.0%', tableX + tableHeaders[0].width + tableHeaders[1].width + tableHeaders[2].width + tableHeaders[3].width / 2, currentY + 4.8, { align: 'center' });

  currentY += 12;

  // 5. REKAPITULASI PARTISIPASI PER KELAS / TINGKAT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('II. REKAPITULASI TINGKAT PARTISIPASI PEMILIH PER ANGKATAN', margin, currentY);

  currentY += 4.5;

  // Calculate breakdown by class prefix (e.g. X, XI, XII)
  const classBreakdown = new Map<string, { total: number; voted: number }>();
  voters.forEach(v => {
    const clsPrefix = v.class ? v.class.split(' ')[0] : 'Lainnya';
    const cur = classBreakdown.get(clsPrefix) || { total: 0, voted: 0 };
    cur.total += 1;
    if (v.hasVoted) cur.voted += 1;
    classBreakdown.set(clsPrefix, cur);
  });

  const classRows = Array.from(classBreakdown.entries()).map(([grp, data]) => ({
    group: grp,
    total: data.total,
    voted: data.voted,
    pct: data.total > 0 ? (data.voted / data.total) * 100 : 0
  }));

  // Class table
  const classColWidth = contentWidth / 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(tableX, currentY, contentWidth, 6.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('TINGKAT / KELAS', tableX + classColWidth / 2, currentY + 4.2, { align: 'center' });
  doc.text('TOTAL PEMILIH DPT', tableX + classColWidth * 1.5, currentY + 4.2, { align: 'center' });
  doc.text('SUDAH MEMILIH', tableX + classColWidth * 2.5, currentY + 4.2, { align: 'center' });
  doc.text('PARTISIPASI (%)', tableX + classColWidth * 3.5, currentY + 4.2, { align: 'center' });

  currentY += 6.5;

  classRows.forEach((row, i) => {
    doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
    doc.rect(tableX, currentY, contentWidth, 6.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Tingkat ${row.group}`, tableX + classColWidth / 2, currentY + 4.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(`${row.total} siswa`, tableX + classColWidth * 1.5, currentY + 4.5, { align: 'center' });
    doc.text(`${row.voted} siswa`, tableX + classColWidth * 2.5, currentY + 4.5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(`${row.pct.toFixed(1)}%`, tableX + classColWidth * 3.5, currentY + 4.5, { align: 'center' });
    currentY += 6.5;
  });

  currentY += 10;

  // 6. LEMBAR PENGESAHAN / TANDA TANGAN RESMI
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Demikian Berita Acara dan Laporan Hasil Perhitungan Suara Pemilihan Ketua OSIS ini dibuat secara sah, transparan, dan dapat dipertanggungjawabkan sesuai data sistem e-voting OSIS VOTE.`,
    margin,
    currentY,
    { maxWidth: contentWidth }
  );

  currentY += 12;

  // Signatures 2 Columns
  const sigColWidth = contentWidth / 2;

  // Left column: Pembina / Kepala Sekolah
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Mengetahui / Mengesahkan,', margin + sigColWidth / 2, currentY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Kepala Sekolah / Pembina OSIS', margin + sigColWidth / 2, currentY + 4.5, { align: 'center' });

  // Right column: Ketua Panitia
  doc.setFont('helvetica', 'normal');
  doc.text(`${settings.schoolName}, ${dateFormatted}`, margin + sigColWidth + sigColWidth / 2, currentY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Ketua Panitia Pemilihan OSIS', margin + sigColWidth + sigColWidth / 2, currentY + 4.5, { align: 'center' });

  // Space for physical stamp & signature
  currentY += 24;

  // Signature lines & names
  doc.setLineWidth(0.3);
  doc.setDrawColor(71, 85, 105);
  doc.line(margin + 12, currentY, margin + sigColWidth - 12, currentY);
  doc.line(margin + sigColWidth + 12, currentY, margin + contentWidth - 12, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('( .................................................... )', margin + sigColWidth / 2, currentY + 4.5, { align: 'center' });
  doc.text('( .................................................... )', margin + sigColWidth + sigColWidth / 2, currentY + 4.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('NIP. ....................................................', margin + sigColWidth / 2, currentY + 8.5, { align: 'center' });
  doc.text('NISN. ..................................................', margin + sigColWidth + sigColWidth / 2, currentY + 8.5, { align: 'center' });

  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const footerText = `Dokumen ini sah dan diterbitkan otomatis oleh Sistem Pemilihan Digital OSIS VOTE — ${settings.schoolName}`;
  doc.text(footerText, margin + contentWidth / 2, 290, { align: 'center' });

  // Save PDF file
  const cleanSchool = settings.schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanYear = settings.electionYear.replace(/[^a-zA-Z0-9]/g, '-');
  const filename = `Laporan_Hasil_Pemilihan_OSIS_${cleanSchool}_${cleanYear}.pdf`;
  doc.save(filename);
};
