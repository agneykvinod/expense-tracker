:root {
  --black: #0a0a0a;
  --white: #ffffff;
  --grey-900: #171717;
  --grey-700: #3a3a3a;
  --grey-500: #767676;
  --grey-300: #b4b4b4;
  --grey-150: #e2e2e2;
  --grey-100: #ececec;
  --grey-050: #f6f6f6;

  --sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --mono: 'SF Mono', 'JetBrains Mono', 'IBM Plex Mono', Menlo, Consolas, monospace;

  --radius: 10px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--grey-050);
  color: var(--black);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;

  display: flex;
  justify-content: center;

  padding: 40px 16px 64px;
}

.app {
  width: 100%;
  max-width: 480px;
}

/* Accessibility */

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Header */

.app-header {
  padding: 8px 4px 28px;
}

.wordmark {
  margin: 0 0 6px;

  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;

  color: var(--grey-500);
}

.tagline {
  margin: 0;

  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.25;

  color: var(--black);
}

/* Dashboard */

.dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;

  gap: 10px;
  margin-bottom: 28px;
}

.dash-card {
  grid-column: span 1;

  background: var(--white);
  border: 1px solid var(--grey-150);
  border-radius: var(--radius);

  padding: 16px 18px;

  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dash-card--primary {
  grid-column: 1 / -1;

  background: var(--black);
  border-color: var(--black);
}

.dash-card--primary .dash-label {
  color: var(--grey-300);
}

.dash-card--primary .dash-value {
  color: var(--white);
  font-size: 2rem;
}

.dash-label {
  font-size: 0.72rem;
  color: var(--grey-500);
}

.dash-value {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;

  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Sections */

.section-heading {
  margin: 0 0 14px;

  font-size: 0.95rem;
  font-weight: 600;

  color: var(--black);
}

.entry,
.ledger,
.analytics {
  background: var(--white);
  border: 1px solid var(--grey-150);
  border-radius: var(--radius);

  padding: 20px 18px;
  margin-bottom: 14px;
}

/* Entry form */

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 0.78rem;
  color: var(--grey-500);
}

.optional {
  color: var(--grey-300);
}

input,
select,
textarea {
  width: 100%;

  font-family: var(--sans);
  font-size: 0.95rem;

  padding: 11px 12px;

  border: 1px solid var(--grey-150);
  border-radius: 8px;

  background: var(--grey-050);
  color: var(--black);

  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

textarea {
  resize: vertical;
  min-height: 76px;
}

input::placeholder,
textarea::placeholder {
  color: var(--grey-300);
}

.amount-input {
  position: relative;

  display: flex;
  align-items: center;
}

.currency-prefix {
  position: absolute;

  left: 12px;

  color: var(--grey-500);

  font-family: var(--mono);
  font-size: 0.95rem;

  pointer-events: none;
}

.amount-input input {
  padding-left: 28px;

  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;

  border-color: var(--black);
  background: var(--white);
}

button:focus-visible {
  outline: 2px solid var(--black);
  outline-offset: 2px;
}

/* Form buttons */

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;

  margin-top: 4px;
}

.add-btn {
  width: 100%;

  padding: 13px;

  border: none;
  border-radius: 8px;

  background: var(--black);
  color: var(--white);

  font-family: var(--sans);
  font-size: 0.95rem;
  font-weight: 600;

  cursor: pointer;

  transition: opacity 0.15s ease;
}

.add-btn:hover {
  opacity: 0.85;
}

.add-btn:active {
  opacity: 0.7;
}

.cancel-btn {
  display: none;

  width: 100%;
  padding: 11px;

  border: 1px solid var(--grey-150);
  border-radius: 8px;

  background: var(--white);
  color: var(--grey-700);

  font-family: var(--sans);
  font-size: 0.9rem;
  font-weight: 500;

  cursor: pointer;
}

.cancel-btn.visible {
  display: block;
}

.cancel-btn:hover {
  border-color: var(--black);
  color: var(--black);
}

/* Search */

.search-box {
  margin-bottom: 12px;
}

.search-box input {
  background: var(--grey-050);
}

/* Filters */

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;

  margin-bottom: 10px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-field label {
  font-size: 0.68rem;
}

.filter-field select,
.filter-field input {
  padding: 9px 8px;
  font-size: 0.8rem;
}

/* Custom date range */

.custom-date-range {
  display: none;

  grid-template-columns: 1fr 1fr;
  gap: 8px;

  padding: 10px;

  margin-bottom: 10px;

  background: var(--grey-050);
  border: 1px solid var(--grey-150);
  border-radius: 8px;
}

.custom-date-range.visible {
  display: grid;
}

/* Transactions */

.expense-list {
  list-style: none;

  margin: 8px 0 0;
  padding: 0;
}

.expense-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;

  padding: 14px 0;

  border-bottom: 1px solid var(--grey-100);
}

