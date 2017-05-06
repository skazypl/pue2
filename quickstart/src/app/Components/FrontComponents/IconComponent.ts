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
import { Attr, Register} from "../ComponentsRegister";
import { SetterAlg } from "../ComponentsRegister";

@Injectable()
@Component
({
  selector: 'icon',
  template: '<span [style.font-size] = "font_size" [ngClass]="class"></span>'
})
@Register
(
  {name : "Icon",
    description : "Ikona ze zbioru glyphicon",
    tag : "ogolne"
  }
)
export class IconComponent extends FrontEndClass implements RenderFromJSON {

  @Attr({info:"Która ikona", default : "glyphicon glyphicon-", name:""})
  @SetterAlg({field: "class", func: (ci: any, v: any) => {ci.class = "glyphicon glyphicon-" + v}})
  class:string;

  @Attr({info:"Wielkość ikony", default : "small", name:""})
  @SetterAlg()
  font_size:string;
  constructor(private cfr: ComponentFactoryResolver, private peopleServicee : MenuService, private http: Http) {
    super();
    this.class = "glyphicon glyphicon-"
    this.font_size = "1em";
  }

  renderJSON(specification: any): void {
    if("class" in specification)
      this.class+= specification["class"];
    if("size" in specification)
    {
      switch(specification["size"])
      {
        case "small":
          this.font_size = "1em";
          break;
        case "medium":
          this.font_size = "2em";
          break;
        case "big":
          this.font_size = "3em";
          break;
      }
    }
  }



}
