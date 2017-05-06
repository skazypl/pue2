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

    this.jsonVal = {};
    this.valMap = new Map();

    let compFactory =
      this.cfr.resolveComponentFactory(StyleGuideComponent.components[this.route.snapshot.params['category']]);
    this.main = this.target.createComponent(compFactory).instance;
    const that = <RenderFromJSON> this.main;
    //that.renderJSON({'title' : 'ok'});

    //ComponentCreator.setObjectProperty(that.constructor.name, 'title', that, 'okey');

    this.front = <FrontEndClass> this.main;
    this.obj = this.front;

    console.log("paramsy")
    console.log(this.obj.params)

    for (let parametr of this.obj.params) {
      if (this.isObject(this.obj[parametr.name])) {
        this.jsonVal[parametr.name] = {};
      }
    }

    console.log("kolejny step")
    // const reg = new RegExp('"info":"(\w|\s)*",');
    this.updateJSON();
    console.log("koniec onINit")
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
    for (let parametr of this.obj.params) {
      if (this.obj[parametr.name]) {
        this.valMap.set(parametr.name, this.jsonVal[parametr.name]);
        this.jsonVal[parametr.name] = this.obj[parametr.name]
      }
      if (typeof parametr.default != undefined) {
        this.valMap.set(parametr.name, parametr.default);
        this.jsonVal[parametr.name] = parametr.default;
      }
    }
  }

  private getMapName(name: string) {
    return typeof this.jsonVal[name] != undefined ? this.jsonVal[name] : "undefined"; 
  }

  makeString(obj: any) {
    console.log("robie string z")
    console.log(obj)
    return JSON.stringify(obj)
  }

  attr_change (zewn: any, wewn: any) {
    console.log("attr change")
    console.log(zewn)
    console.log(zewn.default)
    var className: string = this.obj.constructor.name;

    for (let parametr of this.obj.params) {

      if (this.isObject(this.jsonVal[parametr.name])) {
        ComponentCreator.setObjectProperty(
                          className, parametr.name, this.obj, this.jsonVal[parametr.name]);
      }
      else {
        var realVal: any;
        switch (parametr.type) {
          case "boolean":
            realVal = (this.jsonVal[parametr.name] == 'true') || (this.jsonVal[parametr.name]);
            break;

          case "number":
            realVal = Number(this.jsonVal[parametr.name]);
            break;
          
          default:
            realVal = this.jsonVal[parametr.name];
            break;
        }

        ComponentCreator.setObjectProperty(className, parametr.name, this.obj, realVal);
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

