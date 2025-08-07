import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarpetaService } from '../../services/carpeta.service';
import { Carpeta } from '../../models/carpeta.model';
import { filter, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userProfile: any = null;
  carpetasPadre: Carpeta[] = [];
  isLoadingCarpetas = false;
  
  activeSectorId$: Observable<number | null>;

  constructor(
    public authService: AuthService,
    private carpetaService: CarpetaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.activeSectorId$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null),
      map(() => {
        let currentRoute = this.route.firstChild;
        while (currentRoute?.firstChild) {
            currentRoute = currentRoute.firstChild;
        }
        if (currentRoute?.snapshot.params['id'] && (currentRoute.snapshot.routeConfig?.path?.includes('sector') || currentRoute.snapshot.routeConfig?.path?.includes('subsector'))) {
          const activeId = +currentRoute.snapshot.params['id'];
          const parentMatch = this.carpetasPadre.find(c => c.id === activeId);
          if (parentMatch) return parentMatch.id;
          
        }
        if(currentRoute?.snapshot.routeConfig?.path?.includes('sector/:id')) {
          return +currentRoute.snapshot.params['id'];
        }
        return null;
      })
    );
  }

  ngOnInit(): void {
    this.userProfile = this.authService.getCurrentUser();
    if (!this.userProfile) {
      this.authService.fetchAndSetProfile().subscribe(profile => {
        this.userProfile = profile;
        if (this.userProfile) this.loadCarpetasPadre();
      });
    } else {
      this.loadCarpetasPadre();
    }
  }

  loadCarpetasPadre(): void {
    this.isLoadingCarpetas = true;
    this.carpetaService.getCarpetas().subscribe({
      next: (data) => {
        this.carpetasPadre = data;
        this.isLoadingCarpetas = false;
      },
      error: (err) => {
        console.error("Error al cargar sectores", err);
        this.isLoadingCarpetas = false;
      }
    });
  }

  seleccionarSector(sector: Carpeta): void {
    this.router.navigate(['/dashboard/sector', sector.id]);
  }

  crearNuevoSector(): void {
    const nombre = prompt(`Introduce el nombre del nuevo sector:`);
    if (!nombre || nombre.trim() === '') return;
    
    this.carpetaService.crearCarpeta(nombre.trim()).subscribe({
      next: (response) => {
        alert(response.msg || `Sector creado con éxito`);
        this.loadCarpetasPadre();
      },
      error: (err) => {
        const errorMessage = err.error?.msg || `No se pudo crear el sector.`;
        alert(`Error: ${errorMessage}`);
      }
    });
  }
  
  editarSector(event: MouseEvent, sector: Carpeta): void {
    event.stopPropagation();
    const nuevoNombre = prompt(`Editar nombre del sector "${sector.nombre}":`, sector.nombre);
    if (!nuevoNombre || nuevoNombre.trim() === '' || nuevoNombre.trim() === sector.nombre) {
      return;
    }
    
    this.carpetaService.actualizarCarpeta(sector.id, nuevoNombre.trim()).subscribe({
      next: () => {
        alert("Sector actualizado con éxito.");
        this.loadCarpetasPadre();
      },
      error: err => alert(`Error: ${err.error?.msg || 'No se pudo actualizar.'}`)
    });
  }

  borrarSector(event: MouseEvent, sector: Carpeta): void {
    event.stopPropagation();
    if (confirm(`¿Estás seguro de que quieres eliminar el sector "${sector.nombre}"? Esto borrará todos sus sub-sectores e indiciados de forma permanente.`)) {
      this.carpetaService.borrarCarpeta(sector.id).subscribe({
        next: () => {
          alert("Sector eliminado con éxito.");
          if (this.router.url.includes(`/sector/${sector.id}`) || this.router.url.includes(`/subsector/`)) { // Simplificado
            this.router.navigate(['/dashboard']);
          }
          this.loadCarpetasPadre();
        },
        error: err => alert(`Error: ${err.error?.msg || 'No se pudo eliminar.'}`)
      });
    }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value.trim();

    if (query) {
      this.router.navigate(['/dashboard/search'], { queryParams: { q: query } });
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}