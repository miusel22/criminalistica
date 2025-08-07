import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private apiUrl = `${environment.apiUrl}/documentos`;

  constructor(private http: HttpClient) { }

  uploadDocumentos(indiciadoId: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/indiciado/${indiciadoId}`, formData);
  }

  deleteDocumento(documentoId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${documentoId}`);
  }
}