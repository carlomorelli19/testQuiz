// ── Columbia Road · AI Maturity Quiz Webhook ────────────────────────────────
// Paste this into Google Apps Script (script.google.com → New project)
// Deploy as a Web App: Execute as "Me", access "Anyone"
// Copy the deployment URL into the quiz's N8N_WEBHOOK_URL config line
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_ID   = '1XRDP4UB_4Kbdzc_6KAitYoFxSHnuzVRpy7uh2oXsZ5o';
const SHEET_NAME = 'Sheet1';

// Column order in the sheet
const COLUMNS = [
  'submitted_at',
  'name',
  'email',
  'role',
  'team_size',
  // Scoring
  'score',           // rendered as "14/22"
  'score_pct',
  'stage',
  'adoption_score',
  'data_score',
  'governance_score',
  'team_readiness_score',
  'roi_estimate_eur',
  // Business context
  'deal_size',
  'close_rate',
  'admin_time',
  'monthly_leads',
  'lead_to_conv',
  // AI maturity answers
  'ai_tools',
  'ai_agents',
  'ai_integration',
  'data_quality',
  'governance_owner',
  'team_attitude',
  // Priorities
  'top_opportunities',
  'top_blockers',
  'biggest_time_waste',
  'roadmap_headline',
];

// Human-readable header labels (same order as COLUMNS)
const HEADERS = [
  'Submitted at',
  'Name',
  'Email',
  'Role',
  'Team size',
  'Score',
  'Score %',
  'Stage',
  'Adoption score',
  'Data score',
  'Governance score',
  'Team readiness',
  'ROI estimate (€)',
  'Deal size',
  'Close rate',
  'Admin time',
  'Monthly leads',
  'Lead → conv rate',
  'AI tools',
  'AI agents',
  'AI integration',
  'Data quality',
  'Governance owner',
  'Team attitude',
  'Top opportunities',
  'Top blockers',
  'Biggest time waste',
  'Roadmap headline',
  // Filled in post-event by Claude Code
  'Email subject',
  'Email body',
  // Manual tracking
  'Email sent?',
  'Notes',
];

// ── Main handler ─────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const raw  = e.postData ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    // Write headers on first submission
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      styleHeaderRow(sheet);
    }

    // Build data row
    const row = COLUMNS.map(col => {
      if (col === 'score') {
        return (data.score !== undefined && data.score_max !== undefined)
          ? `${data.score}/${data.score_max}`
          : '';
      }
      const val = data[col];
      return val !== undefined && val !== null ? val : '';
    });

    // Append empty cells for Email subject, Email body, Email sent?, Notes
    row.push('', '', '', '');

    sheet.appendRow(row);

    return jsonResponse({ status: 'ok' });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function styleHeaderRow(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  range.setFontWeight('bold');
  range.setBackground('#1B3A6B');   // Columbia Road navy
  range.setFontColor('#FFFFFF');
  range.setFontSize(11);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);

  // Highlight the "Email sent?" column in a soft amber so it stands out
  const emailSentCol = HEADERS.indexOf('Email sent?') + 1;
  if (emailSentCol > 0) {
    sheet.getRange(1, emailSentCol).setBackground('#F59E0B');
  }
}

// ── Test helper (run manually to verify sheet access) ────────────────────────
// Select this function in the editor and click Run to check everything is wired
function testSetup() {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  Logger.log('Sheet found: ' + sheet.getName());
  Logger.log('Last row: '    + sheet.getLastRow());
}
