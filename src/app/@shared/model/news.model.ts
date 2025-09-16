import { GenericModel } from "./generic.model";

export class NewsElement extends GenericModel {
    title: string;
    timestamp: number;
    description: string; 
}