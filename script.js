// Expenses persist in localStorage under this key. Each entry: { id, description, amount, category, date }
// Older (v1.1) entries may be missing "date" — every function below tolerates that.
const STORAGE_KEY = 'ledger.expenses';

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Could not read saved expenses:', err);
    return [];
  }
}

function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('Could not save expenses:', err);
  }
}

let expenses = loadExpenses();

const form = document.getElementById('expenseForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const expenseList = document.getElementById('expenseList');
const emptyState = document.getElementById('emptyState');
const totalValue = document.getElementById('totalValue');
const countValue = document.getElementById('countValue');
const dashMonthValue = document.getElementById('dashMonthValue');
const clearBtn = document.getElementById('clearBtn');

const monthTotal = document.getElementById('monthTotal');
const monthCount = document.getElementById('monthCount');
const monthAverage = document.getElementById('monthAverage');
const monthLargest = document.getElementById('monthLargest');
const monthTopCategory = document.getElementById('monthTopCategory');
const categoryChart = document.getElementById('categoryChart');
const moneyImpact = document.getElementById('moneyImpact');
const moneyImpactTitle = document.getElementById('moneyImpactTitle');
const moneyImpactText = document.getElementById('moneyImpactText');

let moneyImpactTimer;
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(amount) {
  return currencyFormatter.format(amount || 0);
}

// Returns a short display date, or a placeholder for older entries saved without one.
function formatDate(isoString) {
  if (!isoString) return 'No date';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'No date';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function render() {
  // Rebuild the list from scratch — simplest way to keep DOM in sync with data.
  expenseList.innerHTML = '';

  if (expenses.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }

  expenses.forEach((expense) => {
    const li = document.createElement('li');
    li.className = 'expense-row';
    const category = expense.category || 'Other';
    li.innerHTML = `
      <div class="expense-info">
        <span class="expense-desc">${expense.description}</span>
        <span class="expense-meta">
          <span class="expense-category">${category}</span>
          <span class="dot">·</span>
          <span class="expense-date">${formatDate(expense.date)}</span>
        </span>
      </div>
      <div class="expense-side">
        <span class="expense-amount">${formatCurrency(expense.amount)}</span>
        <button class="remove-btn" data-id="${expense.id}" aria-label="Remove ${expense.description}">✕</button>
      </div>
    `;
    expenseList.appendChild(li);
  });

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  totalValue.textContent = formatCurrency(total);
  countValue.textContent = expenses.length;

  renderAnalytics();
}

function renderAnalytics() {
  const now = new Date();

  // Entries without a valid date (older records) are excluded from "this month"
  // math but still show up in the transaction list and lifetime total above.
  const thisMonth = expenses.filter((e) => {
    if (!e.date) return false;
    const d = new Date(e.date);
    if (isNaN(d.getTime())) return false;
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const total = thisMonth.reduce((sum, e) => sum + (e.amount || 0), 0);
  const count = thisMonth.length;
  const average = count > 0 ? total / count : 0;
  const largest = count > 0 ? Math.max(...thisMonth.map((e) => e.amount || 0)) : 0;

  // Sum spending per category, for both the "top category" stat and the chart below.
  const categoryTotals = {};
  thisMonth.forEach((e) => {
    const category = e.category || 'Other';
    categoryTotals[category] = (categoryTotals[category] || 0) + (e.amount || 0);
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : '—';

  dashMonthValue.textContent = formatCurrency(total);
  monthTotal.textContent = formatCurrency(total);
  monthCount.textContent = count;
  monthAverage.textContent = formatCurrency(average);
  monthLargest.textContent = formatCurrency(largest);
  monthTopCategory.textContent = topCategory;

  categoryChart.innerHTML = '';

  if (sortedCategories.length === 0) {
    categoryChart.innerHTML = '<p class="chart-empty">No expenses this month yet.</p>';
    return;
  }

  const highest = sortedCategories[0][1];

  sortedCategories.forEach(([category, amount]) => {
    const row = document.createElement('div');
    row.className = 'category-row';
    const widthPercent = highest > 0 ? Math.max((amount / highest) * 100, 4) : 0;
    row.innerHTML = `
      <span class="category-name">${category}</span>
      <span class="category-bar-track"><span class="category-bar-fill" style="width: ${widthPercent}%"></span></span>
      <span class="category-amount">${formatCurrency(amount)}</span>
    `;
    categoryChart.appendChild(row);
  });
}
function showMoneyImpact(expense) {
  const monthlyExpenses = expenses.filter((e) => {
    if (!e.date) return false;

    const d = new Date(e.date);

    if (isNaN(d.getTime())) return false;

    const now = new Date();

    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  const monthlyTotal = monthlyExpenses.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );

  const categoryTotals = {};

  monthlyExpenses.forEach((e) => {
    const category = e.category || 'Other';

    categoryTotals[category] =
      (categoryTotals[category] || 0) + (e.amount || 0);
  });

  const category = expense.category || 'Other';

  const categoryTotal =
    categoryTotals[category] || 0;

  const percentage =
    monthlyTotal > 0
      ? ((categoryTotal / monthlyTotal) * 100).toFixed(1)
      : 0;

  const largestExpense =
    monthlyExpenses.length > 0
      ? Math.max(...monthlyExpenses.map((e) => e.amount || 0))
      : expense.amount;

  // Special message if this is the largest expense
  if (expense.amount >= largestExpense) {
    moneyImpactTitle.textContent = 'New largest expense';

    moneyImpactText.textContent =
      `${formatCurrency(expense.amount)} · ${category}`;
  } else {
    moneyImpactTitle.textContent =
      `${formatCurrency(expense.amount)} added`;

    moneyImpactText.textContent =
      `${category} is now ${percentage}% of your monthly spending.`;
  }

  moneyImpact.classList.add('show');

  clearTimeout(moneyImpactTimer);

  moneyImpactTimer = setTimeout(() => {
    moneyImpact.classList.remove('show');
  }, 4000);
         }

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!description || isNaN(amount) || amount <= 0) {
    return;
  }

  const newExpense = {
  id: Date.now(),
  description,
  amount,
  category,
  date: new Date().toISOString(),
};

expenses.push(newExpense);

form.reset();

showMoneyImpact(newExpense);
  descriptionInput.focus();
  saveExpenses();
  render();
});

expenseList.addEventListener('click', (event) => {
  const button = event.target.closest('.remove-btn');
  if (!button) return;

  const id = Number(button.dataset.id);
  expenses = expenses.filter((e) => e.id !== id);
  saveExpenses();
  render();
});

clearBtn.addEventListener('click', () => {
  if (expenses.length === 0) return;
  if (confirm('Clear all expenses?')) {
    expenses = [];
    saveExpenses();
    render();
  }
});

render();

/* =================================
   INCOME + INCOME vs SPENDING
================================= */

// Income persists in localStorage under its own key. Each entry: { id, source, amount, date }
const INCOME_KEY = 'ledger.income';

function loadIncome() {
  try {
    const raw = localStorage.getItem(INCOME_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Could not read saved income:', err);
    return [];
  }
}

function saveIncome() {
  try {
    localStorage.setItem(INCOME_KEY, JSON.stringify(incomeEntries));
  } catch (err) {
    console.error('Could not save income:', err);
  }
}

let incomeEntries = loadIncome();

const incomeForm = document.getElementById('incomeForm');
const incomeSourceInput = document.getElementById('incomeSource');
const incomeAmountInput = document.getElementById('incomeAmount');
const incomeTotalEl = document.getElementById('incomeTotal');
const incomeListEl = document.getElementById('incomeList');

function renderIncome() {
  incomeListEl.innerHTML = '';

  if (incomeEntries.length === 0) {
    incomeListEl.innerHTML = '<p class="chart-empty">No income added yet.</p>';
  }

  incomeEntries.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'expense-row';
    row.innerHTML = `
      <div class="expense-info">
        <span class="expense-desc"></span>
        <span class="expense-meta">${formatDate(entry.date)}</span>
      </div>
      <div class="expense-side">
        <span class="expense-amount">${formatCurrency(entry.amount)}</span>
        <button class="remove-btn" type="button" data-id="${entry.id}">✕</button>
      </div>
    `;
    // textContent (not innerHTML) so a typed source name can never run as HTML.
    row.querySelector('.expense-desc').textContent = entry.source;
    row.querySelector('.remove-btn').setAttribute('aria-label', 'Remove ' + entry.source);
    incomeListEl.appendChild(row);
  });

  const totalIncome = incomeEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  incomeTotalEl.textContent = formatCurrency(totalIncome);
}

function updateMoneyAnalysis() {
  const income = incomeEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const available = income - totalExpenses;

  document.getElementById('analysisIncome').textContent = formatCurrency(income);
  document.getElementById('analysisExpense').textContent = formatCurrency(totalExpenses);
  document.getElementById('analysisAvailable').textContent = formatCurrency(available);

  const result = document.getElementById('analysisResult');

  if (income === 0) {
    result.textContent = 'Add your income and expenses to see your financial position.';
  } else if (available < 0) {
    result.textContent = '⚠ Your spending is higher than your recorded income. Review your expenses.';
  } else if (totalExpenses / income >= 0.8) {
    result.textContent = '⚠ Most of your income is being spent. There may be room to optimise.';
  } else {
    result.textContent = '✓ You have a positive surplus. This can become the basis for your savings and investment plan.';
  }
}

incomeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const source = incomeSourceInput.value.trim();
  const amount = parseFloat(incomeAmountInput.value);

  if (!source || isNaN(amount) || amount <= 0) {
    return;
  }

  incomeEntries.push({
    id: Date.now(),
    source,
    amount,
    date: new Date().toISOString(),
  });

  incomeForm.reset();
  saveIncome();
  renderIncome();
  updateMoneyAnalysis();
  incomeSourceInput.focus();
});

incomeListEl.addEventListener('click', (event) => {
  const button = event.target.closest('.remove-btn');
  if (!button) return;

  const id = Number(button.dataset.id);
  incomeEntries = incomeEntries.filter((e) => e.id !== id);
  saveIncome();
  renderIncome();
  updateMoneyAnalysis();
});

renderIncome();
updateMoneyAnalysis();
/* =========================================
   PAGE NAVIGATION
========================================= */

const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page-section");

navButtons.forEach(button => {
  button.addEventListener("click", () => {

    const pageName = button.dataset.page;

    // Hide all pages
    pages.forEach(page => {
      page.classList.add("hidden");
    });

    // Show selected page
    const selectedPage = document.getElementById(
      pageName === "home" ? "homePage" :
      pageName === "income" ? "incomepage" :
      pageName === "insights" ? "insightsPage" :
      pageName === "ai.html" ? "aiPage" : ""
    );

    if (selectedPage) {
      selectedPage.classList.remove("hidden");
    }

    // Update active button
    navButtons.forEach(btn => {
      btn.classList.remove("active");
    });
    button.classList.add("active");

    // Refresh financial analysis
    if (pageName === "income") {
      updateMoneyAnalysis();
    }
  });
});
