import { Component, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CardModule } from "primeng/card";


import { OnInit } from "@angular/core";
import { CarRegister } from "../car-register/car-register";

@Component({
  selector: "app-cars",
  imports: [CommonModule, CardModule, CarRegister],
  templateUrl: "./cars.html",
  styleUrl: "./cars.scss",
})

export class Cars implements OnInit {
  activeTable: string | null = null;
  selectedCar: any | null = null;
  showRegisterForm = false;
  cars: any[] = [];



  constructor() {}
  ngOnInit() {


  }

    toggleTable(type: string) {
    if (this.activeTable === type) {
      this.activeTable = null;
    } else {
      this.activeTable = type;
    }
  }


  trackById(index: number, item: any) {
    return item.id;
  }


  viewEmployee(e: any) {
    // مثال: فتح نافذة تفاصيل
    console.log("View", e);
  }

  editEmployee(e: any) {
    // مثال: توجيه لصفحة التعديل
    console.log("Edit", e);
  }
    deleteEmployee(e: any) {
    // تأكيد ثم حذف
    if (!confirm(`حذف ${e.name}؟`)) return;
    this.cars = this.cars.filter((x) => x.id !== e.id);
    console.log("Deleted", e);
  }

    toggleRegisterForm() {
    this.selectedCar = null; // ✨ عشان الفورم يفتح فاضي
    this.showRegisterForm = !this.showRegisterForm;
  }

  
}
