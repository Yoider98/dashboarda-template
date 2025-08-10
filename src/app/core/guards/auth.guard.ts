import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { SecurityService } from "../services/security.service";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private securityService: SecurityService
  ) { }

  canActivate(): boolean | UrlTree {
    // Verificar actividad sospechosa
    if (this.securityService.detectSuspiciousActivity()) {
      console.warn('Actividad sospechosa detectada en AuthGuard');
      this.clearTokenAndRedirect();
      return this.router.createUrlTree(["/auth"]);
    }

    // Verificar entorno seguro
    if (!this.securityService.isSecureEnvironment()) {
      console.warn('Entorno no seguro detectado');
      this.clearTokenAndRedirect();
      return this.router.createUrlTree(["/auth"]);
    }

    const token = this.securityService.getSecureToken();

    if (!token) {
      this.redirectToLogin();
      return this.router.createUrlTree(["/auth"]);
    }

    // Verificar que sea un JWT válido
    if (!this.securityService.isValidJWT(token)) {
      console.warn('Token JWT inválido en AuthGuard');
      this.clearTokenAndRedirect();
      return this.router.createUrlTree(["/auth"]);
    }

    // Verificar expiración
    if (this.securityService.isTokenExpired(token)) {
      console.warn('Token JWT expirado en AuthGuard');
      this.clearTokenAndRedirect();
      return this.router.createUrlTree(["/auth"]);
    }

    return true;
  }

  private clearTokenAndRedirect(): void {
    this.securityService.clearAllTokens();
    this.redirectToLogin();
  }

  private redirectToLogin(): void {
    console.log('Redirigiendo a login - token inválido o expirado');
  }
}
