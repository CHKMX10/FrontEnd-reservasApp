import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReportePorEstado, ReservaRequest, ReservaResponse } from '../core/models/reservas.model';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly baseUrl = `${environment.gatewayUrl}/api/reservas`;

  constructor(private http: HttpClient) { }

  listar(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(`${this.baseUrl}/${id}`);
  }

  registrar(request: ReservaRequest): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ReservaRequest): Observable<ReservaResponse> {
    return this.http.put<ReservaResponse>(`${this.baseUrl}/${id}`, request);
  }

  cambiarEstado(id: number, idEstado: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/estado/${idEstado}`, null);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  historico(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(`${this.baseUrl}/reportes/historico`);
  }

  reportePorEstado(): Observable<ReportePorEstado> {
    return this.http.get<ReportePorEstado>(`${this.baseUrl}/reportes/por-estado`);
  }
}
