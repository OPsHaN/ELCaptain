import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
export interface Country {
  id?: number;
  name: string;
}

export interface CountryApiResponse {
  Id: number;
  CountryName: string;
}

export interface Brand {
  Id: number;
  CountryId: number;
  BrandName: string;
  Message: string;
  AddedBy: number | null;
  AddedAt: string; // أو Date لو هتعمل تحويل
  Country: CountryApiResponse;
}

@Injectable({
  providedIn: "root",
})
export class Apiservice {
  private baseUrl = "http://20.19.89.91/api/";

  constructor(private http: HttpClient) {}

  addCountry(body: any): Observable<Country> {
    return this.http
      .post<CountryApiResponse>(`${this.baseUrl}Country/Add`, body)
      .pipe(
        map((res) => ({
          id: res.Id,
          name: res.CountryName,
        }))
      );
  }

  getCountry(id: number) {
    return this.http.get(`${this.baseUrl}Country/GetCountry?id=${id}`);
  }

  updateCountry(body: any): Observable<Country> {
    return this.http
      .put<CountryApiResponse>(`${this.baseUrl}Country/Add`, body)
      .pipe(
        map((res) => ({
          id: res.Id,
          name: res.CountryName,
        }))
      );
  }

  getAllCountry(): Observable<Country[]> {
    return this.http
      .get<CountryApiResponse[]>(`${this.baseUrl}Country/GetAll`)
      .pipe(
        map((res) =>
          res.map((c) => ({
            id: c.Id,
            name: c.CountryName,
          }))
        )
      );
  }

  deleteCountry(id: number) {
    return this.http.delete(`${this.baseUrl}Country/Delete?id=${id}`);
  }

  //////////brand//////

  addBrand(body: Partial<Brand>): Observable<Brand> {
    return this.http.post<Brand>(`${this.baseUrl}brand/Add`, body);
  }

 updateBrand(body: any): Observable<Brand> {
  return this.http
    .put<Brand>(`${this.baseUrl}Brand/Update`, body)
    .pipe(
      map((res: any) => ({
        Id: res.Id,
        BrandName: res.BrandName,
        CountryId: res.CountryId,
        Message: res.Message,
        AddedBy: res.AddedBy,
        AddedAt: res.AddedAt,
        Country: res.Country
      }))
    );
}

  getAllBrand(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}brand/GetAll`);
  }

  getBrand(id: number) {
    return this.http.get(`${this.baseUrl}brand/GetBrand?id=${id}`);
  }

  deleteBrand(id: number) {
    return this.http.delete(`${this.baseUrl}brand/Delete?id=${id}`);
  }


  ///cars///

  getBranch(id: number) {
    return this.http.get(`${this.baseUrl}GetBranch?id=${id}`);
  }

  getBranchs() {
    return this.http.get(`${this.baseUrl}branch/GetAll`);
  }
}
