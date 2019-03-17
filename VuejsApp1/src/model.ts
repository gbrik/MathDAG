export class Stmt {
	constructor(
		public name: string = '',
        public details: Array<StmtDetail> = [],
        public curZoom: number = 0
	) {}
}

export class StmtDetail {
	constructor(
		public zoom: number = 0,
		public statement: string = '',
		public justification: string = '',
		public dependents: Array<String> = [],
	) {}
}

export class Store {
    stmts: Array<Stmt> = []
    active: number = 0
}

export const data = new Store()

/*
export class Store {
	@State()
	stmts: Array<Stmt> = []

	@Mutation()
	updateName(id: number, name: string) {
		this.stmts[id].name = name
	}

	@Mutation()
	addStatement() {
		this.stmts.push(new Stmt())
	}
}

export const store: Store< = createVuexStore(new Store())
 */
