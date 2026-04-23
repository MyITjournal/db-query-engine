import { countries } from "countries-list";

// Build country name → ISO 3166-1 alpha-2 map from countries-list
const COUNTRY_MAP = {};

for (const code in countries) {
  const name = countries[code].name.toLowerCase();
  COUNTRY_MAP[name] = code;
}

//Country abbreviations or other names not necessarily captured under the countries-list
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

const COUNTRY_ENTRIES = Object.entries(COUNTRY_MAP).sort(
  (a, b) => b[0].length - a[0].length,
);

const MALE_WORDS = new Set([
  "male",
  "man",
  "men",
  "boy",
  "boys",
  "guy",
  "guys",
]);
const FEMALE_WORDS = new Set([
  "female",
  "woman",
  "women",
  "girl",
  "girls",
  "lady",
  "ladies",
]);

const CHILD_WORDS = new Set(["child", "children", "kid", "kids"]);
const TEEN_WORDS = new Set([
  "teen",
  "teens",
  "teenager",
  "teenagers",
  "adolescent",
  "adolescents",
]);
const ADULT_WORDS = new Set(["adult", "adults"]);
const SENIOR_WORDS = new Set(["senior", "seniors", "elderly", "old", "older"]);

export function parseNaturalLanguageQuery(query) {
  const text = query.toLowerCase().trim();
  const words = text.split(/\s+/);
  const parsedFilters = {};

  const hasMale = words.some((word) => MALE_WORDS.has(word));
  const hasFemale = words.some((word) => FEMALE_WORDS.has(word));
  if (hasMale && !hasFemale) parsedFilters.gender = "male";
  else if (hasFemale && !hasMale) parsedFilters.gender = "female";

  if (words.includes("young")) {
    parsedFilters.min_age = 16;
    parsedFilters.max_age = 24;
  }

  if (words.some((word) => CHILD_WORDS.has(word)))
    parsedFilters.age_group = "child";
  else if (words.some((word) => TEEN_WORDS.has(word)))
    parsedFilters.age_group = "teenager";
  else if (words.some((word) => ADULT_WORDS.has(word)))
    parsedFilters.age_group = "adult";
  else if (words.some((word) => SENIOR_WORDS.has(word)))
    parsedFilters.age_group = "senior";

  const agePerDecade = text.match(/in their (\d0)s/);
  if (agePerDecade) {
    const decade = parseInt(agePerDecade[1], 10);
    parsedFilters.min_age = decade;
    parsedFilters.max_age = decade + 9;
  }

  const ageBetweenRange = text.match(/between\s+(\d+)\s+and\s+(\d+)/);
  const ageMinimumRange = text.match(
    /(?:over|above|older than|at least)\s+(\d+)/,
  );
  const ageMaximumRange = text.match(
    /(?:under|below|younger than|at most|almost)\s+(\d+)/,
  );

  if (ageBetweenRange) {
    parsedFilters.min_age = parseInt(ageBetweenRange[1], 10);
    parsedFilters.max_age = parseInt(ageBetweenRange[2], 10);
  } else {
    if (ageMinimumRange)
      parsedFilters.min_age = parseInt(ageMinimumRange[1], 10);
    if (ageMaximumRange)
      parsedFilters.max_age = parseInt(ageMaximumRange[1], 10);
  }

  for (const [name, code] of COUNTRY_ENTRIES) {
    if (text.includes(name)) {
      parsedFilters.country_id = code;
      break;
    }
  }

  return parsedFilters;
}
