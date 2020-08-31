import puppeteer from 'puppeteer';
import axios from 'axios';
import config from './src/config';

const resolveNav = async (page: puppeteer.Page, promise: Promise<any>) =>
    Promise.all([page.waitForNavigation(), promise]);

const getProperty = async (elementHandle: puppeteer.ElementHandle, property: string) =>
    (await elementHandle.getProperty(property)).jsonValue();

(async () => {
  // const browser = await puppeteer.launch({headless: false});
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://e.csdd.lv/examp/");

  // Select login for registered users
  await resolveNav(page, page.click("a.lead-in"));

  //Enter email and password and submit
  await page.type("#email", config.email);
  await page.type("#psw", config.password);
  await resolveNav(page, page.keyboard.press("Enter"));

  //Start exam application
  await resolveNav(page, page.click("#confirmNor"));

  //Select "Riga KAC" and submit
  await page.select("#nodala", "1");
  await resolveNav(page, page.click("#find"));

  //Select "Kvalifikācijas iegūšana" and submit
  await page.click("label[for='6']");
  await resolveNav(page, page.click("#find"));

  //Select "B" and submit
  await page.click("label[for='5']");
  await resolveNav(page, page.click("#find"));

  //Go through all available dates
  const dateOptions = await page.$$("select option");

  let content = `Sadly no free positions have been found.`;

  for (const dateOption of dateOptions) {
    const value = await getProperty(dateOption, "value");
    if (value !== "-1") {
      const innerString = await getProperty(dateOption, "innerHTML");
      const innerParts = (<string>innerString).split(" ");

      const date = new Date(innerParts[0]);
      if (date < config.currentDate) {
        const freeSpaces = parseInt(innerParts[3]);
        if (freeSpaces > 1) {
          content = `<@${config.mentionRole}>, there are ${freeSpaces} free spaces for the exam on ${date.toLocaleDateString()}`
        }
      }
    }
  }

  await axios.post(config.webhookUrl, { content });

  // await page.screenshot({path: 'screenshot.png'});
  await browser.close();
})();
