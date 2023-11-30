import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Model } from 'mongoose';
import { Usuario } from './entities/auth.entity';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

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

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
