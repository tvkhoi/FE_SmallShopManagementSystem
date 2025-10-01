import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/customer/header/header';
import { FooterComponent } from '../../components/customer/footer/footer';


@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent,],
  templateUrl: './customer-layout.html',
  styleUrls: ['./customer-layout.scss']
})
export class CustomerLayoutComponent {}
