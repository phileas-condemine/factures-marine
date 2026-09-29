export const SALLES = {
  ansm: {
    label: "ANSM – Sport",
    client: "OZIO – ASSOCIATION SPORTIVE DE L'ANSM (AGENCE NATIONALE DE SECURITE DU MEDICAMENT ET DES PRODUITS DE SANTE)",
    adresse: ["143/147 Boulevard Anatole France", "F-93285 Saint-Denis Cedex"],
    jours: [
      { jour: "lundi",    nb: "2 h", paie: 140 },
      { jour: "mercredi", nb: "1 h", paie: 70  },
      { jour: "jeudi",    nb: "2 h", paie: 140 },
    ],
  },
  senat_jazz: {
    label: "Sénat – Jazz",
    client: "ASCPS",
    adresse: [],
    jours: [
      { jour: "vendredi", nb: "1 h", paie: 83 },
    ],
  },
  senat_stretch: {
    label: "Sénat – Stretch",
    client: "ASCPS",
    adresse: [],
    jours: [
      { jour: "mardi",    nb: "1 h", paie: 83 },
      { jour: "jeudi",    nb: "1 h", paie: 83 },
      { jour: "vendredi", nb: "1 h", paie: 83 },
    ],
  },
  leva_flow_paris: {
    label: "Leva Flow Paris",
    client: "LEVA FLOW PARIS - L&O FLOW",
    adresse: ["163 rue de Sèvres", "75015 PARIS"],
    siret: "993 393 479 00015",
    jours: [
      { jour: "mardi",    nb: "1 h", paie: 60 },
      { jour: "vendredi", nb: "1 h", paie: 60 },
    ],
  },
};

export const PRESTATAIRE = {
  nom: "Marine Olivari",
  adresse: ["1 rue Ernest Renan", "75015 Paris"],
  siret: "523 178 630 00027",
  mention_tva: "TVA non applicable – article 293 B du CGI",
};

export const FR_JOURS   = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
export const FR_MOIS    = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

export function genererJours(salle, annee, mois) {
  const config = SALLES[salle];
  const nbJours = new Date(annee, mois, 0).getDate();
  const rows = [];
  for (let d = 1; d <= nbJours; d++) {
    const date   = new Date(annee, mois - 1, d);
    const nomJour = FR_JOURS[date.getDay()];
    const match  = config.jours.find(j => j.jour === nomJour);
    if (match) {
      const dateISO = `${annee}-${String(mois).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      rows.push({
        id:   dateISO,
        jour: nomJour,
        date: `${String(d).padStart(2,'0')}/${String(mois).padStart(2,'0')}/${annee}`,
        dateISO,
        nb:   match.nb,
        paie: match.paie,
      });
    }
  }
  return rows;
}

export function formatMoisLong(annee, mois) {
  return `${FR_MOIS[mois - 1]} ${annee}`;
}

export function formatDateLongue(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function dernierJourMoisPrecedent() {
  const now  = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const last = new Date(prev.getFullYear(), prev.getMonth() + 1, 0);
  return {
    moisInput:   `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}`,
    dateInput:   `${last.getFullYear()}-${String(last.getMonth()+1).padStart(2,'0')}-${String(last.getDate()).padStart(2,'0')}`,
    numFacture:  `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}`,
  };
}
