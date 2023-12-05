import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Model } from 'mongoose';
import { Usuario } from './entities/auth.entity';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/login-response.interface';
import { createJwt } from 'src/global/tools/create-jwt.tool';
import { JwtService } from '@nestjs/jwt';
import { LisResponse } from './interfaces/list-response.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    private jwtService: JwtService,
  ) {}

  async create(CreateUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    try {
      CreateUsuarioDto.password = bcrypt.hashSync(
        CreateUsuarioDto.password,
        10,
      )
      const newUsuario = new this.usuarioModel(CreateUsuarioDto);
      await newUsuario.save();
      const usuario = newUsuario.toJSON();
      return usuario;
    } catch (error) {
      console.log(error);
      if (error.code == 11000) {
        throw new BadRequestException(
          `${CreateUsuarioDto.email} ya está registrado`,
        );
      }
      throw new InternalServerErrorException('Mi primera chamba');
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;
    const usuario = await this.usuarioModel.findOne({
      //propiedad:valor
      email: email,
      //puede ser tambien asi: email
    });
    if (!usuario) {
      throw new NotFoundException(
        `No se encontro usuario con el email ${email}`,
      );
    }
    //primero la contraseña no encriptada y luego la encriptada.
    if (!bcrypt.compareSync(password, usuario.password)) {
      throw new UnauthorizedException(
        `La contraseña del usuario es incorrecta`,
      );
    }
    const { password:_, ...user } = usuario.toJSON();
    return {
      usuario: user,
      tocken: createJwt(
        {
          id: usuario.id,
        },
        this.jwtService
      )
    };
  }

  async findAll(): Promise<Usuario[]> {
    const usuarios = await this.usuarioModel.find();
    return usuarios.map((usuario) => {
      const { password, ...rest } = usuario.toJSON();
      return rest;
    });
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findById(id);
    const { password, ...rest } = usuario.toJSON();
    return rest;
  }

  async update(id: string, usuario: UpdateAuthDto) {
    await this.usuarioModel.updateOne({ id }, usuario);
    return this.findOne(id);
  }

  async remove(id: string) {
    // Encuentralo antes de eliminarlo
    const usuarior = await this.usuarioModel.findOne({ id: id });

    if (!usuarior) {
      throw new Error('Uusuario no encontrado');
    }
    // Elimina el usuario
    await this.usuarioModel.deleteOne({ id: id });
    return usuarior; // Devuelve el documento encontrado antes de eliminarlo
    // return this.findOne(id);
  }
}
