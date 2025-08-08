import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ApiService } from "./api.service";

@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(private api: ApiService) {}

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

  logout() {
    localStorage.removeItem("token");
  }
}
