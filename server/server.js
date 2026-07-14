import dotenv from "dotenv";
dotenv.config();
import connectDB  from "./src/config/db.js";

import app from "./src/app.js";


const PORT = process.env.PORT || 8000;

connectDB();






app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


