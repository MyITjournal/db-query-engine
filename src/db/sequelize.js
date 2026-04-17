import { Sequelize, DataTypes } from "sequelize";
import config from "../config/index.js";

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
    name: { type: DataTypes.STRING(255), allowNull: false },
    gender: DataTypes.STRING(20),
    gender_probability: DataTypes.DECIMAL(5, 4),
    sample_size: DataTypes.INTEGER,
    age: DataTypes.INTEGER,
    age_group: DataTypes.STRING(20),
    age_sample_size: DataTypes.INTEGER,
    country_id: DataTypes.CHAR(2),
    country_probability: DataTypes.DECIMAL(5, 4),
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "db_profiles",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: [Sequelize.fn("LOWER", Sequelize.col("name"))],
        name: "db_profiles_name_unique",
      },
      { fields: ["gender"], name: "db_profiles_gender_idx" },
      { fields: ["age_group"], name: "db_profiles_age_group_idx" },
      { fields: ["country_id"], name: "db_profiles_country_id_idx" },
    ],
  },
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Database connected");
  } catch (error) {
    console.error("Database error:", error.message);
    process.exit(1);
  }
};

export default sequelize;
