// Expenses persist in localStorage under this key. Each entry: { id, description, amount, category, date }
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
const clearBtn = document.getElementById('clearBtn');

const monthTotal = document.getElementById('monthTotal');
const monthCount = document.getElementById('monthCount');
const monthAverage = document.getElementById('monthAverage');
const monthLargest = document.getElementById('monthLargest');
const monthTopCategory = document.getElementById('monthTopCategory');
const categoryChart = document.getElementById('categoryChart');

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

function formatDate(isoString) {
  const d = new Date(isoString);
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
    li.innerHTML = `
      <div class="expense-info">
        <span class="expense-desc">${expense.description}</span>
        <span><span class="expense-cat">${expense.category}</span><span class="expense-date">${formatDate(expense.date)}</span></span>
      </div>
      <div>
        <span class="expense-amount">${formatCurrency(expense.amount)}</span>
        <button class="remove-btn" data-id="${expense.id}" aria-label="Remove ${expense.description}">✕</button>
      </div>
    `;
    expenseList.appendChild(li);
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  totalValue.textContent = formatCurrency(total);
  countValue.textContent = expenses.length;

  renderAnalytics();
}

function renderAnalytics() {
  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const total = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  const count = thisMonth.length;
  const average = count > 0 ? total / count : 0;
  const largest = count > 0 ? Math.max(...thisMonth.map((e) => e.amount)) : 0;

  // Sum spending per category, for both the "top category" stat and the chart below.
  const categoryTotals = {};
  thisMonth.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : '—';

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

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!description || isNaN(amount) || amount <= 0) {
    return;
  }

  expenses.push({
    id: Date.now(),
    description,
    amount,
    category,
    date: new Date().toISOString(),
  });

  form.reset();
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
