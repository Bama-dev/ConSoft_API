import { createApp } from './app';
import { connectToDatabase } from './config/db';
import { env } from './config/env';
import { ensureCoreData } from './config/bootstrap';
import http from 'http';
import { initSocket } from './realtime/socket';

async function bootstrap() {
  await connectToDatabase();
  await ensureCoreData();
  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Bootstrap error', err);
  process.exit(1);
});


