import { Component, OnInit, ChangeDetectorRef, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarpetaService } from '../../../services/carpeta.service';
import { IndiciadoService } from '../../../services/indiciado.service';
import { DocumentoService } from '../../../services/documento.service';
import { Carpeta } from '../../../models/carpeta.model';
import { Indiciado } from '../../../models/indiciado.model';
import { firstValueFrom } from 'rxjs';
import { Documento } from '../../../models/documento.model';

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

  documentosParaSubir: File[] = [];
  documentoParaVerUrl: string | null = null;
  safeDocUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carpetaService: CarpetaService,
    private indiciadoService: IndiciadoService,
    private documentoService: DocumentoService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
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
      foto: [null],
      google_earth_link: ['']
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
    try {
      const subSector = await firstValueFrom(this.carpetaService.getCarpetaConIndiciados(id));
      if (!subSector) {
        throw new Error(`El sub-sector con ID ${id} no fue encontrado.`);
      }
      this.subSector = subSector;

      if (subSector.parent_id) {
        const padre = await firstValueFrom(this.carpetaService.getCarpetaConIndiciados(subSector.parent_id));
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
      this.cdr.detectChanges();
    }
  }

  verIndiciado(indiciado: Indiciado): void {
    this.indiciadoParaVer = indiciado;
  }

  cerrarVistaIndiciado(): void {
    this.indiciadoParaVer = null;
  }
  
  abrirLinkGoogleEarth(url: string | undefined): void {
    if (!url || url.trim() === '') {
      alert('El link de ubicación no es válido o no ha sido guardado.');
      return;
    }
    let fullUrl = url.trim();
    if (!/^https?:\/\//i.test(fullUrl)) {
      fullUrl = 'https://' + fullUrl;
    }
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  }

  prepararFormulario(indiciado: Indiciado | null): void {
    this.documentosParaSubir = [];
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

  cerrarFormulario(): void {
    this.isFormVisible = false;
    this.indiciadoForm.reset();
  }

  onFileChange(event: any): void {
    const file = event.target.files?.[0];
    if (file) this.currentFile = file;
  }

  onDocumentosSeleccionados(event: any): void {
    if (event.target.files.length > 0) {
      this.documentosParaSubir = Array.from(event.target.files);
    }
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

    action.subscribe({
      next: (response) => {
        const indiciadoId = this.isEditingIndiciado ? this.indiciadoForm.value.id : response.indiciado.id;

        if (this.documentosParaSubir.length > 0) {
          const docFormData = new FormData();
          this.documentosParaSubir.forEach(file => {
            docFormData.append('documentos', file, file.name);
          });
          
          this.documentoService.uploadDocumentos(indiciadoId, docFormData).subscribe({
            next: () => this.finalizarSubmit(),
            error: (err) => {
              alert(`El perfil se guardó, pero hubo un error al subir los documentos: ${err.error.msg}`);
              this.finalizarSubmit();
            }
          });
        } else {
          this.finalizarSubmit();
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(`Error al guardar el perfil: ${err.error.msg || 'Ocurrió un problema.'}`);
      }
    });
  }
  
  finalizarSubmit(): void {
    this.isSubmitting = false;
    this.documentosParaSubir = [];
    this.cerrarFormulario();
    if (this.subSector) {
      this.loadData(this.subSector.id);
    }
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

  visualizarDocumento(doc: Documento): void {
        const fileExtension = doc.filename.split('.').pop()?.toLowerCase();
        
        const downloadUrl = 'http://127.0.0.1:5000' + doc.url;
        const viewUrl = downloadUrl + '?view=true';

        if (fileExtension === 'pdf') {
            window.open(viewUrl, '_blank');
        } else if (fileExtension === 'doc' || fileExtension === 'docx') {
            const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(downloadUrl)}&embedded=true`;
            this.safeDocUrl = this.sanitizer.bypassSecurityTrustResourceUrl(googleViewerUrl);
        } else {
            alert("Este tipo de archivo no se puede previsualizar. Por favor, descárgalo.");
        }
  }

  cerrarVisualizador(): void {
        this.documentoParaVerUrl = null;
        this.safeDocUrl = null;
  }

  eliminarDocumento(documentoId: number, event: MouseEvent): void {
    event.stopPropagation();
    if (confirm("¿Estás seguro de que quieres eliminar este documento?")) {
      this.documentoService.deleteDocumento(documentoId).subscribe({
        next: () => {
          alert("Documento eliminado.");
          if (this.indiciadoParaVer) {
            this.indiciadoParaVer.documentos = this.indiciadoParaVer.documentos?.filter(d => d.id !== documentoId);
            this.cdr.detectChanges();
          }
        },
        error: (err) => alert(`Error: ${err.error.msg || 'No se pudo eliminar.'}`)
      });
    }
  }
}