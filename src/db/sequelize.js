import { Sequelize, DataTypes } from "sequelize";
import config from "../config/index.js";
import { seedProfiles } from "./seed.js";

const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: config.DATABASE_SSL ? { rejectUnauthorized: false } : false,
  },
  logging: false,
});

sequelize.define(
  "db_profile",
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    gender: DataTypes.STRING(20),
    gender_probability: DataTypes.FLOAT,
    age: DataTypes.INTEGER,
    age_group: DataTypes.STRING(20),
    country_id: DataTypes.CHAR(2),
    country_name: DataTypes.STRING(100),
    country_probability: DataTypes.FLOAT,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "db_profiles",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["name"], name: "db_profiles_name_unique_idx" },
      { fields: ["gender"], name: "db_profiles_gender_idx" },
      { fields: ["age_group"], name: "db_profiles_age_group_idx" },
      { fields: ["country_id"], name: "db_profiles_country_id_idx" },
      { fields: ["age"], name: "db_profiles_age_idx" },
    ],
  },
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }

  try {
    await sequelize.sync({ force: true });
    await seedProfiles();
  } catch (error) {
    console.error("Database sync/seed error:", error.message);
    process.exit(1);
  }
};

export default sequelize;
