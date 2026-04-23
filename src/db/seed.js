import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { v7 as uuidv7 } from "uuid";
import pool from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const seedProfiles = async () => {
  const raw = readFileSync(join(__dirname, "seed_profiles.json"), "utf8");
  const { profiles } = JSON.parse(raw);

  console.log(`Seeding ${profiles.length} profiles...`);

  let updatedProfile = 0;
  let skippedProfile = 0;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const profile of profiles) {
      const result = await client.query(
        `INSERT INTO db_profiles
           (id, name, gender, gender_probability, age, age_group,
            country_id, country_name, country_probability, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (name) DO NOTHING`,
        [
          uuidv7(),
          profile.name,
          profile.gender,
          profile.gender_probability,
          profile.age,
          profile.age_group,
          profile.country_id,
          profile.country_name,
          profile.country_probability,
        ],
      );

      if (result.rowCount > 0) {
        updatedProfile++;
      } else {
        skippedProfile++;
      }
    }

    await client.query("COMMIT");
    console.log(
      `Seeding completed. Updated: ${updatedProfile} | Skipped (already exists): ${skippedProfile}`,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding failed, transaction rolled back:", err.message);
    throw err;
  } finally {
    client.release();
  }
};
