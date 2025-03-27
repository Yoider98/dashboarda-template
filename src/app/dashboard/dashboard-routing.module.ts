import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { AuthGuard } from "../core/guards/auth.guard";
import { ProductsComponent } from "./pages/products/products.component";
import { UsersComponent } from "./pages/users/users.component";
const routes: Routes = [
  {
    path: "",
    component: DashboardComponent,
    canActivate: [AuthGuard], // Protege el acceso al Dashboard
    children: [
      {
        path: "products",
        component: ProductsComponent,
        canActivate: [AuthGuard], // Protege también los productos
      },
      {
        path: "users",
        component: UsersComponent,
        canActivate: [AuthGuard], // Protege también los usuarios
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
