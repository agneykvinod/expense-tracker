// ===============================
// LEDGER V2.1
// Setup, currency and storage
// ===============================

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function formatCurrency(amount) {
  return currencyFormatter.format(Number(amount) || 0);
}

const STORAGE_KEY = "ledger.expenses";

let expenses = [];
let editingId = null;

// ---------- Load data ----------

function loadExpenses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    expenses = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(expenses)) {
      expenses = [];
    }
  } catch (error) {
    console.error("Could not load expenses:", error);
    expenses = [];
  }
}

// ---------- Save data ----------

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// ---------- Today's date ----------

function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

loadExpenses();// ===============================
// ADD / EDIT / DELETE
// ===============================

function addExpense(description, amount, category, date, notes) {
  const expense = {
    id: Date.now(),
    description: description.trim(),
    amount: Number(amount),
    category,
    date,
    notes: notes.trim()
  };

  expenses.unshift(expense);
  saveExpenses();
}

function updateExpense(id, description, amount, category, date, notes) {
  const index = expenses.findIndex(
    expense => Number(expense.id) === Number(id)
  );

  if (index === -1) return;

  expenses[index] = {
    ...expenses[index],
    description: description.trim(),
    amount: Number(amount),
    category,
    date,
    notes: notes.trim()
  };

  saveExpenses();
}

function deleteExpense(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this transaction?"
  );

  if (!confirmed) return;

  expenses = expenses.filter(
    expense => Number(expense.id) !== Number(id)
  );

  saveExpenses();
  renderAll();
}

// ---------- Start editing ----------

function startEditing(id) {
  const expense = expenses.find(
    item => Number(item.id) === Number(id)
  );

  if (!expense) return;

  editingId = id;

  document.getElementById("description").value =
    expense.description || "";

  document.getElementById("amount").value =
    expense.amount || "";

  document.getElementById("category").value =
    expense.category || "Other";

  document.getElementById("transactionDate").value =
    expense.date || getTodayString();

  document.getElementById("notes").value =
    expense.notes || "";

  document.getElementById("submitBtn").textContent =
    "Update Transaction";

  document.getElementById("cancelEditBtn").style.display =
    "inline-block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ---------- Cancel editing ----------

function cancelEditing() {
  editingId = null;

  document.getElementById("expenseForm").reset();

  document.getElementById("transactionDate").value =
    getTodayString();

  document.getElementById("submitBtn").textContent =
    "Add Transaction";

  document.getElementById("cancelEditBtn").style.display =
    "none";
  // ===============================
// SEARCH / FILTER / SORT
// ===============================

function getFilteredExpenses() {
  const search =
    document.getElementById("searchInput").value
      .toLowerCase()
      .trim();

  const category =
    document.getElementById("filterCategory").value;

  const dateFilter =
    document.getElementById("dateFilter").value;

  const sort =
    document.getElementById("sortFilter").value;

  let result = [...expenses];

  // Search
  if (search) {
    result = result.filter(expense =>
      `${expense.description} ${expense.category} ${expense.notes || ""}`
        .toLowerCase()
        .includes(search)
    );
  }

  // Category
  if (category !== "All") {
    result = result.filter(
      expense => expense.category === category
    );
  }

  // Date filter
  if (dateFilter !== "all") {
    const today = new Date();
    const todayString = getTodayString();

    if (dateFilter === "today") {
      result = result.filter(
        expense => expense.date === todayString
      );
    }

    if (dateFilter === "thisMonth") {
      const month = today.getMonth();
      const year = today.getFullYear();

      result = result.filter(expense => {
        const date = new Date(expense.date);

        return (
          date.getMonth() === month &&
          date.getFullYear() === year
        );
      });
    }

    if (dateFilter === "lastMonth") {
      const lastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );

      result = result.filter(expense => {
        const date = new Date(expense.date);

        return (
          date.getMonth() === lastMonth.getMonth() &&
          date.getFullYear() === lastMonth.getFullYear()
        );
      });
    }
  }

  // Sorting
  if (sort === "newest") {
    result.sort(
      (a, b) =>
        new Date(b.date) - new Date(a.date)
    );
  }

  if (sort === "oldest") {
    result.sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date)
    );
  }

  if (sort === "highest") {
    result.sort(
      (a, b) => Number(b.amount) - Number(a.amount)
    );
  }

  if (sort === "lowest") {
    result.sort(
      (a, b) => Number(a.amount) - Number(b.amount)
    );
  }

  return result;
    }
    }
