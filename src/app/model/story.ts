export class Story {
  public score: number;
  public storyName: string;
  public id: string;
  public consensus: boolean;


  constructor(id: string) {
    this.score = 0;
    this.storyName = '';
    this.id = id;
    this.consensus = false;
  }
}
