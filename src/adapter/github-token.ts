import { WebhookEvent } from '@octokit/webhooks'
import { Adapter } from '.'
import { Context } from '../context'
import { GitHubAPI } from '../github'
import { logger } from '../logger'
import { LoggerWithTarget, wrapLogger } from '../wrap-logger'

export class GitHubToken implements Adapter {
  public log: LoggerWithTarget

  constructor (token: string) {
    this.log = wrapLogger(logger, logger)
  }

  public async createContext (event: WebhookEvent): Promise<Context> {
    const log = this.log.child({ name: 'event', id: event.id })
    return new Context(event, await this.auth(), log)
  }

  public async auth (): Promise<GitHubAPI> {
    return GitHubAPI()
  }
}
