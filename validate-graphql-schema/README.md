# Validate Env Vars
Github action to compare local graphql schema with prod graphql schema for notifying breaking changes.

## Usage

```
- name: Validate local grpahql schema against prod graphql schema
  uses: sittercity/github-actions/validate-graphql-schema@v1
  with:
    github-token: ${{ env.BUNDLER_ACCESS_TOKEN }}
    schema: './empire-graphql/app/graphql/schema.graphql'
    endpoint: 'https://graphql.sittercity.com/graphql'
```

## Development
Run `npm run build` before you merge as it will pick up on the `dist/index.js` that is compiled. This should be automated in the future.
