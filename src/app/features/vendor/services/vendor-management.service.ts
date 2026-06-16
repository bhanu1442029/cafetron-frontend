import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VendorResponse, VendorRequest } from '../models/vendor-management.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VendorManagementService {
  private readonly API_URL = `${environment.apiUrl}/vendors`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<VendorResponse[]> {
    return this.http.get<VendorResponse[]>(this.API_URL);
  }

  getActive(): Observable<VendorResponse[]> {
    return this.http.get<VendorResponse[]>(`${this.API_URL}/active`);
  }

  getById(id: number): Observable<VendorResponse> {
    return this.http.get<VendorResponse>(`${this.API_URL}/${id}`);
  }

  create(request: VendorRequest): Observable<VendorResponse> {
    return this.http.post<VendorResponse>(this.API_URL, request);
  }

  update(id: number, request: VendorRequest): Observable<VendorResponse> {
    return this.http.put<VendorResponse>(`${this.API_URL}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  toggleActive(id: number, active: boolean): Observable<VendorResponse> {
    return this.http.patch<VendorResponse>(`${this.API_URL}/${id}/active?active=${active}`, {});
  }
}
