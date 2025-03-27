import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../../core/services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLogin: boolean = true;
  showModal = false;
  resetEmail = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });

    this.registerForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
      confirmPassword: ["", Validators.required],
    });
  }
  toggleForm() {
    this.isLogin = !this.isLogin; // Alterna entre login y register
  }

  openForgotPasswordModal() {
    this.showModal = true;
  }

  closeForgotPasswordModal() {
    this.showModal = false;
  }

  sendPasswordReset() {
    if (this.resetEmail) {
      alert("Se ha enviado un enlace de recuperación a: " + this.resetEmail);
      this.showModal = false;
      this.resetEmail = "";
    }
  }

  onSubmit() {
    if (this.isLogin) {
      if (this.loginForm.valid) {
        this.authService.login(this.loginForm.value).subscribe((response) => {
          localStorage.setItem("token", response.token);
          this.router.navigate(["/dashboard"]);
        });
      }
    } else {
      if (this.registerForm.valid) {
        console.log("Registro exitoso", this.registerForm.value);
      }
    }
  }
}
