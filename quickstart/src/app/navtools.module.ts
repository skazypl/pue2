import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule }       from '@angular/common';

import { NavtoolsComponent }  from './navtools.component';
import { NavbarComponent }  from './navbar.component';
import { DashboardComponent }  from './dashboard.component';


@NgModule({
  imports: [ BrowserModule, CommonModule ],
  declarations: [
  				  DashboardComponent,
  				  NavbarComponent,
  				  NavtoolsComponent, ],
  exports: [ 
  			 DashboardComponent,
  			 NavbarComponent,
  			 NavtoolsComponent, ],
  //bootstrap:    [ NavtoolsComponent ]
})
export class NavtoolsModule { }