import { app } from "./app";
import { env } from "./lib/env";
import { startAutoReleaseJob } from "./jobs/autoReleaseDeposits";

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
   startAutoReleaseJob();
});