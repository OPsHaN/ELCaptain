import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { finalize } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogModule } from "primeng/dialog";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { Apiservice } from "../../services/apiservice";
import { ClientRegister } from "../client-register/client-register";

@Component({
  selector: "app-clients",
  standalone: true,
  imports: [CommonModule, DialogModule, ConfirmDialogModule, ClientRegister],
  templateUrl: "./clients.html",
  styleUrls: ["./clients.scss"],
  providers: [ConfirmationService],
})
export class Clients implements OnInit {
  clients: any[] = [];
  selectedClient: any = null;
  showRegisterForm = false;
  showClientDialog = false;
  isEditMode = false;
  defaultAvatar = "assets/images/user-placeholder.png";
  selectedEmployee: any | null = null;
  countries: any[] = [];
  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getAllClients();
    this.loadCountries();
  }

  getAllClients() {
    this.api.getAllClients().subscribe({
      next: (res: any) => (this.clients = res),
      error: (err) => console.error(err),
    });
  }

  toggleRegisterForm() {
    this.showRegisterForm = !this.showRegisterForm;
    if (!this.showRegisterForm) {
      this.selectedClient = null;
      this.isEditMode = false;
    }
  }

  editClient(client: any) {
    this.selectedClient = client;
    this.isEditMode = true;
    this.showRegisterForm = true;
  }

  deleteClient(client: any) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد أنك تريد حذف العميل <strong>${client.ClientName}</strong>؟`,
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "لا",
      accept: () => {
        this.api.deleteCelient(client.Id).subscribe({
          next: () => {
            this.clients = this.clients.filter((c) => c.Id !== client.Id);
            this.showSuccess("✅ تم حذف العميل بنجاح");
          },
          error: (err) => {
            console.error("❌ Error deleting client:", err);
            this.showError("حدث خطأ أثناء حذف العميل");
          },
        });
      },
      reject: () => {
        // لا تفعل شيء
      },
    });
  }

  viewClient(client: any) {
    this.selectedClient = client;
    this.showClientDialog = true;
  }

  trackById(index: number, item: any) {
    return item.Id;
  }

  getPaymentMethod(method: number): string {
    switch (method) {
      case 1:
        return "كاش";
      case 2:
        return "تقسيط";
      default:
        return "غير محدد";
    }
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

  getCountryName(countryId: number): string {
    const country = this.countries.find((c) => c.id === countryId);
    console.log(country);
    return country ? country.name : "غير محددة";
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
