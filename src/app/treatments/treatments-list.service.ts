import {Treatment} from "../shared/treatment.model";

export class TreatmentsListService {

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

}
