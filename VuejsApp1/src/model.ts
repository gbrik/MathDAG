import Vue from 'vue'
import Vuex from 'vuex'
import { Store } from 'vuex'
import { State, Mutation, Getter, createVuexStore } from 'vuex-simple'
Vue.use(Vuex)

export class Stmt {
    constructor(
        public id: number,
		public name: string = '',
        public details: Array<number> = [],
        public curZoom: number = 0
	) {}
}

export class StmtDetail {
    constructor(
        public id: number,
		public zoom: number,
		public statement: string = '',
		public justification: string = '',
		public dependents: Array<number> = [],
	) {}
}

export class Proof {
    stmts: any = {}
    stmtIds: Array<number> = []
    active: number = 0
    details: any = {}
    detailCount: number = 0
    globalZoom: number = 0
}

export const data = {
    proof: new Proof()
}

export const proof = data.proof
/*
export class MyStore {
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

export const store: MyStore = new MyStore()
export const vuexStore: Store<MyStore> = createVuexStore(store)
*/
