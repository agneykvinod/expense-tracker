// ==========================================
// LEDGER AI — LOCAL FINANCIAL ASSISTANT
// ==========================================

const STORAGE_KEY = "ledger.expenses";

// ------------------------------
// Load Ledger expenses
// ------------------------------

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Could not load Ledger data:", error);
    return [];
  }
}


// ------------------------------
// DOM elements
// ------------------------------

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const quickButtons = document.querySelectorAll(".quick-btn");


// ------------------------------
// Currency formatter
// ------------------------------

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function formatCurrency(amount) {
  return currencyFormatter.format(amount || 0);
}


// ------------------------------
// Date helpers
// ------------------------------

function isThisMonth(expense) {
  if (!expense.date) return false;

  const date = new Date(expense.date);

  if (isNaN(date.getTime())) return false;

  const now = new Date();

  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}


// ------------------------------
// Get current month's expenses
// ------------------------------

function getMonthlyExpenses() {
  const expenses = loadExpenses();

  return expenses.filter(isThisMonth);
}


// ------------------------------
// Total spending
// ------------------------------

function getTotal(expenses) {
  return expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );
}


// ------------------------------
// Category totals
// ------------------------------

function getCategoryTotals(expenses) {

  const totals = {};

  expenses.forEach((expense) => {

    const category = expense.category || "Other";

    totals[category] =
      (totals[category] || 0) +
      Number(expense.amount || 0);

  });

  return totals;
}


// ------------------------------
// Biggest expenses
// ------------------------------

function getBiggestExpenses(expenses) {

  return [...expenses]
    .sort(
      (a, b) =>
        Number(b.amount || 0) -
        Number(a.amount || 0)
    )
    .slice(0, 5);
}


// ------------------------------
// Add message to chat
// ------------------------------

function addMessage(text, sender) {

  const message = document.createElement("div");

  message.className =
    sender === "user"
      ? "message user-message"
      : "message assistant-message";


  const label = document.createElement("div");

  label.className = "message-label";

  label.textContent =
    sender === "user"
      ? "You"
      : "Ledger AI";


  const bubble = document.createElement("div");

  bubble.className = "message-bubble";

  // textContent prevents user-entered HTML from being executed.
  bubble.textContent = text;


  message.appendChild(label);
  message.appendChild(bubble);

  chatMessages.appendChild(message);

  chatMessages.scrollTop =
    chatMessages.scrollHeight;
}


// ------------------------------
// Analyse user question
// ------------------------------

