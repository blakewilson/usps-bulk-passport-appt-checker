const ZIP_CODE = process.env.ZIP_CODE;
const RADIUS = process.env.RADIUS ? parseInt(process.env.RADIUS) : 20;
const NUM_ADULTS = process.env.NUM_ADULTS ?? "1";
const NUM_MINORS = process.env.NUM_MINORS ?? "0";
const NOTIFY_BEFORE_DATE = process.env.NOTIFY_BEFORE_DATE
  ? new Date(process.env.NOTIFY_BEFORE_DATE)
  : undefined;

if (!ZIP_CODE) {
  throw new Error("Please set a ZIP Code");
}

if (!NOTIFY_BEFORE_DATE) {
  throw new Error("Please set a date you want to look for appointments before");
}

function dateToUspsDateStr(date) {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);

  return `${year}${month}${day}`;
}

function uspsDateStrToDate(dateString) {
  return new Date(dateString.replace(/(\d{4})(\d{2})(\d{2})/, "$1/$2/$3"));
}

async function getLocations() {
  const res = await fetch(
    "https://tools.usps.com/UspsToolsRestServices/rest/v2/facilityScheduleSearch",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        poScheduleType: "PASSPORT",
        date: dateToUspsDateStr(new Date()),
        numberOfAdults: NUM_ADULTS,
        numberOfMinors: NUM_MINORS,
        radius: RADIUS,
        zip5: ZIP_CODE,
        city: "",
        state: "",
      }),
    }
  );

  const json = await res.json();

  if (json.result.success !== true) {
    return {};
  }

  let locations = {};

  json.facilityDetails.map((location) => {
    locations[location.fdbId] = location.name;
  });

  console.log(`Found the following locations: ${Object.values(locations)}`);

  return locations;
}

async function checkLocationsForDates(locations) {
  const fdbIds = Object.keys(locations);

  const results = {};

  for await (const fdbId of fdbIds) {
    console.log(`Checking dates for ${uspsLocations[fdbId]}...`);

    const res = await fetch(
      "https://tools.usps.com/UspsToolsRestServices/rest/v2/appointmentDateSearch",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numberOfAdults: NUM_ADULTS,
          numberOfMinors: NUM_MINORS,
          fdbId: fdbId,
          productType: "PASSPORT",
        }),
      }
    );

    const json = await res.json();

    if (json.result.success === false) {
      continue;
    }

    let dates = [];

    json.dates.forEach((date) => {
      if (NOTIFY_BEFORE_DATE >= uspsDateStrToDate(date)) {
        dates.push(uspsDateStrToDate(date).toDateString());
      }
    });

    if (dates.length) {
      results[uspsLocations[fdbId]] = dates;
    }
  }

  return results;
}

const uspsLocations = await getLocations();

const results = await checkLocationsForDates(uspsLocations);

if (Object.keys(results)) {
  console.log(`Some dates were found that match your criteria:`);
  console.log(results);
} else {
  console.log("No results found :(");
}
