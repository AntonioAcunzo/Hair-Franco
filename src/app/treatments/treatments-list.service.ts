import { Subject } from 'rxjs/Subject';
import {Treatment} from "../shared/treatment.model";

export class TreatmentsListService {
  // ingredientsChanged = new Subject<Ingredient[]>();
  // startedEditing = new Subject<number>();
  private treatments: Treatment[] = [
    new Treatment('Taglio', 10),
    new Treatment('Shampoo', 5),
    new Treatment('Barba', 7),
    new Treatment('Acconciatura', 10),
    new Treatment('Colore', 30),
    new Treatment('Piega', 20),
    new Treatment('Taglio + Barba', 15),
    new Treatment('Taglio + Colore + Piega', 50),
  ];

  getTreatmet() {
    return this.treatments.slice();
  }

  // getIngredient(index: number) {
  //   return this.ingredients[index];
  // }
  //
  // addIngredient(ingredient: Ingredient) {
  //   this.ingredients.push(ingredient);
  //   this.ingredientsChanged.next(this.ingredients.slice());
  // }
  //
  // addIngredients(ingredients: Ingredient[]) {
  //   // for (let ingredient of ingredients) {
  //   //   this.addIngredient(ingredient);
  //   // }
  //   this.ingredients.push(...ingredients);
  //   this.ingredientsChanged.next(this.ingredients.slice());
  // }
  //
  // updateIngredient(index: number, newIngredient: Ingredient) {
  //   this.ingredients[index] = newIngredient;
  //   this.ingredientsChanged.next(this.ingredients.slice());
  // }
  //
  // deleteIngredient(index: number) {
  //   this.ingredients.splice(index, 1);
  //   this.ingredientsChanged.next(this.ingredients.slice());
  // }

}
