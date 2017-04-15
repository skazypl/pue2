import { HttpModule, Headers, Http }    from '@angular/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class MyHttp {

	constructor(private http: Http, private router: Router) {}

	get(url: string) {
		return this.http.get(url)
			.map(res => {
				if (res.status == 403) {
					this.router.navigateByUrl("/login");
					console.log(url + ": 403 forbidden");
				}
			});
	}

	post(url: string, body: any) {
		return this.http.post(url, body)
			.map(res => {
				if (res.status == 403) {
					this.router.navigateByUrl("/login");
					console.log(url + ": 403 forbidden");
				}
			});
	}
}
