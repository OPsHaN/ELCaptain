import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../services/authservice";
import { ConfirmationService, MessageService } from "primeng/api";
import { Apiservice, Brand } from "../../services/apiservice";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { ConfirmDialogModule } from "primeng/confirmdialog";

@Component({
  selector: "app-car-register",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
    ConfirmDialogModule,
  ],
  templateUrl: "./car-register.html",
  styleUrl: "./car-register.scss",
  providers: [ConfirmationService],
})
export class CarRegister {
  @Input() isEditMode = false;
  carForm!: FormGroup;
  @Input() carData: any; // استبدل 'any' بالنوع المناسب إذا كان معروفًا
  @Output() closeForm = new EventEmitter<void>();
  @Input() car: any | null = null; // هيتعبى لما تبعت selectedCar
  showImageUploadSection = false;
  isSubmitting = false;
  brands: Brand[] = [];
  carId: number | null = null;
  carImagesPreview: string[] = [];

  defaultCarImage = "photos/default-car.jpg"; // مسار الصورة الافتراضية
  // carImagesPreview: string[] = []; // للمعاينة
  selectedBrand: any = null; // البراند المحدد
  @Output() refreshCars = new EventEmitter<void>();

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

  features = [
    { key: "HasChairHeater", label: "تسخين المقاعد" },
    { key: "HasBackAC", label: "مكيف خلفي" },
    { key: "HasPanorama", label: "سقف بانوراما" },
    { key: "HasMassageChairs", label: "مقاعد مساج" },
    { key: "HasTirbo", label: "تيربو" },
    { key: "HasExtraEngine", label: "محرك إضافي" },
    { key: "IsForSale", label: "إعرضها  للبيع" },
  ];

  carTypes: string[] = [
    "سيدان",
    "هاتشباك",
    "SUV",
    "بيك أب",
    "كوبيه",
    "كونفيرتيبل",
    "مينيفان",
    "فان",
    "رياضية",
    "كروس أوفر",
  ];

  engineTypes: string[] = [
    "بنزين",
    "ديزل",
    "هجين",
    "كهربائي",
    "غاز طبيعي",
    "توربو",
    "فول",
    "V6",
    "V8",
    "I4",
  ];

  transmissionTypes: string[] = [
    "يدوي",
    "أوتوماتيك",
    "نصف أوتوماتيك",
    "CVT",
    "ثنائي القابض",
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.car && changes["car"] && this.carForm) {
      this.carForm.patchValue(this.car);
    }

