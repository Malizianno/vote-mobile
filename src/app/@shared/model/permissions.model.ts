import { GenericModel } from "./generic.model"

export class Permissions extends GenericModel {
    private readExternalStorage!: string;
    private media!: string;
    private camera!: string;
    private photos!: string;

    // XXX: populate this more if needed
}