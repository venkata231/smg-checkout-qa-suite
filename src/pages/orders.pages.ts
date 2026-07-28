import { Page } from 'playwright';
import { BasePage } from './base.pages';

export interface OrderRow {
  id: string;
  status: string;
  customer: string;
  deliveryMethod: string;
  items: string;
  total: number;
}

export class OrdersPage extends BasePage {
  private navOrders = this.page.locator('[data-nav="orders"]');
  private orderGridRows = this.page.locator('[data-testid="orders-grid"] .ag-body-viewport .ag-row');
  private exportCsvButton = this.page.locator('[data-cy="export-orders"]');
  private orderFilterInput = this.page.locator('#order-filter');

  constructor(page: Page) {
    super(page);
  }

  async openOrdersPage() {
    await this.navOrders.click();
    await this.page.waitForTimeout(400);
  }

  async getOrderRows(): Promise<OrderRow[]> {
    await this.openOrdersPage();
    const count = await this.orderGridRows.count();
    const rows: OrderRow[] = [];
    for (let i = 0; i < count; i++) {
      const row = this.orderGridRows.nth(i);
      if (await row.locator('.ag-cell.empty').isVisible()) continue;
      const id = (await row.locator('[data-col-id="id"] strong').textContent())?.trim() || '';
      const status = (await row.locator('[data-col-id="status"]').textContent())?.trim() || '';
      const customer = (await row.locator('[data-col-id="customer"]').textContent())?.trim() || '';
      const deliveryMethod = (await row.locator('[data-col-id="deliveryMethod"]').textContent())?.trim() || '';
      const items = (await row.locator('[data-col-id="itemCount"]').textContent())?.trim() || '';
      const totalText = (await row.locator('[data-col-id="total"]').textContent()) || '0';
      const total = await this.parsePrice(totalText);
      rows.push({ id, status, customer, deliveryMethod, items, total });
    }
    return rows;
  }

  async findOrderById(orderId: string): Promise<OrderRow | undefined> {
    const rows = await this.getOrderRows();
    return rows.find(r => r.id === orderId);
  }

  async exportCsv() {
    await this.openOrdersPage();
    await this.exportCsvButton.click();
  }
}
