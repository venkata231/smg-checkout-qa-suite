import { Page } from 'playwright';
import { BasePage } from './base.pages';

export class CataloguePage extends BasePage {
  private navShop = this.page.locator('[data-nav="shop"]');
  private searchInput = this.page.locator('#product-search');
  private categorySelect = this.page.locator('#category-filter');
  private clearButton = this.page.locator('#clear-search');
  private productCards = this.page.locator('article.product-card');

  constructor(page: Page) {
    super(page);
  }

  async openCatalogue() {
    await this.navShop.click();
    await this.searchInput.waitFor({ state: 'visible' });
  }

  async searchProduct(query: string) {
    await this.openCatalogue();
    await this.searchInput.fill(query);
    // Debounce wait in app is 250ms
    await this.page.waitForTimeout(400);
  }

  async filterByCategory(category: string) {
    await this.categorySelect.selectOption(category);
    await this.page.waitForTimeout(300);
  }

  async getDisplayedProductTitles(): Promise<string[]> {
    const titles = await this.productCards.locator('.product-title').allTextContents();
    return titles.map(t => t.trim());
  }

  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  async addProductToBasket(index: number = 0): Promise<{ name: string; price: number; stock: number }> {
    await this.openCatalogue();
    const card = this.productCards.nth(index);
    const name = (await card.locator('.product-title').textContent())?.trim() || '';
    const priceText = (await card.locator('.price').textContent()) || '$0';
    const price = await this.parsePrice(priceText);
    const stockText = (await card.locator('.badge.ok, .badge.warn, .badge.danger').textContent()) || '0';
    const stock = parseInt(stockText) || 0;

    await card.locator('[data-cy="add-to-basket"]').click();
    await this.page.waitForTimeout(400);
    return { name, price, stock };
  }

  async addSpecificProductToBasket(productName: string): Promise<{ name: string; price: number; stock: number }> {
    await this.searchProduct(productName);
    const card = this.productCards.filter({ hasText: productName }).first();
    const name = (await card.locator('.product-title').textContent())?.trim() || '';
    const priceText = (await card.locator('.price').textContent()) || '$0';
    const price = await this.parsePrice(priceText);
    const stockText = (await card.locator('.badge.ok, .badge.warn, .badge.danger').textContent()) || '0';
    const stock = parseInt(stockText) || 0;

    await card.locator('[data-cy="add-to-basket"]').click();
    await this.page.waitForTimeout(400);
    return { name, price, stock };
  }

  async getStockForProduct(productName: string): Promise<number> {
    await this.searchProduct(productName);
    const card = this.productCards.filter({ hasText: productName }).first();
    const stockText = (await card.locator('.badge.ok, .badge.warn, .badge.danger').textContent()) || '0';
    return parseInt(stockText) || 0;
  }
}
