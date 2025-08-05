import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

  getFotoUrl(foto_filename: string | null | undefined): string | null {
      if (!foto_filename) return null;
      return `${this.baseUploadUrl}/uploads/${foto_filename}`;
  }
}