import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { User } from './users/schemas/user.schema';
import { UsersService } from './users/users.service';
const bcrypt = require('bcryptjs');

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

  async login(userData: Partial<User>, response: Response) {
    const user = await this.userService.findUserByEmail(userData.email);

    console.log('user', user);

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
    return { token, user }
  }

  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });
  }

  async register(userData: Partial<User>): Promise<User> {
    const { email, password } = userData;
    const hashedPassword = await bcrypt.hashSync(password, 10);
    const user = await this.userService.createUser({
      email,
      password: hashedPassword,
    });
    console.log('createdUser', user);
    return user;
  }
}
