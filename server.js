// Vercel entry point — exports the Express app for serverless deployment
import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/db/sequelize.js";

await connectDB();

export default app;
