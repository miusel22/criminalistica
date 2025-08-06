import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Carpeta } from '../models/carpeta.model';

@Injectable({
  providedIn: 'root'
})
export class CarpetaService {
  private apiUrl = `${environment.apiUrl}/carpetas`;

  constructor(private http: HttpClient) { }

  
  getCarpetas(): Observable<Carpeta[]> {
    return this.http.get<Carpeta[]>(this.apiUrl);
  }
  
  
  getCarpetaConIndiciados(id: number): Observable<Carpeta> {
    return this.http.get<Carpeta>(`${this.apiUrl}/${id}`);
  }

  
  crearCarpeta(nombre: string, parentId?: number): Observable<any> {
    const payload: { nombre: string; parent_id?: number } = { nombre };
    if (parentId) {
      payload.parent_id = parentId;
    }
    return this.http.post(this.apiUrl, payload);
  }

  
  borrarCarpeta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}