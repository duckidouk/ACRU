const fs = require("node:fs");

const SOURCES = {
  AtmosphericCO2: {
    url: "https://daily-atmosphere-carbon-dioxide-concentration.p.rapidapi.com/api/co2-api",
    headers: {
      "X-RapidAPI-Key": [YOUR API KEY HERE],
      "X-RapidAPI-Host":
        "daily-atmosphere-carbon-dioxide-concentration.p.rapidapi.com"
    }
  },
  AvgSurfaceTemp: {
    url: "https://global-temperature.p.rapidapi.com/api/temperature-api",
    headers: {
      "X-RapidAPI-Key": [YOUR API KEY HERE],
      "X-RapidAPI-Host": "global-temperature.p.rapidapi.com"
    }
  },
  AtmosphericMethane: {
    url: "https://atmosphere-methane-concentration.p.rapidapi.com/api/methane-api",
    headers: {
      "X-RapidAPI-Key": [YOUR API KEY HERE],
      "X-RapidAPI-Host": "atmosphere-methane-concentration.p.rapidapi.com"
    }
  },
  AtmosphericN2O: {
    url: "https://atmosphere-nitrous-oxide-levels.p.rapidapi.com/api/nitrous-oxide-api",
    headers: {
      "X-RapidAPI-Key": [YOUR API KEY HERE],
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
      const arr = Object.values(json).filter((v) => Array.isArray(v));
      data[name] = arr[0].at(-1);
      console.log(`Fetched ${name}`);
    } catch (error) {
      console.error(`Error fetching ${name}: ${error.message}`);
    }

    // Was getting rate-limited before, this adds a 1s delay.
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("Finished fetching");
  fs.writeFileSync("./api_last_entry_data.json", JSON.stringify(data, undefined, "\t"));
  console.log("Written to file");
}

void main();
