import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { ProductsComponent } from "./pages/products/products.component";
import { UsersComponent } from "./pages/users/users.component";
import { ProductFormComponent } from "./pages/products/product-form/product-form.component";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    DashboardComponent,
    ProductsComponent,
    UsersComponent,
    ProductFormComponent,
  ],
  imports: [CommonModule, DashboardRoutingModule, ReactiveFormsModule],
  exports: [],
})
export class DashboardModule {}
