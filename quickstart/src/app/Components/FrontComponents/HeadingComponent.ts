import {Component, Input, Provider, Injectable } from '@angular/core'
import { FormClass } from '../FormComponents/FormClass'
import { FormsModule }   from '@angular/forms';
import {FrontEndClass} from "../ComponentsCore/MainClasses/FrontEndClass";
import {ProviderTypeEnum} from "../ComponentsCore/ProviderTypeEnum";
import {ComponentsRegister, Register, Attr} from "../ComponentsRegister";
import {Docs} from "../ComponentsCore/Interfaces/DescribeInterface";
import { SetterAlg } from "../ComponentsRegister";
import {SizeProperties} from '../ComponentsCore/MainClasses/SizeProperties';

@Component({
  selector: 'heading',
  template: `<h1 class="page-header">{{ text }}{{name}}</h1>`,
  providers:[ComponentsRegister]
})
@Register
(
  { name : "Heading",
    description : "Okno z górną belką i miejscem na zawartość",
    tag : "kontener"
  }
)
export class HeadingComponent extends FrontEndClass implements RenderFromJSON
{
  //textType:ProviderTypeEnum;

  @Attr({info:"Tekst na górnej belce", default : "", name:""})
  @SetterAlg()
  text: string;
  @Attr({info:"Nazwa?", default : "test", name:""})
  @SetterAlg()
  name: string;
  @SetterAlg()
  backgroundColor: string;

  @Attr({info:"id elementu", default : "", name:""})
  @SetterAlg()
  id:number;
  parsed:any;

  @SetterAlg()
  visible:boolean;

  @Attr({info:"Rozmiar elementu", default : ({}), name:""})
  @SetterAlg({field: "size", func: (ci: HeadingComponent, v: any) => {ci.setGridClass({"size": v})}})
  public size:SizeProperties;

  @Attr({info:"Kolor tekstu", default : "black", name:""})
  @SetterAlg()
  public textColor:string;

  public grid_class:string;
  @Attr({info:"Rodzaj kursora", default : "pointer", name:""})
  @SetterAlg()
  cursor:string;

  constructor (reg : ComponentsRegister )
  {
    super();
    this.text = "";
  }

  renderJSON(parsed: any): void {
    console.log( );
    if ("text" in parsed)
      this.text = parsed["text"];
    if("backgroundColor" in parsed)
      this.backgroundColor = parsed["backgroundColor"];
  }
}
