import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzButtonModule,
    NzTableModule,
    NzPaginationModule
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent {
  searchQuery: string = '';
  users = [
    { username: 'Elian99', email: 'Elian99@example.com' },
    { username: 'Elfrieda.Schmeler4', email: 'Elfrieda.Schmeler4@example.net' },
    { username: 'Colten15', email: 'Colten15@example.net' },
    { username: 'Modesta.Koepp37', email: 'Modesta.Koepp37@example.com' },
    { username: 'August.Weimann', email: 'August.Weimann@example.org' },
    { username: 'Mario.Bogan', email: 'Mario.Bogan@example.net' },
    { username: 'Braden94', email: 'Braden94@example.org' },
    { username: 'Marion.Durgan', email: 'Marion.Durgan@example.net' },
    { username: 'Christopher48', email: 'Christopher48@example.org' },
    { username: 'Verna.Mohr', email: 'Verna.Mohr@example.net' }
  ];

  totalItems = this.users.length;
  pageSize = 5;
  currentPage = 1;

  filterUsers() {
    console.log('Filtering users with:', this.searchQuery);
    // Add filtering logic here if needed
  }

  onPageChange(page: number) {
    this.currentPage = page;
    console.log('Page changed to:', page);
  }

  importUsers() {
    console.log('Importing users');
  }

  exportUsers() {
    console.log('Exporting users');
  }

  newUser() {
    console.log('Adding new user');
  }
}