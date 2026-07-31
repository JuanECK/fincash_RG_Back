import app from './app';
import { logger } from './Config/logger';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 Servidor seguro corriendo en http://localhost:${PORT}`);
});