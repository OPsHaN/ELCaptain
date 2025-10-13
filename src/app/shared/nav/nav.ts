import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Apiservice, Brand, Country } from "../../services/apiservice";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-nav",
  imports: [CommonModule, FormsModule],
  templateUrl: "./nav.html",
  styleUrl: "./nav.scss",
})
export class Nav {
  addingCountry = false;
  newCountry = "";
  editingCountryIndex: number | null = null; // لتحديد الصف اللي هنعدله
  countries: Country[] = [];
  activeTable: string | null = null;
  addingCar = false;
  cars: { id?: number; name: string }[] = [];
  newCar = "";
  editingCarIndex: number | null = null;
  idsCountry: number | null = null;
  idBrand: number | null = null;
  brands: Brand[] = [];
  selectedCountryId: number | null = null;
  selectedBrandId: number | null = null;
  selectedCountry: any;
  newBrandCountryId: number | null = null;
  countryMap: { [id: number]: string } = {}; // خريطة id -> name

  constructor(
    private api: Apiservice,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCountries(); // جلب البيانات عند بداية الكمبوننت
    this.loadBrands();
    // setTimeout(() => {
    //   this.loadBrand();
    // }, 50);
  }

  loadCountries() {
    this.api.getAllCountry().subscribe({
      next: (res: Country[]) => {
        this.countries = res;
        // ابني الماب
        this.countryMap = {};
        for (const c of this.countries) {
          if (c.id != null) this.countryMap[c.id] = c.name;
        }
      },
      error: (err) => {
        console.error("خطأ جلب الدول:", err);
      },
    });
  }
  onBrandCountryChange(brand: Brand) {
    const selectedCountry = this.countries.find(
      (c) => c.id === brand.CountryId
    );
    if (!selectedCountry) return;

    const body = {
      Id: brand.Id,
      BrandName: brand.BrandName,
      CountryId: selectedCountry.id,
      Message: "",
      AddedBy: brand.AddedBy,
      AddedAt: brand.AddedAt,
    };

    this.api.updateBrand(body).subscribe({
      next: (res) => {
        console.log("✅ تم تحديث البراند:", res);

        // تحديث البيانات في الجدول بدون إعادة تحميل
        brand.CountryId = selectedCountry.id!;
        brand.Country = {
          Id: selectedCountry.id!,
          CountryName: selectedCountry.name,
        };
      },
      error: (err) => {
        console.error("❌ خطأ أثناء تحديث البراند:", err);
      },
    });
  }

  loadBrands() {
    this.api.getAllBrand().subscribe((res) => {
      this.brands = res;
      console.log(res);
    });
  }

  loadBrand() {
    if (this.selectedCountryId !== null) {
      this.api.getBrand(this.selectedCountryId).subscribe({
        next: (res: any) => {
          console.log("📥 Brand Response:", res);

          // ✅ تأكد إن فيه BrandName
          if (!res || !res.BrandName) {
            this.brands = [];
            return;
          }

          // ✅ نحول الريسبونس لـ Array
          this.brands = Array.isArray(res) ? res : [res];

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("❌ Error loading brand:", err);
          this.brands = [];
        },
      });
    }
  }

  toggleTable(type: string) {
    if (this.activeTable === type) {
      this.activeTable = null;
      this.addingCountry = false;
    } else {
      this.activeTable = type;

      // ✅ لو الزرار بتاع البراند
      if (type === "brand") {
        this.loadBrands(); // 🟢 استدعاء الدالة
      }

      // ✅ لو الزرار بتاع الدولة
      if (type === "country") {
        this.loadCountries(); // لو عايز تحدث الدول برضه
      }

      // ✅ لو الزرار بتاع السيارة
      if (type === "car") {
        // لو عايز تضيف loadCars() هنا بعد ما تعملها
      }
    }
  }

  startAdd() {
    this.addingCountry = true;
    this.newCountry = "";
  }

