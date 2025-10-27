import { Component, Input } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { Apiservice } from "../../services/apiservice";
import { CheckboxModule } from "primeng/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-register-deal",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
    CheckboxModule,
  ],
  templateUrl: "./register-deal.html",
  styleUrl: "./register-deal.scss",
})
export class RegisterDeal {
  @Input() isEditMode = false;
  @Input() deal: any;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private api: Apiservice
  ) {}

  ngOnChanges() {
    if (this.isEditMode && this.deal) {
      // this.patchDealData(this.deal);
    }
  }
}
