"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const bootstrap_1 = require("./config/bootstrap");
async function bootstrap() {
    await (0, db_1.connectToDatabase)();
    await (0, bootstrap_1.ensureCoreData)();
    const app = (0, app_1.createApp)();
    app.listen(env_1.env.port, () => {
        console.log(`Server running on http://localhost:${env_1.env.port}`);
    });
}
bootstrap().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Bootstrap error', err);
    process.exit(1);
});
