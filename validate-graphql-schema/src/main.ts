import * as core from '@actions/core'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { Change, diff } from '@graphql-inspector/core'
import { loadSchema } from '@graphql-tools/load'
import { UrlLoader } from '@graphql-tools/url-loader'

import { comment } from './pr'

/**
 * Executes the main action. It includes the main business logic and is the
 * primary entry point. It is documented inline.
 */
async function run(): Promise<void> {
  // Fetch local graphql schema file
  const schema_path =
    core.getInput('schema', { required: true }) || 'schema.graphql'
  // Fetch graphql endpoint from input or set to default
  const endpoint_path =
    core.getInput('endpoint') || 'https://graphql.sittercity.com/graphql'

  try {
    const schema = async () =>
      await loadSchema(schema_path, {
        loaders: [new GraphQLFileLoader()],
      })

    // load from endpoint
    const endpoint = async () =>
      await loadSchema(endpoint_path, {
        loaders: [new UrlLoader()],
      })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const changes: Change[] = diff(schema, endpoint)
    console.log(changes)
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

run()
