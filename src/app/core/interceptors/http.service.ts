import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { jwtDecode } from "jwt-decode";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem("token");

    if (token && !this.isTokenExpired(token)) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    } else if (token && this.isTokenExpired(token)) {
      // Token expirado: limpiar y redirigir
      localStorage.removeItem("token");
      this.router.navigate(["/auth"]);
      // Opcional: lanzar un error o dejar que la petición falle
    }

    return next.handle(req);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp;
      if (!exp) return true;

      const now = Math.floor(new Date().getTime() / 1000);
      return exp < now;
    } catch (error) {
      // Si el token no es válido
      return true;
    }
  }
}
