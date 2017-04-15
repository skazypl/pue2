import { Injectable } from '@angular/core';
import { MyHttp } from './service/http.service';

@Injectable()
export class LoginService {

	constructor(private http: MyHttp) {}

	checkIfAuth() {
		//this.http.get("/api/auth/info");
		// ten url na razie nie działa ale będzie
	}
}
