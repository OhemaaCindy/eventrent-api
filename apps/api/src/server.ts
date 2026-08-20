import { app } from "./app";
import { env } from "./lib/env";
import { startAutoReleaseJob } from "./jobs/autoReleaseDeposits";
import { initSocket } from "./lib/socket";

const httpServer = app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
   startAutoReleaseJob();
});

initSocket(httpServer);