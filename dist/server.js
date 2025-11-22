"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const bootstrap_1 = require("./config/bootstrap");
const http_1 = __importDefault(require("http"));
const socket_1 = require("./realtime/socket");
async function bootstrap() {
    await (0, db_1.connectToDatabase)();
    await (0, bootstrap_1.ensureCoreData)();
    const app = (0, app_1.createApp)();
    const server = http_1.default.createServer(app);
    (0, socket_1.initSocket)(server);
    server.listen(env_1.env.port, () => {
        console.log(`Server running on http://localhost:${env_1.env.port}`);
    });
}
bootstrap().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Bootstrap error', err);
    process.exit(1);
});
