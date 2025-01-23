import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserRequest } from './dto/create-user.request';
import { User } from './schemas/user.schema';
const bcrypt = require('bcryptjs');

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(request: CreateUserRequest) {
    const validatedReq = await this.validateCreateUserRequest(request);
    try {
      const user = await this.usersRepository.create({
        ...request,
        password: await bcrypt.hash(request.password, 10),
      });
      console.log('logUser', user);
      return user;
    } catch(err) {
      console.log('logError', err);
    }

  }

  private async validateCreateUserRequest(request: CreateUserRequest) {
    let user: User;
      user = await this.usersRepository.findOne({
        email: request.email,
      });
    if (user) {
      throw new UnprocessableEntityException('Email already exists.');
    } else return true;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    return user;
  }

  async getUser(getUserArgs: Partial<User>) {
    return this.usersRepository.findOne(getUserArgs);
  }
}