.expense-row:last-child {
  border-bottom: none;
}

.expense-info {
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 4px;
}

.expense-desc {
  font-size: 0.95rem;
  font-weight: 500;

  color: var(--black);

  overflow-wrap: break-word;
}

.expense-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;

  font-size: 0.72rem;
  color: var(--grey-500);
}

.expense-meta .dot {
  color: var(--grey-300);
}

.expense-notes {
  margin-top: 3px;

  font-size: 0.75rem;
  line-height: 1.4;

  color: var(--grey-500);

  overflow-wrap: break-word;
}

.expense-side {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  flex-shrink: 0;
}

.expense-amount {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;

  font-size: 0.92rem;
  font-weight: 600;

  color: var(--black);

  white-space: nowrap;
}

.transaction-actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  width: 28px;
  height: 28px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid var(--grey-150);
  border-radius: 50%;

  background: var(--white);
  color: var(--grey-500);

  cursor: pointer;

  font-size: 0.75rem;

  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.action-btn:hover {
  border-color: var(--black);
  color: var(--black);
}

.delete-btn:hover {
  border-color: var(--black);
}

/* Empty state */

.empty-state {
  color: var(--grey-500);

  font-size: 0.88rem;
  line-height: 1.5;

  padding: 16px 0 4px;

  text-align: center;
}

/* Analytics */

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;

  gap: 10px;

  margin-bottom: 22px;
}

.stat-block {
  display: flex;
  flex-direction: column;
  gap: 5px;

  padding: 14px;

  background: var(--grey-050);
  border: 1px solid var(--grey-150);

  border-radius: 8px;
}

.stat-block--wide {
  grid-column: 1 / -1;
}

.stat-label {
  font-size: 0.72rem;
  color: var(--grey-500);
}

.stat-value {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;

  font-size: 1.1rem;
  font-weight: 600;

  color: var(--black);
}

.breakdown-title {
  margin: 0 0 12px;

  font-size: 0.82rem;
  font-weight: 600;

  color: var(--grey-500);
}

.category-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-row {
  display: grid;

  grid-template-columns: 84px 1fr 78px;

  align-items: center;

  gap: 10px;

  font-size: 0.85rem;
}

.category-name {
  color: var(--black);
  font-weight: 500;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-bar-track {
  height: 8px;

  background: var(--grey-100);

  border-radius: 4px;

  overflow: hidden;
}

.category-bar-fill {
  height: 100%;

  background: var(--black);

  border-radius: 4px;

  transition: width 0.25s ease;
}

.category-amount {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;

  text-align: right;

  color: var(--grey-700);
}

.chart-empty {
  color: var(--grey-500);
  font-size: 0.85rem;
}

/* Footer */

.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px 4px 0;
}

.clear-btn {
  border: 1px solid var(--grey-150);
  background: var(--white);
  color: var(--grey-500);

  font-family: var(--sans);
  font-size: 0.82rem;

  padding: 9px 16px;

  border-radius: 8px;

  cursor: pointer;

  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.clear-btn:hover {
  border-color: var(--black);
  color: var(--black);
}

.version-tag {
  font-size: 0.72rem;
  color: var(--grey-300);
}

/* Responsive */

@media (max-width: 420px) {

  body {
    padding: 24px 12px 48px;
  }

  .dashboard {
    gap: 8px;
  }

  .dash-card {
    padding: 14px;
  }

  .dash-card--primary .dash-value {
    font-size: 1.7rem;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .custom-date-range {
    grid-template-columns: 1fr;
  }

  .category-row {
    grid-template-columns: 68px 1fr 68px;
    gap: 8px;
  }

  .expense-row {
    gap: 8px;
  }

  .expense-side {
    flex-direction: column;
    align-items: flex-end;
  }
                   }
