import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';


export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
// current-user.decorator.ts


export const webuser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const client = ctx.switchToWs().getClient<Socket>();
  const user = client.data.user; // Retrieve user data attached during the handshake

  if (!user) {
    throw new WsException('User not authenticated');
  }

  return user;
});