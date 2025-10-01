import app from "./server";
import colors from "colors";

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(colors.green.bold(`API running on http://localhost:${PORT}`));
});
