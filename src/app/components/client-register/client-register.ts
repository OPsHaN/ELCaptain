import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { MatSelectModule } from "@angular/material/select";
import { CommonModule } from "@angular/common";
import { CheckboxModule } from "primeng/checkbox";
import { Apiservice } from "../../services/apiservice";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-client-register",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
    CheckboxModule,
  ],
  templateUrl: "./client-register.html",
  styleUrl: "./client-register.scss",
})
export class ClientRegister implements OnInit {
  @Output() closeForm = new EventEmitter<void>();
  clientForm!: FormGroup;
  @Input() isEditMode = false;
  isSubmitting = false;
  selectedFiles: File[] = [];
  @Output() refreshClients = new EventEmitter<void>();
  @Input() client: any;
  clientId: number = 0;
  countries: any[] = [];
  salesList: any[] = [];
  newClientId: number | null = null;
  showUploadSection = false;
  classification = [
    { name: "B", code: "B" },
    { name: "B+", code: "B+" },
    { name: "A", code: "A" },
    { name: "A+", code: "A+" },
  ];

  countryCodes = [
    { name: "Egypt", flag: "🇪🇬", dial_code: "+20" },
    { name: "Saudi Arabia", flag: "🇸🇦", dial_code: "+966" },
    { name: "United Arab Emirates", flag: "🇦🇪", dial_code: "+971" },
    { name: "Kuwait", flag: "🇰🇼", dial_code: "+965" },
    { name: "Qatar", flag: "🇶🇦", dial_code: "+974" },
    { name: "Bahrain", flag: "🇧🇭", dial_code: "+973" },
    { name: "Oman", flag: "🇴🇲", dial_code: "+968" },
    { name: "Jordan", flag: "🇯🇴", dial_code: "+962" },
    { name: "Lebanon", flag: "🇱🇧", dial_code: "+961" },
    { name: "Libya", flag: "🇱🇾", dial_code: "+218" },
    { name: "Tunisia", flag: "🇹🇳", dial_code: "+216" },
    { name: "Morocco", flag: "🇲🇦", dial_code: "+212" },
    { name: "Sudan", flag: "🇸🇩", dial_code: "+249" },
    { name: "Algeria", flag: "🇩🇿", dial_code: "+213" },
    { name: "Palestine", flag: "🇵🇸", dial_code: "+970" },
    { name: "Turkey", flag: "🇹🇷", dial_code: "+90" },
    { name: "Yemen", flag: "🇾🇪", dial_code: "+967" },
    { name: "United States", flag: "🇺🇸", dial_code: "+1" },
    { name: "United Kingdom", flag: "🇬🇧", dial_code: "+44" },
    { name: "France", flag: "🇫🇷", dial_code: "+33" },
    { name: "Germany", flag: "🇩🇪", dial_code: "+49" },
    { name: "Italy", flag: "🇮🇹", dial_code: "+39" },
    { name: "Spain", flag: "🇪🇸", dial_code: "+34" },
    { name: "Canada", flag: "🇨🇦", dial_code: "+1" },
    { name: "India", flag: "🇮🇳", dial_code: "+91" },
    { name: "Pakistan", flag: "🇵🇰", dial_code: "+92" },
    { name: "Indonesia", flag: "🇮🇩", dial_code: "+62" },
    { name: "Malaysia", flag: "🇲🇾", dial_code: "+60" },
    { name: "Philippines", flag: "🇵🇭", dial_code: "+63" },
    { name: "South Africa", flag: "🇿🇦", dial_code: "+27" },
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private api: Apiservice
  ) {}

  ngOnChanges() {
    if (this.isEditMode && this.client && this.clientForm) {
      this.patchClientData(this.client);
    }
  }

  ngOnInit() {
    this.clientForm = this.fb.group({
      ClientName: ["", Validators.required],
      CountryCode: ["", Validators.required],
      PhoneNumber: [
        "",
        [Validators.required, Validators.pattern(/^\d{10}$/)],
      ],
      Classification: [""],
      InterstedInCountryId: [0],
      Budget: [""],
      PaymentMethod: [0],
      AddedBy: [0],
      FilePath: [""],
      // SalesId: [0, Validators.required],
    });

    this.loadEmployees();
    this.loadCountries();

    // 🟡 لو داخل وضع تعديل
    if (this.isEditMode && this.client) {
      this.patchClientData(this.client);
      this.loadEmployees();
    }
  }

  // ✅ لو عايز يشتغل دايناميك بمجرد تغيير القيمة

