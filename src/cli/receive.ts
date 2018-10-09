import program from 'commander'
import dotenv from 'dotenv'
import path from 'path'
import uuid from 'uuid'
import { Application } from '..'
import { GitHubApp } from '../adapter/github-app'
import { GitHubToken } from '../adapter/github-token'
import { findPrivateKey } from '../private-key'
import { resolve } from '../resolver'

export = async function receive () {
  dotenv.config()

  program
    .usage('[options] [path/to/app.js]')
    .option('-e, --event <event-name>', 'Event name', process.env.GITHUB_EVENT)
    .option('-p, --event-path <event-path>', 'Event path', process.env.GITHUB_EVENT_PATH)
    .option('-t, --token <access-token>', 'Access token', process.env.GITHUB_TOKEN)
    .option('-a, --app <id>', 'ID of the GitHub App', process.env.APP_ID)
    .option('-P, --private-key <file>', 'Path to certificate of the GitHub App', findPrivateKey)
    .parse(process.argv)

  if (!program.event || !program.eventPath) {
    program.help()
  }

  const appFn = resolve(program.args[0])
  const payload = require(path.join(process.cwd(), program.eventPath))

  let adapter

  if (program.token) {
    process.env.DISABLE_STATS = 'true'
    adapter = new GitHubToken(program.token)
  } else {
    const key = findPrivateKey()
    adapter = new GitHubApp(program.app, key!.toString())
  }

  const app = new Application({ adapter })
  app.load(appFn)

  const event = {
    id: uuid.v4(),
    name: program.event,
    payload
  }

  app.log.debug(event, 'Receiving event')

  try {
    await app.receive(event)
  } catch (err) {
    app.log.error(err)
    // Process must exist non-zero to indicate that the action failed to run
    process.exit(1)
  }
}
