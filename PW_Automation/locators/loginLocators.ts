import { Locator, Page } from '@playwright/test';

/**
 * Login page locators (https://app.wingify.com/#/login).
 * Strategy: Playwright built-in locators only (getByLabel / getByRole / getByText).
 * getByPlaceholder() is prohibited by project rules.
 * Source of truth: DOM inspected on the live page.
 */
export const loginLocators = {
  // getByRole ignores hidden elements; the DOM holds 4 email inputs (login/reset/forgot/SSO forms),
  // so getByLabel would hit strict-mode violations.
  emailInput: (page: Page): Locator => page.getByRole('textbox', { name: 'Email address', exact: true }),
  passwordInput: (page: Page): Locator => page.getByLabel('Password', { exact: true }),
  // exact:true is required - "Sign in with Google/SSO/Passkey" also match the substring
  signInButton: (page: Page): Locator => page.getByRole('button', { name: 'Sign in', exact: true }),
  errorMessage: (page: Page): Locator =>
    page.getByText('Your email, password, IP address or location did not match'),
};
