import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TokenService {

    private tokenSubject = new BehaviorSubject<string | null>(null);
    private refreshTokenSubject = new BehaviorSubject<string | null>(null);

    constructor() {
        // Inicializar con el token almacenado
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');

        if (token && this.isValidJWT(token)) {
            this.tokenSubject.next(token);
        }

        if (refreshToken) {
            this.refreshTokenSubject.next(refreshToken);
        }
    }

    /**
     * Verifica si un token es un JWT válido
     */
    isValidJWT(token: string): boolean {
        if (!token) return false;

        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return false;
            }

            // Intentar decodificar para verificar que sea un JWT válido
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
     * Verifica si el token actual es válido
     */
    isTokenValid(): boolean {
        const token = this.getToken();
        if (!token) return false;

        return this.isValidJWT(token) && !this.isTokenExpired(token);
    }

    /**
     * Verifica si el token expirará pronto (dentro de 5 minutos)
     */
    isTokenExpiringSoon(): boolean {
        const token = this.getToken();
        if (!token || !this.isValidJWT(token)) {
            return true;
        }

        try {
            const decoded: any = jwtDecode(token);
            const exp = decoded.exp;

            if (!exp) return true;

            const currentTime = Math.floor(Date.now() / 1000);
            const fiveMinutes = 5 * 60; // 5 minutos en segundos

            return (exp - currentTime) < fiveMinutes;
        } catch (error) {
            return true;
        }
    }

    /**
     * Obtiene el tiempo restante del token en segundos
     */
    getTokenTimeRemaining(): number {
        const token = this.getToken();
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
     * Limpia todos los tokens
     */
    clearTokens(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        this.tokenSubject.next(null);
        this.refreshTokenSubject.next(null);
    }

    /**
     * Obtiene el token actual
     */
    getToken(): string | null {
        return this.tokenSubject.value || localStorage.getItem('token');
    }

    /**
     * Guarda un token JWT
     */
    setToken(token: string): void {
        if (!this.isValidJWT(token)) {
            console.error('Intento de guardar un token JWT inválido');
            return;
        }

        localStorage.setItem('token', token);
        this.tokenSubject.next(token);
    }

    /**
     * Obtiene el refresh token
     */
    getRefreshToken(): string | null {
        return this.refreshTokenSubject.value || localStorage.getItem('refreshToken');
    }

    /**
     * Guarda un refresh token
     */
    setRefreshToken(refreshToken: string): void {
        localStorage.setItem('refreshToken', refreshToken);
        this.refreshTokenSubject.next(refreshToken);
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
        const token = this.getToken();
        if (!token || !this.isValidJWT(token)) {
            this.clearTokens();
            return;
        }

        const timeRemaining = this.getTokenTimeRemaining();
        if (timeRemaining > 0) {
            // Programar logout automático
            setTimeout(() => {
                console.warn('Logout automático por expiración de token');
                this.clearTokens();
                // Aquí podrías emitir un evento o usar un servicio para notificar al componente principal
            }, timeRemaining * 1000);
        }
    }
}
