import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.PORT, () => {
  console.log(
    `Dammy Multitrade API running at http://localhost:${env.PORT}`,
  );

  console.log(
    `Health check: http://localhost:${env.PORT}/health`,
  );
});

function shutdown() {
  console.log("Shutting down server...");

  server.close(() => {
    process.exit(0);
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);