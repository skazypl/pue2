import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AtelierComponent }   from './atelier.component';
import { LoginComponent } from './login.component';

import { RenderComponent } from './render.component';
import { TestComponent } from './TestComponent'

import { HomeComponent }  from './home_components/home.component';
import { ServicesComponent } from './services_components/micro-services.component';
import { MessagesComponent } from './home_components/messages.component';
// Meeting components
import { KolejkaComponent } from './meeting_components/kolejka-component';
import { UmowComponent } from './meeting_components/reservation_components/umow-component';
import { MeetingComponent } from './meeting_components/meeting-component';
import { UrzedowanieComponent } from './meeting_components/reservation_components/urzedowanie-component';
import { OpinionComponent } from './meeting_components/opinion_components/opinion-component'

// Medical Leave components
import { ZwolnienieComponent } from './leave_components/zwolnienie-component';
import { PracodawcaComponent } from './leave_components/pracodawca-component';
import { LekarzComponent } from './leave_components/lekarz-component';
import { PacjentComponent } from './leave_components/pacjent-components/pacjent-component';
import { PageNotFoundComponent } from './page-not-found.component';
import { InboxComponent } from './home_components/inbox.component';

const routes: Routes = [
	{ path: '', redirectTo: '/main', pathMatch: 'full' },
	{ path: 'main',  component: HomeComponent },
	{ path: 'login',  component: LoginComponent },
	{ path: 'test',  component: AtelierComponent },
	{ path: 'services',  component: ServicesComponent },
	{ path: 'messages',  component: MessagesComponent, children: [
		{ path: '', redirectTo: 'inbox', pathMatch: 'full' },
		{ path: 'inbox', component: InboxComponent },

	]},
	{ path: 'meeting',  component: MeetingComponent },
	{ path: 'umow',  component: UmowComponent },
	{ path: 'kolejka',  component: KolejkaComponent },
	{ path: 'render',  component: RenderComponent },
	{ path: 'opinion',  component: OpinionComponent },
	{ path: 'zwolnienie',  component: ZwolnienieComponent },
	{ path: 'pracodawca',  component:PracodawcaComponent },
	{ path: 'lekarz',  component: LekarzComponent },
	{ path: 'pacjent',  component: PacjentComponent },
	{ path: '404', component: PageNotFoundComponent },
	{ path: 'komponenty', component: TestComponent},
	{ path: '**', redirectTo: '/404'} // ostatni komponent - dodajemy nowe sciezki przed nim!
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})

export class AppRoutingModule {}
