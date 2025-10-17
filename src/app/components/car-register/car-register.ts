import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
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
  carImages: {
    Id: any;
    CarId: any;
    Img: any;
    AddedBy: any;
    AddedAt: any;
    Message: any;
  }[] = []; // لتخزين بيانات الصور الجديدة
  defaultCarImage = "photos/default-car.jpg"; // مسار الصورة الافتراضية
  // carImagesPreview: string[] = []; // للمعاينة
  selectedBrand: any = null; // البراند المحدد
  @Output() refreshCars = new EventEmitter<void>(); 

  colorsList = [
  { name: 'أحمر', code: '#FF0000' },
  { name: 'أزرق', code: '#0000FF' },
  { name: 'أسود', code: '#000000' },
  { name: 'أبيض', code: '#FFFFFF' },
  { name: 'رمادي', code: '#808080' },
  { name: 'أخضر', code: '#008000' },
  { name: 'فضي', code: '#C0C0C0' },
  { name: 'ذهبي', code: '#FFD700' },
  { name: 'برتقالي', code: '#FFA500' },
  { name: 'وردي', code: '#FFC0CB' },
  { name: 'بني', code: '#8B4513' },
  { name: 'بنفسجي', code: '#800080' },
  { name: 'كحلي', code: '#000080' },
  { name: 'زيتي', code: '#808000' },
  { name: 'سماوي', code: '#87CEEB' },
  { name: 'عنابي', code: '#800000' },
  { name: 'بيج', code: '#F5F5DC' },
  { name: 'تركواز', code: '#40E0D0' },
];


getColorCode(colorName: string): string {
  const color = this.colorsList.find(
    c => c.name.trim().toLowerCase() === colorName?.trim().toLowerCase()
  );
  return color ? color.code : '#000000';
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

  ngOnInit(): void {
    this.loadBrands();

    this.carForm = this.fb.group({
      Type: ["", Validators.required],
      Model: ["", Validators.required],
      BrandId: ["", Validators.required],
      Color: ["" , Validators.required],
      Kilometers: [""],
      Transmission: ["" ],
      Price: [0, Validators.required],
      YearOfManufacture: [0, Validators.required],
      EngineType: ["" ],
      HorsePower: [""],
      AirBagCount: [""],
      BagCapacity: [""],
      Condition: ["" , Validators.required],
      Images: this.fb.array([]), // 🔹 هنا نربط المصفوفة
      HasChairHeater: [false],
      HasBackAC: [false],
      HasPanorama: [false],
      HasMassageChairs: [false],
      HasTirbo: [false],
      HasExtraEngine: [false],
      IsForSale: [false],
    });
  }

  loadBrands() {
    this.api.getAllBrand().subscribe((res) => {
      this.brands = res;
      console.log("bands", res);
    });
  }

  onBrandChange(brandId: number) {
    this.selectedBrand = this.brands.find((b) => b.Id === brandId) || null;
  }

  get imagesFormArray() {
    return this.carForm.get("Images") as FormArray;
  }

  get carImagesPreview(): string[] {
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
      File: file,  // ✅ نحتفظ بالملف الأصلي هنا
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
    if (this.imagesFormArray.length === 0) return;

    this.imagesFormArray.removeAt(index);

    // إذا كانت الصورة الأولى أزيلت، عين الصورة التالية رئيسية تلقائيًا
    if (index === 0 && this.imagesFormArray.length > 0) {
      const first = this.imagesFormArray.at(0).value;
      if (first) {
        first.IsMain = true;
        this.imagesFormArray.at(0).setValue(first);
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
        Message: img.Message || "تم الرفع",
      };

      this.api.AddImagesforCar(body).subscribe({
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

    if (!this.selectedBrand) {
      this.showError("الرجاء اختيار براند للسيارة");
      return;
    }

    const imagesArray = this.imagesFormArray.controls.map((ctrl) => ({
      ...ctrl.value,
      Id: 0,
      CarId: 0,
      AddedBy: 1,
      AddedAt: new Date().toISOString(),
      Message: "تم الرفع",
    }));

    const body = {
      ...this.carForm.value,
      Brand: this.selectedBrand,
      Images: imagesArray,
      AddedBy: 1,
      AddedAt: new Date().toISOString(),
      Message: "string",
    };

    console.log("🚀 Final body to send:", body);

    if (this.isEditMode) {
      this.api.updateCar(body).subscribe({
        next: () => {
          this.showSuccess("✅ تم تعديل السيارة بنجاح");
          this.showImageUploadSection = true;
        },
        error: () => this.showError("❌ حدث خطأ أثناء تعديل السيارة"),
      });
    } else {
      this.api.addCar(body).subscribe({
        next: (res: any) => {
          this.showSuccess("✅ تم إضافة السيارة بنجاح");

          // ✅ احفظ الـ CarId المضاف عشان تربطه بالصور
          this.carId = res.Id;
          console.log("🚗 Car added with ID:", this.carId);
          if (this.carId != null) {
            localStorage.setItem("CarId", this.carId.toString());
          }

          // ✅ خلي جزء رفع الصور يظهر بعد الإضافة
          this.showImageUploadSection = true;

          // ❌ متعملش resetForm هنا
          // this.resetForm();
        },
        error: () => this.showError("❌ حدث خطأ أثناء إضافة السيارة"),
      });
    }
  }

  saveCarImages(): void {

    this.carId = this.car?.Id || this.carId;

    // this.carId = localStorage.getItem("CarId");
    // console.log("🚗 Car ID from localStorage:", this.carId);

    if (this.imagesFormArray.length === 0) {
      this.showError("لا توجد صور لرفعها");
      return;
    }

    if (!this.carId) {
      this.showError("لم يتم تحديد السيارة");
      
      return;
    }

    this.isSubmitting = true;

    // 1️⃣ تجهيز كل عمليات الرفع
    const uploadPromises = this.imagesFormArray.controls.map((ctrl) => {
      const file = ctrl.value.File;
      if (!file) return Promise.reject("لا يوجد ملف"); // تأمين

      return this.api.uploadImage(file).toPromise();
    });

    // 2️⃣ تنفيذ كل الرفعات معًا
    Promise.all(uploadPromises)
      .then((uploadResults: any[]) => {
        // 3️⃣ تجهيز البودي للـ API
        const imagesToAdd = uploadResults.map((res) => ({
          Id: 0,
          CarId: this.carId,
          Img: res.fileUrl || res.Img || this.defaultCarImage,
          AddedBy: 1,
          AddedAt: new Date().toISOString(),
          Message: res.Message || "تم الرفع",
        }));

   const payload = {
  Images: imagesToAdd
};

this.api.AddImagesforCar(payload).subscribe({
  next: () => {
    this.showSuccess("✅ تم رفع الصور بنجاح");
    this.imagesFormArray.clear();
    this.resetForm();
    this.refreshCars.emit();
    this.closeForm.emit();
  },
  error: (err) => {
    this.showError("حدث خطأ أثناء إضافة الصور للسيارة");
  },
  complete: () => {
    this.isSubmitting = false;
  },
});
      })
      .catch((err) => {
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

    this.carImages = [];
    // this.carImagesPreview = [];
    this.selectedBrand = null;
    this.isEditMode = false;
  }
}
