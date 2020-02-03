import { Controller, Get, Route } from '@tsoa/core';
import { ModelService } from '../services/modelService';
import { TestModel } from '../testModel';

@Route()
export class RootController extends Controller {
  @Get()
  public async rootHandler(): Promise<TestModel> {
    return Promise.resolve(new ModelService().getModel());
  }

  @Get('rootControllerMethodWithPath')
  public async rootControllerMethodWithPath(): Promise<TestModel> {
    return Promise.resolve(new ModelService().getModel());
  }
}
