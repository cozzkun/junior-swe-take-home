/**
 * Borrowing Power Calculator
 *
 * Cozza's refactored prototype.
 * This currently calculates what a user can borrow over 30 years.
 */

// Global constant for mortgage simulation
const LOAN_TERM_MONTHS = 360;
const INTEREST_RATE = 7.0;
const ASSESSMENT_RATE_BUFFER = 3.0;

const API_BASE_URL = "http://localhost:3000";
const PAT = "pat_abcdefghijklmnopqrstuvwxyz0123456789";

// Handles shared API request logic
async function fetchApiData(url, apiName) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${PAT}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${apiName} API request failed: ${response.status}`);
  }

  return await response.json();
}

// Tax and HEM requests using shared API helper
async function getTax(income) {
  const data = await fetchApiData(
    `${API_BASE_URL}/api/tax?income=${income}`,
    "Tax",
  );
  return data.tax;
}

async function getHEM(income, dependents) {
  const data = await fetchApiData(
    `${API_BASE_URL}/api/hem?income=${income}&dependents=${dependents}`,
    "HEM",
  );
  return data.hem;
}

/**
 * Calculates the total borrowing power amount and the monthly repayment configuration
 */

async function calculateBorrowingPower(
  income,
  dependents,
  expenses,
  creditLimits,
  annualAssessmentRate,
) {
  // Reject invalid and negative inputs before making API requests
  if (
    !Number.isFinite(income) ||
    !Number.isFinite(dependents) ||
    !Number.isFinite(expenses) ||
    !Number.isFinite(creditLimits) ||
    !Number.isFinite(annualAssessmentRate) ||
    income < 0 ||
    dependents < 0 ||
    expenses < 0 ||
    creditLimits < 0 ||
    annualAssessmentRate < 0
  ) {
    throw new Error("Inputs must be valid and non negative");
  }

  // 1. Calculate Net Monthly Income after tax deductions
  const annualTax = await getTax(income);
  const netMonthlyIncome = (income - annualTax) / 12;

  // 2. Determine living expenses (User declared expenses vs HEM baseline, whichever is higher)
  const baselineHEM = await getHEM(income, dependents);
  const totalLivingExpenses = Math.max(expenses, baselineHEM);

  // 3. Calculate credit card liability (~3% of total limits)
  const creditCardLiability = creditLimits * 0.03;

  // 4. Calculate monthly repayment capacity
  const maxMonthlyRepayment =
    netMonthlyIncome - totalLivingExpenses - creditCardLiability;

  // Return 0 if user cannot afford loan
  if (maxMonthlyRepayment <= 0) {
    return { maxLoanAmount: 0, monthlyRepayment: 0 };
  }

  // 5. Calculate the monthly interest rate
  const monthlyRate = annualAssessmentRate / 100 / 12;

  // 6. Calculate maximum borrowing power using the following formula:
  // P = M * (1 - (1 + R)^-N) / R
  const maxLoanAmount =
    maxMonthlyRepayment *
    ((1 - Math.pow(1 + monthlyRate, -LOAN_TERM_MONTHS)) / monthlyRate);

  return {
    maxLoanAmount: Number(maxLoanAmount.toFixed(2)),
    monthlyRepayment: Number(maxMonthlyRepayment.toFixed(2)),
  };
}

function runConsoleMode() {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Mortgage Borrowing Power Calculator");
  console.log("===================================");

  rl.question("Gross Annual Income: $", (income) => {
    rl.question("Number of Dependents: ", (dependents) => {
      rl.question("Declared Monthly Expenses: $", (expenses) => {
        rl.question("Total Credit Card Limits: $", async (creditLimits) => {
          const assessmentRate = INTEREST_RATE + ASSESSMENT_RATE_BUFFER;

          try {
            const result = await calculateBorrowingPower(
              parseFloat(income),
              parseInt(dependents),
              parseFloat(expenses),
              parseFloat(creditLimits),
              assessmentRate,
            );

            console.log("\n--- Calculation Summary ---");
            console.log(
              `Maximum Borrowing Power at ${INTEREST_RATE}%: $${result.maxLoanAmount.toLocaleString()}`,
            );
            console.log(
              `Assumed Monthly Mortgage Repayment: $${result.monthlyRepayment.toLocaleString()} over 30 years`,
            );
          } catch (error) {
            console.error(`Unable to calculate: ${error.message}`);
          }

          rl.close();
        });
      });
    });
  });
}

if (require.main === module) {
  runConsoleMode();
}

module.exports = { calculateBorrowingPower, getTax, getHEM, fetchApiData };
