import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-portfolio',
  imports: [],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss'
})
export class Portfolio implements AfterViewInit {
ngAfterViewInit() {
    // const iso = new Isotope('#portfolioGrid', {
    //   itemSelector: '.portfolio-item',
    //   layoutMode: 'masonry'
    // });
  }
}
