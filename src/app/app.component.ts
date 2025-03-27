import { Component } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  isAuthRoute = false;
  isReady = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAuthRoute =
          event.url.startsWith("/auth") || event.url.startsWith("/404");
        this.isReady = true;
      }
    });
  }

  isAuthenticated(): boolean {
    // Aquí iría tu lógica de autenticación
    return !!localStorage.getItem("token");
  }

  logout(): void {
    localStorage.removeItem("token");
    this.router.navigate(["/auth"]);
  }
}
