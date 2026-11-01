# Wingify Login – Playwright Automation Framework

End-to-end test automation for the Wingify (VWO) login page at <https://app.wingify.com/#/login>, built with **Playwright + TypeScript**, the **Page Object Model (POM)**, **faker** for test data, **dotenv** for credentials and **Allure** for reporting.

---

## 1. Tech stack

| Purpose | Tool |
|---|---|
| Test runner / browser automation | `@playwright/test` (Chromium) |
| Language | TypeScript |
| Test data | `@faker-js/faker` via `utils/dataGenerator.ts` |
| Config / secrets | `dotenv` (`.env`) |
| Reporting | Playwright HTML report + Allure (`allure-playwright`, `allure-commandline`) |

**Prerequisites:** Node.js 18+ (developed on v22), npm, and **Java 8+** (required by the Allure CLI to generate reports).

---

## 2. Project structure

```
PW_Automation/
├── fixtures/
│   └── baseTest.ts            # Extends Playwright `test` with a `loginPage` fixture
├── locators/
│   └── loginLocators.ts       # Locator factories for the login page
├── pages/
│   └── LoginPage.ts           # Page Object (private locators, actions, assertions)
├── tests/
│   └── smoke/
│       └── TC001_login.spec.ts   # Valid + invalid login tests (@smoke)
├── utils/
│   ├── dataGenerator.ts       # faker-based random test data
│   └── retry.ts               # withRetry() helper used by page actions
├── playwright.config.ts       # Runner, reporters, trace/video/screenshot settings
├── tsconfig.json
├── .env                       # Real credentials (git-ignored)
├── .env.example               # Template for .env
├── RICE_POT_Prompt.md         # Prompt/rules the framework was built against
└── package.json
```

Generated (git-ignored): `node_modules/`, `test-results/`, `playwright-report/`, `allure-results/`, `allure-report/`.

---

## 3. Setup

```bash
cd PW_Automation
npm install
npx playwright install chromium
cp .env.example .env      # then fill in real values
```

### Environment variables (`.env`)

| Variable | Description |
|---|---|
| `BASE_URL` | Login page URL (default `https://app.wingify.com/#/login`) |
| `WINGIFY_VALID_USERNAME` | Email of a valid Wingify account |
| `WINGIFY_VALID_PASSWORD` | Password of that account |

`.env` is git-ignored – never commit real credentials. If the two credential variables are empty, the valid-login test is **skipped** (not failed).

---

## 4. Running tests

| Command | What it does |
|---|---|
| `npm test` | Run all tests |
| `npm run test:smoke` | Run only `tests/smoke` |
| `npx playwright test -g "TC002"` | Run a single test by title |
| `npx playwright test --headed` | Run with a visible browser |
| `npx playwright test --debug` | Step through with the Playwright Inspector |

---

## 5. Test cases

File: `tests/smoke/TC001_login.spec.ts` (tag `@smoke`)

| ID | Scenario | Data | Key assertions |
|---|---|---|---|
| TC001 | Login with valid credentials | `.env` credentials | Login form visible → after Sign in, URL is no longer `#/login` and the email field is hidden |
| TC002 | Login with invalid credentials | Random faker email/password | Login form visible → error banner shows *"Your email, password, IP address or location did not match"* and URL stays on `#/login` |

Steps in each test are commented so they can be traced back to the scenario.

---

## 6. Framework design

### Locators (`locators/loginLocators.ts`)
- Playwright built-in locator strategy only (`getByRole`, `getByLabel`, `getByText`).
- **`getByPlaceholder()` is strictly prohibited** (project rule).
- Exposed as factory functions `(page) => Locator`.

| Element | Locator | Note |
|---|---|---|
| Email | `getByRole('textbox', { name: 'Email address', exact: true })` | The DOM contains 4 email inputs (login, reset, forgot-password, SSO); `getByRole` ignores the hidden ones. `getByLabel` caused strict-mode violations. |
| Password | `getByLabel('Password', { exact: true })` | |
| Sign in | `getByRole('button', { name: 'Sign in', exact: true })` | `exact` needed – "Sign in with Google/SSO/Passkey" also match. |
| Error banner | `getByText('Your email, password, IP address or location did not match')` | |

