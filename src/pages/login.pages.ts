import { Page } from 'playwright';
import { BasePage } from './base.pages';
import { TEST_USER } from '../testdata/testData';

export class LoginPage extends BasePage {
  private emailInput = this.page.locator('#login-email');
  private passwordInput = this.page.locator('#login-password');
  private submitButton = this.page.locator('[data-cy="sign-in-submit"]');
  private errorMessage = this.page.locator('#login-error');
  private userChip = this.page.locator('[data-testid="logged-in-user"]');

  constructor(page: Page) {
    super(page);
  }

  async login(
    email: string = process.env.TEST_USERNAME || TEST_USER.email,
    password: string = process.env.TEST_PASSWORD || TEST_USER.password
  ) {
    await this.navigateTo('/');
    
    // Check if already logged in
    if (await this.userChip.isVisible()) {
      return;
    }

    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.userChip.waitFor({ state: 'visible', timeout: 8000 });
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.userChip.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }
}
