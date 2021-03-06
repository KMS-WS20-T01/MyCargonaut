export type State = "Waiting" | "InProgress" | "Delivered";

export interface Status {
  offer: string;
  state: State;
  text: string;
  createDate: Date;
}
