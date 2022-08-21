const pteer = require("puppeteer");

const sessnFactory = require("../factories/session");
const userFactory = require("../factories/user");

class CustomPage {
  static async build() {
    const browser = await pteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function (target, prop) {
        return target[prop] || browser[prop] || page[prop];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessnFactory(user);

    this.page.setCookie({ name: "session", value: session });
    this.page.setCookie({ name: "session.sig", value: sig });

    await this.page.goto("http://localhost:3000/blogs");
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentOf(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML);
  }
}

module.exports = CustomPage;
