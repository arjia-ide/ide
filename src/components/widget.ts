

export default class Widget {
  private title: string;
  private widget: any;

  constructor(title: string, widget) {
    this.title = title;
    this.widget = widget;
  }

  getTitle() {
    return this.title;
  }

  buildComponent() {
    return this.widget;
  }

}
