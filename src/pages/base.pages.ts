import { Page } from 'playwright';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string = '/') {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async resetData() {
    const resetButton = this.page.locator('[data-action="reset-data"]');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  async getToastText(): Promise<string> {
    const toast = this.page.locator('.toast');
    await toast.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    return (await toast.first().textContent()) || '';
  }

  async parsePrice(text: string): Promise<number> {
    // Match explicit currency patterns like £1,299.00 or numbers with decimals like 1299.00
    const matches = text.match(/(?:[£$]\s*)[\d,]+(?:\.\d+)?|[\d,]+\.\d+/g);
    if (matches && matches.length > 0) {
      const cleaned = matches[0].replace(/[^0-9.]/g, '');
      return parseFloat(cleaned) || 0;
    }
    const cleaned = text.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }
}