// ===============================
// RENDER TRANSACTIONS
// ===============================

function renderExpenses() {
  const list = document.getElementById("expenseList");
  const emptyState = document.getElementById("emptyState");

  const filtered = getFilteredExpenses();

  list.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  filtered.forEach(expense => {
    const item = document.createElement("div");

    item.className = "expense-item";

    item.innerHTML = `
      <div>
        <strong>${escapeHTML(expense.description)}</strong>
        <div>${escapeHTML(expense.category)}</div>
        <small>${expense.date || ""}</small>
        ${
          expense.notes
            ? `<p>${escapeHTML(expense.notes)}</p>`
            : ""
        }
      </div>

      <div>
        <strong>${formatCurrency(expense.amount)}</strong>

        <button onclick="startEditing(${expense.id})">
          Edit
        </button>

        <button onclick="deleteExpense(${expense.id})">
          Delete
        </button>
      </div>
    `;

    list.appendChild(item);
  });
}

// ---------- Security helper ----------

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ===============================
// ANALYTICS
// ===============================

function renderAnalytics() {
  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const count = expenses.length;

  document.getElementById("totalValue").textContent =
    formatCurrency(total);

  document.getElementById("countValue").textContent =
    count;

  const now = new Date();

  const monthlyExpenses = expenses.filter(expense => {
    if (!expense.date) return false;

    const date = new Date(expense.date);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });

  const monthTotal = monthlyExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  document.getElementById("monthTotal").textContent =
    formatCurrency(monthTotal);

  document.getElementById("monthCount").textContent =
    monthlyExpenses.length;

  const average =
    monthlyExpenses.length > 0
      ? monthTotal / monthlyExpenses.length
      : 0;

  document.getElementById("monthAverage").textContent =
    formatCurrency(average);

  const largest =
    monthlyExpenses.length > 0
      ? Math.max(
          ...monthlyExpenses.map(
            expense => Number(expense.amount || 0)
          )
        )
      : 0;

  document.getElementById("monthLargest").textContent =
    formatCurrency(largest);

  const categoryTotals = {};

  monthlyExpenses.forEach(expense => {
    categoryTotals[expense.category] =
      (categoryTotals[expense.category] || 0) +
      Number(expense.amount || 0);
  });

  let topCategory = "—";

  if (Object.keys(categoryTotals).length > 0) {
    topCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  document.getElementById("monthTopCategory").textContent =
    topCategory;
}

// ===============================
// FORM EVENTS
// ===============================

document
  .getElementById("expenseForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    const description =
      document.getElementById("description").value;

    const amount =
      document.getElementById("amount").value;

    const category =
      document.getElementById("category").value;

    const date =
      document.getElementById("transactionDate").value ||
      getTodayString();

    const notes =
      document.getElementById("notes").value;

    if (!description.trim() || Number(amount) <= 0) {
      alert("Please enter a valid description and amount.");
      return;
    }

    if (editingId !== null) {
      updateExpense(
        editingId,
        description,
        amount,
        category,
        date,
        notes
      );
    } else {
      addExpense(
        description,
        amount,
        category,
        date,
        notes
      );
    }

    cancelEditing();
    renderAll();
  });

// Cancel edit
document
  .getElementById("cancelEditBtn")
  .addEventListener("click", cancelEditing);

// Search and filters
[
  "searchInput",
  "filterCategory",
  "dateFilter",
  "sortFilter"
].forEach(id => {
  document
    .getElementById(id)
    .addEventListener("input", renderExpenses);

  document
    .getElementById(id)
    .addEventListener("change", renderExpenses);
});

// ===============================
// CLEAR ALL
// ===============================

document
  .getElementById("clearBtn")
  .addEventListener("click", function() {

    if (expenses.length === 0) return;

    const confirmed = confirm(
      "Delete ALL transactions?"
    );

    if (!confirmed) return;

    expenses = [];

    saveExpenses();
    renderAll();
  });

// ===============================
// MAIN RENDER
// ===============================

function renderAll() {
  renderExpenses();
  renderAnalytics();
}

// Initial setup
document.getElementById("transactionDate").value =
  getTodayString();

document.getElementById("cancelEditBtn").style.display =
  "none";

renderAll();
