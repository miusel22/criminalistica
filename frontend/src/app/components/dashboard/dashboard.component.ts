import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userProfile: any = null; // Para guardar todos los datos del perfil

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Intenta obtener el perfil del servicio (si el usuario acaba de iniciar sesión)
    const profile = this.authService.getCurrentUser();

    if (profile) {
      this.userProfile = profile;
    } else {
      // Si no está, es porque el usuario recargó la página. Lo pedimos de nuevo.
      this.authService.fetchAndSetProfile().subscribe({
        next: (profileData) => {
          this.userProfile = profileData;
        },
        error: (err) => {
          console.error("Error al obtener el perfil en el dashboard:", err);
          this.authService.logout(); // Si falla, lo deslogueamos por seguridad
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}