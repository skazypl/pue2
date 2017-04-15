import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule,
    JsonpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { MyHttp } from './service/http.service';

import { AppComponent }  from './app.component';

import {TextBox} from './Components/FormComponents/TextBox/TextBox'
import {TestComponent} from './TestComponent'

// Home page components
import { HomeComponent }  from './home_components/home.component';
import { Notify } from './home_components/notifications.component';
import { MessagesComponent } from './home_components/messages.component';

// Micro services components
import { ServicesComponent } from './services_components/micro-services.component';

// Navbars components
import { NavbarComponent }  from './navbar_components/navbar.component';

// Navtools components
import { NavtoolsComponent }  from './navtools.component';
import { NavtoolsModule }       from './navtools.module';

import { PageNotFoundComponent } from './page-not-found.component';

import { DashboardComponent}  from './dashboard_components/dashboard.component';

// Email windows components
import { EmailComponent }       from './email_components/email.component';

import { AtelierComponent }  from './atelier.component';

import { RenderComponent } from './render.component';

import { AppRoutingModule }     from './app-routing.module';



// Meeting components
import { KolejkaComponent } from './meeting_components/kolejka-component';
import { UmowComponent } from './meeting_components/reservation_components/umow-component';
import { MeetingComponent } from './meeting_components/meeting-component';
import { UrzedowanieComponent } from './meeting_components/reservation_components/urzedowanie-component';


// Visit opinion subpage
import { RatingComponent } from './meeting_components/opinion_components/rating-component'
import { OpinionComponent } from './meeting_components/opinion_components/opinion-component'


// Medical leave components
import { ZwolnienieComponent } from './leave_components/zwolnienie-component';
import { PracodawcaComponent } from './leave_components/pracodawca-component';
import { LekarzComponent } from './leave_components/lekarz-component';
import { PacjentComponent } from './leave_components/pacjent-components/pacjent-component';
import { ListaComponent } from './leave_components/pacjent-components/list-leaves-component';
import { BreadCrumbComponent } from './dashboard_components/breadcrumb.component';
import { InboxComponent } from './home_components/inbox.component';
import { RowComponent } from "./Components/FrontComponents/RowComponent";
import {ComponentCreator} from "./Components/ComponentsCore/ComponentCreator";
import {PanelComponent} from "./Components/FrontComponents/PanelComponent";
import { PeselComponent } from './Components/FormComponents/TextBox/PeselComponent'
import { PasswordComponent } from './Components/FormComponents/TextBox/PasswordComponent'
import { LabelComponent } from './Components/FrontComponents/LabelComponent'
import {SubmitComponent} from "./Components/FormComponents/SubmitComponent";
import {FormComponent} from "./Components/FormComponents/FormComponent";
import { ProgressBarComponent } from "./Components/FormComponents/ProgressBarComponent";
import {HeadingComponent} from "./Components/FrontComponents/HeadingComponent";
import {PanelGroupComponent} from "./Components/FrontComponents/PanelGroupComponent";
import {ContentComponent} from "./Components/FrontComponents/ContentComponent";
import { LoginComponent } from './login.component';
import { LoginService } from './login.service';
import { GlyphiconComponent } from './Components/FormComponents/GlyphiconComponent'

@NgModule({
    imports:      [ BrowserModule,
                                    AppRoutingModule,
                                    HttpModule,
                                    JsonpModule,
                                    FormsModule,
                                    MyHttp,
                                    LoginService,
                                ],
    declarations: [ AppComponent,
                    HomeComponent,
                    PageNotFoundComponent,
                    AtelierComponent,
                    DashboardComponent,
                    NavbarComponent,
                    MessagesComponent,
                    RenderComponent,
                    Notify,
                    ServicesComponent,
                    MeetingComponent,
                    KolejkaComponent,
                    UmowComponent,
                    UrzedowanieComponent,
                    OpinionComponent,
                    RatingComponent,
                    ZwolnienieComponent,
                    PracodawcaComponent,
                    LekarzComponent,
                    PacjentComponent,
                    EmailComponent,
                    ListaComponent,
                    BreadCrumbComponent,
                    InboxComponent,
                    TextBox,
                    TestComponent,
                    RowComponent,
                    PanelComponent,
                    PeselComponent,
                    ProgressBarComponent,
                    LoginComponent,
                    SubmitComponent,
                    FormComponent,
                    PasswordComponent,
                    LabelComponent,
                    HeadingComponent,
                    PanelGroupComponent,
                    ContentComponent,
                    GlyphiconComponent,
                ],
    bootstrap:    [ AppComponent ],
    entryComponents: [TestComponent,
                        TextBox,
                        RowComponent,
                        PanelComponent,
                        PeselComponent,
                        PasswordComponent,
                        LabelComponent,
                        SubmitComponent,
                        FormComponent,
                        HeadingComponent,
                        PanelGroupComponent,
                        ContentComponent,
                        ProgressBarComponent,
                        LoginComponent,
                        GlyphiconComponent,
                        ]

})
export class AppModule { }
