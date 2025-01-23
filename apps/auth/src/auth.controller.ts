import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import JwtAuthGuard from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from './users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() userData: Partial<User>,
    @Res() response: Response,
  ) {
    const user = await this.authService.login(userData, response);
    console.log('user', userData);
    response.status(200).json({ user });
  }

  @Post('register')
  async register(
    @Body() userData: Partial<User>,
    @Res() response: Response,
  ) {
      console.log('userData', userData);
      const user = await this.authService.register(userData);
      // response.status(200).json({ message: 'Manual response', payload: user });
      await this.authService.login(user, response);
      return response.send(user);
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('validate_user')
  async validateUser(@CurrentUser() user: User) {
    return user;
  }
}
