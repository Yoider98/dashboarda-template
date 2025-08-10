import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { SecurityService } from "../services/security.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private securityService: SecurityService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Verificar actividad sospechosa
    if (this.securityService.detectSuspiciousActivity()) {
      console.warn('Actividad sospechosa detectada en interceptor');
      this.handleSecurityViolation();
      return next.handle(req);
    }

    // Verificar entorno seguro
    if (!this.securityService.isSecureEnvironment()) {
      console.warn('Entorno no seguro detectado en interceptor');
      this.handleSecurityViolation();
      return next.handle(req);
    }

    const token = this.securityService.getSecureToken();

    if (!token) {
      return next.handle(req);
    }

    // Verificar que sea un JWT válido
    if (!this.securityService.isValidJWT(token)) {
      console.warn('Token JWT inválido en interceptor');
      this.handleInvalidToken();
      return next.handle(req);
    }

    // Verificar expiración
    if (this.securityService.isTokenExpired(token)) {
      console.warn('Token JWT expirado en interceptor');
      this.handleExpiredToken();
      return next.handle(req);
    }

    // Agregar el token al header de autorización
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.handleUnauthorized();
        } else if (error.status === 403) {
          this.handleForbidden();
        }
        return throwError(() => error);
      })
    );
  }

  private handleInvalidToken(): void {
    console.warn('Token JWT inválido detectado en interceptor');
    this.securityService.clearAllTokens();
  }

  private handleExpiredToken(): void {
    console.warn('Token JWT expirado detectado en interceptor');
    this.securityService.clearAllTokens();
  }

  private handleUnauthorized(): void {
    console.warn('Respuesta 401 - Token no autorizado');
    this.securityService.clearAllTokens();
  }

  private handleForbidden(): void {
    console.warn('Respuesta 403 - Acceso prohibido');
    this.securityService.clearAllTokens();
  }

  private handleSecurityViolation(): void {
    console.warn('Violación de seguridad detectada');
    this.securityService.clearAllTokens();
  }
}
