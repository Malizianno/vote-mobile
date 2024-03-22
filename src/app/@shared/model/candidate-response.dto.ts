import { Candidate } from "./candidate.model";
import { GenericModel } from "./generic.model";

export class CandidateResponse extends GenericModel {
    candidates!: Candidate[];
    total!: number;
}