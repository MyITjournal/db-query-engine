// Local development entry point
import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/db/sequelize.js";
import config from "./src/config/index.js";

await connectDB();
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
