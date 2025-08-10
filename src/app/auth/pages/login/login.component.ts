import { Component } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  loading: boolean = false; // Estado para mostrar el cargando
  errorMessage: string = ""; // Mensaje de error
  showErrorModal: boolean = false; // Controla la visibilidad del modal de error
  showSuccessNotification: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  isLogin: boolean = true;
  showModal: boolean = false;
  resetEmail: string = "";
  rememberMe: boolean = false;

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Formulario de inicio de sesión
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });

    // Formulario de registro
    this.registerForm = this.fb.group(
      {
        name: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, this.passwordValidator]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator }
    ); // ✅ Correcto
  }
  ngOnInit() {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      this.rememberMe = true;
      this.loginForm.get("email").setValue(savedEmail);
    }
  }

  showError(message: string) {
    this.errorMessage = message;
    this.showErrorModal = true;
  }
  // Validador personalizado para la contraseña
  passwordValidator(control: AbstractControl) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(control.value)) {
      return { passwordInvalid: true };
    }
    return null;
  }

  passwordMatchValidator(formGroup: AbstractControl) {
    const passwordControl = formGroup.get("password");
    const confirmPasswordControl = formGroup.get("confirmPassword");

    if (!passwordControl || !confirmPasswordControl) return null;

    return passwordControl.value === confirmPasswordControl.value
      ? null
      : { mismatch: true };
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true; // Activar estado de carga
    this.errorMessage = ""; // Limpiar errores anteriores

    const { email, password } = this.loginForm.value;

    this.authService.loginWithTokens({ email, password }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && response.token) {
          this.router.navigate(["/dashboard"]);
        } else if (response && response.error) {
          console.log("Error de inicio de sesión:", response);
          this.showError(response.error.message || "Error de inicio de sesión");
        }
      },
      error: (error) => {
        this.loading = false;
        this.showError(
          error.error.error.message || error.message || "Error de inicio de sesión"
        );
        console.error(error);
      }
    });
  }
  onRegisterSubmit() {
    console.log("Formulario de registro:", this.registerForm.value);
    if (this.registerForm.invalid) {
      console.log("Formulario inválido");
      this.registerForm.markAllAsTouched();
      this.showError("Por favor, revise el formulario, y corrija los errores.");
      return;
    }

    this.loading = true; // Activar estado de carga
    this.errorMessage = ""; // Limpiar errores anteriores

    const { name, email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.showError("Las contraseñas no coinciden.");
      this.loading = false;
      return;
    }

    this.authService.register({ name, email, password }).subscribe(
      (response) => {
        this.loading = false;
        if (response && typeof response.token === 'string' && response.token.trim() !== '') {
          this.toggleForm(); // Cambiar a formulario de login si deseas
          this.registerForm.reset();
          this.showSuccessNotification = true;
          this.loginForm.get("email").setValue(email); // Prellenar el campo de correo electrónico
          setTimeout(() => {
            this.showSuccessNotification = false;
          }, 3000);
        } else {
          this.showError(response.message || "Error al registrarse");
        }
      },
      (error) => {
        this.loading = false;
        this.showError(error.message || "Error al registrarse");
        console.error(error);
      }
    );
  }

  openForgotPasswordModal() {
    this.showModal = true;
  }

  closeForgotPasswordModal() {
    this.showModal = false;
  }

  sendPasswordReset() {
    this.loading = true; // Activar estado de carga
    this.errorMessage = ""; // Limpiar errores anteriores
    console.log("Se envió el correo de recuperación a:", this.resetEmail);
    this.authService.resetPassword(this.resetEmail).subscribe(
      (response) => {
        this.loading = false;
        if (response && response.status == "success") {
          this.showModal = false; // Cerrar el modal
          this.resetEmail = ""; // Limpiar el campo de correo electrónico
          this.showError(response.message || "Correo de recuperación enviado.");
        } else {
          this.showError(
            "Hubo un error al restablecer contraseña. Intenta nuevamente."
          );
        }
      },
      (error) => {
        this.loading = false;
        this.showError(
          error.message || "Error al enviar el correo de recuperación"
        );
        console.error(error);
      }
    );
  }

  toggleForm() {
    this.isLogin = !this.isLogin;
    this.errorMessage = ""; // Limpiar error al cambiar de formulario
  }
  // Cerrar el modal de error
  closeModal() {
    this.showErrorModal = false;
  }
}
