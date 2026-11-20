import { JwtPayload } from '../models/auth.model';

export class JwtHelper {

  static decodeToken(token: string): JwtPayload | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))) as JwtPayload;
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload?.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }
}