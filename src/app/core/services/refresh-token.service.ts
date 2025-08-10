import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SecurityService } from './security.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RefreshTokenService {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    private securityService: SecurityService,
    private router: Router
  ) { }

  /**
   * Renueva el token usando el refresh token de forma segura
   */
  refreshToken(): Observable<any> {
    const refreshToken = this.securityService.getSecureRefreshToken();

    if (!refreshToken) {
      this.handleRefreshError('No hay refresh token disponible');
      return throwError(() => new Error('No hay refresh token disponible'));
    }

    // Verificar actividad sospechosa
    if (this.securityService.detectSuspiciousActivity()) {
      this.handleRefreshError('Actividad sospechosa detectada durante renovación');
      return throwError(() => new Error('Actividad sospechosa detectada'));
    }

    // Verificar entorno seguro
    if (!this.securityService.isSecureEnvironment()) {
      this.handleRefreshError('Entorno no seguro para renovación de token');
      return throwError(() => new Error('Entorno no seguro'));
    }

    if (this.isRefreshing) {
      return this.refreshTokenSubject.asObservable();
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.http.post(`${environment.apiUrl}refresh-token`, {
      refreshToken: refreshToken
    }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          // Guardar nuevo token de forma segura
          this.securityService.setSecureToken(response.token);
          
          if (response.refreshToken) {
            this.securityService.setSecureRefreshToken(response.refreshToken);
          }
          
          this.refreshTokenSubject.next(response);
        }
        this.isRefreshing = false;
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.handleRefreshError('Error al renovar el token');
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica si el token necesita renovación
   */
  shouldRefreshToken(): boolean {
    return this.securityService.isTokenExpiringSoon();
  }

  /**
   * Programa la renovación automática del token
   */
  scheduleTokenRefresh(): void {
    const token = this.securityService.getSecureToken();
    if (!token || !this.securityService.isValidJWT(token)) {
      return;
    }

    // Verificar actividad sospechosa
    if (this.securityService.detectSuspiciousActivity()) {
      console.warn('Actividad sospechosa detectada - cancelando renovación automática');
      return;
    }

    const timeRemaining = this.securityService.getTokenTimeRemaining();
    const refreshTime = Math.max(0, timeRemaining - (5 * 60)); // Renovar 5 minutos antes

    if (refreshTime > 0) {
      setTimeout(() => {
        this.refreshToken().subscribe({
          next: (response) => {
            console.log('Token renovado automáticamente de forma segura');
            // Programar la siguiente renovación
            this.scheduleTokenRefresh();
          },
          error: (error) => {
            console.error('Error en renovación automática:', error);
            this.handleRefreshError('Error en renovación automática');
          }
        });
      }, refreshTime * 1000);
    }
  }

  /**
   * Maneja errores de renovación de token
   */
  private handleRefreshError(message: string): void {
    console.warn(message);
    this.securityService.clearAllTokens();
    this.router.navigate(['/auth']);
  }

  /**
   * Verifica si hay una renovación en progreso
   */
  isRefreshingToken(): boolean {
    return this.isRefreshing;
  }

  /**
   * Obtiene el observable de renovación de token
   */
  getRefreshTokenObservable(): Observable<any> {
    return this.refreshTokenSubject.asObservable();
  }
}
