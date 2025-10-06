import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-button',
  imports: [CommonModule, NzButtonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  standalone: true,
})
export class Button {
  @Input() type: 'primary' | 'cancel' | 'secondary' | 'danger' | 'ghost' | 'link' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Input() isActive: boolean = false;
  @Input() customClass: string = '';
  @Input() isLoading: boolean = false;
  @Input() fullWidth = false;
}
