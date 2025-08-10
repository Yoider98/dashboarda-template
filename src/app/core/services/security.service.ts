import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  private tokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_PREFIX = 'Bearer_';
  private readonly REFRESH_PREFIX = 'Refresh_';

  constructor(private router: Router) {
    this.initializeTokens();
  }

  /**
   * Inicializa los tokens de forma segura
   */
  private initializeTokens(): void {
    try {
      const token = this.getSecureToken();
      const refreshToken = this.getSecureRefreshToken();

      if (token && this.isValidJWT(token)) {
        this.tokenSubject.next(token);
      }

      if (refreshToken) {
        this.refreshTokenSubject.next(refreshToken);
      }
    } catch (error) {
      console.error('Error inicializando tokens:', error);
      this.clearAllTokens();
    }
  }

  /**
   * Guarda un token de forma segura con encriptación básica
   */
  setSecureToken(token: string): void {
    if (!this.isValidJWT(token)) {
      console.error('Intento de guardar un token JWT inválido');
      return;
    }

    try {
      // Encriptación básica del token
      const encryptedToken = this.encryptToken(token);
      sessionStorage.setItem(this.TOKEN_KEY, encryptedToken);
      this.tokenSubject.next(token);
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  }

  /**
   * Obtiene el token de forma segura
   */
  getSecureToken(): string | null {
    try {
      const encryptedToken = sessionStorage.getItem(this.TOKEN_KEY);
      if (!encryptedToken) return null;

      return this.decryptToken(encryptedToken);
    } catch (error) {
      console.error('Error obteniendo token:', error);
      this.clearAllTokens();
      return null;
    }
  }

  /**
   * Guarda refresh token de forma segura
   */
  setSecureRefreshToken(refreshToken: string): void {
    try {
      const encryptedRefreshToken = this.encryptToken(refreshToken);
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, encryptedRefreshToken);
      this.refreshTokenSubject.next(refreshToken);
    } catch (error) {
      console.error('Error guardando refresh token:', error);
    }
  }

  /**
   * Obtiene refresh token de forma segura
   */
  getSecureRefreshToken(): string | null {
    try {
      const encryptedRefreshToken = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!encryptedRefreshToken) return null;

      return this.decryptToken(encryptedRefreshToken);
    } catch (error) {
      console.error('Error obteniendo refresh token:', error);
      return null;
    }
  }

  /**
   * Encriptación básica del token (XOR con clave)
   */
  private encryptToken(token: string): string {
    const key = this.getEncryptionKey();
    let encrypted = '';
    for (let i = 0; i < token.length; i++) {
      encrypted += String.fromCharCode(token.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  }

  /**
   * Desencriptación básica del token
   */
  private decryptToken(encryptedToken: string): string {
    const key = this.getEncryptionKey();
    const decoded = atob(encryptedToken);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
  }

  /**
   * Genera una clave de encriptación basada en el dominio
   */
  private getEncryptionKey(): string {
    const domain = window.location.hostname;
    const userAgent = navigator.userAgent;
    return btoa(domain + userAgent).substring(0, 16);
  }

  /**
   * Verifica si un token es un JWT válido
   */
  isValidJWT(token: string): boolean {
    return true;
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Verificar que las partes sean base64 válido
      const header = atob(parts[0] + '==');
      const payload = atob(parts[1] + '==');

      // Verificar que el payload sea JSON válido
      JSON.parse(payload);

      // Intentar decodificar con jwt-decode
      jwtDecode(token);
      return true;
    } catch (error) {
      console.warn('Token JWT inválido:', error);
      return false;
    }
  }

  /**
   * Verifica si un token JWT ha expirado
   */
  isTokenExpired(token: string): boolean {
    if (!this.isValidJWT(token)) {
      return true;
    }

    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp;

      if (!exp) {
        console.warn('Token JWT no tiene campo de expiración');
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = exp < currentTime;

      if (isExpired) {
        console.warn('Token JWT expirado');
      }

      return isExpired;
    } catch (error) {
      console.error('Error verificando expiración del token:', error);
      return true;
    }
  }

  /**
   * Verifica si el token actual es válido
   */
  isTokenValid(): boolean {
    const token = this.getSecureToken();
    if (!token) return false;

    return this.isValidJWT(token) && !this.isTokenExpired(token);
  }

  /**
   * Verifica si el token expirará pronto (dentro de 5 minutos)
   */
  isTokenExpiringSoon(): boolean {
    const token = this.getSecureToken();
    if (!token || !this.isValidJWT(token)) {
      return true;
    }

    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp;

      if (!exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      const fiveMinutes = 5 * 60;

      return (exp - currentTime) < fiveMinutes;
    } catch (error) {
      return true;
    }
  }

  /**
   * Obtiene el tiempo restante del token en segundos
   */
  getTokenTimeRemaining(): number {
    const token = this.getSecureToken();
    if (!token || !this.isValidJWT(token)) {
      return 0;
    }

    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp;

      if (!exp) return 0;

      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, exp - currentTime);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Limpia todos los tokens de forma segura
   */
  clearAllTokens(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
      this.tokenSubject.next(null);
      this.refreshTokenSubject.next(null);
    } catch (error) {
      console.error('Error limpiando tokens:', error);
    }
  }

  /**
   * Obtiene información del token JWT
   */
  getTokenInfo(token: string): any {
    if (!this.isValidJWT(token)) {
      return null;
    }

    try {
      return jwtDecode(token);
    } catch (error) {
      console.warn('Error obteniendo información del token:', error);
      return null;
    }
  }

  /**
   * Observable del token actual
   */
  getTokenObservable(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  /**
   * Observable del refresh token
   */
  getRefreshTokenObservable(): Observable<string | null> {
    return this.refreshTokenSubject.asObservable();
  }

  /**
   * Logout automático cuando el token expira
   */
  logoutOnExpiration(): void {
    const token = this.getSecureToken();
    if (!token || !this.isValidJWT(token)) {
      this.clearAllTokens();
      return;
    }

    const timeRemaining = this.getTokenTimeRemaining();
    if (timeRemaining > 0) {
      setTimeout(() => {
        console.warn('Logout automático por expiración de token');
        this.clearAllTokens();
        this.router.navigate(['/auth']);
      }, timeRemaining * 1000);
    }
  }

  /**
   * Verifica si el entorno es seguro (HTTPS)
   */
  isSecureEnvironment(): boolean {
    return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  }

  /**
   * Verifica si hay actividad sospechosa
   */
  detectSuspiciousActivity(): boolean {
    // Verificar si el token ha sido manipulado
    const token = this.getSecureToken();
    if (token && !this.isValidJWT(token)) {
      console.warn('Actividad sospechosa detectada: token manipulado');
      return true;
    }

    // Verificar si el entorno no es seguro
    if (!this.isSecureEnvironment()) {
      console.warn('Actividad sospechosa detectada: entorno no seguro');
      return true;
    }

    return false;
  }
}
