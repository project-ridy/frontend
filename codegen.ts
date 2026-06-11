import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../backend/src/graphql/schema.graphql',
  documents: ['src/graphql/operations/**/*.graphql'],
  generates: {
    'src/graphql/generated/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'graphql',
      },
      config: {
        avoidOptionals: true,
        enumsAsConst: true,
        immutableTypes: true,
        maybeValue: 'T | null',
      },
    },
  },
};

export default config;
