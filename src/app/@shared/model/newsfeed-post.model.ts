import { GenericModel } from "./generic.model";

export class NewsfeedPost extends GenericModel {
    id: number;
    title: string;
    content: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    electionId: number;
}