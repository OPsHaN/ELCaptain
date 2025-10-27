import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Apiservice, Brand, Country } from "../../services/apiservice";
import { MessageService } from "primeng/api";
import { finalize } from "rxjs";

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
  addingBranch = false;
  newBranch = "";
  editingBranchIndex: number | null = null;
  idsCountry: number | null = null;
  idBrand: number | null = null;
  brands: Brand[] = [];
  branchs: any[] = [];
  selectedCountryId: number | null = null;
  selectedBrandId: number | null = null;
  selectedCountry: any;
  newBrandCountryId: number | null = null;
  countryMap: { [id: number]: string } = {}; // خريطة id -> name
  countryImageFile: File | null = null;
  brandImageFile: File | null = null;
  countryPreview: string | null = null;
  brandPreview: string | null = null;
  newBrand = "";
  addingBrand = false;
  editingBrandIndex: number | null = null;
  isLoading: boolean = false;
  editingBranchId: number | null = null;

  constructor(
    private api: Apiservice,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCountries(); // جلب البيانات عند بداية الكمبوننت
    this.loadBrands();
    this.loadBranchs();
    // setTimeout(() => {
    //   this.loadBrand();
    // }, 50);
  }

  loadCountries() {
    this.api.getAllCountry().subscribe({
      next: (res: Country[]) => {
        this.countries = res;
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

  loadBranchs() {
    this.isLoading = true;
    this.api
      .getBranchs()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.branchs = res;
        },
        error: (err) => {
          console.error("خطأ في تحميل الفروع:", err);
        },
      });
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

      // ✅ لو الزرار بتاع الفرع
      if (type === "branch") {
        this.loadBranchs(); // لو عايز تحدث الفرع برضه
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
    this.idsCountry = country.id ?? null;
    this.countryPreview = country.img || ""; // ✅ لو في صورة قديمة نعرضها كـ preview
  }

  saveCountry() {
    if (!this.newCountry.trim()) return;

    if (this.editingCountryIndex !== null) {
      // ✅ تعديل بلد موجود
      const existingCountry = this.countries[this.editingCountryIndex!];

      const body = {
        Id: this.idsCountry, // نرسل الـ id الفعلي
        CountryName: this.newCountry.trim(),
        Img: this.countryPreview || existingCountry.img || "", // ✅ صورة جديدة أو قديمة
        AddedBy: 1,
        AddedAt: new Date().toISOString(),
      };

      this.api.updateCountry(body).subscribe({
        next: (updated) => {
          // نحدث الـ array باستخدام index
          this.countries[this.editingCountryIndex!] = updated;
          this.editingCountryIndex = null;
          this.idsCountry = null;
          this.newCountry = "";
          this.countryPreview = ""; // 🧹 نفضي الـ preview
          this.showSuccess("تم تعديل البلد");
          this.loadCountries(); // 🆙 إعادة تحميل الدول من السيرفر
        },
        error: (err) => {
          if (err.status === 401) {
            this.showError("هذه البلد غير موجودة");
          } else if (err.status === 500) {
            this.showError("لا يمكن الاتصال بالخادم. تحقق من الاتصال.");
          } else {
            this.showError("هناك مشكلة بالسيرفر");
          }
        },
      });
    } else {
      // ✅ إضافة بلد جديد
      const body = {
        Id: 0,
        CountryName: this.newCountry.trim(),
        Img: this.countryPreview || "", // ✅ لو في صورة جديدة نضيفها
        AddedBy: 1,
        AddedAt: new Date().toISOString(),
      };

      this.api.addCountry(body).subscribe({
        next: (newC: Country) => {
          this.countries.push(newC);
          this.addingCountry = false;
          this.newCountry = "";
          this.countryPreview = ""; // 🧹 نفضي الـ preview
          this.showSuccess("تم إضافة البلد");
          this.loadCountries(); // 🆙 إعادة تحميل الدول من السيرفر
        },
        error: (err) => {
          if (err.status === 401) {
            this.showError("هذه البلد غير موجودة");
          } else if (err.status === 500) {
            this.showError("لا يمكن الاتصال بالخادم. تحقق من الاتصال.");
          } else {
            this.showError("هناك مشكلة بالسيرفر");
          }
        },
      });
    }
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
        this.loadCountries
      },
      error: (err) => {
        console.error("Error deleting country:", err);
        this.showError("حدث خطأ أثناء حذف البلد");
      },
    });
  }

  cancelAdd() {
    this.newCountry = "";
    this.addingCountry = false;
    this.editingCountryIndex = null;
  }

  startAddBranch() {
    this.addingBranch = true;
    this.newBranch = "";
    this.editingBranchIndex = null;
  }

  // 🟠 بدء تعديل فرع موجود
  editBranch(index: number) {
    this.editingBranchIndex = index;
    this.newBranch = this.branchs[index].BranchName;
    this.editingBranchId = this.branchs[index].Id;
    this.addingBranch = false;
  }

