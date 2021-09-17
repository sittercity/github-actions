# Validate Env Vars
Github action to compare .env file with secrets in the secret manager.

## Usage

```
- name: Validate .env file against secret manager
  uses: sittercity/github-actions/validate-env-vars@v1
  with:
    github-token: ${{ env.BUNDLER_ACCESS_TOKEN }}
    credentials: ${{ secrets.PROD_GITHUB_SERVICE_ACCOUNT_CREDENTIALS }}
    gcp-project-id: prod-services
    working-directory: sittercity
    secrets: |-
      empire
      sittercity
```

## Development
Run `npm run build` before you merge as it will pick up on the `dist/index.js` that is compiled. This should be automated in the future.
