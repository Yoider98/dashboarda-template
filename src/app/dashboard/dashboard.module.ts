import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { HomeComponent } from "./pages/home/home.component";
import { ProductsComponent } from "./pages/products/products.component";
import { UsersComponent } from "./pages/users/users.component";
import { ProductFormComponent } from "./pages/products/product-form/product-form.component";
import { DiscountsComponent } from "./pages/discounts/discounts.component";
// NOTE: FormsModule y ReactiveFormsModule ya importados arriba para binding y validaciones
import { SharedModule } from "../shared/shared.module";
import { UserFormComponent } from "./pages/users/user-form/user-form.component";
import { ProfileComponent } from "./pages/profile/profile.component";

@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    ProductsComponent,
    UsersComponent,
    ProductFormComponent,
    DiscountsComponent,
    UserFormComponent,
    ProfileComponent,
  ],
  imports: [CommonModule, RouterModule, DashboardRoutingModule, ReactiveFormsModule, FormsModule, SharedModule],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule { }
