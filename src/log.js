// github.com/headline/discord-compiler-bot
import winston from 'winston';
const {createLogger, format, transports} = winston;
const { label, combine, timestamp, printf, colorize } = format;
import { fileURLToPath } from 'url';
import {join, dirname} from 'path'
const __dirname = dirname(fileURLToPath(import.meta.url));
const date = new Date();
const initializationDateString = `${__dirname}/../logs/${date.getMonth()}-${date.getDate()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()} `;

const log = createLogger({
    level: 'info',
    format: combine(
        colorize({
            debug: 'blue',
            verbose: 'white',
            info: 'green',
            warn: 'yellow',
            error: 'red',
        }),
        label({
            label: 'Modpack Index Bot',
        }),
        timestamp(),
        printf(({ level, message, label, timestamp}) => {
            return `${timestamp} [${label}] ${level}: ${message}`;
        })
    ),
    levels: {
        debug: 4,
        verbose: 3,
        info: 2,
        warn: 1,
        error: 0,
    },
    transports: [
        new transports.Console({level:`info`}),
        new transports.File({
          filename: `${initializationDateString}.log`,
          level: `debug`
        })
    ]
});

export default log;
