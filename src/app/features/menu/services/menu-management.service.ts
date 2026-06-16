import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItemResponse, MenuItemRequest } from '../models/menu-management.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MenuManagementService {
  private readonly API_URL = `${environment.apiUrl}/menu`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MenuItemResponse[]> {
    return this.http.get<MenuItemResponse[]>(this.API_URL);
  }

  getById(id: number): Observable<MenuItemResponse> {
    return this.http.get<MenuItemResponse>(`${this.API_URL}/${id}`);
  }

  create(request: MenuItemRequest): Observable<MenuItemResponse> {
    return this.http.post<MenuItemResponse>(this.API_URL, request);
  }

  update(id: number, request: MenuItemRequest): Observable<MenuItemResponse> {
    return this.http.put<MenuItemResponse>(`${this.API_URL}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  updateStock(id: number, stock: number): Observable<MenuItemResponse> {
    return this.http.patch<MenuItemResponse>(`${this.API_URL}/${id}/stock?stock=${stock}`, {});
  }

  toggleAvailability(id: number, available: boolean): Observable<MenuItemResponse> {
    return this.http.patch<MenuItemResponse>(`${this.API_URL}/${id}/availability?available=${available}`, {});
  }
}
