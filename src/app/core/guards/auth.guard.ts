import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem("token");
    if (!token || this.isTokenExpired(token)) {
      return this.router.createUrlTree(["/auth"]);
    }

    // Puedes agregar validación de expiración del token si es JWT
    if (token) {
      return true;
    }

    // Redirige y retorna UrlTree para mejor compatibilidad con rutas
    return this.router.createUrlTree(["/auth"]);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true; // Si no se puede decodificar, lo tratamos como expirado
    }
  }
}
