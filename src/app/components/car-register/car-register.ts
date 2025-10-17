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

  isSubmitting = false;
  brands: Brand[] = [];
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
      Color: [""],
      Kilometers: [""],
      Transmission: [""],
      Price: [0, Validators.required],
      YearOfManufacture: [0, Validators.required],
      EngineType: [""],
      HorsePower: [""],
      AirBagCount: [""],
      BagCapacity: [""],
      Condition: [""],
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

  const currentValue = this.carForm.get('IsForSale')?.value;
  const newValue = !currentValue; // القيمة اللي المفروض تتغير

  const message = newValue
    ? "هل أنت متأكد أنك تريد عرض السيارة للبيع؟"
    : "هل أنت متأكد أنك تريد إلغاء عرض السيارة للبيع؟";

  this.confirmationService.confirm({
    message: message,
    acceptLabel: 'نعم',
    rejectLabel: 'لا',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.carForm.get('IsForSale')?.setValue(newValue);
    },
    reject: () => {
      // لا تفعل شيء، يبقى checkbox زي ما هو
    }
  });
}


onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  Array.from(input.files).forEach((file) => {
    const imageObj = {
      file: file,
      Img: URL.createObjectURL(file),
      IsMain: this.imagesFormArray.length === 0,
    };

    this.imagesFormArray.push(this.fb.control(imageObj));
  });

  // احتفظ بحد أقصى 6 صور
  if (this.imagesFormArray.length > 6) {
    while (this.imagesFormArray.length > 6) {
      this.imagesFormArray.removeAt(0);
    }
  }

  this.cdr.detectChanges();
}





uploadCarImages(carId: number) {
  if (this.imagesFormArray.length === 0) return;

  this.imagesFormArray.controls.forEach((ctrl) => {
    const imgCtrlValue = ctrl.value;

    if (imgCtrlValue?.file) {
      const formData = new FormData();
      formData.append("file", imgCtrlValue.file);
      formData.append("CarId", carId.toString());

      this.api.uploadImagesforCar(formData).subscribe({
        next: (res) => console.log("✅ تم رفع صورة:", res),
        error: (err) => console.error("❌ خطأ في رفع الصورة", err),
      });
    }
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
      life: 3000,
    });
  }

removeImage(index: number) {
  if (this.imagesFormArray.length === 0) return;

  const imgObj = this.imagesFormArray.at(index).value;

  if (imgObj?.Id) {
    // لو الصورة مرفوعة على السيرفر فعلاً
    this.api.deleteImagesForCar(imgObj.Id).subscribe({
      next: () => {
        this.imagesFormArray.removeAt(index);
        if (index === 0 && this.imagesFormArray.length > 0) {
          const first = this.imagesFormArray.at(0).value;
          if (first) {
            first.IsMain = true;
            this.imagesFormArray.at(0).setValue(first);
          }
        }
        this.cdr.detectChanges();
        this.showSuccess("✅ تم حذف الصورة بنجاح");
      },
      error: (err) => {
        this.showError("حدث خطأ أثناء حذف الصورة");
      },
    });
  } else {
    // لو الصورة لسه محلية (لسه مرفعتش)
    this.imagesFormArray.removeAt(index);
  }
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

  const body = this.prepareCarBody();

  // 🟡 أرسل السيارة بدون صور
  this.api.addCar(body).subscribe({
    next: (res: any) => {
      const carId = res.Id || res.CarId;
      this.uploadCarImages(carId); // 🟢 بعد الإضافة نرفع الصور
      this.showSuccess("✅ تم إضافة السيارة بنجاح");
      this.resetForm();
    },
    error: (err) => {
      console.error(err);
      this.showError("❌ حدث خطأ أثناء إضافة السيارة");
    },
  });
}

prepareCarBody() {
  const formValue = this.carForm.value;
  return {
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
    Brand: this.selectedBrand,
    AddedBy: 1,
    AddedAt: new Date().toISOString(),
    Message: "string",
  };
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
