import { expect } from 'chai';
import 'mocha';
import { SwaggerConfig } from '../../../src/config';
import { MetadataGenerator } from '../../../src/metadataGeneration/metadataGenerator';
import { SpecGenerator3 } from '../../../src/swagger/specGenerator3';
import { Swagger } from '../../../src/swagger/swagger';
import { getDefaultOptions } from '../../fixtures/defaultOptions';

describe('Parameter generation for OpenAPI 3.0.0', () => {
  const metadata = new MetadataGenerator('./__tests__/fixtures/controllers/parameterController.ts').Generate();

  const defaultOptions = getDefaultOptions();
  const optionsWithNoAdditional = Object.assign<{}, SwaggerConfig, Partial<SwaggerConfig>>({}, defaultOptions, {
    noImplicitAdditionalProperties: 'silently-remove-extras',
  });

  interface SpecAndName {
    spec: Swagger.Spec3;
    /**
     * If you want to add another spec here go for it. The reason why we use a string literal is so that tests below won't have "magic string" errors when expected test results differ based on the name of the spec you're testing.
     */
    specName: 'specDefault' | 'specWithNoImplicitExtras';
  }

  const specDefault: SpecAndName = {
    spec: new SpecGenerator3(metadata, defaultOptions).GetSpec(),
    specName: 'specDefault',
  };
  const specWithNoImplicitExtras: SpecAndName = {
    spec: new SpecGenerator3(metadata, optionsWithNoAdditional).GetSpec(),
    specName: 'specWithNoImplicitExtras',
  };

  /**
   * This allows us to iterate over specs that have different options to ensure that certain behavior is consistent
   */
  const allSpecs: SpecAndName[] = [specDefault, specWithNoImplicitExtras];

  function forSpec(chosenSpec: SpecAndName): string {
    return `for the ${chosenSpec.specName} spec`;
  }

  allSpecs.forEach(currentSpec => {
    describe(`for ${currentSpec.specName}`, () => {
      it('should generate a body parameter', () => {
        const bodySpec = currentSpec.spec.paths['/ParameterTest/Bodies'].post!.requestBody!.content['application/json'].schema;

        expect(bodySpec).to.deep.eq(
          {
            oneOf: [
              {
                $ref: '#/components/schemas/ParameterTestModel',
              },
              {
                items: {
                  $ref: '#/components/schemas/ParameterTestModel',
                },
                type: 'array',
              },
            ],
          },
          `for spec ${forSpec(currentSpec)}`,
        );
      });
    });
  });
});