### Page Object (`pages/LoginPage.ts`)
- Constructor receives Playwright `Page`; all locators are `private readonly`.
- Action methods: `open`, `enterEmail`, `enterPassword`, `clickSignIn`, `login`.
- Assertion helpers: `expectLoginFormVisible`, `expectLoginSuccess`, `expectLoginError`.
- Actions are wrapped in `withRetry()` (3 attempts, 500 ms delay) which rethrows with a descriptive message.

### Fixture (`fixtures/baseTest.ts`)
Provides a ready-made `loginPage` to tests; tests never touch raw selectors.

### Test data (`utils/dataGenerator.ts`)
`DataGenerator.invalidCredentials()` returns a random faker email (`@example.com`) and password.

---

## 7. Reporting & artifacts

### Playwright HTML report
```bash
npx playwright show-report
```
Output: `playwright-report/`

### Allure report
```bash
npm test                  # produces allure-results/
npm run report            # generate + open allure-report/
# or
npm run allure:serve      # generate and open a temporary report
```

| Script | Purpose |
|---|---|
| `allure:generate` | Build `allure-report/` from `allure-results/` |
| `allure:open` | Open the built report |
| `allure:serve` | Generate + serve in one step |
| `report` | generate then open |

### Failure artifacts (`test-results/`)
On failure the config retains a **screenshot**, **video** and **trace**. Open a trace with:
```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```
Each failed test folder also has an `error-context.md` with the error and page snapshot.

---

## 8. Configuration highlights (`playwright.config.ts`)

- `testDir: ./tests`, per-test timeout 60 s, `expect` timeout 10 s
- `fullyParallel: true`; retries = 2 on CI, 0 locally
- Reporters: list, HTML, Allure
- `trace` / `video`: `retain-on-failure`; `screenshot`: `only-on-failure`
- Single project: Chromium (Desktop Chrome), headless

---

## 9. Current status & known limitations

- **TC002 (invalid login): passing.**
- **TC001 (valid login): failing with the current `.env` credentials.** The app returns the same error banner ("Your email, password, IP address or location did not match") and stays on `#/login`. This is an application/credential response, not a locator problem. Possible causes: wrong credentials, IP/location restrictions on the account, or an account that uses Google/SSO login. Verify by logging in manually with the same credentials.
- TC001's success check is intentionally generic (URL leaves `#/login`, login form hidden) because the PRD does not define a post-login element. Inference (low confidence): the post-login target is `#/dashboard`. Strengthen the assertion once a successful login is observed.
- The PRD (`Product Requirements Document_ VWO Login Dashboard.docx`) describes `app.vwo.com`; tests target `app.wingify.com` as requested.
- PRD features not yet automated: Forgot Password, SSO, Google/Passkey sign-in, Remember me, on-blur validation.
- The prompt references `TC002_createDivision.spec.ts` as a pattern; that file does not exist in this workspace.

---

## 10. Adding new tests

1. Add/extend locators in `locators/`.
2. Add/extend a Page Object in `pages/` (private locators, retry-wrapped actions).
3. Register it in `fixtures/baseTest.ts` if tests need it.
4. Add the spec under `tests/<tag>/` (e.g. `tests/smoke`), using only Page Object methods.
5. Generate random data through `utils/dataGenerator.ts`.
6. Assert every critical verification step.

---

## 11. Rules followed (from `RICE_POT_Prompt.md`)

- Playwright locator strategy; no `getByPlaceholder()`
- POM only – no raw selectors in tests
- faker data via `dataGenerator.ts`
- Locators → `/locators`, Page Objects → `/pages`, tests → `/tests/<tag>`
- On failure: capture trace, video, screenshot, error message and stack; diagnose root cause and document the fix
