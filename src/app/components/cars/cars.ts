import { ChangeDetectorRef, Component, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CardModule } from "primeng/card";
import { CarouselModule } from "primeng/carousel";

import { OnInit } from "@angular/core";
import { CarRegister } from "../car-register/car-register";
import { Apiservice, Brand, Country } from "../../services/apiservice";
import { DialogModule } from "primeng/dialog";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { ActivatedRoute } from "@angular/router";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-cars",
  imports: [
    CommonModule,
    CardModule,
    CarRegister,
    DialogModule,
    CarouselModule,
    ConfirmDialogModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: "./cars.html",
  styleUrl: "./cars.scss",
  providers: [ConfirmationService],
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
  filteredCars: any[] = []; // اللي هيتعرض في الجدول أو الصفحة

  selectedCountry: number | "" = "";
  selectedBrand: number | "" = "";
  selectedBranch: number | "" = "";
  searchText: string | "" = "";
  countries: Country[] = [];
  brands: Brand[] = [];
  branchs: any[] = [];

  colorsList = [
    { name: "أحمر", code: "#FF0000" },
    { name: "أزرق", code: "#0000FF" },
    { name: "أسود", code: "#000000" },
    { name: "أبيض", code: "#FFFFFF" },
    { name: "رمادي", code: "#808080" },
    { name: "أخضر", code: "#008000" },
    { name: "فضي", code: "#C0C0C0" },
    { name: "ذهبي", code: "#FFD700" },
    { name: "برتقالي", code: "#FFA500" },
    { name: "وردي", code: "#FFC0CB" },
    { name: "بني", code: "#8B4513" },
    { name: "بنفسجي", code: "#800080" },
    { name: "كحلي", code: "#000080" },
    { name: "زيتي", code: "#808000" },
    { name: "سماوي", code: "#87CEEB" },
    { name: "عنابي", code: "#800000" },
    { name: "بيج", code: "#F5F5DC" },
    { name: "تركواز", code: "#40E0D0" },
  ];

  getColorCode(colorName: string): string {
    const color = this.colorsList.find(
      (c) => c.name.trim().toLowerCase() === colorName?.trim().toLowerCase()
    );
    return color ? color.code : "#000000";
  }

  constructor(
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // ✅ قراءة البرامترات من الرابط
    this.route.queryParams.subscribe((params) => {
      const countryId = params["countryId"];
      const brandId = params["brandId"];

      if (brandId) {
        // 📡 جلب السيارات الخاصة بالبراند
        this.api.getCarsInBrands(brandId).subscribe({
          next: (data: any) => {
            // cast response to any[] to satisfy TypeScript array assignment
            this.cars = data as any[];
            this.filteredCars = [...this.cars];
            console.log("✅ Cars for selected brand:", this.cars);
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("❌ خطأ في جلب السيارات:", err);
          },
        });
      } else {
        // 📡 لو مفيش فلترة، اعرض كل السيارات
        this.loadCars();
      }
    });

    this.loadBranches();
    this.loadBrands();
    this.loadCountries();
  }

  //ريفريش بعد الاضافة او التعديل

  loadCars() {
    this.api.getAllCars().subscribe({
      next: (data) => {
        this.cars = data as any[];
        this.filteredCars = [...this.cars]; // نسخة مبدئية

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
    this.selectedCar = { ...car }; // 🟡 تخزين بيانات العربية المختارة
    this.isEditMode = true; // 🟡 وضع تعديل
    this.showRegisterForm = true; // 🟡 عرض الفورم
  }

  deleteCar(car: any) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف السيارة: ${car.Model}؟`,
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "لا",
      accept: () => {
        this.api.deleteCar(car.Id).subscribe({
          next: () => {
            this.cars = this.cars.filter((c) => c.Id !== car.Id);
            this.showSuccess("✅ تم حذف السيارة بنجاح");
          },
          error: (err) => {
            console.error("❌ Delete error:", err);
            this.showError("حدث خطأ أثناء حذف السيارة");
          },
        });
      },
      reject: () => {
        // لا تفعل شيء عند الرفض
      },
    });
  }

  filterBySearch() {
    const search = this.searchText.toLowerCase().trim();

    this.filteredCars = this.cars.filter((car: any) =>
      car.Brand?.BrandName?.toLowerCase().includes(search)
    );
  }
  toggleRegisterForm() {
    this.showRegisterForm = !this.showRegisterForm;
    if (!this.showRegisterForm) {
      this.selectedCar = null; // 🧽 تنظيف
      this.isEditMode = false;
    }
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

  loadBranches(): void {
    this.api.getBranchs().subscribe({
      next: (res: any) => {
        this.branchs = res;
        this.cdr.detectChanges();
        console.log(res);
      },
      error: (err) => {
        console.error("خطأ أثناء جلب الفروع:", err);
      },
    });
  }

  getBranchName(branchId: number): string {
  const branch = this.branchs.find((b: any) => b.Id === branchId);
  return branch ? branch.BranchName : 'غير محدد';
}

  loadCountries(): void {
    this.api.getAllCountry().subscribe({
      next: (res: any) => {
        this.countries = res;
        this.cdr.detectChanges();
        console.log(this.countries);
      },
      error: (err) => {
        console.error("خطأ أثناء جلب الدول:", err);
      },
    });
  }

  loadBrands() {
    this.api.getAllBrand().subscribe((res) => {
      this.brands = res;
      console.log(res);
    });
  }

  onFilterChange() {
    const countryId = this.selectedCountry || 0;
    const brandId = this.selectedBrand || 0;
    const branchId = this.selectedBranch || 0;

    // لو كله فاضي → رجّع كل العربيات
    if (!countryId && !brandId && !branchId) {
      this.loadCars();
      return;
    }

    this.api.filterCars(countryId, brandId, branchId).subscribe({
      next: (res: any) => {
        console.log("Filter result:", res);
        this.filteredCars = res; // أو res.data حسب شكل الـ response
      },
      error: (err) => {
        console.error("Error loading filtered cars:", err);
      },
    });
  }

  onSearch() {
    console.log("بحث عن:", this.searchText);
  }
}
