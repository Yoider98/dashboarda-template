import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { AuthService } from "./core/services/auth.service";
import { SecurityService } from "./core/services/security.service";
import { RefreshTokenService } from "./core/services/refresh-token.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  isAuthRoute = false;
  isReady = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private securityService: SecurityService,
    private refreshTokenService: RefreshTokenService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAuthRoute =
          event.url.startsWith("/auth") || event.url.startsWith("/404");
        this.isReady = true;
      }
    });
  }

  ngOnInit() {
    // Inicializar servicios de seguridad al cargar la aplicación
    this.initializeSecurityServices();
  }

  private initializeSecurityServices() {
    // Verificar actividad sospechosa al iniciar
    if (this.securityService.detectSuspiciousActivity()) {
      console.warn('Actividad sospechosa detectada al iniciar la aplicación');
      this.securityService.clearAllTokens();
      this.router.navigate(['/auth']);
      return;
    }

    // Verificar entorno seguro
    if (!this.securityService.isSecureEnvironment()) {
      console.warn('Entorno no seguro detectado al iniciar la aplicación');
      this.securityService.clearAllTokens();
      this.router.navigate(['/auth']);
      return;
    }

    // Verificar si hay un token válido al iniciar
    if (this.securityService.isTokenValid()) {
      console.log('Token válido encontrado al iniciar la aplicación');

      // Programar renovación automática
      this.refreshTokenService.scheduleTokenRefresh();

      // Programar logout automático por expiración
      this.securityService.logoutOnExpiration();
    } else {
      console.log('No hay token válido al iniciar la aplicación');
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
  }

  /**
   * Obtiene información del usuario actual
   */
  getUserInfo(): any {
    return this.authService.getUserInfo();
  }

  /**
   * Verifica si el token necesita renovación
   */
  shouldRefreshToken(): boolean {
    return this.authService.shouldRefreshToken();
  }

  /**
   * Verifica si el entorno es seguro
   */
  isSecureEnvironment(): boolean {
    return this.authService.isSecureEnvironment();
  }

  /**
   * Detecta actividad sospechosa
   */
  detectSuspiciousActivity(): boolean {
    return this.authService.detectSuspiciousActivity();
  }
}
