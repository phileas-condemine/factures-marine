import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { SALLES, PRESTATAIRE, genererJours, dernierJourMoisPrecedent } from './data';
import { genererPDF } from './pdf';

export default function App() {
  const defaults = dernierJourMoisPrecedent();

  const [salle,       setSalle]       = useState('ansm');
  const [moisVal,     setMoisVal]     = useState(defaults.moisInput);
  const [dateFac,     setDateFac]     = useState(defaults.dateInput);
  const [numFac,      setNumFac]      = useState(defaults.numFacture);
  const [lignes,      setLignes]      = useState([]);
  const [supprimees,  setSupprimees]  = useState(new Set());

  // Regénérer le calendrier quand salle ou mois change
  useEffect(() => {
    if (!moisVal) return;
    const [annee, mois] = moisVal.split('-').map(Number);
    const rows = genererJours(salle, annee, mois).map(r => ({ ...r, supprimee: false }));
    setLignes(rows);
    setSupprimees(new Set());
  }, [salle, moisVal]);

  const toggleLigne = useCallback((date) => {
    setSupprimees(prev => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
    setLignes(prev => prev.map(r => r.date === date ? { ...r, supprimee: !r.supprimee } : r));
  }, []);

  const restaurerTout = useCallback(() => {
    setSupprimees(new Set());
    setLignes(prev => prev.map(r => ({ ...r, supprimee: false })));
  }, []);

  const actives = lignes.filter(r => !r.supprimee);
  const total   = actives.reduce((s, r) => s + r.paie, 0);
  const config  = SALLES[salle];

  const handlePDF = () => {
    genererPDF({ salle, moisVal, dateFac, numFac, lignes });
  };

  return (
    <div className="layout">
      <div className="topbar">
        <h1>Facturation</h1>
        <span>Marine Olivari</span>
      </div>

      {/* Contrôles */}
      <div className="controls">
        <div className="field">
          <label>Salle / Cours</label>
          <select value={salle} onChange={e => setSalle(e.target.value)}>
            {Object.entries(SALLES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Mois à facturer</label>
          <input type="month" value={moisVal} onChange={e => setMoisVal(e.target.value)} />
        </div>
        <div className="field">
          <label>Date de la facture</label>
          <input type="date" value={dateFac} onChange={e => setDateFac(e.target.value)} />
        </div>
        <div className="field">
          <label>N° de facture</label>
          <input type="text" value={numFac} onChange={e => setNumFac(e.target.value)} placeholder="ex: 2025-04" />
        </div>
      </div>

      {/* En-têtes */}
      <div className="header-cards">
        <div className="card">
          <div className="card-label">Prestataire</div>
          <div className="card-name">{PRESTATAIRE.nom}</div>
          <div className="card-addr">{PRESTATAIRE.adresse.join(', ')}</div>
          <span className="badge-siret">SIRET {PRESTATAIRE.siret}</span>
        </div>
        <div className="card">
          <div className="card-label">Client</div>
          <div className="card-name">{config.client}</div>
          {config.adresse.length > 0 && (
            <div className="card-addr">{config.adresse.join('\n')}</div>
          )}
        </div>
      </div>

      {/* Jours supprimés */}
      <div className="removed-section">
        <div className="section-label">
          Jours supprimés {supprimees.size > 0 && `(${supprimees.size})`}
        </div>
        <div className="pills">
          {supprimees.size === 0
            ? <span className="pills-empty">Cliquez sur une ligne pour supprimer un jour</span>
            : [...supprimees].sort().map(d => (
                <span key={d} className="pill" onClick={() => toggleLigne(d)}>
                  ✕ {d}
                </span>
              ))
          }
        </div>
      </div>

      {/* Tableau */}
      <div className="section-label" style={{ marginBottom: 8 }}>Détail des interventions</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 100 }}>Jour</th>
              <th>Date</th>
              <th className="col-h" style={{ width: 90 }}>Heures</th>
              <th className="col-amt" style={{ width: 110 }}>Montant TTC</th>
              <th style={{ width: 28 }}></th>
            </tr>
          </thead>
          <tbody>
            {lignes.map(r => (
              <tr
                key={r.date}
                className={r.supprimee ? 'row-removed' : ''}
                onClick={() => toggleLigne(r.date)}
              >
                <td className="col-jour">{r.jour}</td>
                <td>{r.date}</td>
                <td className="col-h">{r.nb}</td>
                <td className="col-amt">{r.paie} €</td>
                <td className="col-icon">{r.supprimee ? '↩' : '×'}</td>
              </tr>
            ))}
            <tr className="row-total">
              <td></td>
              <td></td>
              <td className="col-h" style={{ fontSize: '0.78rem', color: '#999', fontWeight: 400 }}>TOTAL</td>
              <td className="col-amt">{total} €</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="actions">
        <button className="btn btn-primary" onClick={handlePDF}>
          Télécharger la facture PDF
        </button>
        <button className="btn btn-secondary" onClick={restaurerTout}>
          Restaurer tous les jours
        </button>
      </div>
      <p className="hint">Cliquez sur une ligne pour la supprimer · Cliquez sur une pilule pour la restaurer</p>
    </div>
  );
}
