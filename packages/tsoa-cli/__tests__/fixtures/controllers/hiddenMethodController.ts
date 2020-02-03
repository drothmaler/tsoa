import { Controller, Get, Hidden, Route } from '@tsoa/core';
import { TestModel } from '../testModel';
import { ModelService } from '../services/modelService';

@Route('Controller')
export class HiddenMethodController extends Controller {
  @Get('normalGetMethod')
  public async normalGetMethod(): Promise<TestModel> {
    return Promise.resolve(new ModelService().getModel());
  }

  @Get('hiddenGetMethod')
  @Hidden()
  public async hiddenGetMethod(): Promise<TestModel> {
    return Promise.resolve(new ModelService().getModel());
  }
}
