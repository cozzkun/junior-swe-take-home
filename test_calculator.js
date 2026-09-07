/**
 * Borrowing Power Calculator Test Suite
 */

const assert = require("assert");
const { calculateBorrowingPower, getHEM } = require("./borrowingCalculator");

describe("Borrowing Power Calculator Tests", () => {
  it("Test for calculateBorrowingPower", async () => {
    const result = await calculateBorrowingPower(120000, 2, 1400, 20000, 7.5);
    assert.ok(
      result.maxLoanAmount > 0,
      "Should yield a positive borrowing power amount",
    );
    assert.strictEqual(result.monthlyRepayment, 4300);
    assert.strictEqual(result.maxLoanAmount, 614975.8);
  });

  it("Return 0 when there is no borrowing capacity", async () => {
    const result = await calculateBorrowingPower(30000, 3, 4000, 5000, 7.5);
    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
  });

  it("Throw error for negative inputs", async () => {
    await assert.rejects(
      calculateBorrowingPower(-120000, 2, 1400, 20000, 7.5),
      /Inputs cannot be negative/,
    );
  });

  describe("HEM income level tests", () => {
    const testCases = [
      { income: 30000, dependents: 0, expectedHEM: 1600 },
      { income: 30000, dependents: 1, expectedHEM: 2100 },
      { income: 30000, dependents: 2, expectedHEM: 2500 },
      { income: 30000, dependents: 3, expectedHEM: 2800 },

      { income: 70000, dependents: 0, expectedHEM: 2200 },
      { income: 70000, dependents: 1, expectedHEM: 2700 },
      { income: 70000, dependents: 2, expectedHEM: 3100 },
      { income: 70000, dependents: 3, expectedHEM: 3500 },

      { income: 160000, dependents: 0, expectedHEM: 2600 },
      { income: 160000, dependents: 1, expectedHEM: 3100 },
      { income: 160000, dependents: 2, expectedHEM: 3600 },
      { income: 160000, dependents: 3, expectedHEM: 4100 },
    ];

    testCases.forEach(({ income, dependents, expectedHEM }) => {
      it(`returns ${expectedHEM} for income ${income} with ${dependents} dependents`, async () => {
        const result = await getHEM(income, dependents);

        assert.strictEqual(result, expectedHEM);
      });
    });
  });
});
