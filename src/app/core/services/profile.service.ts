import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Profile {
    id?: string;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private apiUrl = `${environment.apiUrl}/profiles`;

    constructor(private http: HttpClient) { }

    getProfiles(): Observable<Profile[]> {
        return this.http.get<Profile[]>(this.apiUrl);
    }

    getProfileById(id: string): Observable<Profile> {
        return this.http.get<Profile>(`${this.apiUrl}/${id}`);
    }

    createProfile(profile: Profile): Observable<any> {
        return this.http.post(this.apiUrl, profile);
    }

    updateProfile(id: string, profile: Profile): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, profile);
    }

    deleteProfile(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}


