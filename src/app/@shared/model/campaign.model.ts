import { Election } from "./election.model";
import { GenericModel } from "./generic.model";

export class ElectionCampaignDTO extends GenericModel {
    enabled!: boolean;
    elections!: Election[];
}