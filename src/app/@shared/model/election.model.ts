import { GenericModel } from './generic.model';

export class Election extends GenericModel {
  id!: number;
  enabled!: boolean;
  name!: string;
  description!: string;
  startDate!: Date;
  endDate!: Date;
}
