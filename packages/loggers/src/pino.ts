import type { LoggerTransport } from '@mastra/core/logger';
import { LogLevel, MastraLogger } from '@mastra/core/logger';
import pino from 'pino';
import pretty from 'pino-pretty';

type TransportMap = Record<string, LoggerTransport>;

export { LogLevel } from '@mastra/core/logger';

export class PinoLogger extends MastraLogger {
  protected logger: pino.Logger;

  constructor(
    options: {
      name?: string;
      level?: LogLevel;
      transports?: TransportMap;
      overrideDefaultTransports?: boolean;
    } = {},
  ) {
    super(options);

    const transportsAry = [...this.getTransports().entries()];

    let prettyTransport: undefined | pretty.PrettyStream = undefined;
    if (!options.overrideDefaultTransports) {
      prettyTransport = pretty({
        colorize: true,
        levelFirst: true,
        ignore: 'pid,hostname',
        colorizeObjects: true,
        translateTime: 'SYS:standard',
        singleLine: false,
      });
    }

    this.logger = pino(
      {
        name: options.name || 'app',
        level: options.level || LogLevel.INFO,
        formatters: {
          level: (label: string) => ({ level: label }),
        },
      },
      options.overrideDefaultTransports
        ? options?.transports?.default
        : transportsAry.length === 0
          ? prettyTransport
          : pino.multistream([
              ...transportsAry.map(([, transport]) => ({
                stream: transport!,
                level: options.level || LogLevel.INFO,
              })),
              {
                stream: prettyTransport!,
                level: options.level || LogLevel.INFO,
              },
            ]),
    );
  }

  debug(message: string, args: Record<string, any> = {}): void {
    this.logger.debug(args, message);
  }

  info(message: string, args: Record<string, any> = {}): void {
    this.logger.info(args, message);
  }

  warn(message: string, args: Record<string, any> = {}): void {
    this.logger.warn(args, message);
  }

  error(message: string, args: Record<string, any> = {}): void {
    this.logger.error(args, message);
  }
}