    // 🖼️ لو فيه صور، أعرضها
    if (this.car?.Images && this.car.Images.length > 0) {
      this.carImagesPreview = this.car.Images.map((img: any) => img.Img);
    } else {
      this.carImagesPreview = [];
    }
  }

  ngOnInit(): void {
    this.loadBrands();

    this.carForm = this.fb.group({
      Type: ["", Validators.required],
      Model: ["", Validators.required],
      BrandId: ["", Validators.required],
      Color: ["", Validators.required],
      Kilometers: [""],
      Transmission: [""],
      Price: [0, Validators.required],
      YearOfManufacture: [0, Validators.required],
      EngineType: [""],
      HorsePower: [""],
      AirBagCount: [""],
      BagCapacity: [""],
      Condition: ["", Validators.required],
      Images: this.fb.array([]),
      HasChairHeater: [false],
      HasBackAC: [false],
      HasPanorama: [false],
      HasMassageChairs: [false],
      HasTirbo: [false],
      HasExtraEngine: [false],
      IsForSale: [false],
    });

    if (this.isEditMode && this.car) {
      setTimeout(() => {
        this.carForm.patchValue(this.car);
      });
    }
  }

  loadBrands() {
    this.api.getAllBrand().subscribe((res) => {
      this.brands = res;
      console.log("bands", res);
      this.cdr.detectChanges(); // ✅ يحل مشكلة ExpressionChangedAfterItHasBeenCheckedError
    });
  }

  onBrandChange(brandId: number) {
    this.selectedBrand = this.brands.find((b) => b.Id === brandId) || null;
  }

  get imagesFormArray() {
    return this.carForm.get("Images") as FormArray;
  }

  get imagesFromFormArray(): string[] {
    return this.imagesFormArray.controls
      .map((ctrl) => ctrl.value?.Img) // ✅ تحقق من وجود ctrl.value
      .filter((img) => !!img); // ✅ تصفية القيم null/undefined
  }

  confirmIsForSale(event: MouseEvent) {
    event.preventDefault(); // يمنع تغيير القيمة مباشرة

    const currentValue = this.carForm.get("IsForSale")?.value;
    const newValue = !currentValue; // القيمة اللي المفروض تتغير

    const message = newValue
      ? "هل أنت متأكد أنك تريد عرض السيارة للبيع؟"
      : "هل أنت متأكد أنك تريد إلغاء عرض السيارة للبيع؟";

    this.confirmationService.confirm({
      message: message,
      acceptLabel: "نعم",
      rejectLabel: "لا",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.carForm.get("IsForSale")?.setValue(newValue);
      },
      reject: () => {
        // لا تفعل شيء، يبقى checkbox زي ما هو
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach((file) => {
      const imageObj = {
        File: file, // ✅ نحتفظ بالملف الأصلي هنا
        Img: URL.createObjectURL(file), // للعرض فقط
        Id: 0,
        CarId: 0,
        AddedBy: 1,
        AddedAt: new Date().toISOString(),
        Message: "لم يتم الرفع بعد",
        IsMain: this.imagesFormArray.length === 0,
      };

      this.imagesFormArray.push(this.fb.control(imageObj));

      // لو عايز تعرض الصور كـ preview
      this.carImagesPreview.push(imageObj.Img);

      // أقصى عدد 6 صور
      if (this.imagesFormArray.length > 6) {
        while (this.imagesFormArray.length > 6) {
          this.imagesFormArray.removeAt(0);
          this.carImagesPreview.shift();
        }
      }
    });

    this.cdr.detectChanges();
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

  removeImage(index: number) {
    const removedImg = this.carImagesPreview[index];

    // ✅ لو الصورة قديمة (جاية من السيرفر)
    const existingImage = this.car?.Images?.find(
      (img: { Img?: string; Id?: number } | any) => img?.Img === removedImg
    );
    if (existingImage) {
      // 🧹 احذفها من carImagesPreview
      this.carImagesPreview.splice(index, 1);

      // 🗑️ لو عايز تحذفها من السيرفر فورًا:
      this.api.deleteImagesForCar(existingImage.Id).subscribe({
        next: () => console.log(`🧼 تم حذف الصورة ID=${existingImage.Id}`),
        error: (err) => console.error("❌ خطأ في حذف الصورة:", err),
      });

      return; // نخرج علشان منعملش remove من imagesFormArray
    }

    // ✅ لو الصورة جديدة (لسه متضافتش للسيرفر)
    if (
      this.imagesFormArray.length > 0 &&
      index < this.imagesFormArray.length
    ) {
      this.imagesFormArray.removeAt(index);

      // ✅ لو الصورة الأولى اتشالت، عين اللي بعدها رئيسية
      if (index === 0 && this.imagesFormArray.length > 0) {
        const first = this.imagesFormArray.at(0).value;
        if (first) {
          first.IsMain = true;
          this.imagesFormArray.at(0).setValue(first);
        }
      }
    }

    this.cdr.detectChanges();
  }

  uploadImagesForCar(carId: number, images: any[]) {
    images.forEach((img) => {
      const body = {
        Id: 0,
        CarId: carId,
        Img: img.Img, // ✅ URL اللى رجع من uploadImage
        AddedBy: 1,
        AddedAt: new Date().toISOString(),
        Message: "تم الرفع",
        EditedBy: 1,
        EditedAt: new Date().toISOString(),
      };

      this.api.uploadBulkImages(body).subscribe({
        next: () => console.log(`✅ تم إضافة الصورة لعربية رقم ${carId}`),
        error: (err) => console.error("❌ خطأ أثناء إضافة الصورة:", err),
      });
    });
  }

  onSubmit(): void {
    if (this.carForm.invalid) {
      this.carForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // 🖼️ تجهيز الصور
    const imagesArray = this.imagesFormArray.controls.map((ctrl) => ({
      ...ctrl.value,
      Id: 0,
      CarId: this.isEditMode && this.car ? this.car.Id : 0,
      AddedBy: 1,
      AddedAt: new Date().toISOString(),
      Message: "تم الرفع",
      EditedBy: 1,
      EditedAt: new Date().toISOString(),
    }));

    const formValue = this.carForm.value;

    const payload: any = {
      Id: this.isEditMode && this.car ? this.car.Id : 0, // 🟡 لو تعديل نستخدم ID الحالى
      Type: formValue.Type,
      Model: formValue.Model,
      BrandId: formValue.BrandId,
      Color: formValue.Color,
      Kilometers: formValue.Kilometers,
      Transmission: formValue.Transmission,
      Price: formValue.Price,
      YearOfManufacture: formValue.YearOfManufacture,
      EngineType: formValue.EngineType,
      HorsePower: formValue.HorsePower,
      AirBagCount: formValue.AirBagCount,
      BagCapacity: formValue.BagCapacity,
      Condition: formValue.Condition,
      HasChairHeater: formValue.HasChairHeater,
      HasBackAC: formValue.HasBackAC,
      HasPanorama: formValue.HasPanorama,
      HasMassageChairs: formValue.HasMassageChairs,
      HasTirbo: formValue.HasTirbo,
      HasExtraEngine: formValue.HasExtraEngine,
      IsForSale: formValue.IsForSale,
      AddedBy: 1,
      AddedAt: new Date().toISOString(),
      Message: "string",
      Brand: this.selectedBrand,
      // Images: imagesArray,
    };

    console.log("🚀 Final payload to send:", payload);

    if (this.isEditMode) {
      // 🟡 تعديل
      this.api.updateCar(payload).subscribe({
        next: () => {
          this.showSuccess("✅ تم تعديل السيارة بنجاح");
          this.isSubmitting = false;
          this.showImageUploadSection = true;

          this.isEditMode = false;
        },
        error: (err) => {
          console.error("❌ Update error:", err);
          this.isSubmitting = false;
          this.showError("حدث خطأ أثناء تعديل السيارة");
        },
      });
    } else {
      // 🟢 إضافة
      this.api.addCar(payload).subscribe({
        next: (res: any) => {
          this.showSuccess("✅ تم إضافة السيارة بنجاح");

          // 🆔 احفظ Id عشان الصور
          this.carId = res.Id;
          if (this.carId != null) {
            localStorage.setItem("CarId", this.carId.toString());
          }
          this.carForm.reset();

          this.showImageUploadSection = true;
          this.isSubmitting = false;
          // this.closeForm.emit();
          // this.refreshCars.emit();
        },
        error: (err) => {
          console.error("❌ Add error:", err);
          this.isSubmitting = false;
          this.showError("حدث خطأ أثناء إضافة السيارة");
        },
      });
    }
  }

saveCarImages(): void {
  this.carId = this.car?.Id || this.carId;

  // ✅ تأكد إن فيه ID للعربية
  if (!this.carId) {
    this.showError("لم يتم تحديد السيارة");
    return;
  }

  this.isSubmitting = true;

  // 📸 الصور الجديدة فقط (اللي فيها File)
  const newImageControls = this.imagesFormArray.controls.filter(
    (ctrl) => ctrl.value.File
  );

  // 🛑 لو لا صور جديدة ولا قديمة → Error
  if (newImageControls.length === 0 && this.carImagesPreview.length === 0) {
    this.showError("لا توجد صور لرفعها");
    this.isSubmitting = false;
    return;
  }

  // 🟡 لو مفيش صور جديدة لكن فيه صور قديمة → مفيش API call
  if (newImageControls.length === 0) {
    console.log("🟡 لا توجد صور جديدة، لن يتم استدعاء API");
    this.showSuccess("✅ لا توجد صور جديدة للرفع، تم حفظ التغييرات");
    this.isSubmitting = false;
    this.refreshCars.emit();
    this.closeForm.emit();
    return;
  }

  // ✅ لو فيه صور جديدة → ارفعها
  const uploadPromises = newImageControls.map((ctrl) =>
    this.api.uploadImage(ctrl.value.File).toPromise()
  );

  Promise.all(uploadPromises)
    .then((uploadResults) => {
      const imagesToAdd = uploadResults.map((res, idx) => ({
        Id: 0,
        CarId: this.carId,
        Img: (res as any)?.fileUrl || newImageControls[idx].value.Img,
        AddedBy: 1,
        AddedAt: new Date().toISOString(),
        Message: "تم الرفع",
        EditedBy: 1,
        EditedAt: new Date().toISOString(),
      }));

      // 📤 استدعاء API للصور الجديدة فقط
      this.api.uploadBulkImages(imagesToAdd).subscribe({
        next: () => {
          this.showSuccess("✅ تم رفع الصور الجديدة بنجاح");

          // 🧼 إزالة الصور الجديدة من الفورم
          newImageControls.forEach((ctrl) => {
            const i = this.imagesFormArray.controls.indexOf(ctrl);
            if (i >= 0) this.imagesFormArray.removeAt(i);
          });

          // 🖼️ تحديث المعاينة
          this.carImagesPreview = [
            ...this.carImagesPreview,
            ...imagesToAdd.map((i) => i.Img),
          ];

          console.log("🚀 الصور بعد الرفع:", this.carImagesPreview);
          console.log("🚀 الفورم:", this.carForm.value);

          this.cdr.detectChanges();
          this.refreshCars.emit();
          this.closeForm.emit();
        },
        error: () => this.showError("حدث خطأ أثناء إضافة الصور للسيارة"),
        complete: () => (this.isSubmitting = false),
      });
    })
    .catch((err) => {
      console.error("❌ Image upload error:", err);
      this.showError("حدث خطأ أثناء رفع واحدة أو أكثر من الصور");
      this.isSubmitting = false;
    });
}


  // ✅ إعادة تهيئة الفورم بعد الإرسال
  resetForm() {
    this.carForm.reset({
      Type: "",
      Model: "",
      BrandId: null,
      Color: "",
      Kilometers: "",
      Transmission: "",
      Price: 0,
      YearOfManufacture: 0,
      EngineType: "",
      HorsePower: "",
      AirBagCount: "",
      BagCapacity: "",
      Condition: "",
      Images: [],
      HasChairHeater: false,
      HasBackAC: false,
      HasPanorama: false,
      HasMassageChairs: false,
      HasTirbo: false,
      HasExtraEngine: false,
      IsForSale: false,
    });

    this.carImagesPreview = [];
    this.selectedBrand = null;
    this.isEditMode = false;
  }
}
