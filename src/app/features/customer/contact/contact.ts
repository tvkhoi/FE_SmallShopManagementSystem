import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
@Component({
  selector: 'app-contact',
   standalone: true,             // 👈 standalone component
  imports: [FormsModule],       // 👈 phải khai báo FormsModule ở đây
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss']
})
export class ContactComponent {
  contact = {
    name: '',
    email: '',
    message: ''
  };

  onSubmit() {
    // Tạm thời log ra console, sau có API thì gọi service gửi mail
    console.log('Form gửi:', this.contact);
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm.');
    // reset form
    this.contact = { name: '', email: '', message: '' };
  }
}
