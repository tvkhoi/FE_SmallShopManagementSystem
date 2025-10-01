import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NzIconModule, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
   searchText = '';
    onSearch() {
    console.log(this.searchText);
}
}
