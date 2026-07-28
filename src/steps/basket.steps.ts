import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/hooks';

// --------------------------------------------------
// BASKET CALCULATIONS STEPS
// --------------------------------------------------

Given('an available product is added to the basket', async function (this: CustomWorld) {
  await this.cataloguePage.openCatalogue();
  const added = await this.cataloguePage.addProductToBasket(0);
  this.testData.addedProduct = added;
});

When('the shopper increases the product quantity', async function (this: CustomWorld) {
  const initialQty = await this.basketPage.getItemQuantity(0);
  this.testData.initialQty = initialQty;
  this.testData.expectedQty = initialQty + 1;
  await this.basketPage.increaseQuantity(0);
});

Then('the basket quantity should update correctly', async function (this: CustomWorld) {
  const currentQty = await this.basketPage.getItemQuantity(0);
  const expected = this.testData.expectedQty !== undefined ? this.testData.expectedQty : 1;
  expect(currentQty).to.equal(expected);
});

Then('the product line total should be recalculated correctly', async function (this: CustomWorld) {
  const item = await this.basketPage.getItemDetails(0);
  const expectedLineTotal = item.unitPrice * item.quantity;
  expect(item.unitPrice * item.quantity).to.equal(expectedLineTotal);
});

Then('the basket subtotal should be recalculated correctly', async function (this: CustomWorld) {
  const item = await this.basketPage.getItemDetails(0);
  const expectedSubtotal = item.unitPrice * item.quantity;
  await this.checkoutPage.openCheckout();
  const actualSubtotal = await this.checkoutPage.getSubtotal();
  expect(actualSubtotal).to.equal(expectedSubtotal);
});

When('the shopper decreases the product quantity', async function (this: CustomWorld) {
  await this.cataloguePage.openCatalogue();
  const currentQty = await this.basketPage.getItemQuantity(0);
  this.testData.initialQty = currentQty;
  this.testData.expectedQty = currentQty - 1;
  await this.basketPage.decreaseQuantity(0);
});
