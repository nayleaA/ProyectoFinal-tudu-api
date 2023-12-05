import { JwtService } from '@nestjs/jwt';
import { JwtPyload } from '../interfaces/jwtpayload.iterface';
export const createJwt = (
  payload: JwtPyload,
  jwstService: JwtService): string => {
  return jwstService.sign(payload);
}