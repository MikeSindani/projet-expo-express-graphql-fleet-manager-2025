import { PdfTemplate } from '@/contexts/SettingsContext';

interface ReportData {
  date: string;
  type?: string;
  kilometrage: number;
  incidents?: string;
  commentaires?: string;
  chauffeurName: string;
  vehiculeInfo: string;
  organizationName?: string;
}

// ─── Template 1: Classic ────────────────────────────────────────────────────
// Clean professional style with blue accents, table layout, and sectioned cards
function classicTemplate(data: ReportData): string {
  const dateStr = new Date(data.date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const typeColor =
    data.type === 'MAINTENANCE' ? '#16a34a' :
    data.type === 'REPARATION'  ? '#ea580c' : '#2563eb';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Helvetica, Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #2563eb; font-weight: 800; }
    .header .badge { background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 6px; padding: 4px 14px; font-size: 13px; font-weight: 700; color: ${typeColor}; text-transform: uppercase; letter-spacing: 1px; }
    .org { font-size: 12px; color: #64748b; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
    .card .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 6px; }
    .card .value { font-size: 15px; font-weight: 600; color: #0f172a; }
    .card .value.highlight { color: #2563eb; font-size: 22px; }
    .section { margin-bottom: 20px; }
    .section .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; border-left: 3px solid #2563eb; padding-left: 8px; }
    .section .content { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; font-size: 14px; line-height: 1.6; color: #334155; min-height: 48px; }
    .content.incident { border-color: #fca5a5; background: #fff7f7; color: #b91c1c; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 30px; }
    .footer strong { color: #2563eb; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>📋 Rapport d'Activité</h1>
      <div class="org">FleetManager Pro${data.organizationName ? ` · ${data.organizationName}` : ''}</div>
    </div>
    <div class="badge">${data.type || 'INCIDENT'}</div>
  </div>

  <div class="meta-grid">
    <div class="card">
      <div class="label">📅 Date</div>
      <div class="value">${dateStr}</div>
    </div>
    <div class="card">
      <div class="label">🚗 Kilométrage</div>
      <div class="value highlight">${data.kilometrage} km</div>
    </div>
    <div class="card">
      <div class="label">👤 Chauffeur</div>
      <div class="value">${data.chauffeurName}</div>
    </div>
    <div class="card">
      <div class="label">🚙 Véhicule</div>
      <div class="value">${data.vehiculeInfo}</div>
    </div>
  </div>

  <hr class="divider"/>

  <div class="section">
    <div class="section-title">⚠️ Incidents</div>
    <div class="content ${data.incidents ? 'incident' : ''}">
      ${data.incidents || 'Aucun incident signalé pour ce trajet.'}
    </div>
  </div>

  <div class="section">
    <div class="section-title">💬 Commentaires</div>
    <div class="content">${data.commentaires || 'Aucun commentaire.'}</div>
  </div>

  <div class="footer">
    Généré par <strong>FleetManager Pro</strong> le ${new Date().toLocaleString('fr-FR')}
  </div>
</body>
</html>`;
}

// ─── Template 2: Modern ─────────────────────────────────────────────────────
// Bold dark header, color-coded type banner, structured table rows
function modernTemplate(data: ReportData): string {
  const dateStr = new Date(data.date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const typeBg =
    data.type === 'MAINTENANCE' ? '#dcfce7' :
    data.type === 'REPARATION'  ? '#ffedd5' : '#dbeafe';
  const typeColor =
    data.type === 'MAINTENANCE' ? '#15803d' :
    data.type === 'REPARATION'  ? '#c2410c' : '#1d4ed8';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Helvetica, Arial, sans-serif; color: #111827; background: #f9fafb; }
    .header-bar { background: linear-gradient(135deg, #111827 0%, #1e3a5f 100%); color: #fff; padding: 32px 40px 24px; }
    .header-bar h1 { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
    .header-bar .subtitle { font-size: 13px; color: #93c5fd; margin-top: 4px; }
    .type-banner { background: ${typeBg}; color: ${typeColor}; text-align: center; padding: 10px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid ${typeColor}; }
    .body { padding: 32px 40px; }
    table.info-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    table.info-table th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 700; padding: 10px 12px; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; width: 35%; }
    table.info-table td { padding: 10px 12px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f3f4f6; }
    table.info-table td.km { font-size: 20px; color: #1d4ed8; font-weight: 900; }
    .section-block { margin-bottom: 22px; }
    .section-block .section-header { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #6b7280; background: #f3f4f6; padding: 8px 14px; border-radius: 6px 6px 0 0; border: 1px solid #e5e7eb; border-bottom: none; }
    .section-block .section-body { padding: 14px; font-size: 14px; line-height: 1.7; color: #374151; background: #fff; border: 1px solid #e5e7eb; border-radius: 0 0 6px 6px; min-height: 50px; }
    .section-body.incident { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
    .footer { text-align: right; font-size: 10px; color: #9ca3af; padding: 0 40px 24px; }
  </style>
</head>
<body>
  <div class="header-bar">
    <h1>Rapport d'Activité</h1>
    <div class="subtitle">FleetManager Pro${data.organizationName ? ` · ${data.organizationName}` : ''}</div>
  </div>
  <div class="type-banner">${data.type || 'INCIDENT'}</div>

  <div class="body">
    <table class="info-table">
      <tr>
        <th>📅 Date</th>
        <td>${dateStr}</td>
      </tr>
      <tr>
        <th>🚗 Distance</th>
        <td class="km">${data.kilometrage} km</td>
      </tr>
      <tr>
        <th>👤 Chauffeur</th>
        <td>${data.chauffeurName}</td>
      </tr>
      <tr>
        <th>🚙 Véhicule</th>
        <td>${data.vehiculeInfo}</td>
      </tr>
    </table>

    <div class="section-block">
      <div class="section-header">⚠️ Incidents</div>
      <div class="section-body ${data.incidents ? 'incident' : ''}">
        ${data.incidents || 'Aucun incident signalé pour ce trajet.'}
      </div>
    </div>

    <div class="section-block">
      <div class="section-header">💬 Commentaires</div>
      <div class="section-body">${data.commentaires || 'Aucun commentaire.'}</div>
    </div>
  </div>

  <div class="footer">
    Généré par FleetManager Pro le ${new Date().toLocaleString('fr-FR')}
  </div>
</body>
</html>`;
}

// ─── Selector ────────────────────────────────────────────────────────────────
export function generatePdfHtml(template: PdfTemplate, data: ReportData): string {
  return template === 'modern' ? modernTemplate(data) : classicTemplate(data);
}
