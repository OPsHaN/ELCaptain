import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { UserResponse } from "../shared/tokenpayload";
export interface Country {
  id?: number;
  name: string;
  img: string;
}

export interface CountryApiResponse {
  Id: number;
  CountryName: string;
  Img: string | null;
}

export interface Brand {
  Id: number;
  CountryId: number;
  BrandName: string;
  Message: string;
  Img: string;
  AddedBy: number | null;
  AddedAt: string; // أو Date لو هتعمل تحويل
  Country: CountryApiResponse;
}

@Injectable({
  providedIn: "root",
})
export class Apiservice {
  private baseUrl = "https://elcaptainauto.com:2083/api/";

  constructor(private http: HttpClient) {}

  //country

  addCountry(body: any): Observable<Country> {
    return this.http
      .post<CountryApiResponse>(`${this.baseUrl}Country/Add`, body)
      .pipe(
        map((res) => ({
          id: res.Id,
          name: res.CountryName,
          img: "",
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
          img: "",
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
            img: c.Img || "",
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
    return this.http.put<Brand>(`${this.baseUrl}Brand/Update`, body).pipe(
      map((res: any) => ({
        Id: res.Id,
        BrandName: res.BrandName,
        CountryId: res.CountryId,
        Message: res.Message,
        Img: res.Img,
        AddedBy: res.AddedBy,
        AddedAt: res.AddedAt,
        Country: res.Country,
      }))
    );
  }

  getAllBrand(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}brand/GetAll`);
  }

  getBrand(id: number) {
    return this.http.get(`${this.baseUrl}brand/GetBrand?id=${id}`);
  }

  getBrandByCountryId(countryId: number): Observable<Brand[]> {
    return this.http
      .get<Brand[]>(`${this.baseUrl}brand/GetBrandsInCountry?CountryId=${countryId}`);
  }

  deleteBrand(id: number) {
    return this.http.delete(`${this.baseUrl}brand/Delete?id=${id}`);
  }

  ///cars///

  getAllCars():Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}Car/GetAll`);
  }
  getCar(id: number) {
    return this.http.get(`${this.baseUrl}Car/GetCar?id=${id}`);
  }
  deleteCar(id: number) {
    return this.http.delete(`${this.baseUrl}Car/Delete?id=${id}`);
  }
  addCar(body: any) {
    return this.http.post(`${this.baseUrl}Car/Add`, body);
  }
  updateCar(body: any) {
    return this.http.put(`${this.baseUrl}Car/Update`, body);
  }

  addImageforCar(body: any) {
    return this.http.post(`${this.baseUrl}Car/AddImage`, body);
  }

  uploadBulkImages(body: any) {
    return this.http.post(`${this.baseUrl}Car/AddBulkImages`, body);
  }

  deleteImagesForCar(id: number) {
    return this.http.delete(`${this.baseUrl}Car/DeleteImage?ImageId=${id}`);
  }


  getCarsInBrands(brandId:number){
    return this.http.get(`${this.baseUrl}car/GetCarsInBrand?BrandId=${brandId}`)
  }

  filterCars(countryId:number , brandId:number , branchId:number){
    return this.http.get(`${this.baseUrl}car/Filter?CountryId=${countryId}&BrandId=${brandId}&BranchId=${branchId}`)
  }

  //branch

  addBranch(body: any) {
    return this.http.post(`${this.baseUrl}branch/Add`, body);
  }

  getBranch(id: number) {
    return this.http.get(`${this.baseUrl}GetBranch?id=${id}`);
  }

  getBranchs() {
    return this.http.get(`${this.baseUrl}branch/GetAll`);
  }

  deleteBranch(id: number) {
    return this.http.delete(`${this.baseUrl}branch/Delete?id=${id}`);
  }
  updateBranch(body: any) {
    return this.http.put(`${this.baseUrl}branch/Update`, body);
  }

  //employee//

  getAllEmployee() {
    return this.http.get(`${this.baseUrl}auth/GetAll`);
  }

  updateEmployee(data: UserResponse): Observable<UserResponse> {
    return this.http.put<UserResponse>(
      `${this.baseUrl}auth/Update
  `,
      data
    );
  }

  deleteEmployee(id: number) {
    return this.http.delete(`${this.baseUrl}auth/Delete?id=${id}`);
  }


  //addClient
  addClient(body: any) {
    return this.http.post(`${this.baseUrl}Client/Add`, body);
  }
  updateClient(body: any) {
    return this.http.put(`${this.baseUrl}Client/Update`, body);
  }
  deleteCelient(id: number) {
    return this.http.delete(`${this.baseUrl}Client/Delete?id=${id}`);
  }
  getAllClients() {
    return this.http.get(`${this.baseUrl}Client/GetAll`);
  }
  deleteFile(id: number) {
    return this.http.delete(`${this.baseUrl}Client/DeleteFile?FileId=${id}`);
  }
  uploadFile(clientId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", clientId.toString()); // ⬅️ إرسال clientId مع الملف

    const url = `${this.baseUrl}Client/UploadFile`;
    return this.http.post(url, formData);
  }

  //opertaion

  addOperation(body:any){
    return this.http.post(`${this.baseUrl}Operation/Add` , body)
  }

  getOperation(operationId:number) {
    return this.http.get(`${this.baseUrl}Operation/GetOperation?id=${operationId}`)
  }

  updateOperation(body:any){
    return this.http.put(`${this.baseUrl}Operation/Update` , body)
  }

  deleteOperation(operationId:number){
    this.http.delete(`${this.baseUrl}Operation/Delete?id=${operationId}`)
  }

  getAllOperation(){
    return this.http.get(`${this.baseUrl}Operation/GetAll`)
  }

  //uploadImage

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file); // اسم الحقل حسب المطلوب من الـ API
    return this.http.post(`${this.baseUrl}images/Upload`, formData);
  }
}
