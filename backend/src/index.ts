// src/index.ts
import app from "./app";

const PORT = Number(process.env.PORT) || 10000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 API running on http://${HOST}:${PORT}`);
});
