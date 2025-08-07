import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { Indiciado } from '../../../models/indiciado.model';
import { IndiciadoService } from '../../../services/indiciado.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['../dashboard.component.css', './search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  searchResults: Indiciado[] = [];
  searchQuery = '';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private indiciadoService: IndiciadoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const query = params.get('q');
      if (query) {
        this.searchQuery = query;
        this.performSearch(query);
      } else {
        this.isLoading = false;
        this.searchResults = [];
        this.searchQuery = '';
      }
    });
  }

  async performSearch(query: string): Promise<void> {
    this.isLoading = true;
    console.log(`[SearchResults] Buscando: "${query}"`);

    try {
      const results = await firstValueFrom(this.indiciadoService.searchIndiciados(query));
      console.log('[SearchResults] Resultados recibidos:', results);
      this.searchResults = results;
    } catch (error) {
      console.error('[SearchResults] Error durante la búsqueda:', error);
      this.searchResults = [];
      alert('Ocurrió un error al realizar la búsqueda.');
    } finally {
      this.isLoading = false;
      console.log('[SearchResults] Búsqueda finalizada. isLoading = false');
      this.cdr.detectChanges();
    }
  }

  goToIndiciado(indiciado: Indiciado): void {
    this.router.navigate(['/dashboard/subsector', indiciado.carpeta_id]);
  }
}