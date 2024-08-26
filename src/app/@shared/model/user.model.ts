import { GenericModel } from "./generic.model";

export class User extends GenericModel {
    id!: number;
    username!: string;
    password!: string;
    role!: UserRole;
    hasVoted!: boolean;
}

export enum UserRole {
    ADMIN, VOTANT,
}