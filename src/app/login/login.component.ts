import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    const loginData = {
      email: this.email,
      password: this.password
    };
  
    this.http.post<any>('http://localhost:3000/login', loginData)
      .subscribe(
        (response) => {
          if (response.success) {
            this.router.navigate(['/home']); // Redirect to home page
          } else {
            this.errorMessage = 'Invalid email or password';
          }
        },
        (error) => {
          console.error('Error logging in:', error);
          this.errorMessage = 'An error occurred. Please try again later.';
        }
      );
  }
  
}
