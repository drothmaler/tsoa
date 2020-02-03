// tslint:disable:no-console
import chalk from 'chalk';
import { generateSwaggerAndRoutes } from '../src/cli';
import { SwaggerConfig } from '../src/config';
import { generateRoutes } from '../src/module/generate-routes';
import { Timer } from './utils/timer';

const defaultOptions: SwaggerConfig = {
  basePath: '/v1',
  entryFile: './__tests__/fixtures/express/server.ts',
  host: 'localhost:3000',
  noImplicitAdditionalProperties: 'silently-remove-extras',
  outputDirectory: './dist',
  securityDefinitions: {
    api_key: {
      in: 'query',
      name: 'access_token',
      type: 'apiKey',
    },
    tsoa_auth: {
      authorizationUrl: 'http://swagger.io/api/oauth/dialog',
      flow: 'implicit',
      scopes: {
        'read:pets': 'read things',
        'write:pets': 'modify things',
      },
      type: 'oauth2',
    },
  },
  yaml: true,
};
const optionsWithNoAdditional = Object.assign<{}, SwaggerConfig, Partial<SwaggerConfig>>({}, defaultOptions, {
  noImplicitAdditionalProperties: 'throw-on-extras',
  outputDirectory: './distForNoAdditional',
});

const spec = async () => {
  const result = await generateSwaggerAndRoutes({
    configuration: 'tsoa.json',
  });
  return result[0];
};

const log = async <T>(label: string, fn: () => Promise<T>) => {
  console.log(chalk.dim(chalk.green(`↻ Starting ${label}...`)));
  const timer = new Timer();

  const result = await fn();
  console.log(chalk.green(`✓ Finished ${label} in ${timer.elapsed()}ms`));

  return result;
};

(async () => {
  const metadata = await log('Swagger Spec Generation', spec);
  await Promise.all([
    log('Express Route Generation', () =>
      generateRoutes(
        {
          authenticationModule: './__tests__/fixtures/express/authentication.ts',
          basePath: '/v1',
          entryFile: './__tests__/fixtures/express/server.ts',
          middleware: 'express',
          routesDir: './__tests__/fixtures/express',
        },
        defaultOptions,
        undefined,
        undefined,
        metadata,
      ),
    ),
    log('Express Route Generation, OpenAPI3, noImplicitAdditionalProperties', () =>
      generateRoutes(
        {
          authenticationModule: './__tests__/fixtures/express-openapi3/authentication.ts',
          basePath: '/v1',
          entryFile: './__tests__/fixtures/server.ts',
          middleware: 'express',
          routesDir: './__tests__/fixtures/express-openapi3',
        },
        { ...optionsWithNoAdditional, specVersion: 3 },
        undefined,
        undefined,
        metadata,
      ),
    ),
    log('Express Dynamic Route Generation', () =>
      generateRoutes(
        {
          authenticationModule: './__tests__/fixtures/express/authentication.ts',
          basePath: '/v1',
          controllerPathGlobs: ['./__tests__/fixtures/controllers/*'],
          entryFile: './__tests__/fixtures/express-dynamic-controllers/server.ts',
          middleware: 'express',
          routesDir: './__tests__/fixtures/express-dynamic-controllers',
        },
        defaultOptions,
        undefined,
        undefined,
        metadata,
      ),
    ),
    log('Koa Route Generation', () =>
      generateRoutes(
        {
          authenticationModule: './__tests__/fixtures/koa/authentication.ts',
          basePath: '/v1',
          entryFile: './__tests__/fixtures/koa/server.ts',
          middleware: 'koa',
          routesDir: './__tests__/fixtures/koa',
        },
        defaultOptions,
        undefined,
        undefined,
        metadata,
      ),
    ),
    log('Koa Route Generation (but noImplicitAdditionalProperties is set to "throw-on-extras")', () =>
      generateRoutes(
        {
          authenticationModule: './__tests__/fixtures/koaNoAdditional/authentication.ts',
          basePath: '/v1',
          entryFile: './__tests__/fixtures/server.ts',
          middleware: 'koa',
          routesDir: './__tests__/fixtures/koaNoAdditional',
        },
        optionsWithNoAdditional,
        undefined,
        undefined,
        metadata,
      ),
    ),
    log('Hapi Route Generation', () =>
      generateRoutes(
        {
          authenticationModule: './__tests__/fixtures/hapi/authentication.ts',
          basePath: '/v1',
          entryFile: './__tests__/fixtures/hapi/server.ts',
          middleware: 'hapi',
          routesDir: './__tests__/fixtures/hapi',
        },
        defaultOptions,
      ),
    ),
    log('Custom Route Generation', () =>
      generateRoutes(
        {
          authenticationModule: './__tests__/fixtures/custom/authentication.ts',
          basePath: '/v1',
          entryFile: './__tests__/fixtures/custom/server.ts',
          middleware: 'express',
          middlewareTemplate: './__tests__/fixtures/custom/custom-tsoa-template.ts.hbs',
          routesDir: './__tests__/fixtures/custom',
          routesFileName: 'customRoutes.ts',
        },
        defaultOptions,
        undefined,
        undefined,
        metadata,
      ),
    ),
    log('Inversify Route Generation', () =>
      generateRoutes(
        {
          authenticationModule: './__tests__/fixtures/inversify/authentication.ts',
          basePath: '/v1',
          entryFile: './__tests__/fixtures/inversify/server.ts',
          iocModule: './__tests__/fixtures/inversify/ioc.ts',
          middleware: 'express',
          routesDir: './__tests__/fixtures/inversify',
        },
        defaultOptions,
      ),
    ),
  ]);
})();
