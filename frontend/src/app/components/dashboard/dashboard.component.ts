import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CarpetaService } from '../../services/carpeta.service';
import { IndiciadoService } from '../../services/indiciado.service';
import { Carpeta } from '../../models/carpeta.model';
import { Indiciado } from '../../models/indiciado.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userProfile: any = null;
  carpetasPadre: Carpeta[] = [];
  sectorSeleccionado: Carpeta | null = null;
  subSectorSeleccionado: Carpeta | null = null;

  indiciadoForm: FormGroup;
  isFormVisible = false;
  isEditingIndiciado = false;
  currentFile: File | null = null;

  indiciadoParaVer: Indiciado | null = null;
  
  isLoadingCarpetas = false;
  isLoadingDetalles = false;
  isSubmitting = false;

  constructor(
    public authService: AuthService,
    private carpetaService: CarpetaService,
    public indiciadoService: IndiciadoService,
    private fb: FormBuilder
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
      sub_sector: [''],
      foto: [null]
    });
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
    this.carpetaService.getCarpetas().pipe(
      finalize(() => this.isLoadingCarpetas = false)
    ).subscribe({
      next: (data) => this.carpetasPadre = data,
      error: (err) => console.error("Error al cargar sectores", err)
    });
  }

  seleccionarSector(sector: Carpeta): void {
    if (this.sectorSeleccionado?.id === sector.id && this.subSectorSeleccionado === null) return;
    
    this.isLoadingDetalles = true;
    this.subSectorSeleccionado = null;
    this.carpetaService.getCarpetaConIndiciados(sector.id).pipe(
      finalize(() => this.isLoadingDetalles = false)
    ).subscribe({
      next: (data) => {
        this.sectorSeleccionado = data;
      },
      error: (err) => {
        console.error("Error al cargar detalles del sector", err);
        this.sectorSeleccionado = null;
      }
    });
  }

  seleccionarSubSector(subSector: Carpeta): void {
    if (this.subSectorSeleccionado?.id === subSector.id) return;
    
    this.isLoadingDetalles = true;
    this.carpetaService.getCarpetaConIndiciados(subSector.id).pipe(
      finalize(() => this.isLoadingDetalles = false)
    ).subscribe({
      next: (data) => this.subSectorSeleccionado = data,
      error: (err) => {
        console.error("Error al cargar detalles del sub-sector", err);
        this.subSectorSeleccionado = null;
      }
    });
  }
  
  volverASubSectores(): void {
    this.subSectorSeleccionado = null;
  }
  
  verIndiciado(indiciado: Indiciado): void {
    this.indiciadoParaVer = indiciado;
  }

  cerrarVistaIndiciado(): void {
    this.indiciadoParaVer = null;
  }

  crearNuevaCarpeta(esSubcarpeta: boolean): void {
    const tipo = esSubcarpeta ? 'sub-sector' : 'sector';
    const nombre = prompt(`Introduce el nombre del nuevo ${tipo}:`);
    if (!nombre || nombre.trim() === '') return;

    const nombreLimpio = nombre.trim();
    const parentId = (esSubcarpeta && this.sectorSeleccionado) ? this.sectorSeleccionado.id : undefined;
    
    this.carpetaService.crearCarpeta(nombreLimpio, parentId).subscribe({
      next: (response) => {
        alert(response.msg || `${tipo} creado con éxito`);
        if (esSubcarpeta && this.sectorSeleccionado) {
          this.seleccionarSector(this.sectorSeleccionado);
        } else {
          this.loadCarpetasPadre();
        }
      },
      error: (err) => {
        const errorMessage = err.error?.msg || `No se pudo crear el ${tipo}.`;
        alert(`Error: ${errorMessage}`);
      }
    });
  }

  borrarCarpeta(carpeta: Carpeta): void {
    const esPadre = !carpeta.parent_id;
    const tipo = esPadre ? 'sector' : 'sub-sector';
    if (confirm(`¿Estás seguro? Se borrará el ${tipo} "${carpeta.nombre}" y todo su contenido. Esta acción no se puede deshacer.`)) {
      this.carpetaService.borrarCarpeta(carpeta.id).subscribe({
        next: () => {
          alert(`${tipo} eliminado`);
          if (esPadre) {
            this.loadCarpetasPadre();
            this.sectorSeleccionado = null;
            this.subSectorSeleccionado = null;
          } else if (this.sectorSeleccionado) {
            this.seleccionarSector(this.sectorSeleccionado);
          }
        },
        error: (err) => alert(`Error: ${err.error.msg || 'No se pudo borrar'}`)
      });
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files?.[0];
    if (file) this.currentFile = file;
  }

  prepararFormulario(indiciado: Indiciado | null): void {
    const carpetaDestino = this.subSectorSeleccionado;
    if (!carpetaDestino) return;

    this.isFormVisible = true;
    this.currentFile = null;
    if (indiciado) {
      this.isEditingIndiciado = true;
      this.indiciadoForm.patchValue(indiciado);
    } else {
      this.isEditingIndiciado = false;
      this.indiciadoForm.reset();
      this.indiciadoForm.patchValue({ carpeta_id: carpetaDestino.id });
    }
  }
  
  cerrarFormulario(): void {
    this.isFormVisible = false;
    this.indiciadoForm.reset();
  }

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

    if (this.currentFile) {
      formData.append('foto', this.currentFile, this.currentFile.name);
    }
    
    const action = this.isEditingIndiciado
      ? this.indiciadoService.actualizarIndiciado(this.indiciadoForm.value.id, formData)
      : this.indiciadoService.agregarIndiciado(formData);

    action.pipe(finalize(() => this.isSubmitting = false)).subscribe({
      next: () => {
        alert(`Indiciado ${this.isEditingIndiciado ? 'actualizado' : 'creado'} con éxito.`);
        this.cerrarFormulario();
        if (this.subSectorSeleccionado) {
          this.seleccionarSubSector(this.subSectorSeleccionado);
        }
      },
      error: (err) => alert(`Error: ${err.error.msg || 'Ocurrió un problema.'}`)
    });
  }
  
  borrarIndiciado(id: number): void {
    if (confirm("¿Estás seguro de que quieres eliminar a este indiciado? Esta acción es irreversible.")) {
      this.indiciadoService.borrarIndiciado(id).subscribe({
        next: () => {
          alert("Indiciado eliminado.");
          if (this.subSectorSeleccionado) {
            this.seleccionarSubSector(this.subSectorSeleccionado);
          }
        },
        error: (err) => alert(`Error: ${err.error.msg || 'No se pudo eliminar.'}`)
      });
    }
  }
  
  logout(): void {
    this.authService.logout();
  }
}