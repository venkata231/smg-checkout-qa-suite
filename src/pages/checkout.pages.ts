import { Page } from 'playwright';
import { BasePage } from './base.pages';

export class CheckoutPage extends BasePage {
  private navCheckout = this.page.locator('[data-nav="checkout"]');
  private promoInput = this.page.locator('#promo-code');
  private applyPromoButton = this.page.locator('[data-cy="apply-promo"]');
  private appliedPromosContainer = this.page.locator('[data-testid="applied-promos"]');
  private deliverySelect = this.page.locator('#delivery-method');
  private subtotalElement = this.page.locator('[data-total-field="subtotal"]');
  private discountElement = this.page.locator('[data-total-field="discount"]');
  private deliveryFeeElement = this.page.locator('[data-total-field="delivery"]');
  private grandTotalElement = this.page.locator('[data-testid="checkout-grand-total"]');
  
  private addressLine1 = this.page.locator('#address-line1');
  private addressCity = this.page.locator('#address-city');
  private addressPostcode = this.page.locator('#address-postcode');
  private cardNumberInput = this.page.locator('#card-number');
  private termsCheckbox = this.page.locator('#terms');
  private placeOrderButton = this.page.locator('[data-cy="place-order"]');

  private orderSuccessBanner = this.page.locator('[data-qa="order-success"], .success-panel');

  constructor(page: Page) {
    super(page);
  }

  async openCheckout() {
    await this.navCheckout.click();
    await this.grandTotalElement.first().waitFor({ state: 'visible', timeout: 8000 });
    await this.page.waitForTimeout(300);
  }

  async applyPromoCode(code: string) {
    await this.promoInput.fill(code);
    await this.applyPromoButton.click();
    await this.page.waitForTimeout(800);
  }

  async getAppliedPromos(): Promise<string[]> {
    const text = (await this.appliedPromosContainer.textContent()) || '';
    if (text.includes('No promo code applied')) return [];
    const spans = await this.appliedPromosContainer.locator('span').allTextContents();
    return spans.map(s => s.trim());
  }

  async selectDeliveryOption(option: string = 'standard') {
    await this.deliverySelect.selectOption(option);
    await this.page.waitForTimeout(500);
  }

  async getSubtotal(): Promise<number> {
    await this.subtotalElement.first().waitFor({ state: 'visible', timeout: 5000 });
    const text = (await this.subtotalElement.first().textContent()) || '£0';
    return await this.parsePrice(text);
  }

  async getDiscount(): Promise<number> {
    await this.discountElement.first().waitFor({ state: 'visible', timeout: 5000 });
    const text = (await this.discountElement.first().textContent()) || '£0';
    return await this.parsePrice(text);
  }

  async getDeliveryFee(): Promise<number> {
    await this.deliveryFeeElement.first().waitFor({ state: 'visible', timeout: 5000 });
    const text = (await this.deliveryFeeElement.first().textContent()) || '£0';
    return await this.parsePrice(text);
  }

  async getGrandTotal(): Promise<number> {
    await this.grandTotalElement.first().waitFor({ state: 'visible', timeout: 5000 });
    const text = (await this.grandTotalElement.first().textContent()) || '£0';
    return await this.parsePrice(text);
  }

  async fillDeliveryDetails(line1: string = '10 Automation Street', city: string = 'London', postcode: string = 'EC1A 1QA') {
    await this.addressLine1.fill(line1);
    await this.addressCity.fill(city);
    await this.addressPostcode.fill(postcode);
  }

  async fillCardNumber(cardNumber: string) {
    await this.cardNumberInput.fill(cardNumber);
  }

  async acceptTerms(accept: boolean = true) {
    const isChecked = await this.termsCheckbox.isChecked();
    if (isChecked !== accept) {
      await this.termsCheckbox.click();
      await this.page.waitForTimeout(200);
    }
  }

  async placeOrder() {
    await this.placeOrderButton.click();
    await this.page.waitForTimeout(1000);
  }

  async submitOrderMultipleTimes(times: number = 3) {
    for (let i = 0; i < times; i++) {
      await this.placeOrderButton.click({ force: true });
    }
    await this.page.waitForTimeout(1000);
  }

  async getOrderSuccessDetails(timeoutMs: number = 5000): Promise<{ confirmed: boolean; orderId: string }> {
    try {
      await this.orderSuccessBanner.waitFor({ state: 'visible', timeout: timeoutMs });
      const text = (await this.orderSuccessBanner.textContent()) || '';
      const match = text.match(/ORD-\d+/);
      const orderId = match ? match[0] : '';
      return { confirmed: true, orderId };
    } catch {
      return { confirmed: false, orderId: '' };
    }
  }
}
