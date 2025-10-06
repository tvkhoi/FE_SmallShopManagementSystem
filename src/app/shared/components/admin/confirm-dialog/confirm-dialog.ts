import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../button/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, Button, NzModalModule, NzIconModule],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.scss'],
})
export class ConfirmDialog {
  @Input() title: string = 'Xác nhận hành động';
  @Input() message: string = 'Bạn có chắc chắn muốn thực hiện hành động này?';
  @Input() confirmText: string = 'Xác nhận';
  @Input() cancelText: string = 'Hủy';
  @Input() confirmType: 'primary' | 'danger' | 'cancel' = 'primary';
  @Input() isVisible = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancelModal = new EventEmitter<void>();
  @Output() isVisibleChange = new EventEmitter<boolean>();

  handleConfirm(): void {
    this.confirm.emit();
    this.close();
  }

  handleCancel(): void {
    this.cancelModal.emit();
    this.close();
  }

  private close(): void {
    this.isVisible = false;
    this.isVisibleChange.emit(false);
  }
}
