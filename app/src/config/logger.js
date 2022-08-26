const { createLogger, transports, format } = require("winston");
const { combine, timestamp, json, printf, label, colorize, simple } = format;

const printFormat = printf(({ timestamp, label, level, message }) => {
    return `<${label}> ${level}[${timestamp}]: ${message}`
});

const printLogFormat = {
    file: combine(
        label({
            label: "jungsan",
        }),
        timestamp({
            format: "YYYY-MM-DD HH:mm:dd"
        }),
        printFormat,
    ),
    console: combine(
        colorize(),
        simple()
    )
};

const opts = {
    file: new transports.File({
        filename: "access.log",
        dirname: "./log",
        level: "http",
        format: printLogFormat.file,
    }),
    console: new transports.Console({
        level: "http",
        format: printLogFormat.console,
    })
}

const logger = createLogger({
    transports: [
        opts.file,
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(opts.console);
}

logger.stream = {
    write: (message) => logger.info(message)
}

module.exports = logger;