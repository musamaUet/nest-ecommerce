import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, tap } from 'rxjs';
import { AUTH_SERVICE } from './services';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE) private authClient: ClientProxy) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authentication = this.getAuthentication(context);
    return this.authClient
      .send('validate_user', {
        Authentication: authentication,
      })
      .pipe(
        tap((res) => {
          this.addUser(res, context, authentication);
        }),
        catchError(() => {
          throw new UnauthorizedException();
        }),
      );
  }

  private getAuthentication(context: ExecutionContext): string {
    let authentication: string | undefined;

    if (context.getType() === 'rpc') {
      authentication = context.switchToRpc().getData().Authentication;
    } else if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers['authorization'];

      if (authHeader && authHeader.startsWith('Bearer ')) {
        authentication = authHeader.split(' ')[1]; // Extract token after "Bearer"
      }
    }

    if (!authentication) {
      throw new UnauthorizedException(
        'No value was provided for the Authorization token',
      );
    }
    return authentication;
  }

  private addUser(user: any, context: ExecutionContext, token: string) {
    if (context.getType() === 'rpc') {
      context.switchToRpc().getData().user = user;
    } else if (context.getType() === 'http') {
      context.switchToHttp().getRequest().user = user;
      context.switchToHttp().getRequest().user.token = token;
    }
  }
}
