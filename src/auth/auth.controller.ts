import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { JwtService } from '@nestjs/jwt';
import { Request } from '@nestjs/common';
import { AuthGuard } from 'src/global/guards/auth/auth.guard';
import { createJwt } from 'src/global/tools/create-jwt.tool';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Usuario } from './entities/auth.entity';
import { LisResponse } from './interfaces/list-response.interface';
import { LoginResponse } from './interfaces/login-response.interface';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    return this.authService.create(createUsuarioDto);
    /**
     que le das Promise<LoginResponse>
     const usuario=awai this.authService.create(createAuthDto);
     return{
      usuario,
      token:''
     }
    */
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const usuario = await this.authService.login(loginDto);
    return {
      usuario,
      token: createJwt({ id: usuario._id }, this.jwtService),
    };
    //return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard) //para poner mas de un guardia solo ahi mismo separado por ,
  @Get()
  async findAll(@Request() req: Request): Promise<LisResponse> {
    const usuario = await this.authService.findAll();
    const usuarioLogeado = req['usuario'] as Usuario;
    return {
      usuarios: usuario,
      token: createJwt({ id: usuarioLogeado._id }, this.jwtService),
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: Request):Promise<LoginResponse> {
    const usuario = await this.authService.findOne(id);
    const usuarioLogeado = req['usuario'] as Usuario;
    return {
      usuario,
      token: createJwt({ id: usuarioLogeado._id }, this.jwtService)
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto, @Request() req: Request,): Promise<LoginResponse> {
    const usuario = await this.authService.update(id, updateAuthDto);
    const usuarioLogeado = req['usuario'] as Usuario;
    return {
      usuario,
      token: createJwt({ id: usuarioLogeado._id }, this.jwtService)
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }
}
