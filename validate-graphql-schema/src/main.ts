import * as core from '@actions/core'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { Change, diff } from '@graphql-inspector/core'
import { loadSchemaSync } from '@graphql-tools/load'
import { UrlLoader } from '@graphql-tools/url-loader'

import { comment } from './pr'

/**
 * Executes the main action. It includes the main business logic and is the
 * primary entry point. It is documented inline.
 */
async function run(): Promise<void> {

  try {
    const workingDirectory = core.getInput('working-directory') || '.';
    const schema_path = core.getInput('schema', {required: true})
    const schema_full_path = `${workingDirectory}/${schema_path}`
    const endpoint_path = core.getInput('endpoint', {required: true})

    const schema = loadSchemaSync(schema_full_path, {
      loaders: [new GraphQLFileLoader()],
    })

    // load from endpoint
    const endpoint = loadSchemaSync(endpoint_path, {
      loaders: [new UrlLoader()],
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const changes: Change[] = await diff(endpoint, schema)
    const messages = changes.map(({message}) => message).join('\n   -')

    if (changes.length != 0) {
      let warningMessage = '#### ⚠️ Warning: A breaking change has been made to the graphql schema. Please confirm that no graphql clients still rely on the item being changed.\nHere, is the summary:\n\n   -'
      warningMessage += messages

      core.setOutput('warning_message', warningMessage);

      await comment(warningMessage, core.getInput('github-token'));

      core.warning(warningMessage);

      return;
    }

    core.info(
      '✅ Great Work! No breaking changes detected in graphql schema.',
    );
  } catch (error) {
    console.log((error as Error).message)
  }
}

run()
