import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import * as cookie from 'cookie';
import { Socket } from 'socket.io';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Determine if the request is HTTP or WebSocket
    if (context.getType() === 'http') {
      return this.validateHttpRequest(context);
    } else if (context.getType() === 'ws') {
      return this.validateWebSocketRequest(context);
    }

    return false;
  }

  private async validateHttpRequest(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(request);
    console.log('Extracted Token:', token); // Log the token for debugging
    if (!token) {
      throw new UnauthorizedException('No token, please login'); // Throw error if no token is found
    }

    try {
      // Verify the token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'your_jwt_secret', // Ensure the secret is the same as used in token generation
      });
      // Set the user object on the request
      request['user'] = payload;
      return true;
    } catch (err) {
      console.error('Token verification error:', err); // Log the error for debugging
      throw new UnauthorizedException('Invalid token'); // Throw error if token verification fails
    }
  }

  private async validateWebSocketRequest(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const cookies = client.handshake.headers.cookie;
    if (!cookies) {
      throw new UnauthorizedException('No cookies found');
    }

    const { auth_token } = cookie.parse(cookies);
    if (!auth_token) {
      throw new UnauthorizedException('No token, please login');
    }

    try {
      const decoded = this.jwtService.verify(auth_token, {
        secret: 'your_jwt_secret', // Ensure the secret is the same as used in token generation
      });
      client.handshake.auth.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromCookie(request: Request): string | null {
    const cookies = request.headers.cookie;
    if (!cookies) {
      return null;
    }

    const { auth_token } = cookie.parse(cookies);
    return auth_token || null;
  }
}