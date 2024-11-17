import { Component, Output, EventEmitter} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputFieldComponent } from '../../../shared/header/input-field/input-field.component';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    InputFieldComponent,
    FormsModule,
    ReactiveFormsModule,
    MatIcon,
    RouterModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  constructor(public auth:AuthenticationService){
  }

    myFormResetPassword = new FormGroup({
      setNewPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)])
    });

    @Output() eventInResetPassword= new EventEmitter();

    sendClickToParentPageCounter(index: number = 0) {
      this.eventInResetPassword.emit(index);
    }
    
    setNewPassword(){
      if(this.myFormResetPassword.value){
        this.auth.saveNewPassword(this.myFormResetPassword.value.confirmPassword as string).then(() => {
        });
      }
    }

}