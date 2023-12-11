import { Usuario } from "../entities/auth.entity";
export interface LisResponse{
  usuarios: Usuario[],
  token: string
}