  editCountry(index: number) {
    const country = this.countries[index];
    this.editingCountryIndex = index; // لتحديد الصف اللي بيتعدل
    this.newCountry = country.name;
    this.idsCountry = this.countries[index].id ?? null;
  }
  saveCountry() {
    if (!this.newCountry.trim()) return;

    if (this.editingCountryIndex !== null) {
      // تعديل بلد موجود
      const body = {
        Id: this.idsCountry, // نرسل الـ id الفعلي
        CountryName: this.newCountry.trim(),
        AddedBy: 1,
        AddedAt: new Date().toISOString(),
      };

      this.api.updateCountry(body).subscribe({
        next: (updated) => {
          console.log(updated);
          // نحدث الـ array باستخدام index
          this.countries[this.editingCountryIndex!] = updated;
          this.editingCountryIndex = null;
          this.idsCountry = null;
          this.newCountry = "";
          this.showSuccess("تم تعديل البلد");
        },
        error: (err) => {
          if (err.status === 401) {
            this.showError("هذ’ البلد غير موجود");
          } else if (err.status === 500) {
            this.showError("لا يمكن الاتصال بالخادم. تحقق من الاتصال.");
          } else {
            this.showError("هناك مشكلة بالسيرفر");
          }
        },
      });
    } else {
      // إضافة بلد جديد
      const body = {
        Id: 0,
        CountryName: this.newCountry.trim(),
        AddedBy: 1,
        AddedAt: new Date().toISOString(),
      };

      this.api.addCountry(body).subscribe({
        next: (newC: Country) => {
          this.countries.push(newC); // نضيفه في آخر الـ array
          this.addingCountry = false;
          this.newCountry = "";
          this.showSuccess("تم إضافة البلد");
        },
        error: (err) => {
          if (err.status === 401) {
            this.showError("هذ’ البلد غير موجود");
          } else if (err.status === 500) {
            this.showError("لا يمكن الاتصال بالخادم. تحقق من الاتصال.");
          } else {
            this.showError("هناك مشكلة بالسيرفر");
          }
        },
      });
    }
  }

  cancelAdd() {
    this.newCountry = "";
    this.addingCountry = false;
    this.editingCountryIndex = null;
  }

  deleteCountry(index: number) {
    const country = this.countries[index];
    console.log("Deleting country:", country);
    if (!country?.id) {
      this.showError("هذا البلد غير صالح للحذف");
      return;
    }

    this.api.deleteCountry(country.id).subscribe({
      next: () => {
        this.countries.splice(index, 1);
        this.showSuccess("تم حذف البلد");
      },
      error: (err) => {
        console.error("Error deleting country:", err);
        this.showError("حدث خطأ أثناء حذف البلد");
      },
    });
  }

  startAddCar() {
    this.addingCar = true;
    this.newCar = "";
    this.editingCarIndex = null;
  }

  editCar(i: number) {
    this.editingCarIndex = i;
    this.newCar = this.cars[i].name;
    this.addingCar = false;
  }

  saveCar() {
    if (!this.newCar.trim()) return;
    if (this.editingCarIndex !== null) {
      this.cars[this.editingCarIndex].name = this.newCar.trim();
      this.editingCarIndex = null;
    } else {
      this.cars.push({ name: this.newCar.trim() });
      this.addingCar = false;
    }
    this.newCar = "";
  }

  cancelCar() {
    this.newCar = "";
    this.addingCar = false;
    this.editingCarIndex = null;
  }

  deleteCar(i: number) {
    this.cars.splice(i, 1);
  }

  newBrand = "";
  addingBrand = false;
  editingBrandIndex: number | null = null;

  startAddBrand() {
    this.addingBrand = true;
    this.newBrand = "";
    this.editingBrandIndex = null;
  }

  editBrand(i: number) {
    this.editingBrandIndex = i;
    this.newBrand = this.brands[i].BrandName;
    this.idBrand = this.brands[i].Id;
    this.addingBrand = false;
    this.idBrand = this.brands[i].Id || null;
  }

