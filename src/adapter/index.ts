import { WebhookEvent } from '@octokit/webhooks'
import { Context } from '../context'
import { GitHubAPI } from '../github'
import { LoggerWithTarget } from '../wrap-logger'

export interface Adapter {
  createContext (event: WebhookEvent): Promise<Context>
  auth (id?: number, log?: LoggerWithTarget): Promise<GitHubAPI>
}
