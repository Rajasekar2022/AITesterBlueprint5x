import { test } from '../../fixtures/baseTest';
import { DataGenerator } from '../../utils/dataGenerator';

const LOGIN_URL = process.env.BASE_URL ?? 'https://app.wingify.com/#/login';
const INVALID_LOGIN_MESSAGE = 'Your email, password, IP address or location did not match';

test.describe('@smoke Wingify login', () => {
  // TC001 - Login with valid credentials (from .env)
  test('TC001 - login with valid credentials', async ({ loginPage }) => {
    const username = process.env.WINGIFY_VALID_USERNAME;
    const password = process.env.WINGIFY_VALID_PASSWORD;
    test.skip(!username || !password, 'WINGIFY_VALID_USERNAME / WINGIFY_VALID_PASSWORD not set in .env');

    // Step 1: open login page
    await loginPage.open(LOGIN_URL);
    await loginPage.expectLoginFormVisible();
    // Step 2: submit valid credentials
    await loginPage.login(username!, password!);
    // Step 3: user leaves the login screen
    await loginPage.expectLoginSuccess();
  });

  // TC002 - Login with invalid credentials (random faker data)
  test('TC002 - login with invalid credentials shows error', async ({ loginPage }) => {
    const { username, password } = DataGenerator.invalidCredentials();

    // Step 1: open login page
    await loginPage.open(LOGIN_URL);
    await loginPage.expectLoginFormVisible();
    // Step 2: submit invalid credentials
    await loginPage.login(username, password);
    // Step 3: error banner shown, user stays on login
    await loginPage.expectLoginError(INVALID_LOGIN_MESSAGE);
  });
});
