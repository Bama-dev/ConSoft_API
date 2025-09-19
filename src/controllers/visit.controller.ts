import { VisitModel } from '../models/visit.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(VisitModel);

export const VisitController = {
	...base,
};
