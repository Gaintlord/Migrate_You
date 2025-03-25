import puppeteer from "puppeteer";
import fs from "fs";

// created a instaance o f browser
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// this take a lot of time all request will go throw this , maybe //
await page.setRequestInterception(true);

page.on("request", (request) => request.continue());

const Collected_json = [];

page.on("response", async (response) => {
  const Url = response.url();
  console.log(Url);
  if (
    Url.includes("https://api-partner.spotify.com/pathfinder/v1/query") &&
    Url.includes("operationName=fetchPlaylist&variables")
  ) {
    try {
      console.log("Found the url we needed");
      const neededjson = await response.json();
      Collected_json.push(neededjson);
    } catch (e) {
      console.log("something definitely went wrong", e);
    }
  }
});

await page.goto("https://open.spotify.com/playlist/4z5whwZPQuMotubMwwlsLB", {
  waitUntil: "networkidle2",
  timeout: 21000,
});
const realdeal = JSON.stringify(Collected_json[0]);
console.log(realdeal);

const formodule = await `module.export  = ${realdeal}`;

fs.writeFileSync("Parses_json_data.js", formodule, "utf8", (e) => {
  if (e) {
    console.log("maybe try again , maybe ", e);
  } else {
    console.log("made the file");
  }
});

await browser.close();
