import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { ProductsComponent } from './pages/products/products.component';
import { UsersComponent } from './pages/users/users.component';

@NgModule({
  declarations: [DashboardComponent, ProductsComponent, UsersComponent],
  imports: [CommonModule, DashboardRoutingModule],
  exports: [],
})
export class DashboardModule {}
