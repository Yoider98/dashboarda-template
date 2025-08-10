import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ApiService } from "./api.service";
import { SecurityService } from "./security.service";
import { RefreshTokenService } from "./refresh-token.service";
import { Router } from "@angular/router";
import { tap } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(
    private api: ApiService,
    private securityService: SecurityService,
    private refreshTokenService: RefreshTokenService,
    private router: Router
  ) { }

  login(credentials: any): Observable<any> {
    return this.api.post("login", credentials);
  }

  register(data: any): Observable<any> {
    return this.api.post("signup", data);
  }

  resetPassword(email: string): Observable<any> {
    return this.api.post("reset-password", { email });
  }

  getUserProfile(): Observable<any> {
    return this.api.get("user/profile");
  }

  /**
   * Login mejorado que maneja tokens y refresh tokens de forma segura
   */
  loginWithTokens(credentials: any): Observable<any> {
    return this.api.post("login", credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          // Verificar actividad sospechosa antes de guardar
          if (this.securityService.detectSuspiciousActivity()) {
            console.error('Actividad sospechosa detectada durante login');
            throw new Error('Actividad sospechosa detectada');
          }

          // Verificar entorno seguro
          if (!this.securityService.isSecureEnvironment()) {
            console.error('Entorno no seguro para guardar tokens');
            throw new Error('Entorno no seguro');
          }

          // Guardar token principal de forma segura
          this.securityService.setSecureToken(response.token);

          // Guardar refresh token si está disponible
          if (response.refreshToken) {
            this.securityService.setSecureRefreshToken(response.refreshToken);
          }

          // Programar renovación automática
          this.refreshTokenService.scheduleTokenRefresh();

          console.log('Login exitoso - tokens guardados de forma segura');
        }
      })
    );
  }

  /**
   * Logout que limpia todos los tokens de forma segura
   */
  logout() {
    this.securityService.clearAllTokens();
    this.router.navigate(['/auth']);
    console.log('Logout completado - tokens limpiados de forma segura');
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.securityService.isTokenValid();
  }

  /**
   * Obtiene información del usuario desde el token
   */
  getUserInfo(): any {
    const token = this.securityService.getSecureToken();
    if (token) {
      return this.securityService.getTokenInfo(token);
    }
    return null;
  }

  /**
   * Renueva el token actual
   */
  refreshCurrentToken(): Observable<any> {
    return this.refreshTokenService.refreshToken();
  }

  /**
   * Verifica si el token necesita renovación
   */
  shouldRefreshToken(): boolean {
    return this.refreshTokenService.shouldRefreshToken();
  }

  /**
   * Verifica si el entorno es seguro
   */
  isSecureEnvironment(): boolean {
    return this.securityService.isSecureEnvironment();
  }

  /**
   * Detecta actividad sospechosa
   */
  detectSuspiciousActivity(): boolean {
    return this.securityService.detectSuspiciousActivity();
  }
}
