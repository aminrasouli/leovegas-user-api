import { Expose } from "class-transformer";
import { UserModel } from "src/features/user/user.types";

export class UserResponseDto implements UserModel {
    @Expose()
    id: number;
    
    @Expose()
    email: string;
    
    @Expose()
    name: string;
}   
