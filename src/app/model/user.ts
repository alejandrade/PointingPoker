export class User {
  public name: string;
  public vote: number;
  public id: string;
  public spectator: boolean;


  constructor(id?: string, name?: string) {
    this.name = name || '';
    this.id = id;
    this.spectator = false;
  }
}
