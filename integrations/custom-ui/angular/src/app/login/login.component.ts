import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private fb: FormBuilder, private router: Router) { }
  mainForm!: FormGroup

  ngOnInit(): void {
    this.mainForm = this.fb.group({
      Email: ['', Validators.required],
      Password: ['', Validators.required]
    })
  }

  onSubmit(){    
    if(this.mainForm.valid){
      localStorage.setItem("userDetails",JSON.stringify({username:this.mainForm.value.Email}))
      this.router.navigate(['/home'])
    }
  }

}
