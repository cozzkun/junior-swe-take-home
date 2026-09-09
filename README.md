# Borrowing Power Calculator

This is a simplified borrowing power calculator written in JavaScript.

The prototype used placeholder functions for Tax and HEM. These have been replaces with API calls to the provided local API. The calculator and tests have been updated accordingly to work asynchronously.

The calculator uses:

- Annual income
- Number of dependents
- Declared monthly expenses
- Credit card limit

Tax and HEM data are returned by the API to calculate repayment capacity and maximum borrowing power.

## Setup

Make sure Node.js is installed and run:
npm install

## Running the API

Start the local API in a separate terminal:
npm run api

The server runs at:
http://localhost:3000

The API terminal must be running while using the calculator or running tests.

## Running the Calculator

In another terminal run:
npm start

The calculator will ask for income, dependents, monthly expenses and credit card limits before displaying the borrowing power and monthly repayment amount.

## Running the Tests

Ensure the API is running, then run:
npm test

The test suite covers:

- Standard borrowing power calculations
- No borrowing capacity
- Negative and invalid inputs
- HEM values for different income levels and dependent counts
- Tax values for different income levels
- Failed Tax and HEM API requests

## Design Decisions

### Orchestrator Function

I have kept the calculator function-based and used `calculateBorrowingPower()` as the main orchestrator.

It handles input validation, retrieves the Tax and HEM values and performs the borrowing power calculations.

I decided against introducing a class to keep the overall structure simple and focused on adapting the existing functions that already have defined responsibilities.

### Shared API Helper

`getTax()` and `getHEM()` originally contained the same API logic.

The logic flows as follows:

- fetch()
- PAT authentication
- Checking response.ok
- Parsing the JSON response.

I have moved the shared request logic using a helper function:
fetchApiData(url, apiName)

This avoids repeating request logic in `getTax()` and `getHEM()`

### Async + Await

As `getTax()` and `getHEM()` have now been changed to make API requests, they are asynchronous and return Promises which need to be accounted for.

`calculateBorrowingPower()` was also made asynchronous so it can wait for Tax and HEM values before carrying out further calculations.

Existing tests were also adjusted for this.

### Input Validation

User inputs are checked at the start of `calculateBorrowingPower()` before any API requests are made.

The validation accounts for:

- Negative values
- NaN
- Infinity
- undefined
- zero assessment rate
- non integer dependent values

If the inputs are valid but there is no repayment capacity, the calculator returns 0 for both borrowing power and monthly repayment.

## Testing Approach

Existing tests in test_calculator.js were updated to account for async.

As HEM is calculated using both income level and number of dependents, I stored the expected HEM cases in an array and looped through the array using `forEach()` which creates a separate test for each combination.

The same method was used for negative and invalid inputs which helped with reducing repeated code.

Tax is tested using values across 3 different income levels to ensure tax calculations return the expected value.

The shared API helper is tested by using an invalid endpoint to confirm failed Tax and HEM requests would reject with the expected error.

## Assumptions

- The provided local API is running at http://localhost:3000.
- The provided PAT is valid.
- Console inputs are parsed into numbers before being passed into calculations.
- HEM is treasted as a monthly living expense baseline.
- Calculator will use the higher value between declared monthly expenses and HEM.
- Credit card liability is estimated to be 3% of total credit card limits.
- Loan term remains at 30 years.
- The provided borrowing power formula and mortgage assumptions have been kept.

## Tradeoffs

The Tax and HEM tests require the local API instead of mocking `fetch()`.

This means the API must be running for the tests to work, it ensures the tests have to pass through the real request flow (authentication, response handling and JSON parsing).

I have kept the solution function based instead of introducing a class as this implementation kept things simple whilst still ensuring key responsibilities within the calculator are still separate.
