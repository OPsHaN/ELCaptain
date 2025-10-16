import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../services/authservice";
import { MessageService } from "primeng/api";
import { Apiservice } from "../../services/apiservice";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-car-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule, FormsModule],
  templateUrl: "./car-register.html",
  styleUrl: "./car-register.scss",
})
export class CarRegister {
  @Input() isEditMode = false;
  carForm!: FormGroup;
  @Input() carData: any; // استبدل 'any' بالنوع المناسب إذا كان معروفًا
  carImagePreview: string | null = null;
  defaultCarImage = "assets/default-car.png"; // مسار الصورة الافتراضية
  @Output() closeForm = new EventEmitter<void>();
  isSubmitting = false;

  features = [
    { key: "HasChairHeater", label: "تسخين المقاعد" },
    { key: "HasBackAC", label: "مكيف خلفي" },
    { key: "HasPanorama", label: "سقف بانوراما" },
    { key: "HasMassageChairs", label: "مقاعد مساج" },
    { key: "HasTirbo", label: "تيربو" },
    { key: "HasExtraEngine", label: "محرك إضافي" },
    { key: "IsForSale", label: "للبيع" },
  ];

  brands = [
    { Id: 1, BrandName: "BMW" },
    { Id: 2, BrandName: "Mercedes" },
    { Id: 3, BrandName: "Audi" },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private api: Apiservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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

      HasChairHeater: [false],
      HasBackAC: [false],
      HasPanorama: [false],
      HasMassageChairs: [false],
      HasTirbo: [false],
      HasExtraEngine: [false],
      IsForSale: [true],
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.carImagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.carForm.invalid) {
      this.carForm.markAllAsTouched();
      return;
    }

    const payload = this.carForm.value;
    console.log("🚀 Payload:", payload);

    if (this.isEditMode) {
      // updateCar(payload)
    } else {
      // addCar(payload)
    }
  }
}
