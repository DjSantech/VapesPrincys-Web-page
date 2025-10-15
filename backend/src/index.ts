import app from "./server";
import colors from "colors";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 8080;

(async () => {
   await connectDB();
 app.listen(PORT, () => {
  console.log(colors.green.bold(`API running on http://localhost:${PORT}`));
});
})();