function generateResponse(question) {

  const q = question.toLowerCase().trim();

  const expenses = loadExpenses();

  const monthlyExpenses =
    expenses.filter(isThisMonth);

  const monthlyTotal =
    getTotal(monthlyExpenses);

  const categoryTotals =
    getCategoryTotals(monthlyExpenses);


  // --------------------------------
  // No data
  // --------------------------------

  if (expenses.length === 0) {

    return (
      "I don't have any expenses to analyse yet. " +
      "Add a few transactions in Ledger first, " +
      "then come back and ask me about your spending."
    );
  }


  // --------------------------------
  // Total spending
  // --------------------------------

  if (
    q.includes("how much") &&
    (
      q.includes("spent") ||
      q.includes("spend") ||
      q.includes("spending")
    )
  ) {

    if (monthlyExpenses.length === 0) {

      return (
        "You haven't recorded any expenses " +
        "for this month yet."
      );

    }

    return (
      "You have spent " +
      formatCurrency(monthlyTotal) +
      " this month across " +
      monthlyExpenses.length +
      " transaction" +
      (monthlyExpenses.length === 1 ? "." : "s.")
    );
  }


  // --------------------------------
  // Biggest category
  // --------------------------------

  if (
    q.includes("most") ||
    q.includes("highest") ||
    q.includes("biggest category") ||
    q.includes("where do i spend")
  ) {

    if (monthlyExpenses.length === 0) {

      return (
        "There isn't enough spending data " +
        "from this month yet."
      );

    }

    const sorted =
      Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    const topCategory = sorted[0];

    const percentage =
      monthlyTotal > 0
        ? ((topCategory[1] / monthlyTotal) * 100).toFixed(1)
        : 0;

    return (
      "Your highest spending category this month " +
      "is " +
      topCategory[0] +
      " at " +
      formatCurrency(topCategory[1]) +
      ". That's approximately " +
      percentage +
      "% of your recorded spending."
    );
  }


  // --------------------------------
  // Category questions
  // --------------------------------

  const categories = [
    "food",
    "groceries",
    "fuel",
    "bills",
    "transport",
    "housing",
    "leisure",
    "other"
  ];

  const mentionedCategory =
    categories.find(category =>
      q.includes(category)
    );


  if (
    mentionedCategory &&
    (
      q.includes("how much") ||
      q.includes("spent") ||
      q.includes("spend")
    )
  ) {

    const categoryName =
      mentionedCategory.charAt(0).toUpperCase() +
      mentionedCategory.slice(1);

    const amount =
      categoryTotals[categoryName] || 0;

    return (
      "You have spent " +
      formatCurrency(amount) +
      " on " +
      categoryName +
      " this month."
    );
  }


  // --------------------------------
  // Biggest expenses
  // --------------------------------

  if (
    q.includes("biggest expense") ||
    q.includes("largest expense") ||
    q.includes("top expenses")
  ) {

    const biggest =
      getBiggestExpenses(monthlyExpenses);

    if (biggest.length === 0) {

      return (
        "You don't have any expenses " +
        "recorded this month."
      );

    }

    let response =
      "Your largest expenses this month are:\n\n";

    biggest.forEach((expense, index) => {

      response +=
        (index + 1) +
        ". " +
        expense.description +
        " — " +
        formatCurrency(expense.amount) +
        "\n";

    });

    return response;
  }


  // --------------------------------
  // Saving advice
  // --------------------------------

  if (
    q.includes("save") ||
    q.includes("saving") ||
    q.includes("reduce spending") ||
    q.includes("cut expenses")
  ) {

    if (monthlyExpenses.length === 0) {

      return (
        "Start by recording your expenses. " +
        "Once I have some spending data, " +
        "I can identify your biggest categories " +
        "and suggest areas to review."
      );
    }

    const sorted =
      Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    const topCategory = sorted[0];

    const potentialSaving =
      topCategory[1] * 0.15;

    return (
      "Your largest spending category is " +
      topCategory[0] +
      " at " +
      formatCurrency(topCategory[1]) +
      ".\n\n" +
      "A practical starting point would be to " +
      "review that category and see whether you " +
      "can reduce it by around 15%.\n\n" +
      "That would represent approximately " +
      formatCurrency(potentialSaving) +
      " in potential monthly savings."
    );
  }


  // --------------------------------
  // Transaction count
  // --------------------------------

  if (
    q.includes("transaction") ||
    q.includes("transactions")
  ) {

    return (
      "You have recorded " +
      monthlyExpenses.length +
      " transaction" +
      (monthlyExpenses.length === 1 ? "" : "s") +
      " this month."
    );
  }


  // --------------------------------
  // Average transaction
  // --------------------------------

  if (
    q.includes("average") ||
    q.includes("avg")
  ) {

    if (monthlyExpenses.length === 0) {

      return (
        "There isn't enough data to calculate " +
        "your average transaction yet."
      );

    }

    const average =
      monthlyTotal / monthlyExpenses.length;

    return (
      "Your average transaction this month " +
      "is " +
      formatCurrency(average) +
      "."
    );
  }


  // --------------------------------
  // General spending summary
  // --------------------------------

  if (
    q.includes("summary") ||
    q.includes("overview") ||
    q.includes("financial")
  ) {

    if (monthlyExpenses.length === 0) {

      return (
        "You don't have any expenses recorded " +
        "for this month yet."
      );

    }

    const sorted =
      Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    let response =
      "Here's your spending summary for this month:\n\n";

    response +=
      "Total: " +
      formatCurrency(monthlyTotal) +
      "\n";

    response +=
      "Transactions: " +
      monthlyExpenses.length +
      "\n";

    response +=
      "Top category: " +
      sorted[0][0] +
      " (" +
      formatCurrency(sorted[0][1]) +
      ")";

    return response;
  }


  // --------------------------------
  // Help
  // --------------------------------

  if (
    q.includes("help") ||
    q.includes("what can you do")
  ) {

    return (
      "I can analyse the expense data stored in " +
      "your Ledger.\n\n" +
      "Try asking:\n" +
      "• How much did I spend?\n" +
      "• Where do I spend the most?\n" +
      "• How much did I spend on food?\n" +
      "• What are my biggest expenses?\n" +
      "• How can I save?\n" +
      "• What's my average transaction?\n" +
      "• Give me a spending summary."
    );
  }


  // --------------------------------
  // Fallback
  // --------------------------------

  return (
    "I can currently answer questions about " +
    "your recorded expenses, categories, spending " +
    "and saving opportunities.\n\n" +
    "Try asking something like " +
    "\"Where do I spend the most?\""
  );
}


// ------------------------------
// Send message
// ------------------------------

function sendMessage(question) {

  const cleanQuestion =
    question.trim();

  if (!cleanQuestion) return;


  // User message
  addMessage(
    cleanQuestion,
    "user"
  );


  // Small delay for natural chat feel
  setTimeout(() => {

    const response =
      generateResponse(cleanQuestion);

    addMessage(
      response,
      "assistant"
    );

  }, 350);
}


// ------------------------------
// Form submission
// ------------------------------

chatForm.addEventListener("submit", (event) => {

  event.preventDefault();

  const question =
    chatInput.value.trim();

  if (!question) return;

  chatInput.value = "";

  sendMessage(question);

  chatInput.focus();

});


// ------------------------------
// Quick question buttons
// ------------------------------

quickButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const question =
      button.dataset.question;

    if (!question) return;

    sendMessage(question);

  });

});
