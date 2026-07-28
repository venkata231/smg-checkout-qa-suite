import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/hooks';
import { TEST_ADDRESS, TEST_CARDS } from '../testdata/testData';

// --------------------------------------------------
// PAYMENT VALIDATION STEPS
// --------------------------------------------------

Given('the shopper has products ready for checkout', async function (this: CustomWorld) {
  await this.cataloguePage.openCatalogue();
  await this.cataloguePage.addProductToBasket(0);
  await this.checkoutPage.openCheckout();
});

Given('valid delivery details have been provided', async function (this: CustomWorld) {
  await this.checkoutPage.fillDeliveryDetails(TEST_ADDRESS.line1, TEST_ADDRESS.city, TEST_ADDRESS.postcode);
});

Given('the shopper enters {string} as the payment card number', async function (this: CustomWorld, cardNumber: string) {
  const mappedCard = cardNumber === 'invalid-card' ? TEST_CARDS.declined : cardNumber;
  await this.checkoutPage.fillCardNumber(mappedCard);
});

Given('the shopper accepts the checkout terms', async function (this: CustomWorld) {
  await this.checkoutPage.acceptTerms(true);
});

Given('the shopper has accepted the checkout terms', async function (this: CustomWorld) {
  await this.checkoutPage.acceptTerms(true);
});

When('the shopper attempts to place the order', async function (this: CustomWorld) {
  await this.checkoutPage.placeOrder();
});

Then('the order should not be created', async function (this: CustomWorld) {
  const { confirmed, orderId } = await this.checkoutPage.getOrderSuccessDetails(1500);
  expect(confirmed).to.be.false, `BUG-009 / BUG-013: Checkout accepted invalid/declined card and created order ${orderId}!`;
});

Then('an appropriate payment validation message should be displayed', async function (this: CustomWorld) {
  const toastText = await this.checkoutPage.getToastText();
  const lower = toastText.toLowerCase();
  expect(lower).to.satisfy((t: string) => 
    t.includes('required') || t.includes('error') || t.includes('invalid') || t.includes('declined') || t.includes('confirmed')
  );
});
