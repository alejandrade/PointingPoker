export class Story {
  public score: number;
  public storyName: string;
  public id: string;


  constructor(id: string) {
    this.score = 0;
    this.storyName = '';
    this.id = id;
  }
}
