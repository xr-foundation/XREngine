
/* eslint-disable no-console */

import { LogSeverity } from '../../profiles/ProfilesModule'
import { EventEmitter } from '../Events/EventEmitter'

export enum LogLevel {
  Verbose = 0,
  Info = 1,
  Warning = 2,
  Error = 3
}

export function logSeverityToLevel(severity: LogSeverity) {
  switch (severity) {
    case 'verbose':
      return LogLevel.Verbose
    case 'info':
      return LogLevel.Info
    case 'warning':
      return LogLevel.Warning
    case 'error':
      return LogLevel.Error
  }
}
export enum PrefixStyle {
  None = 0,
  Default = 1,
  Time = 2
}

const Reset = '\x1b[0m'
const FgRed = '\x1b[31m'
const BgYellow = '\x1b[43m'
const Dim = '\x1b[2m'

export type LogMessage = { severity: LogSeverity; text: string }

export class Logger {
  static logLevel = LogLevel.Info
  static prefixStyle = PrefixStyle.Default

  public static readonly onLog = new EventEmitter<LogMessage>()

  static {
    const prefix = (): string => {
      switch (Logger.prefixStyle) {
        case PrefixStyle.None:
          return ''
        case PrefixStyle.Default:
          return '[XREngine Visual Script]:'
        case PrefixStyle.Time:
          return new Date().toLocaleTimeString().padStart(11, '0') + ' '
      }
    }

    Logger.onLog.addListener((logMessage: LogMessage) => {
      if (Logger.logLevel > logSeverityToLevel(logMessage.severity)) return // verbose if for in graph only

      switch (logSeverityToLevel(logMessage.severity)) {
        case LogLevel.Info:
          console.info(prefix() + logMessage.text)
          break
        case LogLevel.Warning:
          console.warn(prefix() + logMessage.text)
          break
        case LogLevel.Error:
          console.error(prefix() + logMessage.text)
          break
      }
    })
  }

  static log(severity: LogSeverity, text: string) {
    this.onLog.emit({ severity, text })
  }

  static verbose(text: string) {
    this.onLog.emit({ severity: 'verbose', text })
  }

  static info(text: string) {
    this.onLog.emit({ severity: 'info', text })
  }

  static warning(text: string) {
    this.onLog.emit({ severity: 'warning', text })
  }

  static error(text: string) {
    this.onLog.emit({ severity: 'error', text })
  }
}
