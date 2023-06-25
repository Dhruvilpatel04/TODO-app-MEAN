import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name: string | undefined;
  email: string | undefined;
  password: string | undefined;
  confirmPassword: string | undefined;
  errorMessage: string | undefined;

  constructor(private http: HttpClient, private router: Router) {}

  onSignup() {
    console.log('onSignup() called'); // Add this line
  const user = {
    name: this.name,
    email: this.email,
    password: this.password
  };

  this.http.post<any>('http://localhost:3000/signup', user).subscribe(
    (response) => {
      if (response.success) {
        this.router.navigate(['/login']); // Redirect to home page
      } 
    },
    (error: HttpErrorResponse) => {
      if (error.status === 409) {
        this.errorMessage = 'User already exists.';
      } else {
        this.errorMessage = 'An error occurred. Please try again later.';
      }
    }
  );
}
}