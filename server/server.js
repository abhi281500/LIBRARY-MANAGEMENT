import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import { processExpiredBookings } from "./src/services/expiry.service.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    // Initial check on server start
    processExpiredBookings().catch((err) =>
      console.error("[Expiry Worker Startup Error]:", err)
    );

    // Periodic check every 1 hour
    setInterval(() => {
      processExpiredBookings().catch((err) =>
        console.error("[Expiry Worker Interval Error]:", err)
      );
    }, 60 * 60 * 1000);

    // Start Express server after DB connects
    app.listen(PORT, () => {
      console.log(`🚀 StudySpace OS Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  });