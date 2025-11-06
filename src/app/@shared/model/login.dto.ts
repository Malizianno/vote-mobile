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
    hasVoted!: boolean;
    id!: number;
}

export class FaceLoginRequestDTO extends LoginRequestDTO {
    imageBase64!: string;
}

export class FaceLoginResponseDTO extends LoginResponseDTO {
    
}