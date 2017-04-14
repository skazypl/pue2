import {Component, ComponentFactoryResolver, Injectable, Input, ViewChild, ViewContainerRef,} from '@angular/core'
import { FormClass } from '../FormComponents/FormClass'
import { FormsModule }   from '@angular/forms';
import {Container} from "../ComponentsCore/Interfaces/ContainerInterface";
import {ComponentCreator} from "../ComponentsCore/ComponentCreator";
import {FrontEndClass} from "../ComponentsCore/MainClasses/FrontEndClass";
import {Http} from "@angular/http";
import {Observable} from "rxjs";
import {MenuService} from "../../menu-service";
import {TimerObservable} from "rxjs/observable/TimerObservable";

@Injectable()
@Component
({
  selector: 'content',
  template: '<div style=" display:inline"#target>{{text}}</div>'
})
export class ContentComponent extends FrontEndClass implements RenderFromJSON{

  text:string;
  people: string = "";

  @ViewChild('target', { read: ViewContainerRef }) target: ViewContainerRef;

  constructor(private cfr: ComponentFactoryResolver, private peopleServicee : MenuService, private http: Http) {
    super();
    this.text = "Xx";
    let timer = TimerObservable.create(0, 5000);
    timer.subscribe(t => this.start());
    //this.start();
  }

  renderJSON(specification: any): void {

  }

  start(){
   this.http.get("/api/view/abc").map(res => res.text())
              .subscribe(p => this.text = p)
  }


}
