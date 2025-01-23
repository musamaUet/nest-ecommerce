import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { User } from './users/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users/users.service';

export interface TokenPayload {
  userId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async login(user: User, response: Response) {
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    };

    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
    );

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires,
    });
  }

  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });
  }

  async register(userData: Partial<User>): Promise<User> {
    try {
      const { email, password } = userData;

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('email', email);
      console.log('password', password);

      // const user = await this.userService.createUser({
      //   email,
      //   password: hashedPassword,
      // });
      // console.log('createdUser', user);

      // return "user";
      return hashedPassword;
    } catch(err) {
      console.log('error', err);
    }
  }
}
