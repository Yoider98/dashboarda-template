import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthInterceptor } from "./core/interceptors/http.service";
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ModalMessageComponent } from './shared/modal-message/modal-message.component';

@NgModule({
  declarations: [AppComponent, NotFoundComponent, ModalMessageComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
