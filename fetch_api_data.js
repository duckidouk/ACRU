const fs = require("node:fs");

// Duc - just edit this to change start date. Each of these are a whole entry
// back in time so we can test stuff.
const START_CO2_DATE = {
  year: "2023",
  month: "1",
  day: "6"
};

const START_N20_AND_METHANE_DATE = "2023.1";

const SOURCES = {
  AtmosphericCO2: {
    url: "https://daily-atmosphere-carbon-dioxide-concentration.p.rapidapi.com/api/co2-api",
    headers: {
      "X-RapidAPI-Key": "646a388b1amsh35ca34eabbecf86p11d504jsn2e45d9a35d6a",
      "X-RapidAPI-Host":
        "daily-atmosphere-carbon-dioxide-concentration.p.rapidapi.com"
    }
  },
  AvgSurfaceTemp: {
    url: "https://global-temperature.p.rapidapi.com/api/temperature-api",
    headers: {
      "X-RapidAPI-Key": "646a388b1amsh35ca34eabbecf86p11d504jsn2e45d9a35d6a",
      "X-RapidAPI-Host": "global-temperature.p.rapidapi.com"
    }
  },
  AtmosphericMethane: {
    url: "https://atmosphere-methane-concentration.p.rapidapi.com/api/methane-api",
    headers: {
      "X-RapidAPI-Key": "646a388b1amsh35ca34eabbecf86p11d504jsn2e45d9a35d6a",
      "X-RapidAPI-Host": "atmosphere-methane-concentration.p.rapidapi.com"
    }
  },
  AtmosphericN2O: {
    url: "https://atmosphere-nitrous-oxide-levels.p.rapidapi.com/api/nitrous-oxide-api",
    headers: {
      "X-RapidAPI-Key": "646a388b1amsh35ca34eabbecf86p11d504jsn2e45d9a35d6a",
      "X-RapidAPI-Host": "atmosphere-nitrous-oxide-levels.p.rapidapi.com"
    }
  }
};

async function main() {
  const data = {};
  for (const [name, { url, headers }] of Object.entries(SOURCES)) {
    try {
      const res = await fetch(url, { method: "GET", headers });
      const json = await res.json();

      const arr = Object.values(json).filter((v) => Array.isArray(v))[0];

      data[name] = arr;

      if (name == "AtmosphericCO2") {
        const startIndex = arr.findIndex(
          ({ year, month, day }) =>
            year == START_CO2_DATE.year &&
            month == START_CO2_DATE.month &&
            day == START_CO2_DATE.day
        );

        for (const [i, item] of arr.entries()) {
          if (i == 0) continue;

          item.trendChange = (+item["trend"] - +arr[i - 1]["trend"]).toFixed(2);

          if (i > startIndex) {
            const start = arr[startIndex];
            item.totalTrendChange = (+item["trend"] - +start["trend"]).toFixed(
              2
            );
          }
        }
      }

      if (name == "AtmosphericN2O" || name == "AtmosphericMethane") {
        const startIndex = arr.findIndex(
          ({ date }) => date == START_N20_AND_METHANE_DATE
        );

        for (const [i, item] of arr.entries()) {
          if (i == 0) continue;

          item.trendChange = (+item["trend"] - +arr[i - 1]["trend"]).toFixed(2);

          if (i > startIndex) {
            const start = arr[startIndex];
            item.totalTrendChange = (+item["trend"] - +start["trend"]).toFixed(
              2
            );
          }
        }
      }	

      console.log(`Fetched ${name}`);
    } catch (error) {
      console.error(`Error fetching ${name}: ${error.message}`);
    }

    // Was getting rate-limited before, this adds a 1s delay.
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("Finished fetching");
  fs.writeFileSync("./api_data.json", JSON.stringify(data, undefined, "\t"));
  console.log("Written to file");
}

void main();
