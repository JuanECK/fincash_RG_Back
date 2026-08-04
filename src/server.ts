import app from './app';
import { logger } from './Config/logger';
import { env } from './Config/env';

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`🚀 Servidor seguro corriendo en http://localhost:${PORT}`);
});