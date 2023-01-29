/* eslint-disable */
// parseEvents(await (await fetch(`${waterUrl}/${i - 1}0`)).text())
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const fs = require('fs');

const waterUrl = 'http://water.gov.ge/page/full/107';
(async function () {
  let addresses = new Set();
  for (let i = 1; i !== 141; i++) {
    console.log(`loading page #${i}`);
    addresses = new Set([...addresses, ...(await getPageAddresses(i))]);
    console.log(`now have ${addresses.size} addresses`);
  }
  fs.writeFileSync('addresses.txt', [...addresses].sort().join('\n') + '\n');

  // const firstPageHTML = await (await fetch(waterUrl)).text();
  // events = events.concat(parseEvents(firstPageHTML));
  // events.forEach((e) => addresses.add(...e.streets));
})();

async function getPageAddresses(pageN) {
  const addresses = new Set();
  parseEvents(await (await fetch(`${waterUrl}/${pageN - 1}0`)).text()).forEach(
    (a) => a.streets.forEach((s) => addresses.add(s)),
  );
  return addresses;
}

function parseEvents(pageHTML) {
  return HTMLParser.parse(pageHTML)
    .querySelectorAll('.col-sm-12')
    .filter((article) => article.childNodes.length === 15)
    .map((article) => {
      const streets = article.childNodes[9].text.trim().split('   ');
      return {
        start: article.childNodes[3].text.slice(31).trim(),
        end: article.childNodes[5].text.slice(31).trim(),
        streets,
      };
    });
}
