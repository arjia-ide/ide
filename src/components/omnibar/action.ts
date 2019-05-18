import OmnibarContext from "./omnibarContext";

export interface IAction {
  name: string;
  run: (context: OmnibarContext) => void;
  label?: string;
}
