import {
  Component, Input, OnInit, ViewChildren, ViewContainerRef, ViewChild, ReflectiveInjector, ComponentFactoryResolver,
  QueryList, ElementRef, TemplateRef
} from '@angular/core'
import { FormClass } from '../FormComponents/FormClass'
import { FormsModule }   from '@angular/forms';
import {TextBox} from "../FormComponents/TextBox/TextBox";
import {Type} from "typescript";
import {ViewContainer} from "@angular/core/src/linker/view_container";
import {ComponentCreator} from "../ComponentsCore/ComponentCreator";
import {Container} from "../ComponentsCore/Interfaces/ContainerInterface";
import {Register} from "../ComponentsRegister";
import { Attr, SetterAlg } from "../ComponentsRegister";
import {FrontEndClass} from "../ComponentsCore/MainClasses/FrontEndClass";

@Component
({
  selector: 'row',
  template: '<div class="row"><template #target></template></div>'
 ,
})
@Register
(
  {
    name : "Row",
    description : "Grupuje zawartość w rząd",
    tag : "kontener"
  }
)
export class RowComponent extends FrontEndClass implements RenderFromJSON, OnInit, Container{

  @Attr({info:"id elementu", default : "", name:""})
  @SetterAlg()
  id:number;
  parsed:any;

  visible:boolean;
  @ViewChild('target', { read: ViewContainerRef }) target: ViewContainerRef;

  constructor(private cfr: ComponentFactoryResolver) {
    super();
  }

  ngOnInit(): void {}

  renderJSON(specification: any): void {
    //this.target.clear();
    if("id" in specification)
      this.id = specification["id"];

    if("children" in specification)
    {// Stworz wszystkie komponenty i dodaj je w sobie
      this.renderChildren(specification["children"]);
    }
  }
  renderChildren(children: any): void {
    for(var child = 0; child < children.length; child++)
    {
      var added = ComponentCreator.insertComponent(this.cfr, this.target, children[child]["type"]);
      added.renderJSON(children[child]);
    }
  }
}
