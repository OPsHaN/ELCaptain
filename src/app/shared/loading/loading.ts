import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loadingservice';


@Component({
  selector: "app-loading",
  imports: [CommonModule],
  templateUrl: "./loading.html",
  styleUrl: "./loading.scss",
})
export class Loading {

  constructor(public loadingService: LoadingService) {}


}
