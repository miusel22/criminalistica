import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData = {
    username: '',
    email: '',
    full_name: '', // Coincide con el backend (full_name)
    password: ''
  };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Los campos de usuario, email y contraseña son obligatorios.';
      return;
    }

    this.authService.register(this.registerData).subscribe({
      next: () => {
        alert('¡Usuario registrado con éxito! Ahora serás redirigido para que inicies sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error.msg || 'Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.';
        console.error(err);
      }
    });
  }
}