  private patchClientData(client: any) {
  let countryCode = '';
  let phoneNumber = '';

  if (client.PhoneNumber) {
    // أولاً نطهر الرقم: نشيل مسافات، شرطات، أقواس
    let raw = client.PhoneNumber.toString().replace(/[\s\-\(\)]/g, '');

    // نضمن وجود + بالبداية لو موجود كود
    // (لو الرقم محفوظ كـ "0020123..." ممكن تحول 00 -> +)
    if (raw.startsWith('00')) {
      raw = '+' + raw.slice(2);
    }

    // نبحث في countryCodes عن أطول كود يتطابق مع بداية الرقم
    // نرتب الكودز نزولياً حسب الطول عشان نأخذ المطابقة الأطول أولاً
    const sortedCodes = [...this.countryCodes].sort(
      (a, b) => b.dial_code.length - a.dial_code.length
    );

    const found = sortedCodes.find(c => raw.startsWith(c.dial_code));

    if (found) {
      countryCode = found.dial_code;
      phoneNumber = raw.slice(countryCode.length);
    } else {
      // لو ما لقيناش كود، ممكن نعامل الرقم كرقم محلي (بدون كود)
      // أو نحاول فصل علامة + وكله بعد كده
      if (raw.startsWith('+')) {
        // حاول تاخذ أول جزئين: +ddd وباقي
        const m = raw.match(/^(\+\d{1,4})(\d+)$/);
        if (m) {
          countryCode = m[1];
          phoneNumber = m[2];
        } else {
          phoneNumber = raw.replace(/^\+/, '');
        }
      } else {
        phoneNumber = raw;
      }
    }

    // اختياري: لو الرقم المحلي بدأ بصفر (مثل 012345...), وشايف انك عايز تخزّن بدون الصفر
    // شيل الصفر الأول لو موجود (تعتمد اذا النمط اللي بتستخدمه في التسجيل بيحتفظ بالصفر أو لا)
    if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.slice(1);
    }
  }

  // الآن نحدّث الفورم
  this.clientForm.patchValue({
    ClientName: client.ClientName,
    CountryCode: countryCode || '', // ممكن تضع قيمة افتراضية لو حبيت
    PhoneNumber: phoneNumber || '',
    Classification: client.Classification,
    InterstedInCountryId: client.InterstedInCountryId,
    Budget: client.Budget,
    PaymentMethod: client.PaymentMethod,
    SalesId: 0,
  });

  this.clientId = client.Id;
}


  loadEmployees() {
    this.api.getAllEmployee().subscribe({
      next: (res: any) => {
        this.salesList = res;
        console.log("Sales List:", res);
      },
      error: (err) => console.error(err),
    });
  }

  loadCountries() {
    this.api.getAllCountry().subscribe({
      next: (res: any) => {
        this.countries = res;
        console.log("Countries List:", res);
      },
      error: (err) => {
        console.error("خطأ جلب الدول:", err);
      },
    });
  }

onFileSelected(event: any): void {
  this.selectedFiles = Array.from(event.target.files);
}

uploadFiles(): void {
  if (!this.clientId || this.selectedFiles.length === 0) {
    this.showError("يجب تسجيل العميل أولًا واختيار ملفات 📎");
    return;
  }

  this.selectedFiles.forEach((file) => {
    this.api.uploadFile(this.clientId!, file).subscribe({
      next: () => {
        console.log("✅ File uploaded successfully:", file.name);
        this.showSuccess(`تم رفع الملف ${file.name} بنجاح`);
        this.closeForm.emit()
      },
      error: (err) => {
        console.error("❌ Error uploading file:", err);
        this.showError(`فشل رفع الملف ${file.name}`);
      },
    });
  });
}


  onSubmit(): void {
  if (this.clientForm.invalid) {
    this.clientForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;
  this.clientId = this.client ? this.client.Id : 0;

  const fullPhone =
    this.clientForm.value.CountryCode + this.clientForm.value.PhoneNumber;

  // 📝 تجهيز جسم البيانات للإرسال
  const body = {
    Id: this.clientId || 0,
    ClientName: this.clientForm.value.ClientName,
    PhoneNumber: fullPhone,
    Classification: this.clientForm.value.Classification,
    InterstedInCountryId: this.clientForm.value.InterstedInCountryId,
    Budget: this.clientForm.value.Budget,
    PaymentMethod: this.clientForm.value.PaymentMethod,
    AddedBy: 0,
    AddedAt: new Date().toISOString(),
    EditedBy: 0,
    SalesId: 0,
    EditedAt: new Date().toISOString(),
  };

  // ✨ لو تعديل استدعاء update ولو إضافة استدعاء add
  const savePromise = this.isEditMode && this.clientId > 0
    ? this.api.updateClient(body).toPromise()
    : this.api.addClient(body).toPromise();

  savePromise
    .then((res: any) => {
      // ⏳ حفظ ناجح → إظهار رفع الملفات
      this.isSubmitting = false;
      this.showUploadSection = true; // ✅ هنا المكان الصح لعرض الرفع

      // لو السيرفر رجع ID جديد نحفظه لاستخدامه في رفع الملفات
      if (!this.clientId && res?.id) {
        this.clientId = res.id;
      }

      if (this.isEditMode) {
        this.showSuccess("✅ تم تعديل بيانات العميل بنجاح");
      } else {
        this.showSuccess("✅ تم تسجيل العميل بنجاح");
      }
    })
    .catch((err) => {
      console.error("❌ خطأ أثناء حفظ البيانات", err);
      this.showError("حدث خطأ أثناء حفظ البيانات");
      this.isSubmitting = false;
    });
}

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.api.uploadFile(this.clientId, file);
  }

  addClient(body: any) {
    return this.api.addClient(body);
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
