import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    const message =
      error.error.message || "Ocurrió un error inesperado. Intenta nuevamente.";
    return throwError(() => new Error(message));
  }

  get<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = new HttpParams({ fromObject: params || {} });
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = new HttpParams({ fromObject: params || {} });
    return this.http
      .delete<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }
}
