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
  userProfile: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const profile = this.authService.getCurrentUser();

    if (profile) {
      this.userProfile = profile;
    } else {
      this.authService.fetchAndSetProfile().subscribe({
        next: (profileData) => {
          this.userProfile = profileData;
        },
        error: (err) => {
          console.error("Error al obtener el perfil en el dashboard:", err);
          this.authService.logout(); 
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}