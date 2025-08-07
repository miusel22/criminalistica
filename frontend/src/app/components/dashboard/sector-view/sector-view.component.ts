import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CarpetaService } from '../../../services/carpeta.service';
import { Carpeta } from '../../../models/carpeta.model';
import { Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-sector-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sector-view.component.html',
  styleUrls: ['../dashboard.component.css', './sector-view.component.css']
})
export class SectorViewComponent implements OnInit {
  sector: Carpeta | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carpetaService: CarpetaService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!id) {
          this.router.navigate(['/dashboard']);
          return new Observable<Carpeta | null>(sub => sub.next(null));
        }
        return this.carpetaService.getCarpetaConIndiciados(id);
      }),
      tap(sectorData => {
        this.sector = sectorData;
        this.isLoading = false;
      })
    ).subscribe({
        error: err => {
            this.isLoading = false;
            console.error('[SectorView] Error al cargar el sector:', err);
            alert('No se pudo cargar el sector.');
            this.router.navigate(['/dashboard']);
        }
    });
  }

  seleccionarSubSector(subSectorId: number): void {
    this.router.navigate(['/dashboard/subsector', subSectorId]);
  }

  crearNuevoSubSector(sectorActual: Carpeta): void {
    const nombre = prompt(`Introduce el nombre del nuevo sub-sector para "${sectorActual.nombre}":`);
    if (!nombre || !nombre.trim()) return;
    
    this.carpetaService.crearCarpeta(nombre.trim(), sectorActual.id).subscribe({
      next: () => {
        alert(`Sub-sector creado con éxito`);
        this.loadData();
      },
      error: (err) => alert(`Error: ${err.error?.msg || 'No se pudo crear.'}`)
    });
  }
}