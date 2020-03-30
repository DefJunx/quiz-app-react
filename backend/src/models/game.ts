export default interface Game {
  host: string;
  room: string;
  active: boolean;
  currentQuestion: any;
  answerTimeout: NodeJS.Timeout | null;
  playersThatCanStillAnswer: number;
}
