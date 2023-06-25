// verification.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent {
  email: string = '';
  emailVerified: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  onVerify() {
    // Send a request to the server to verify the email
    this.http.get<any>('http://localhost:3000/verify-email', { params: { email: this.email } }).subscribe(
      (response) => {
        if (response.success) {
          this.emailVerified = true;
        } else {
          console.log('Email verification failed');
        }
      },
      (error) => {
        console.log('An error occurred during email verification');
      }
    );
  }
  
  onPasswordSubmit() {
    if (this.newPassword === this.confirmPassword) {
      // Send a request to the server to update the password
      this.http.post<any>('http://localhost:3000/update-password', { email: this.email, password: this.newPassword }).subscribe(
        (response) => {
          if (response.success) {
            console.log('Password updated successfully');
            this.router.navigate(['/login']); // Redirect to login page
          } else {
            console.log('Password update failed');
          }
        },
        (error) => {
          console.log('An error occurred during password update');
        }
      );
    } else {
      console.log('New password and confirm password do not match');
    }
  }
}
