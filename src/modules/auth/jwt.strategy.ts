import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../user-mamangement/user.repository';

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly usersRepo: UsersRepository,
  ) {
    const secret = config.get<string>('app.jwt.secret');
     console.log('JWT SECRET LOADED:----------------------------', secret);  
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('app.jwt.secret') as string,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersRepo.findById(payload.sub);
   console.log(user,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user; // attached to req.user
  }
}