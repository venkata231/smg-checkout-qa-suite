import { Page } from 'playwright';
import { BasePage } from './base.pages';

export class BasketPage extends BasePage {
  private cartPanel = this.page.locator('[data-region="basket"]');
  private cartItems = this.page.locator('[data-testid="cart-items"] .cart-item');
  private continueButton = this.page.locator('[data-cy="continue-to-checkout"]');

  constructor(page: Page) {
    super(page);
  }

  async getItemQuantity(index: number = 0): Promise<number> {
    const item = this.cartItems.nth(index);
    const qtySpan = item.locator('[data-quantity-for]');
    const text = (await qtySpan.textContent()) || '0';
    return parseInt(text) || 0;
  }

  async increaseQuantity(index: number = 0) {
    const item = this.cartItems.nth(index);
    const plusBtn = item.locator('[data-cart-control="increase"]');
    const qtySpan = item.locator('[data-quantity-for]');
    const currentQty = await this.getItemQuantity(index);
    await plusBtn.click();
    // Wait explicitly for quantity text or button state to settle rather than sleeping
    await qtySpan.waitFor({ state: 'visible' });
    await this.page.waitForFunction(
      ({ selector, prevQty }) => {
        const el = document.querySelector(selector);
        const val = parseInt(el?.textContent || '0');
        return val !== prevQty || val === 5; // Updated or reached max limit
      },
      { selector: `[data-quantity-for]`, prevQty: currentQty },
      { timeout: 3000 }
    ).catch(() => {});
  }

  async decreaseQuantity(index: number = 0) {
    const item = this.cartItems.nth(index);
    const minusBtn = item.locator('[data-cart-control="decrease"]');
    const qtySpan = item.locator('[data-quantity-for]');
    const currentQty = await this.getItemQuantity(index);
    await minusBtn.click();
    await qtySpan.waitFor({ state: 'visible' });
    await this.page.waitForFunction(
      ({ selector, prevQty }) => {
        const el = document.querySelector(selector);
        const val = parseInt(el?.textContent || '0');
        return val !== prevQty || val === 1; // Updated or reached min limit
      },
      { selector: `[data-quantity-for]`, prevQty: currentQty },
      { timeout: 3000 }
    ).catch(() => {});
  }

  async continueToCheckout() {
    await this.continueButton.waitFor({ state: 'visible' });
    await this.continueButton.click();
    await this.page.locator('[data-region="checkout"]').waitFor({ state: 'visible' }).catch(() => {});
  }

  async getItemDetails(index: number = 0): Promise<{ name: string; unitPrice: number; quantity: number }> {
    const item = this.cartItems.nth(index);
    const name = (await item.locator('strong').first().textContent())?.trim() || '';
    const quantity = await this.getItemQuantity(index);
    const text = (await item.locator('small').textContent()) || '';
    const unitPrice = await this.parsePrice(text);
    return { name, unitPrice, quantity };
  }

  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }
}
