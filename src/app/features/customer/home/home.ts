import { Component } from '@angular/core';

// import các component con
import { CarouselComponent } from '../carousel/carousel';
import { ProductsComponent } from '../products/products';
import { AboutComponent } from '../about/about';
import { ContactComponent } from '../contact/contact';  

@Component({
  selector: 'app-home',
  standalone: true,
  // import các component con ở đây
  imports: [
    CarouselComponent,
    ProductsComponent,
    AboutComponent,
    ContactComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
   slides = [
    { image: 'assets/Minimarket4.jpg'},
    { image: 'assets/Minimarket2.jpg' },
    { image: 'assets/Minimarket3.jpg'},
  ];
 }
