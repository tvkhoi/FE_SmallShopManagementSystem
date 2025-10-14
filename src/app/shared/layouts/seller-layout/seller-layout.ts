import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Sidebar } from "../../components/seller/sidebar/sidebar";
import { Footer } from "../../components/seller/footer/footer";
import { RouterOutlet } from '@angular/router';
import { Header } from "../../components/seller/header/header";
import { TopNavbar } from "../../components/seller/top-navbar/top-navbar";

@Component({
  selector: 'app-seller-layout',
  imports: [Sidebar, Footer, RouterOutlet, Header, TopNavbar],
  templateUrl: './seller-layout.html',
  styleUrl: './seller-layout.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SellerLayout {

}
