export class GenericModel {
    static fromArray(source: any) {
        return source.map((e: any) => new this(e));
    }

    constructor(source?: any) {
        if (source) {
            Object.assign(this, source);
        }
    }
}