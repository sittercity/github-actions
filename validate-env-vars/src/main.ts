import * as core from '@actions/core';
import { Client } from './client';
import { Reference } from './reference';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { comment } from './pr';

/**
 * Accepts the actions list of secrets and parses them as References.
 *
 * @param secretsInput List of secrets, from the actions input, can be
 * comma-delimited or newline, whitespace around secret entires is removed.
 * @returns Array of References for each secret, in the same order they were
 * given.
 */
function parseSecretsRefs(project: string, secretsInput: string): Reference[] {
  const secrets = new Array<Reference>();
  for (const line of secretsInput.split(`\n`)) {
    for (const piece of line.split(',')) {
      secrets.push(new Reference(project, piece.trim()));
    }
  }
  return secrets;
}

/**
 * Executes the main action. It includes the main business logic and is the
 * primary entry point. It is documented inline.
 */
async function run(): Promise<void> {
  try {
    // Fetch the list of secrets provided by the user.
    const secretsInput = core.getInput('secrets', { required: true });

    // Get credentials, if any.
    const credentials = core.getInput('credentials');
    const gcpProjectId = core.getInput('gcp-project-id');
    const workingDirectory = core.getInput('working-directory') || '.';
    const dotenvFile = core.getInput('dotenv-file') || '.env';
    const dotenvFullPath = `${workingDirectory}/${dotenvFile}`;

    // Create an API client.
    const client = new Client({
      credentials: credentials,
    });

    // Parse all the provided secrets into references.
    const secretsRefs = parseSecretsRefs(gcpProjectId, secretsInput);

    // Access and export each secret.
    const secrets = [];

    for (const ref of secretsRefs) {
      const value = await client.accessSecret(ref.selfLink());

      // Split multiline secrets by line break and mask each line.
      // Read more here: https://github.com/actions/runner/issues/161
      value.split(/\r\n|\r|\n/g).forEach((line) => core.setSecret(line));

      core.setOutput(ref.output, value);

      secrets.push(JSON.parse(value));
    }

    const secretKeys = Object.keys(Object.assign({}, ...secrets));
    const envFileKeys = Object.keys(
      dotenv.parse(fs.readFileSync(dotenvFullPath)),
    );

    const localMissing = secretKeys.filter(
      (key: string) => !envFileKeys.includes(key),
    );
    const secretsMissing = envFileKeys.filter(
      (key) => !secretKeys.includes(key),
    );

    if (localMissing.length > 0 || secretsMissing.length > 0) {
      let warningMessage = `#### ⚠️ Warning: There is a mismatch between ${dotenvFullPath} and ${gcpProjectId} ${secretsInput} secret manager. If possible, ensure the .env file matches ${gcpProjectId} secrets before merging.`;

      if (localMissing.length > 0) {
        warningMessage += `\n- ${dotenvFullPath} is missing env vars:\n    - ${localMissing.join(
          '\n    - ',
        )}`;
      }

      if (secretsMissing.length > 0) {
        warningMessage += `\n- Secret manager is missing env vars:\n    - ${secretsMissing.join(
          '\n    - ',
        )}`;
      }

      core.setOutput('warning_message', warningMessage);

      await comment(warningMessage, core.getInput('github-token'));

      core.warning(warningMessage);

      return;
    }

    core.info(
      `✅ .env var file matches secrets in ${gcpProjectId} secret manager. Nice!`,
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
