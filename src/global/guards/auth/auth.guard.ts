import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    //extraer el tocken que se hace con JWT
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    /* Toda pedicion que hacemos siempre lleva cabeceras, esta es la predefinida,
     etiqueta valor(compuesto), split para que lo sepra de acuerdo a espacios, 
     el operador ?? de verificacion, si falla o no trae valor retorna lo que esta  a la derecha en vez de lo que esta a la izquierda*/

    //verificar si es igual a un valor
    if (type != 'Bearer') {
      throw new UnauthorizedException(
        'No tiene autorización para acceder aquí',
      );
    }

    //verificacion
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SEED,
      });
      //validar si no trae el id
      if (!payload.id) {
        throw new UnauthorizedException('No se recibio información de usuario');
      }
      const usuario = await this.authService.findOne(payload.id);
      request['usuario'] = usuario;
    } catch (error: any) {
      throw new UnauthorizedException(error.message);
    }
    return true;
  }
}
