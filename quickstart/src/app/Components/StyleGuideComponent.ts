import {Component, ComponentFactoryResolver, Input, ViewChild, ViewContainerRef, OnInit} from '@angular/core'
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormsModule }   from '@angular/forms';
import {FrontEndClass} from "./ComponentsCore/MainClasses/FrontEndClass";
import {ComponentsRegister} from "./ComponentsRegister";
import {PanelComponent} from "./FrontComponents/PanelComponent";
import {RowComponent} from "./FrontComponents/RowComponent";
import {HeadingComponent} from "./FrontComponents/HeadingComponent";
import {IconComponent} from "./FrontComponents/IconComponent";
import {ComponentCreator} from "./ComponentsCore/ComponentCreator";
import { KeysPipe } from '../keys.pipe';

@Component
({
  selector: 'styleguide',
  templateUrl: '/pages/Components/style_guide.html',
})
export class StyleGuideComponent implements OnInit {

  static components = {
    'Panel' : PanelComponent,
    'Row' : RowComponent,
    'Icon' : IconComponent,
    'Heading' : HeadingComponent,
  };

  obj:any;

  @ViewChild('target', { read: ViewContainerRef }) target: ViewContainerRef;

  constructor(private route: ActivatedRoute, private cfr: ComponentFactoryResolver) {
  }

  ngOnInit(): void {

    let compFactory =
      this.cfr.resolveComponentFactory(StyleGuideComponent.components[this.route.snapshot.params['category']]);
    this.main = this.target.createComponent(compFactory).instance;
    const that = <RenderFromJSON> this.main;

    this.front = <FrontEndClass> this.main;
    this.obj = this.front;

    this.updateJSON();

    for (let param of this.obj.params) {
      if (this.isObject(this.obj[param.name])) {
        this.jsonVal[param.name] = {};
      }
    }
    // const reg = new RegExp('"info":"(\w|\s)*",');
  }

  private main: any;
  private jsonVal = {};
  private valMap = new Map();
  private front: any;

  isObject(sth: any): boolean {
    return (sth instanceof Object);
  }

  listaParam(obj: any) {
    if (obj) {
      var toReturn = Object.getOwnPropertyNames(obj);
      var index = toReturn.indexOf("parent");
      if (index > -1) {
        toReturn.splice(index, 1);
      }
      return toReturn;
    }
    else
      return [];
  }

  updateJSON() {
    for (let param of this.obj.params) {
      if (this.obj[param.name]) {
        this.valMap.set(param.name, this.jsonVal[param.name]);
        this.jsonVal[param.name] = this.obj[param.name]
      }
      if (typeof param.default != undefined) {
        this.valMap.set(param.name, param.default);
        this.jsonVal[param.name] = param.default;
      }
    }
  }

  private getMapName(name: string) {
    return typeof this.jsonVal[name] != undefined ? this.jsonVal[name] : "undefined"; 
  }

  makeString(obj: any) {
    return JSON.stringify(obj)
  }

  attr_change () {
    var className: string = this.obj.constructor.name;

    for (let param of this.obj.params) {

      if (this.isObject(this.jsonVal[param.name])) {
        console.log("wyśle mu to")
        var toSend = this.jsonVal[param.name];
        for (let nested of Object.getOwnPropertyNames(toSend)) {
          console.log(nested)
          toSend[nested] = Number(toSend[nested]);
        }

        console.log("ostatecznie")
        console.log(toSend)
        ComponentCreator.setObjectProperty(
                          className, param.name, this.obj, toSend);
      }
      else {
        var realVal: any;
        switch (param.type) {
          case "boolean":
            realVal = (this.jsonVal[param.name] == 'true') || (this.jsonVal[param.name]);
            break;

          case "number":
            realVal = Number(this.jsonVal[param.name]);
            break;
          
          default:
            realVal = this.jsonVal[param.name];
            break;
        }

        ComponentCreator.setObjectProperty(className, param.name, this.obj, realVal);
      }
    }
  }

  printTypeBased(item: any, value: any) {
    if (item == "boolean")
      return value.toString();
    if (item == "number")
      return value.toString();
    if (item == "string")
      return "\"" + value + "\"";

    return JSON.stringify(value)
  }


}

