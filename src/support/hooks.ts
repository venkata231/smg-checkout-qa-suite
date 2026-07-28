import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { LoginPage, CataloguePage, BasketPage, CheckoutPage, OrdersPage } from '../pages';
import { TEST_CONFIG, TEST_USER } from '../testdata/testData';

setDefaultTimeout(30000);

let browser: Browser;

export interface CustomWorld {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  loginPage: LoginPage;
  cataloguePage: CataloguePage;
  basketPage: BasketPage;
  checkoutPage: CheckoutPage;
  ordersPage: OrdersPage;
  testData: Record<string, any>;
  attach: (data: string | Buffer, mediaType?: string) => void;
}

BeforeAll(async function () {
  const headless = process.env.HEADLESS !== 'false';
  browser = await chromium.launch({ headless });
});

Before(async function (this: CustomWorld) {
  // 1. Reset backend test data prior to every scenario for complete test isolation
  const resetContext = await browser.newContext({ baseURL: TEST_CONFIG.baseUrl });
  const resetPage = await resetContext.newPage();
  try {
    await resetPage.goto('/');
    await resetPage.fill('#login-email', TEST_USER.email);
    await resetPage.fill('#login-password', TEST_USER.password);
    await resetPage.click('[data-cy="sign-in-submit"]');
    await resetPage.waitForSelector('[data-testid="logged-in-user"]', { timeout: 8000 });
    await resetPage.click('[data-action="reset-data"]');
    await resetPage.waitForTimeout(300);
  } catch (e) {
    // Ignore reset errors if app is offline
  } finally {
    await resetContext.close();
  }

  // 2. Initialize test scenario context and page objects
  this.context = await browser.newContext({
    baseURL: TEST_CONFIG.baseUrl,
    viewport: { width: 1280, height: 800 }
  });
  this.page = await this.context.newPage();
  this.loginPage = new LoginPage(this.page);
  this.cataloguePage = new CataloguePage(this.page);
  this.basketPage = new BasketPage(this.page);
  this.checkoutPage = new CheckoutPage(this.page);
  this.ordersPage = new OrdersPage(this.page);
  this.testData = {};

  // Automatically log in shopper so all scenarios start authenticated
  await this.loginPage.login(TEST_USER.email, TEST_USER.password);
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    if (this.page) {
      const screenshot = await this.page.screenshot();
      this.attach(screenshot, 'image/png');
    }
  }
  if (this.context) {
    await this.context.close();
  }
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});
