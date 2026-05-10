import "dotenv/config";
import { runWorkerLoop, shutdownPool } from "./index";

runWorkerLoop().catch(async (e) => {
  console.error(e);
  await shutdownPool();
  process.exit(1);
});
