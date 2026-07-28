# QA Technical Assessment: Findings, Defect Report & Risk Analysis

**Application Under Test**: [Checkout QA Lab](https://qa-checkout-task.onrender.com/)  
**Candidate Account**: Configured via environment (`.env`)  
**Assessment Date**: July 2026  

---

## Executive Summary

During the exploratory and automated regression testing of the **Shopper Checkout Application**, several **critical functional defects and security risks** were identified. While basic user flows (product search, adding items to basket, valid order completion) function as intended under happy-path conditions, the application fails to enforce critical business logic, payment security rules, stock integrity, and idempotency control.

An automated BDD regression suite (Playwright + Cucumber) was constructed to validate all scenarios specified in the ticket brief. The execution of the suite surfaced **4 major defect areas** where application behavior violates specified acceptance criteria and business validation rules.

---

## Key Defect Findings

### Defect 1: Duplicate & Combined Promotional Discount Stacking (Critical)

- **Severity**: High / Critical (Financial Impact)
- **Ticket Acceptance Criteria**: *"Promotional offers cannot be combined with other offers or discounts."*
- **Observed Behavior**:
  - Pushing the `SAVE10` promo code multiple times successfully adds multiple `SAVE10` entries into the applied promos array: `["SAVE10", "SAVE10"]`.
  - The subtotal discount recalculates iteratively on each click: applying `SAVE10` twice on a £2,598 basket results in a £519.60 discount (20% total discount).
  - Applying `WELCOME5` on top further stacks a £5 discount, producing `["SAVE10", "SAVE10", "WELCOME5"]` and reducing total payable to £2,073.40.
- **Business & Financial Risk**: Shoppers can exploit promo codes to claim unintended cumulative discounts, leading to revenue loss.
- **Automated Test Evidence**: `Prevent the same promotional offer from being applied multiple times` scenario assertions failed with:
  > *Defect detected: Promotional offer WELCOME5 was applied 2 times instead of being restricted to once.*

---

### Defect 2: Payment Details Validation Bypass & Declined Card Acceptance (Critical)

- **Severity**: Critical (Financial & Security Impact)
- **Ticket Validation Rule**: *"Required delivery and payment details must be provided before placing an order."* / *"Declined card: 4000000000000002"*
- **Observed Behavior**:
  - Entering invalid or blank payment details (e.g. `""`, `"1234"`, `"invalid-card"`) or the explicitly specified **Declined Card** (`4000000000000002`) bypasses backend payment verification.
  - The API responds with HTTP 201 Created and returns a confirmed order object (`status: "Confirmed"`).
- **Business & Financial Risk**: Unauthenticated or unauthorized card submissions generate real confirmed orders without payment clearance, exposing the platform to severe fraud and unfulfilled inventory lockup.
- **Automated Test Evidence**: `Prevent order placement with invalid payment details` scenario assertions failed with:
  > *Defect detected: Order ORD-10001 was successfully created despite invalid payment details!*

---

### Defect 3: Incorrect Stock Reduction Math After Order Completion (Major)

- **Severity**: High (Inventory Integrity Impact)
- **Ticket Validation Rule**: *"Basket quantities should respect product availability."*
- **Observed Behavior**:
  - When completing a purchase of 1 unit of `NovaBook Pro 13` (initial stock: 6 units), the catalogue stock count drops directly to `0 in stock` instead of `5 in stock`.
  - Investigation of backend logic indicates stock calculation wipes out available inventory upon purchase rather than subtracting `purchasedQuantity`.
- **Business & Financial Risk**: False stock depletion prematurely marks products out of stock, causing missed sales opportunities and inaccurate inventory reporting.
- **Automated Test Evidence**: `Update available stock after a successful purchase` scenario assertions failed with:
  > *Defect detected: Product stock went from 6 to 0 instead of expected 5 after purchasing 1 unit(s).*

---

### Defect 4: Lack of Idempotency Control on Repeat Order Submission (Major)

- **Severity**: Medium / High (Customer Experience & Order Duplication)
- **Observed Behavior**:
  - Clicking the **Place Order** button multiple times in rapid succession submits multiple concurrent requests to `/api/checkout`.
  - The server processes each request independently and generates multiple distinct confirmed orders (`ORD-10001`, `ORD-10002`, `ORD-10003`) for a single checkout interaction.
- **Business Risk**: Shoppers with unstable network connections or double-clicking submit buttons are double-billed or issued duplicate orders.
- **Automated Test Evidence**: `Prevent duplicate orders from repeated order submission` scenario assertions failed with:
  > *Defect detected: 3 orders were created from rapid repeat submissions instead of only 1.*

---

## Test Prioritisation & Coverage Strategy

### Risk-Based Priority Matrix

| Feature Area | Risk Level | Rationale & Automated Coverage |
| :--- | :--- | :--- |
| **Payment & Checkout** | **Critical** | Core revenue flow. Automated payment validation, order creation, and terms acceptance. |
| **Promo Code Calculation** | **High** | High financial risk due to offer stacking bugs. Automated single & multi-apply scenarios. |
| **Stock & Inventory** | **High** | Critical for order fulfillment. Automated stock verification before and after purchase. |
| **Basket Calculations** | **Medium** | Important UI feedback. Automated quantity increments, line item totals, and subtotals. |
| **Product Search & Sort** | **Medium** | Primary buyer navigation. Automated catalog filter by name, SKU, and category. |
| **Order History & CSV Export** | **Low/Medium** | Post-purchase record keeping. Automated grid row verification and CSV API endpoint check. |

---

## Technical Assumptions & Constraints

1. **Test Data Resettability**: Assumed `/api/test/reset` resets database state to baseline prior to test scenarios.
2. **Browser Environment**: Playwright Chromium driver used in headless mode for fast, deterministic regression execution.
3. **Async UI Rendering**: App client re-fetches cart, orders, and products asynchronously following POST actions; automated wait strategies account for DOM updates.
