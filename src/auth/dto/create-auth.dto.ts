import { IsEmail,IsString,MinLength } from "class-validator";

export class CreateUsuarioDto {
    @IsEmail({}, { message: 'Correo electrónico no válido' })
    email: string;
  
    @IsString({ message: 'Debe ser una cadena de texto' })
    @MinLength(6)
    password: string;
}
