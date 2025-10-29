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
  classification = [
    { name: "A+", code: "A+" },
    { name: "A", code: "A" },
    { name: "B+", code: "B+" },
    { name: "B", code: "B" },
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
      PhoneNumber: ["", Validators.required],
      Classification: [""],
      InterstedInCountryId: [0],
      Budget: [""],
      PaymentMethod: [0],
      AddedBy: [0],
      Message: [""],
      SalesId: [0, Validators.required],
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
    this.clientForm.patchValue({
      ClientName: client.ClientName,
      PhoneNumber: client.PhoneNumber,
      Classification: client.Classification,
      InterstedInCountryId: client.InterstedInCountryId,
      Budget: client.Budget,
      PaymentMethod: client.PaymentMethod,
      Message: client.Message,
      SalesId: client.SalesId,
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
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files.item(i)!);
    }
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.clientId = this.client ? this.client.Id : 0;

    // 🖼️ رفع الملفات أولاً لو فيه
    const uploadPromises = this.selectedFiles.map((file) =>
      this.api.uploadFile(this.clientId, file).toPromise()
    );

    Promise.all(uploadPromises)
      .then((uploadedFiles: any) => {
        // 📝 تجهيز جسم البيانات للإرسال
        const body = {
          FilesArray: uploadedFiles.map((file: any) => ({
            Id: 0,
            ClientId: this.clientId || 0,
            FilePath: file?.filePath || file?.path || "",
            AddedBy: 0,
            AddedAt: new Date().toISOString(),
            Message: "",
            EditedBy: 0,
            EditedAt: new Date().toISOString(),
          })),
          Id: this.clientId || 0,
          ClientName: this.clientForm.value.ClientName,
          PhoneNumber: this.clientForm.value.PhoneNumber,
          Classification: this.clientForm.value.Classification,
          InterstedInCountryId: this.clientForm.value.InterstedInCountryId,
          Budget: this.clientForm.value.Budget,
          PaymentMethod: this.clientForm.value.PaymentMethod,
          AddedBy: 0,
          AddedAt: new Date().toISOString(),
          Message: this.clientForm.value.Message,
          EditedBy: 0,
          SalesId: Number(this.clientForm.value.SalesId),
          EditedAt: new Date().toISOString(),
        };


        console.log("🟡 Body before send:", body);


        // ✨ لو تعديل استدعاء update ولو إضافة استدعاء add
        if (this.isEditMode && this.clientId > 0) {
          return this.api.updateClient(body).toPromise();
        } else {
          return this.api.addClient(body).toPromise();
        }
      })
      .then(() => {
        this.isSubmitting = false;

        if (this.isEditMode) {
          this.showSuccess("✅ تم تعديل بيانات العميل بنجاح");
        } else {
          this.showSuccess("✅ تم تسجيل العميل بنجاح");
        }

        this.clientForm.reset();
        this.selectedFiles = [];
        this.closeForm.emit();
        this.refreshClients.emit();
      })
      .catch((err) => {
        console.error("❌ خطأ أثناء الحفظ", err);
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
