import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-seller-sidebar',
  imports: [ RouterLink ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true
})
export class Sidebar {
  
}
