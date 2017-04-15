import { Component, Input, } from '@angular/core'
import { FormClass } from './FormClass'
import { FormsModule }   from '@angular/forms';

@Component({
  selector: 'glyph',
  template: `<span class="glyphicon" [ngClass]="glyphicon-{{ type }}"></span>`
})
export class GlyphiconComponent extends FormClass {

  type: string;
  backgroundColor: string;

  constructor ()
  {
    super();
    this.type = "";
  }
 
  renderJSON(parsed: any): void {

    if("id" in parsed)
      this.id = parsed["id"];
    else
      throw new Error('Error with JSON form.');

    if ("type" in parsed)
      this.type = parsed["type"];

    if("backgroundColor" in parsed)
      this.backgroundColor = parsed["backgroundColor"];
  }
}
