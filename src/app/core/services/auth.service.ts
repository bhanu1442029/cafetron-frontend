import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  APP_ROLES,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile
} from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API = environment.apiUrl;
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly LEGACY_TOKEN_KEYS = ['cafetron_token', 'auth_token'];
  private readonly USER_KEY = 'cafetron_user';

  constructor(private http: HttpClient) {}

  // ── API calls ────────────────────────────────────────────────────

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.API}/auth/register`, request
    ).pipe(
      tap(response => this.saveSession(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.API}/auth/login`, request
    ).pipe(
      tap(response => this.saveSession(response))
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API}/users/me`);
  }

  // ── Session management ───────────────────────────────────────────

  private saveSession(response: AuthResponse): void {
    const normalizedResponse: AuthResponse = {
      ...response,
      role: this.normalizeRole(response.role) || response.role,
    };

    localStorage.setItem(this.TOKEN_KEY, response.token);
    this.LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(this.USER_KEY, JSON.stringify(normalizedResponse));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem(this.USER_KEY);
  }

  private getStoredUser(): AuthResponse | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as AuthResponse;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  getToken(): string | null {
    const primary = localStorage.getItem(this.TOKEN_KEY);
    if (primary) {
      return primary;
    }

    for (const key of this.LEGACY_TOKEN_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) {
        localStorage.setItem(this.TOKEN_KEY, legacy);
        localStorage.removeItem(key);
        return legacy;
      }
    }

    return null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getRole(): string | null {
    const role = this.getStoredUser()?.role || this.getRoleFromToken();
    if (!role) {
      return null;
    }

    return this.normalizeRole(role);
  }

  getUserName(): string | null {
    return this.getStoredUser()?.name ?? null;
  }

  getUserEmail(): string | null {
    return this.getStoredUser()?.email ?? null;
  }

  hasRole(...roles: string[]): boolean {
    const role = this.getRole();
    return !!role && roles.includes(role);
  }

  getDefaultRoute(): string {
    switch (this.getRole()) {
      case APP_ROLES.admin:
        return '/admin';
      case APP_ROLES.vendor:
        return '/vendor/orders';
      default:
        return '/menu';
    }
  }

  private normalizeRole(role: string | null | undefined): string | null {
    if (!role) {
      return null;
    }

    const normalizedRole = String(role).replace(/^ROLE_/i, '').trim().toUpperCase();
    return normalizedRole === APP_ROLES.counter ? APP_ROLES.vendor : normalizedRole;
  }

  private getRoleFromToken(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
        '='
      );
      const decoded = JSON.parse(atob(paddedPayload));
      return this.normalizeRole(decoded?.role);
    } catch {
      return null;
    }
  }
}
