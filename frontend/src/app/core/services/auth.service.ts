import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '../config';
import {
  AppUser,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ROLE_ADMIN,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/auth`;

  private readonly _user = signal<AppUser | null>(null);
  private readonly _token = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.roles.includes(ROLE_ADMIN) ?? false);

  constructor() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      this._token.set(token);
      this.loadCurrentUser().subscribe();
    }
  }

  get token(): string | null {
    return this._token();
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, request)
      .pipe(tap((response) => this.setSession(response)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/register`, request)
      .pipe(tap((response) => this.setSession(response)));
  }

  loadCurrentUser(): Observable<AppUser | null> {
    return this.http.get<AppUser>(`${this.base}/me`).pipe(
      tap((user) => this._user.set(user)),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  private setSession(response: AuthResponse): void {
    this._token.set(response.token);
    this._user.set(response.user);
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
  }
}
