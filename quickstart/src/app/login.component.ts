import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from './login.service';

@Component({
	selector: 'login',
	templateUrl: 'pages/login.html',
})

export class LoginComponent implements OnInit {
	@Input() menu: any = null;
	first: boolean = false;

	constructor (private loginService: LoginService) {}

	ngOnInit() {
		this.loginService.checkIfAuth();
	}

}
