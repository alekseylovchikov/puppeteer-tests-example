const puppeteer = require("puppeteer");
const { faker } = require("@faker-js/faker");
// const iPhone = puppeteer.KnownDevices["iPhone 6"];

const { toMatchImageSnapshot } = require("jest-image-snapshot");

expect.extend({ toMatchImageSnapshot });

/**
 * test for device
 */
// test("fills out form and submits", async () => {
//   const page2 = await browser.newPage();
//   await page2.emulate(iPhone);
//   await page2.goto("http://localhost:3000/");

//   const firstName = await page2.$('[data-testid="firstName"]');
//   const lastName = await page2.$('[data-testid="lastName"]');
//   const email = await page2.$('[data-testid="email"]');
//   const password = await page2.$('[data-testid="password"]');
//   const submit = await page2.$('[data-testid="submit"]');

//   await firstName.tap();
//   await page2.type('[data-testid="firstName"]', user.firstName);

//   await lastName.tap();
//   await page2.type('[data-testid="lastName"]', user.lastName);

//   await email.tap();
//   await page2.type('[data-testid="email"]', user.email);

//   await password.tap();
//   await page2.type('[data-testid="password"]', user.password);

//   await submit.tap();

//   await page2.waitForSelector('[data-testid="success"]');
// }, 16000);

const user = {
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
};

const isDebugging = () => {
  const debuggingMode = {
    headless: false,
    slowMo: 50,
    devtools: true,
  };
  return process.env.NODE_ENV === "debug" ? debuggingMode : {};
};

describe("on page load", () => {
  let browser;
  let page;
  let logs = [];
  let errors = [];

  beforeAll(async () => {
    browser = await puppeteer.launch(isDebugging());
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on("request", (ir) => {
      if (ir.url().includes("swapi")) {
        // ir.abort();
      } else {
        ir.continue();
      }
    });

    page.on("console", (c) => logs.push(c.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("http://localhost:3000/");

    page.setViewport({
      width: 500,
      height: 2400,
    });
  }, 16000);

  test("anchor tag loads correctly", async () => {
    const html = await page.$eval('[data-testid="h1"]', (e) => e.innerHTML);

    expect(html).toBe("Welcome to React");
  });

  test("nav loads correctly", async () => {
    const image = await page.screenshot();
    const navbar = await page.$eval('[data-testid="navbar"]', (el) =>
      el ? true : false
    );
    const listItems = await page.$$('[data-testid="navBarLi"]');

    expect(image).toMatchImageSnapshot({
      customDiffConfig: {
        threshold: 0,
      },
    });
    expect(navbar).toBeTruthy();
    expect(listItems).toHaveLength(4);
  });

  describe("login form", () => {
    test("fills out form and submits", async () => {
      await page.setCookie({ name: "JWT", value: "123" });

      const firstName = await page.$('[data-testid="firstName"]');
      const lastName = await page.$('[data-testid="lastName"]');
      const email = await page.$('[data-testid="email"]');
      const password = await page.$('[data-testid="password"]');
      const submit = await page.$('[data-testid="submit"]');

      await firstName.click();
      await page.type('[data-testid="firstName"]', user.firstName);

      await lastName.click();
      await page.type('[data-testid="lastName"]', user.lastName);

      await email.click();
      await page.type('[data-testid="email"]', user.email);

      await password.click();
      await page.type('[data-testid="password"]', user.password);

      await submit.click();

      await page.waitForSelector('[data-testid="success"]');
    }, 16000);

    test("sets firstName cookie", async () => {
      const cookies = await page.cookies();
      const firstNameCookie = cookies.find(
        (c) => c.name === "firstName" && c.value === user.firstName
      );

      expect(firstNameCookie).not.toBeUndefined();
    });
  });

  test("does not have console logs", () => {
    logs = logs.filter(
      (c) =>
        c !==
        "%cDownload the React DevTools for a better development experience: https://reactjs.org/link/react-devtools font-weight:bold"
    );
    expect(logs).toHaveLength(0);
  });
  test("does not exist exceptions", () => {
    expect(errors).toHaveLength(0);
  });
  test("fails to fetch starWars endpoint", async () => {
    const h3 = await page.$eval('[data-testid="starWars"]', (e) => e.innerHTML);
    expect(h3).toBe("Something went wrong");
  }, 16000);

  afterAll(async () => await browser.close());
});
