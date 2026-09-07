/**
 * Borrowing Power Calculator Test Suite
 */

const assert = require("assert");
const { calculateBorrowingPower } = require("./borrowingCalculator");

describe("Borrowing Calculator Tests", () => {
  it("Test for calculateBorrowingPower", async () => {
    const result = await calculateBorrowingPower(120000, 2, 1400, 20000, 7.5);
    assert.ok(
      result.maxLoanAmount > 0,
      "Should yield a positive borrowing power amount",
    );
    assert.strictEqual(result.monthlyRepayment, 4300);
    assert.strictEqual(result.maxLoanAmount, 614975.8);
  });

  it("Should return 0 when there is no borrowing capacity", async () => {
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
});
