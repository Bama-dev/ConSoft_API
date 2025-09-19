import { ServiceModel } from '../models/service.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(ServiceModel);

export const ServiceController = {
	...base,
};
