
export class Parameter {
  public name: string;
}

export class Emit {
  public name: string;


  constructor(name: string) {
    this.name = name;
  }
}

export class Event {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }
}

export class Function {

  public name: string;
  public parameters: Parameter[] = [];
  public emits: Emit[] = [];
  public stateMutability: string;
  public visibility: string;

  constructor(name: string) {
    this.name = name;
  }
}

export class Contract {
  public name: string;
  public functions: any[] = [];
  public events: Event[] = [];

  constructor(name: string) {
    this.name = name;
  }
}

export class Source {
  public contracts: Contract[] = [];
  public imports: string[] = [];
}

export class AstParser {

  parseAst(ast: any, parent: any = null) {


    switch (ast.type) {
      case "SourceUnit":
        const source = new Source();
        for (const child of ast.children) {
          this.parseAst(child, source);
        }
        return source;

      case "ContractDefinition": {
        const contract = new Contract(ast.name);
        parent.contracts.push(contract);
        for (const child of ast.subNodes) {
          this.parseAst(child, contract);
        }
        break;
      }

      case "EventDefinition": {
        const ev = new Event(ast.name);
        parent.events.push(ev);
        break;
      }

      case "FunctionDefinition": {
        const func = new Function(ast.name);
        func.stateMutability = ast.stateMutability;
        func.visibility = ast.visibility;
        parent.functions.push(func);
        if (ast.body && ast.body.statements) {
          for (const statement of ast.body.statements) {
            this.parseAst(statement, func);
          }
        }

        break;
      }
      case "ImportDirective": {
        parent.imports.push(ast.path);
        break;
      }

      case "EmitStatement": {
        const emit = new Emit(ast.eventCall.expression.name);
        parent.emits.push(emit);
        break;
      }
    }

    return null;
  }

}
