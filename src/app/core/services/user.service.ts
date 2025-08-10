import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface User {
    id?: string;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;
    private meUrl = `${environment.apiUrl}/user/profile`;

    constructor(private http: HttpClient) { }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getUserById(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    createUser(user: User): Observable<any> {
        return this.http.post(this.apiUrl, user);
    }

    updateUser(id: string, user: User): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, user);
    }

    deleteUser(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    getMyProfile(): Observable<User> {
        return this.http.get<User>(this.meUrl);
    }

    updateMyProfile(user: Partial<User>): Observable<any> {
        return this.http.put(this.meUrl, user);
    }
}