// 🟣 حفظ فرع (إضافة أو تعديل)
saveBranch() {
  if (!this.newBranch.trim()) return;

  // ✏️ حالة تعديل فرع موجود
  if (this.editingBranchIndex !== null && this.editingBranchId !== null) {
    const existingBranch = this.branchs[this.editingBranchIndex];

    const body = {
      Id: this.editingBranchId,
      BranchName: this.newBranch.trim(),
      Message: existingBranch.Message || "",
      AddedBy: existingBranch.AddedBy || 1,
      AddedAt: existingBranch.AddedAt || new Date().toISOString(),
    };

    this.api.updateBranch(body).subscribe({
      next: (res: any) => {
        // ✅ تحديث الصف محلياً بعد نجاح التعديل
        this.branchs[this.editingBranchIndex!] = {
          ...existingBranch,
          BranchName: res.BranchName,
        };

        this.editingBranchIndex = null;
        this.newBranch = "";
        this.showSuccess("✅ تم تعديل الفرع بنجاح");

        // 🆙 إعادة تحميل البيانات من السيرفر
        this.loadBranchs();
      },
      error: (err) => {
        this.showError("حدث خطأ أثناء تعديل الفرع");
      },
    });
  } 
  
  // ➕ حالة إضافة فرع جديد
  else {
    const body = {
      Id: 0,
      BranchName: this.newBranch.trim(),
      Message: "",
      AddedBy: 1,
      AddedAt: new Date().toISOString(),
    };

    this.api.addBranch(body).subscribe({
      next: (res: any) => {
        this.branchs.push(res);
        this.addingBranch = false;
        this.newBranch = "";

        this.showSuccess("✅ تم إضافة الفرع بنجاح");
        this.loadBranchs(); // ⬅️ تحديث القائمة بعد الإضافة
      },
      error: (err) => {
        this.showError("حدث خطأ أثناء إضافة الفرع");
      },
    });
  }
}

  // ❌ إلغاء الإضافة أو التعديل
  cancelBranch() {
    this.addingBranch = false;
    this.editingBranchIndex = null;
    this.editingBranchId = null;
    this.newBranch = "";
  }

  // 🗑 حذف فرع
// 🗑 حذف فرع
deleteBranch(index: number) {
  const branch = this.branchs[index];
  console.log("Deleting branch:", branch);

  // ✅ تأكد إن الفرع له ID صالح
  if (!branch?.Id) {
    this.showError("هذا الفرع غير صالح للحذف");
    return;
  }

  this.api.deleteBranch(branch.Id).subscribe({
    next: () => {
      // 🆗 نحذف من المصفوفة بعد نجاح الحذف
      this.branchs.splice(index, 1);
      this.showSuccess("✅ تم حذف الفرع بنجاح");
      this.loadBranchs(); // 🆙 إعادة تحميل الفروع من السيرفر
    },
    error: (err) => {
      console.error("❌ خطأ أثناء حذف الفرع:", err);
      this.showError("حدث خطأ أثناء حذف الفرع");
    },
  });
}


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
        Img: this.brandPreview || existingBrand.Img || "", // ✅ لو الصورة جديدة خذها، لو لا استخدم القديمة
        AddedBy: existingBrand.AddedBy || 1,
        AddedAt: existingBrand.AddedAt || new Date().toISOString(),
        Country: {
          Id: updatedCountryId,
          CountryName: updatedCountryName,
          Img: this.countryPreview || existingBrand.Country?.Img || "", // ✅ نفس الفكرة للدولة
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
              Img: this.countryPreview || "",
            },
          };

          this.editingBrandIndex = null;
          this.newBrand = "";
          this.showSuccess("✅ تم تعديل البراند بنجاح");

          // 🆙 تحديث القائمة من السيرفر بعد التعديل
          this.loadBrands();
        },
        error: (err) => {
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
        Img: this.brandPreview || "", // ✅ رابط صورة البراند بعد الرفع
        AddedBy: 1,
        AddedAt: new Date().toISOString(),
        Country: {
          Id: this.newBrandCountryId!,
          CountryName: this.countryMap[this.newBrandCountryId!],
          Img: this.countryPreview || "", // ✅ رابط صورة الدولة بعد الرفع
        },
      };

      this.api.addBrand(body).subscribe({
        next: (res: Brand) => {
          this.brands.push(res);
          this.addingBrand = false;
          this.newBrand = "";
          this.newBrandCountryId = null;

          this.showSuccess("✅ تم إضافة البراند بنجاح");
          this.loadBrands(); // ⬅️ تحديث القائمة
        },
        error: (err) => {
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
        this.loadBrands(); // 🆙 إعادة تحميل البراندات من السيرفر
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

  /////الصور الخاصة بالدول و البراندات//////
  onCountryImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.countryImageFile = input.files[0];
      // ✅ رفع الصورة مباشرة
      this.api.uploadImage(this.countryImageFile).subscribe({
        next: (res: any) => {
          const imageUrl = res.fileUrl;

          this.countryPreview = imageUrl;
          this.cdr.detectChanges();

          this.showSuccess("تم رفع الصورة بنجاح");

          // 🟡 لو كنا بنعدل دولة موجودة
          if (this.editingCountryIndex !== null) {
            this.countries[this.editingCountryIndex].img = imageUrl;
          }
        },

        error: (err) => {
          console.error("❌ خطأ في الرفع", err);
        },
      });
    }
  }

  onBrandImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.brandImageFile = input.files[0];

      // ✅ رفع الصورة مباشرة
      this.api.uploadImage(this.brandImageFile).subscribe({
        next: (res: any) => {
          const imageUrl = res.fileUrl;
          this.brandPreview = imageUrl;
          this.cdr.detectChanges();

          this.showSuccess("تم رفع الصورة بنجاح");

          // 🟡 لو كنا بنعدل براند موجود
          if (this.editingBrandIndex !== null) {
            this.brands[this.editingBrandIndex].Img = imageUrl;
          }
        },
        error: (err) => {
          console.error("❌ خطأ في الرفع", err);
        },
      });
    }
  }
}
