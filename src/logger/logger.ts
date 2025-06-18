import winston from 'winston';

export function setupLogger(name: string): winston.Logger {
    const logFormat = winston.format.printf(
        ({ timestamp, level, message, label }) => {
            const loggerName = label || name;
            return `${timestamp} - ${loggerName} - ${level} - ${message}`;
        }
    );

    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize(),
            logFormat
        ),
        transports: [new winston.transports.Console()],
    });

    return logger.child({ label: name });
}
