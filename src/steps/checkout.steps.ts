import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/hooks';
import { TEST_CARDS, TEST_PRODUCTS } from '../testdata/testData';

// --------------------------------------------------
// SUCCESSFUL END-TO-END PURCHASE STEPS
// --------------------------------------------------

Given('valid payment details have been provided', async function (this: CustomWorld) {
  await this.checkoutPage.fillCardNumber(TEST_CARDS.valid);
});

Given('the shopper has selected a delivery option', async function (this: CustomWorld) {
  await this.checkoutPage.selectDeliveryOption('standard');
});

When('the shopper places the order', async function (this: CustomWorld) {
  const grandTotal = await this.checkoutPage.getGrandTotal();
  this.testData.confirmedGrandTotal = grandTotal;
  await this.checkoutPage.placeOrder();
});

Then('the order should be confirmed', async function (this: CustomWorld) {
  const { confirmed } = await this.checkoutPage.getOrderSuccessDetails(5000);
  expect(confirmed).to.be.true;
});

Then('an order reference should be generated', async function (this: CustomWorld) {
  const { orderId } = await this.checkoutPage.getOrderSuccessDetails(5000);
  expect(orderId).to.match(/^ORD-\d+$/);
  this.testData.confirmedOrderId = orderId;
});

Then('the final payable total should be correct', async function (this: CustomWorld) {
  const expectedTotal = this.testData.confirmedGrandTotal;
  const { orderId } = await this.checkoutPage.getOrderSuccessDetails(5000);
  const orderRow = await this.ordersPage.findOrderById(orderId);
  if (orderRow) {
    expect(orderRow.total).to.equal(expectedTotal);
  }
});

Then('the completed order should appear in order history', async function (this: CustomWorld) {
  const orderId = this.testData.confirmedOrderId;
  const orderRow = await this.ordersPage.findOrderById(orderId);
  expect(orderRow).to.not.be.undefined;
});

Then('the active basket should be cleared', async function (this: CustomWorld) {
  await this.cataloguePage.openCatalogue();
  const count = await this.basketPage.getItemCount();
  expect(count).to.equal(0, `BUG-002: Purchased items remained in active basket after successful checkout!`);
});

// --------------------------------------------------
// STOCK UPDATE AFTER PURCHASE STEPS
// --------------------------------------------------

Given('a product with available stock is selected', async function (this: CustomWorld) {
  await this.cataloguePage.openCatalogue();
  this.testData.selectedProductName = TEST_PRODUCTS.defaultProduct;
});

Given('the current available stock quantity is recorded', async function (this: CustomWorld) {
  const name = this.testData.selectedProductName;
  const stock = await this.cataloguePage.getStockForProduct(name);
  this.testData.initialStock = stock;
});

Given('the product is added to the basket', async function (this: CustomWorld) {
  const name = this.testData.selectedProductName;
  await this.cataloguePage.addSpecificProductToBasket(name);
  this.testData.purchasedQuantity = 1;
});

When('the shopper successfully completes the purchase', async function (this: CustomWorld) {
  await this.checkoutPage.openCheckout();
  await this.checkoutPage.fillDeliveryDetails();
  await this.checkoutPage.fillCardNumber('4242424242424242');
  await this.checkoutPage.acceptTerms(true);
  await this.checkoutPage.placeOrder();
  const { confirmed } = await this.checkoutPage.getOrderSuccessDetails(5000);
  expect(confirmed).to.be.true;
});

When('returns to the product catalogue', async function (this: CustomWorld) {
  await this.cataloguePage.openCatalogue();
});

Then('the available stock should be reduced by the purchased quantity', async function (this: CustomWorld) {
  const name = this.testData.selectedProductName;
  const currentStock = await this.cataloguePage.getStockForProduct(name);
  const initialStock = this.testData.initialStock;
  const purchasedQty = this.testData.purchasedQuantity || 1;
  const expectedStock = initialStock - purchasedQty;

  expect(currentStock).to.equal(expectedStock, `BUG-003: Purchasing ${purchasedQty} unit of "${name}" dropped stock from ${initialStock} to ${currentStock} instead of ${expectedStock}!`);
});

// --------------------------------------------------
// ORDER HISTORY VERIFICATION STEPS
// --------------------------------------------------

Given('the shopper has successfully completed an order', async function (this: CustomWorld) {
  await this.cataloguePage.openCatalogue();
  await this.cataloguePage.addProductToBasket(0);
  await this.checkoutPage.openCheckout();
  await this.checkoutPage.selectDeliveryOption('standard');
  await this.checkoutPage.fillDeliveryDetails();
  await this.checkoutPage.fillCardNumber('4242424242424242');
  await this.checkoutPage.acceptTerms(true);
  
  const grandTotal = await this.checkoutPage.getGrandTotal();
  this.testData.expectedTotal = grandTotal;
  this.testData.expectedDeliveryMethod = 'standard';

  await this.checkoutPage.placeOrder();
  const { confirmed, orderId } = await this.checkoutPage.getOrderSuccessDetails(5000);
  expect(confirmed).to.be.true;
  this.testData.expectedOrderId = orderId;
});

When('the shopper opens order history', async function (this: CustomWorld) {
  await this.ordersPage.openOrdersPage();
});

Then('the completed order should be displayed', async function (this: CustomWorld) {
  const orderId = this.testData.expectedOrderId;
  const order = await this.ordersPage.findOrderById(orderId);
  expect(order).to.not.be.undefined;
});

Then('the order reference should match the confirmation', async function (this: CustomWorld) {
  const orderId = this.testData.expectedOrderId;
  const order = await this.ordersPage.findOrderById(orderId);
  expect(order?.id).to.equal(orderId);
});

Then('the order total should match the confirmed purchase', async function (this: CustomWorld) {
  const orderId = this.testData.expectedOrderId;
  const expectedTotal = this.testData.expectedTotal;
  const order = await this.ordersPage.findOrderById(orderId);
  expect(order?.total).to.equal(expectedTotal);
});

Then('the delivery method should match the checkout selection', async function (this: CustomWorld) {
  const orderId = this.testData.expectedOrderId;
  const expectedDelivery = this.testData.expectedDeliveryMethod;
  const order = await this.ordersPage.findOrderById(orderId);
  expect(order?.deliveryMethod.toLowerCase()).to.equal(expectedDelivery.toLowerCase());
});

// --------------------------------------------------
// DUPLICATE ORDER PREVENTION STEPS
// --------------------------------------------------

Given('the shopper has completed all required checkout information', async function (this: CustomWorld) {
  await this.cataloguePage.openCatalogue();
  await this.cataloguePage.addProductToBasket(0);
  await this.checkoutPage.openCheckout();
  await this.checkoutPage.fillDeliveryDetails();
});

When('the shopper submits the order multiple times in quick succession', async function (this: CustomWorld) {
  await this.checkoutPage.submitOrderMultipleTimes(3);
});

Then('only one confirmed order should be created', async function (this: CustomWorld) {
  const rows = await this.ordersPage.getOrderRows();
  expect(rows.length).to.equal(1, `BUG-010: Rapid submission created ${rows.length} duplicate orders instead of 1!`);
});
