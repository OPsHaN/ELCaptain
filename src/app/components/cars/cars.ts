import { ChangeDetectorRef, Component, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CardModule } from "primeng/card";
import { CarouselModule } from "primeng/carousel";

import { OnInit } from "@angular/core";
import { CarRegister } from "../car-register/car-register";
import { MessageService } from "primeng/api";
import { Apiservice } from "../../services/apiservice";
import { DialogModule } from "primeng/dialog";

@Component({
  selector: "app-cars",
  imports: [
    CommonModule,
    CardModule,
    CarRegister,
    DialogModule,
    CarouselModule,
  ],
  templateUrl: "./cars.html",
  styleUrl: "./cars.scss",
})
export class Cars implements OnInit {
  activeTable: string | null = null;
  selectedCar: any = null;
  showCarDialog: boolean = false;
  showRegisterForm = false;
  cars: any[] = [];
  isCarEditMode: boolean = false;
  selectedCarToEdit: any = null;
  showCarForm: boolean = false;
  isEditMode = false; // ⬅️ لو true معناها بنعدل موظف
  defaultCarImage = "./photos/default-car.jpg";
  car: any[] = [];

  getColorCode(colorName: string): string {
    if (!colorName) return "#000"; // افتراضي أسود

    const normalized = colorName.trim().toLowerCase();

    switch (normalized) {
      case "أحمر":
      case "red":
        return "red";
      case "أزرق":
      case "blue":
        return "blue";
      case "أسود":
      case "black":
        return "black";
      case "أبيض":
      case "white":
        return "#fff";
      case "رمادي":
      case "رمادى":
      case "gray":
      case "grey":
        return "gray";
      case "أخضر":
      case "green":
        return "green";
      case "فضي":
      case "فضى":
      case "silver":
        return "silver";
      case "ذهبي":
      case "ذهبى":
      case "gold":
        return "gold";
      default:
        return "#000"; // لو اللون مش معروف
    }
  }

  constructor(
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadCars();
  }

  loadCars() {
    this.api.getAllCars().subscribe({
      next: (data) => {
        this.cars = data as any[];
        console.log("✅ Cars loaded:", this.cars);
        this.cdr.detectChanges();
      },
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  viewCar(car: any) {
    this.selectedCar = car;
    this.showCarDialog = true;
  }

  editCar(car: any) {
    this.selectedCarToEdit = car;
    this.isCarEditMode = true;
    this.showCarForm = true;

    // if (this.carForm) {
    //   this.patchCarForm(car);
    // }
  }

  deleteCar(car: any) {
    if (
      !confirm(
        `هل أنت متأكد من حذف السيارة: ${car.Brand.BrandName} - ${car.Model}?`
      )
    )
      return;

    this.api.deleteCar(car.Id).subscribe({
      next: () => {
        this.cars = this.cars.filter((c) => c.Id !== car.Id);
        this.showSuccess("تم حذف السيارة بنجاح ✅");
      },
      error: (err) => {
        console.error("❌ Delete error:", err);
        this.showError("حدث خطأ أثناء حذف السيارة");
      },
    });
  }

  toggleRegisterForm() {
    this.selectedCar = null; // ✨ عشان الفورم يفتح فاضي
    this.showRegisterForm = !this.showRegisterForm;
  }

  showError(msg: string) {
    this.messageService.add({
      severity: "error",
      // summary: "خطأ",
      detail: msg,
      life: 2000,
    });
  }

  showSuccess(msg: string) {
    this.messageService.add({
      severity: "success",
      // summary: "تم بنجاح",
      detail: msg,
      life: 3000,
    });
  }
}
