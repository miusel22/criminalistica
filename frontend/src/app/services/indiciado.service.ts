import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Indiciado } from '../models/indiciado.model';

@Injectable({
  providedIn: 'root'
})
export class IndiciadoService {
  private apiUrl = `${environment.apiUrl}/indiciados`;
  private baseUploadUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) { }

  agregarIndiciado(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  actualizarIndiciado(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  borrarIndiciado(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchIndiciados(query: string): Observable<Indiciado[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Indiciado[]>(`${this.apiUrl}/search`, { params });
  }

  getFotoUrl(foto_filename: string | null | undefined): string | null {
      if (!foto_filename) return null;
      return `${this.baseUploadUrl}/uploads/${foto_filename}`;
  }
}