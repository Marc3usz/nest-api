import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminKey = process.env.ADMIN_KEY ?? 'supersecret';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const header = request.headers['x-admin-key'];
    const providedKey = Array.isArray(header) ? header[0] : header;

    return providedKey === this.adminKey;
  }
}
