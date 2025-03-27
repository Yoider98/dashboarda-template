import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { NotFoundComponent } from "./pages/not-found/not-found.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard", // Redirigir a dashboard si la ruta está vacía
    pathMatch: "full", // Importante para evitar coincidencias parciales
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then((m) => m.AuthModule),
  },
  {
    path: "dashboard",
    loadChildren: () =>
      import("./dashboard/dashboard.module").then((m) => m.DashboardModule),
  },
  { path: "404", component: NotFoundComponent }, // Página de error explícita
  { path: "**", redirectTo: "/404" }, // Redirige rutas inexistentes a /404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
