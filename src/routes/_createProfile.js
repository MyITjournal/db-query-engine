// This file is not active. It contains routes that were removed because the
// current spec focuses on querying pre-seeded data only.
//
// Handlers preserved here:
//   POST /   → createProfileHandler
//   GET /:id → getProfileByIdHandler
//   DELETE /:id → deleteProfileHandler

import axios from "axios";
import { v7 as uuidv7 } from "uuid";
import {
  determineAgeGroup,
  handleUpstreamError,
  getCountryName,
} from "../helpers/helperFunctions.js";
import { formatProfile } from "../helpers/helperFunctions.js";
import {
  createProfileRules,
  profileIdRules,
  handleValidationErrors,
} from "../helpers/validators.js";
import pool from "../db/index.js";

//   router.post("/", createProfileRules, handleValidationErrors, createProfileHandler);

export async function createProfileHandler(req, res) {
  const { name } = req.body;

  try {
    //*Idempotency*
    const existing = await pool.query(
      `SELECT id, name, gender, gender_probability,
              age, age_group, country_id, country_name, country_probability, created_at
       FROM db_profiles WHERE LOWER(name) = LOWER($1)`,
      [name],
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: formatProfile(existing.rows[0]),
      });
    }

    const fetchGender = axios.get("https://api.genderize.io", {
      params: { name },
      timeout: 3500,
    });
    const fetchAge = axios.get("https://api.agify.io", {
      params: { name },
      timeout: 3500,
    });
    const fetchNationality = axios.get("https://api.nationalize.io", {
      params: { name },
      timeout: 3500,
    });

    const [genderRes, ageRes, countryRes] = await Promise.allSettled([
      fetchGender,
      fetchAge,
      fetchNationality,
    ]);

    // Gender
    let gender = null;
    let genderProb = null;

    if (genderRes.status === "fulfilled") {
      const d = genderRes.value.data;
      if (d.count && d.count > 0) {
        gender = d.gender;
        genderProb = d.probability;
      }
    }

    if (gender === null) {
      return res.status(502).json({
        status: "error",
        message: "Genderize returned an invalid response",
      });
    }

    // Age
    let estimatedAge = null;

    if (ageRes.status === "fulfilled") {
      estimatedAge = ageRes.value.data.age;
    }

    if (estimatedAge === null) {
      return res.status(502).json({
        status: "error",
        message: "Agify returned an invalid response",
      });
    }

    const age_group = determineAgeGroup(estimatedAge);

    // Nationality
    let countries = [];

    if (countryRes.status === "fulfilled") {
      countries = countryRes.value.data.country;
    }

    if (!countries || countries.length === 0) {
      return res.status(502).json({
        status: "error",
        message: "Nationalize returned an invalid response",
      });
    }

    const topCountry = countries.reduce((a, b) =>
      b.probability > a.probability ? b : a,
    );
    const countryId = topCountry.country_id;
    const countryProb = topCountry.probability;
    const countryName = getCountryName(countryId);

    const id = uuidv7();
    const created_at = new Date().toISOString();

    await pool.query(
      `INSERT INTO db_profiles
       (id, name, gender, gender_probability,
        age, age_group, country_id, country_name, country_probability, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        name,
        gender,
        genderProb,
        estimatedAge,
        age_group,
        countryId,
        countryName,
        countryProb,
        created_at,
      ],
    );

    return res.status(201).json({
      status: "success",
      data: formatProfile({
        id,
        name,
        gender,
        gender_probability: genderProb,
        age: estimatedAge,
        age_group,
        country_id: countryId,
        country_name: countryName,
        country_probability: countryProb,
        created_at,
      }),
    });
  } catch (error) {
    return handleUpstreamError(res, error);
  }
}

//   router.get("/:id", profileIdRules, handleValidationErrors, getProfileByIdHandler);
export async function getProfileByIdHandler(req, res) {
  const id = req.params.id;

  try {
    const { rows } = await pool.query(
      `SELECT id, name, gender, gender_probability,
              age, age_group, country_id, country_name, country_probability, created_at
       FROM db_profiles WHERE id = $1 LIMIT 1`,
      [id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Profile not found" });
    }

    return res.status(200).json({
      status: "success",
      data: formatProfile(rows[0]),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

//   router.delete("/:id", profileIdRules, handleValidationErrors, deleteProfileHandler);
export async function deleteProfileHandler(req, res) {
  const id = req.params.id;

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM db_profiles WHERE id = $1",
      [id],
    );

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Profile not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
