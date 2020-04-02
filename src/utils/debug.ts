export default class Debug {
  static IS_DEV = process.env.NODE_ENV === "development";

  static Log(...args: any) {
    if (Debug.IS_DEV) {
      console.log(...args);
    }
  }
}
