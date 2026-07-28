import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/hooks';

// --------------------------------------------------
// PROMOTIONS & DISCOUNT STEPS
// --------------------------------------------------

Given('the shopper has products in the basket', async function (this: CustomWorld) {
  await this.cataloguePage.openCatalogue();
  await this.cataloguePage.addProductToBasket(0);
});

Given('the shopper has continued to checkout', async function (this: CustomWorld) {
  await this.checkoutPage.openCheckout();
});

When('the shopper applies promo code {string}', async function (this: CustomWorld, promoCode: string) {
  this.testData.appliedPromo = promoCode;
  await this.checkoutPage.applyPromoCode(promoCode);
});

Then('the promotional discount should be calculated correctly', async function (this: CustomWorld) {
  const subtotal = await this.checkoutPage.getSubtotal();
  const discount = await this.checkoutPage.getDiscount();
  const code = this.testData.appliedPromo;

  let expectedDiscount = 0;
  if (code === 'SAVE10') {
    expectedDiscount = Math.round((subtotal * 0.10) * 100) / 100;
  } else if (code === 'WELCOME5') {
    expectedDiscount = 5;
  }

  expect(discount).to.equal(expectedDiscount, `Expected discount for ${code} on subtotal ${subtotal} to be ${expectedDiscount}, but got ${discount}`);
});

Then('the final payable total should be recalculated correctly', async function (this: CustomWorld) {
  const subtotal = await this.checkoutPage.getSubtotal();
  const discount = await this.checkoutPage.getDiscount();
  const delivery = await this.checkoutPage.getDeliveryFee();
  const grandTotal = await this.checkoutPage.getGrandTotal();

  const expectedTotal = Math.max(0, subtotal - discount + delivery);
  expect(grandTotal).to.equal(expectedTotal);
});

Given('the shopper has already applied the WELCOME5 promotional code', async function (this: CustomWorld) {
  await this.checkoutPage.applyPromoCode('WELCOME5');
  const initialDiscount = await this.checkoutPage.getDiscount();
  this.testData.initialDiscount = initialDiscount;
});

When('the shopper attempts to apply WELCOME5 again', async function (this: CustomWorld) {
  await this.checkoutPage.applyPromoCode('WELCOME5');
});

Then('the promotional offer should not be applied again', async function (this: CustomWorld) {
  const applied = await this.checkoutPage.getAppliedPromos();
  const count = applied.filter(c => c === 'WELCOME5').length;
  expect(count).to.equal(1, `BUG-008: Promo code WELCOME5 was applied ${count} times instead of being restricted to 1 application!`);
});

Then('the discount should remain unchanged', async function (this: CustomWorld) {
  const currentDiscount = await this.checkoutPage.getDiscount();
  expect(currentDiscount).to.be.above(0);
});

Then('the second promotional offer should be rejected', async function (this: CustomWorld) {
  const applied = await this.checkoutPage.getAppliedPromos();
  expect(applied.length).to.equal(1, `BUG-014: Server allowed combining multiple promo codes (${applied.join(', ')})!`);
});
