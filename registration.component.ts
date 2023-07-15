import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DBOperation } from '../services/db-operation';
import { mustMatch } from '../services/must-match.validators';
import { User } from '../services/user.interface';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
   

  myReactiveForm!: FormGroup;
  users: User[] =[];
  submitted:boolean = false;
  buttonText: string = "submit";
  dbops!: DBOperation;
  constructor(private fb: FormBuilder, private _user:UserService) { }

  ngOnInit() {
     this.createForm();
     this.getAllUsers();
  }

  createForm(){
    this.buttonText ="submit";
    this.dbops = DBOperation.create;

    this.myReactiveForm = this.fb.group({
      id:[0],
      title:['',Validators.required],
      firstName:['',Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(10)])],
      lastName:['',Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(10)])],
      dob:['',Validators.compose([Validators.required,Validators.pattern(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/)])],
      email:['',Validators.compose([Validators.required,Validators.email])],
      password:['',Validators.compose([Validators.required,Validators.minLength(6)])],
      confirmPassword:['',Validators.required],
      acceptTerms:[false,Validators.requiredTrue],
    },{
      validators:mustMatch('password','confirmPassword')
    })
  }

  get f(){
    return this.myReactiveForm.controls;
  }

  onSubmit(){
       this.submitted = true;

    if (this.myReactiveForm.invalid) {
      return;
    }

    switch (this.dbops) {
      case DBOperation.create:
        this._user.addUser(this.myReactiveForm.value).subscribe(res =>{
          this.getAllUsers();
          this.onCancel()
        })
        break;

        case DBOperation.update:
        this._user.updateUser(this.myReactiveForm.value).subscribe(res =>{
          this.getAllUsers();
          this.onCancel()
        })
        break;
    
    } 
  }

  
getAllUsers(){
  this._user.getUsers().subscribe((res :User[]) => {
    this.users = res;
  })
}

onCancel(){
  this.myReactiveForm.reset();
  this.buttonText = "submit";
  this.dbops = DBOperation.create;
  this.submitted = false;
}

Edit(userId:number){
this.buttonText = "Update";
this.dbops = DBOperation.update;

let user:any = this.users.find((u:User) =>u.id === userId)

this.myReactiveForm.patchValue(user)
}

delete(userId:number){

  Swal.fire({
    title: 'Are you sure?',
    text: "You will not be able to record this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel!',
   
  }).then((result) => {
    if (result.value) {
      this._user.deleteUser(userId).subscribe(res =>{
        this.getAllUsers();
      })

      Swal.fire(
        'Deleted!',
        'Your file has been deleted.',
        'success'
      )
    } else if (result.dismiss === Swal.DismissReason.cancel) {

      Swal.fire(
        'Cancelled',
        'Your imaginary file is safe :)',
        'error'
      )
    }
  })
 
}
}