 saveBrand() {
  if (!this.newBrand.trim()) return;

  if (this.editingBrandIndex !== null) {
    // تعديل براند موجود
    const existingBrand = this.brands[this.editingBrandIndex];

    // ✅ ناخد الدولة الجديدة اللي اختارها من الجدول
    const updatedCountryId = existingBrand.CountryId;
    const updatedCountryName = this.countryMap[updatedCountryId] || "";

    const body: Brand = {
      Id: existingBrand.Id,
      BrandName: this.newBrand.trim(),
      CountryId: updatedCountryId,
      Message: existingBrand.Message || "",
      AddedBy: existingBrand.AddedBy || 1,
      AddedAt: existingBrand.AddedAt || new Date().toISOString(),
      Country: {
        Id: updatedCountryId,
        CountryName: updatedCountryName,
      },
    };

    this.api.updateBrand(body).subscribe({
      next: (res: Brand) => {
        // ✅ تحديث الصف محليًا بعد نجاح التعديل
        this.brands[this.editingBrandIndex!] = {
          ...existingBrand,
          BrandName: res.BrandName,
          CountryId: updatedCountryId,
          Country: {
            Id: updatedCountryId,
            CountryName: updatedCountryName,
          },
        };

        this.editingBrandIndex = null;
        this.newBrand = "";
        this.showSuccess("✅ تم تعديل البراند بنجاح");

        // 🆙 تحديث القائمة من السيرفر بعد التعديل
        this.loadBrand();
      },
      error: (err) => {
        console.error("❌ خطأ أثناء تعديل البراند", err);
        this.showError("حدث خطأ أثناء تعديل البراند");
      },
    });
  } else {
    // ➕ إضافة براند جديد
    const body: Brand = {
      Id: 0,
      BrandName: this.newBrand.trim(),
      CountryId: this.newBrandCountryId!,
      Message: "",
      AddedBy: 1,
      AddedAt: new Date().toISOString(),
      Country: {
        Id: this.newBrandCountryId!,
        CountryName: this.countryMap[this.newBrandCountryId!],
      },
    };

    this.api.addBrand(body).subscribe({
      next: (res: Brand) => {
        this.brands.push(res);
        this.addingBrand = false;
        this.newBrand = "";
        this.newBrandCountryId = null;

        this.showSuccess("✅ تم إضافة البراند بنجاح");
        this.loadBrand(); // ⬅️ تحديث القائمة
      },
      error: (err) => {
        console.error("❌ خطأ أثناء إضافة البراند", err);
        this.showError("حدث خطأ أثناء إضافة البراند");
      },
    });
  }
}

  cancelBrand() {
    this.newBrand = "";
    this.addingBrand = false;
    this.editingBrandIndex = null;
  }

  deleteBrand(index: number) {
    const brand = this.brands[index];
    if (!brand?.Id) {
      this.showError("هذا البراند غير صالح للحذف");
      return;
    }

    this.api.deleteBrand(brand.Id).subscribe({
      next: () => {
        this.brands.splice(index, 1); // حذف من الـ array
        this.showSuccess("تم حذف البراند");
      },
      error: (err) => {
        console.error("حدث خطأ أثناء حذف البراند:", err);
        this.showError("حدث خطأ أثناء حذف البراند");
      },
    });
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
      life: 2000,
    });
  }

  // عند اختيار الدولة
  // chooseCountry(id?: number) {
  //   if (!id) return;
  //   const country = this.countries.find((c) => c.id === id);
  //   console.log(country);
  //   if (!country) return;
  //   this.selectedCountry = {
  //     Id: country.id,
  //     CountryName: country.name,
  //     // Message: "",
  //     // AddedBy: 1,
  //     AddedAt: new Date().toISOString(),
  //   };

  //   this.selectedCountryId = country.id!;
  //   this.selectedCountryName = country.name;
  //   // إظهار جدول البراند وزر إضافة براند
  //   this.activeTable = "brand";
  //   this.addingBrand = true;
  //   this.showAddBrandButton = true;
  //   this.showAddCarButton = false; // زر السيارة مخفي لحد اختيار براند
  //   this.brands = [];

  //   setTimeout(() => {
  //     this.loadBrand();
  //   }, 50);
  // }

  // // عند اختيار البراند
  // chooseBrand(id?: number) {
  //   if (!id) return;
  //   const brand = this.brands.find((b) => b.Id === id);
  //   if (!brand) return;

  //   this.selectedBrandId = brand.Id;

  //   // إظهار زر إضافة سيارة
  //   this.showAddCarButton = true;
  //   this.activeTable = "car";
  //   this.addingCar = true;
  // }
}
  