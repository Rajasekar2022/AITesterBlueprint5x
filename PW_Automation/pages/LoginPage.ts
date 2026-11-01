import { Locator, Page, expect } from '@playwright/test';
import { loginLocators } from '../locators/loginLocators';
import { withRetry } from '../utils/retry';

export class LoginPage {
  private readonly page: Page;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = loginLocators.emailInput(page);
    this.passwordInput = loginLocators.passwordInput(page);
    this.signInButton = loginLocators.signInButton(page);
    this.errorMessage = loginLocators.errorMessage(page);
  }

  async open(url: string): Promise<void> {
    await withRetry('open login page', async () => {
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
      await this.emailInput.waitFor({ state: 'visible' });
    });
  }

  async enterEmail(email: string): Promise<void> {
    await withRetry('enter email', () => this.emailInput.fill(email));
  }

  async enterPassword(password: string): Promise<void> {
    await withRetry('enter password', () => this.passwordInput.fill(password));
  }

  async clickSignIn(): Promise<void> {
    await withRetry('click Sign in', () => this.signInButton.click());
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSignIn();
  }

  async expectLoginFormVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  async expectLoginSuccess(): Promise<void> {
    await expect(this.page).not.toHaveURL(/#\/login/);
    await expect(this.emailInput).toBeHidden();
  }

  async expectLoginError(expectedText: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedText);
    await expect(this.page).toHaveURL(/#\/login/);
  }
}
