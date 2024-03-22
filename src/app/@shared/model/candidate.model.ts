import { PartyTypeEnum } from "../util/party-type.enum";
import { GenericModel } from "./generic.model";

export class Candidate extends GenericModel {
    id!: number;
    firstName!: string;
    lastName!: string;
    party!: PartyTypeEnum;
    image!: string;
    description!: string;
}