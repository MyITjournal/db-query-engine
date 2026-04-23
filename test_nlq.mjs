import { countries } from "countries-list";

const COUNTRY_MAP = {};
for (const code in countries) {
  COUNTRY_MAP[countries[code].name.toLowerCase()] = code;
}
Object.assign(COUNTRY_MAP, {
  usa: "US",
  uk: "GB",
  britain: "GB",
  england: "GB",
  "great britain": "GB",
  "ivory coast": "CI",
  "dr congo": "CD",
  "democratic republic of congo": "CD",
  "republic of congo": "CG",
  swaziland: "SZ",
  "the gambia": "GM",
});
const ENTRIES = Object.entries(COUNTRY_MAP).sort(
  (a, b) => b[0].length - a[0].length,
);

const MALE = new Set([
  "male",
  "masculine",
  "males",
  "man",
  "men",
  "boy",
  "boys",
  "guy",
  "guys",
]);
const FEMALE = new Set([
  "female",
  "feminine",
  "females",
  "woman",
  "women",
  "girl",
  "girls",
  "lady",
  "ladies",
]);
const ADULT = new Set(["adult", "adults"]);

const queries = [
  "young males from kenya",
  "females above 30",
  "adult males from kenya",
];
for (const q of queries) {
  const text = q.toLowerCase().trim();
  const words = text.split(/\s+/);
  const hasMale = words.some((w) => MALE.has(w));
  const hasFemale = words.some((w) => FEMALE.has(w));
  const gender =
    hasMale && !hasFemale
      ? "male"
      : hasFemale && !hasMale
        ? "female"
        : undefined;
  const age_group = words.some((w) => ADULT.has(w)) ? "adult" : undefined;
  let min_age, max_age;
  if (words.includes("young")) {
    min_age = 16;
    max_age = 24;
  }
  const minR = text.match(/(?:over|above|older than|at least)\s+(\d+)/);
  const maxR = text.match(
    /(?:under|below|younger than|at most|almost)\s+(\d+)/,
  );
  if (minR) min_age = parseInt(minR[1]);
  if (maxR) max_age = parseInt(maxR[1]);
  let country_id;
  for (const [name, code] of ENTRIES) {
    if (text.includes(name)) {
      country_id = code;
      break;
    }
  }
  console.log(
    JSON.stringify({ q, gender, age_group, min_age, max_age, country_id }),
  );
}
