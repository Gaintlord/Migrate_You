import puppeteer, { Browser } from "puppeteer";
import fs from "fs";

async function scrolling(page, DivSize) {
  const currenthieght = 0;

  while (currenthieght < DivSize) {
    page.scroll;
  }
}

async function DataRetrive() {
  // created a instaance o f browser
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const width = 1080;
  const height = 1920;
  await page.setViewport({ width: width, height: height });
  // this take a lot of time all request will go throw this , maybe //
  await page.setRequestInterception(true);

  page.on("request", (request) => request.continue());

  const Collected_json = [];

  page.on("response", async (response) => {
    const Url = response.url();
    // console.log(Url);
    if (
      (Url.includes("https://api-partner.spotify.com/pathfinder/v1/query") &&
        Url.includes("operationName=fetchPlaylistContents&variables")) ||
      Url.includes("operationName=fetchPlaylist&variables")
    ) {
      try {
        console.log("Found the url we needed");
        const neededjson = await response.json();
        Collected_json.push(neededjson);
      } catch (e) {
        console.log("something definitely went wrong");
      }
    }
  });

  await page.goto("https://open.spotify.com/playlist/7foHivhN9mBQi7kkiYnEK3", {
    waitUntil: "networkidle2",
    timeout: 50000,
  });
  console.log("opened");

  await page.waitForSelector(".contentSpacing");
  console.log("Found");
  //   //  ckick to remove any ads
  await page.mouse.click(0, 0);
  console.log("clicked");
  //  clicking again just in case
  await page.mouse.click(0, 0);
  console.log("clicked");

  // MOving to the center of page where the scrollabe div is
  await page.mouse.move(width / 2, height / 2);
  console.log("moved the mouse");

  //  found the scrollable height of the div
  const divsize = await page.evaluate(() => {
    const div = document.querySelector('div[data-testid="playlist-tracklist"]');
    return div.scrollHeight;
  });

  for (let i = 100; i < divsize; i += 100) {
    // trying to scroll the page from that div
    await page.mouse.wheel({ deltaY: i });
    console.log(`scrolled the mouse 100px page at ${i}px`);
  }

  console.log(Collected_json);

  for (let i = 0; i < Collected_json.length; ++i) {
    const realdeal = JSON.stringify(Collected_json[i]);
    // console.log(realdeal);

    const formodule =
      await `const DataObject  = ${realdeal} //here start next object`;

    // ------ making the file for json data extraction (make it dynamic later)--------

    fs.writeFileSync(`Parsed_json_data_${i}.js`, formodule, "utf8", (e) => {
      if (e) {
        console.log("maybe try again , maybe ", e);
      } else {
        console.log("made the file");
      }
    });
  }

  await browser.close();
}

DataRetrive();
// console.log(DataObject.data.playlistV2.content.items.length);
// const arraysize = DataObject.data.playlistV2.content.items.length;

// for (let i = 0; i < arraysize; ++i) {
//   console.log(DataObject.data.playlistV2.content.items[i].itemV2.data.name);
// }
