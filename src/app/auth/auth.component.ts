import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, NgForm, Validators} from "@angular/forms";
import {AuthResponseData, AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  form: FormGroup;
  email : FormControl ;
  password : FormControl;
  isLoading : boolean;
  error: string;
  secret : boolean;

  constructor(private authService: AuthService, private router: Router) {}


  ngOnInit(): void {
    this.form = new FormGroup({
      'email' : new FormControl('', [Validators.required, Validators.email]),
      'password' : new FormControl('', [Validators.required]),
    });
    this.isLoading = false;
    this.secret = true;
    this.error = null;
  }

  // Function for show the password inserted
  showPassword(): void{
    this.secret = !this.secret;
  }


  onSubmit(): void{

    if (!this.form.valid) return;
    let authObs: Observable<AuthResponseData>;
    this.isLoading = true;

    authObs = this.authService.login(this.form.value.email, this.form.value.password);

    authObs.subscribe(
      resData => {
        console.log(resData);
        this.isLoading = false;
        this.router.navigate(['/prenota-appuntamento']);
      },
      errorMessage => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.isLoading = false;
      }
    );

    this.form.reset();
  }

}
