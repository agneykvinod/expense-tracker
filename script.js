// Expenses persist in localStorage under this key. Each entry: { id, description, amount, category }
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

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
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
        <span class="expense-cat">${expense.category}</span>
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
