import { UserRole } from "./user.model";

export class LoginRequestDTO {
    username!: string;
    password!: string;
    role!: UserRole;
}

export class LoginResponseDTO {
    username!: string;
    token!: string;
    role!: UserRole;
}