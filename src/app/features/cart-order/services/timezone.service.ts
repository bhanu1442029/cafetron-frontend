import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TimeZoneOption {
  id: string;
  label: string;
  offset: string;
}

@Injectable({ providedIn: 'root' })
export class TimeZoneService {
  private readonly API_URL = `${environment.apiUrl}/timezones`;

  constructor(private http: HttpClient) {}

  getTimeZones(): Observable<TimeZoneOption[]> {
    return this.http.get<TimeZoneOption[]>(this.API_URL);
  }
}
