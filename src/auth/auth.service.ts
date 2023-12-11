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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
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

  async login(loginDto: LoginDto): Promise<Usuario> {
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
    return user;
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

  async update(id: string, usuario: UpdateAuthDto): Promise<Usuario> {
    await this.usuarioModel.updateOne({ id }, usuario);
    return this.findOne(id);
  }

  async remove(id: string): Promise<Usuario> {
    // Encuentralo antes de eliminarlo
    const usuarior = await this.findOne(id);

    if (!usuarior) {
      throw new NotFoundException('Usuario no encontrado con ese id');
    }
    usuarior.isActive = false;
    // Elimina el usuario
    await this.usuarioModel.updateOne({ _id: id }, usuarior);
    return usuarior; // Devuelve el usurario encontrado antes de eliminarlo
    // return this.findOne(id);
  }
}
