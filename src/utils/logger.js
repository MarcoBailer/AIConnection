import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    // Você pode adicionar outros transports como arquivo ou serviço externo
  ],
});

export default logger;
