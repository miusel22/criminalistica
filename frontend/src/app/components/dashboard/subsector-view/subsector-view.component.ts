import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarpetaService } from '../../../services/carpeta.service';
import { IndiciadoService } from '../../../services/indiciado.service';
import { Carpeta } from '../../../models/carpeta.model';
import { Indiciado } from '../../../models/indiciado.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-subsector-view',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DatePipe],
  templateUrl: './subsector-view.component.html',
  styleUrls: ['../dashboard.component.css']
})
export class SubsectorViewComponent implements OnInit {
  
  subSector: Carpeta | null = null;
  sectorPadre: Carpeta | null = null;
  isLoading = true;

  
  indiciadoForm: FormGroup;
  isFormVisible = false;
  isEditingIndiciado = false;
  isSubmitting = false;
  currentFile: File | null = null;
  indiciadoParaVer: Indiciado | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carpetaService: CarpetaService,
    private indiciadoService: IndiciadoService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    
    this.indiciadoForm = this.fb.group({
      id: [null],
      carpeta_id: [null, Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cc: ['', Validators.required],
      alias: [''],
      fecha_nacimiento: [''],
      edad: [null, [Validators.min(0), Validators.max(120)]],
      hijo_de: [''],
      estado_civil: [''],
      residencia: [''],
      telefono: [''],
      estudios_realizados: [''],
      profesion: [''],
      oficio: [''],
      senales_fisicas: [''],
      banda_delincuencial: [''],
      delitos_atribuidos: [''],
      situacion_juridica: [''],
      observaciones: [''],
      foto: [null]
    });
  }

  ngOnInit(): void {
    
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadData(id);
      }
    });
  }

  
  async loadData(id: number): Promise<void> {
    this.isLoading = true;
    console.log(`[SubsectorView] Iniciando carga de datos para ID: ${id}`);
    
    try {
      
      const subSector = await firstValueFrom(this.carpetaService.getCarpetaConIndiciados(id));
      console.log('[SubsectorView] Datos del sub-sector recibidos:', subSector);

      if (!subSector) {
        throw new Error(`El sub-sector con ID ${id} no fue encontrado.`);
      }
      this.subSector = subSector;

      
      if (subSector.parent_id) {
        console.log(`[SubsectorView] Obteniendo padre con ID: ${subSector.parent_id}`);
        const padre = await firstValueFrom(this.carpetaService.getCarpetaConIndiciados(subSector.parent_id));
        console.log('[SubsectorView] Datos del padre recibidos:', padre);
        this.sectorPadre = padre;
      } else {
        this.sectorPadre = null;
      }

    } catch (error) {
      console.error('[SubsectorView] Error durante la carga de datos:', error);
      alert('No se pudieron cargar los datos. Serás redirigido.');
      this.router.navigate(['/dashboard']);
    } finally {
      
      this.isLoading = false;
      console.log('[SubsectorView] Carga de datos finalizada. isLoading = false');
      
      
      this.cdr.detectChanges();
    }
  }

  

  verIndiciado(indiciado: Indiciado): void { this.indiciadoParaVer = indiciado; }
  cerrarVistaIndiciado(): void { this.indiciadoParaVer = null; }
  
  prepararFormulario(indiciado: Indiciado | null): void {
    if (!this.subSector) return;
    this.isFormVisible = true;
    this.currentFile = null;
    if (indiciado) {
      this.isEditingIndiciado = true;
      this.indiciadoForm.patchValue(indiciado);
    } else {
      this.isEditingIndiciado = false;
      this.indiciadoForm.reset();
      this.indiciadoForm.patchValue({ carpeta_id: this.subSector.id });
    }
  }

  cerrarFormulario(): void { this.isFormVisible = false; this.indiciadoForm.reset(); }
  onFileChange(event: any): void { const file = event.target.files?.[0]; if (file) this.currentFile = file; }

  

  onSubmitIndiciado(): void {
    if (this.indiciadoForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData = new FormData();
    Object.keys(this.indiciadoForm.controls).forEach(key => {
      const control = this.indiciadoForm.get(key);
      if (key !== 'foto' && control && control.value !== null && control.value !== '') {
        if (key === 'fecha_nacimiento' && control.value) {
            formData.append(key, new Date(control.value).toISOString().split('T')[0]);
        } else {
            formData.append(key, control.value);
        }
      }
    });
    if (this.currentFile) formData.append('foto', this.currentFile, this.currentFile.name);

    const action = this.isEditingIndiciado
      ? this.indiciadoService.actualizarIndiciado(this.indiciadoForm.value.id, formData)
      : this.indiciadoService.agregarIndiciado(formData);

    action.subscribe({
      next: () => {
        alert(`Indiciado ${this.isEditingIndiciado ? 'actualizado' : 'creado'} con éxito.`);
        this.isSubmitting = false;
        this.cerrarFormulario();
        if (this.subSector) {
          this.loadData(this.subSector.id);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(`Error: ${err.error.msg || 'Ocurrió un problema.'}`);
      }
    });
  }

  borrarIndiciado(id: number): void {
    if (confirm("¿Estás seguro de que quieres eliminar a este indiciado?")) {
      this.indiciadoService.borrarIndiciado(id).subscribe({
        next: () => {
          alert("Indiciado eliminado.");
          if (this.subSector) {
            this.loadData(this.subSector.id);
          }
        },
        error: (err) => alert(`Error: ${err.error.msg || 'No se pudo eliminar.'}`)
      });
    }
  }
}