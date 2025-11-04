import { GenericModel } from "./generic.model";

export class User extends GenericModel {
    id!: number;
    username!: string;
    password!: string;
    role!: UserRole;
    hasVoted!: boolean;
}

export class UserProfile extends User {
    firstname!: string;
    lastname!: string;
    gender!: UserGender;
    idSeries!: string;
    idNumber!: number;
    cnp!: number;
    nationality!: UserNationality;
    residenceAddress!: string;
    validityStartDate!: number;
    validityEndDate!: number;
    idImage!: string; // base64
    faceImage!: string; // base64
}

export enum UserRole {
    ADMIN, VOTANT,
}

export  enum UserGender {
    MALE, FEMALE, OTHER,
}

export enum UserNationality {
    ROMANIAN, FOREIGNER,
}
