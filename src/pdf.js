import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SALLES, PRESTATAIRE, formatMoisLong, formatDateLongue } from './data';

export function genererPDF({ salle, moisVal, dateFac, numFac, lignes }) {
  const config = SALLES[salle];
  const [annee, mois] = moisVal.split('-').map(Number);

  const actives = lignes.filter(r => !r.supprimee);
  const total   = actives.reduce((s, r) => s + r.paie, 0);

  const moisFormate = formatMoisLong(annee, mois);
  const dateFormatee = formatDateLongue(dateFac);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const M      = 20;
  const CW     = PAGE_W - 2 * M;

  // ── En-tête : prestataire (gauche) | client (droite) ──
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Prestataire', M, 26);
  doc.text('Client', M + CW / 2, 26);

  // Prestataire
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(PRESTATAIRE.nom, M, 34);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  PRESTATAIRE.adresse.forEach((l, i) => doc.text(l, M, 40 + i * 5));
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`SIRET : ${PRESTATAIRE.siret}`, M, 40 + PRESTATAIRE.adresse.length * 5 + 2);

  // Client
  const cx = M + CW / 2;
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  // Wrap long client name
  const clientLines = doc.splitTextToSize(config.client, CW / 2 - 2);
  doc.text(clientLines, cx, 34);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const clientY = 34 + clientLines.length * 5.5;
  config.adresse.forEach((l, i) => doc.text(l, cx, clientY + i * 5));
  if (config.siret) {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`SIRET : ${config.siret}`, cx, clientY + config.adresse.length * 5 + 2);
  }

  // Séparateur
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(M, 62, PAGE_W - M, 62);

  // ── Titre facture ──
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Facture', M, 73);

  if (numFac) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text(`N° ${numFac}`, M, 80);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Période : ${moisFormate}`, PAGE_W - M, 73, { align: 'right' });
  doc.text(`Date : ${dateFormatee}`, PAGE_W - M, 80, { align: 'right' });

  // ── Tableau ──
  const tableData = actives.map(r => [
    r.jour.charAt(0).toUpperCase() + r.jour.slice(1),
    r.date,
    r.nb,
    `${r.paie} €`,
  ]);

  doc.autoTable({
    startY: 87,
    head: [['Jour', 'Date', 'Heures', 'Montant TTC']],
    body: tableData,
    foot: [['', '', 'Total', `${total} €`]],
    margin: { left: M, right: M },
    styles: {
      fontSize: 9,
      cellPadding: 3.5,
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: [245, 245, 243],
      textColor: [100, 100, 100],
      fontStyle: 'normal',
      fontSize: 8,
    },
    footStyles: {
      fillColor: [245, 245, 243],
      fontStyle: 'bold',
      fontSize: 11,
    },
    alternateRowStyles: { fillColor: [251, 251, 250] },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 45 },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 42, halign: 'right' },
    },
  });

  // ── Total mis en évidence ──
  const afterTable = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(`Total à régler : ${total} €`, PAGE_W - M, afterTable, { align: 'right' });

  // ── Mention TVA ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text(PRESTATAIRE.mention_tva, M, afterTable);

  // ── Pied de page ──
  const footY = 287;
  doc.setDrawColor(220, 220, 220);
  doc.line(M, footY - 4, PAGE_W - M, footY - 4);
  doc.setFontSize(7.5);
  doc.setTextColor(170, 170, 170);
  doc.text(
    `${PRESTATAIRE.nom} · ${PRESTATAIRE.adresse.join(', ')} · SIRET ${PRESTATAIRE.siret}`,
    PAGE_W / 2, footY, { align: 'center' }
  );

  // ── Sauvegarde ──
  const filename = `facture_${salle}_${moisVal}.pdf`;
  doc.save(filename);
}
