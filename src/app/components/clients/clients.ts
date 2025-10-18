import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { finalize } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogModule } from "primeng/dialog";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { Apiservice } from "../../services/apiservice";
import { ClientRegister } from "../client-register/client-register";

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, DialogModule, ConfirmDialogModule, ClientRegister],
  templateUrl: './clients.html',
  styleUrls: ['./clients.scss'],
  providers: [ConfirmationService],

})
export class Clients implements OnInit {

  clients: any[] = [];
  selectedClient: any = null;
  showRegisterForm = false;
  showClientDialog = false;
  isEditMode = false;
  defaultAvatar = 'assets/images/user-placeholder.png';
  selectedEmployee: any | null = null;

  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.getAllClients();
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
      message: `هل تريد حذف العميل <b>${client.ClientName}</b> ؟`,
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteCelient(client.Id).subscribe({
          next: () => this.getAllClients(),
          error: (err:any) => console.error(err),
        });
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
        return 'كاش';
      case 2:
        return 'تقسيط';
      default:
        return 'غير محدد';
    }
  }
}
