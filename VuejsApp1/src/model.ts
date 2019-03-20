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
    maxStmtId: number = 0
    active: number = 0
    details: any = {}
    detailIds: Array<number> = []
    maxDetailId: number = 0
    globalZoom: number = 0
}

export class MyStore {
	@State()
    proof: Proof = new Proof()

    stmt(stmtId: number): Stmt { return this.proof.stmts[stmtId] }

    get stmts(): Array<Stmt> {
        return this.proof.stmtIds.map((id) => this.proof.stmts[id])
    }

    details(stmtId: number): Array<StmtDetail> {
        return (this.stmt(stmtId) as Stmt).details.map((id) => this.proof.details[id])
    }

    zoomedDetail(stmtId: number): StmtDetail | undefined {
        return this.details(stmtId).find((det) => det.zoom === this.stmt(stmtId).curZoom)
    }

    get active(): Stmt {
        return this.stmt(this.proof.active)
    }

    get activeDetail(): StmtDetail | undefined {
        return this.zoomedDetail(this.proof.active)
    }

    @Mutation()
    setProof(newProof: Proof) { Object.assign(this.proof, newProof) }

    @Mutation()
    setActive(id: number) { this.proof.active = id }

    @Mutation()
    setZoom(zoom: number) { this.proof.globalZoom = zoom }

    @Mutation()
    setStmtName(id: number, name: string) { this.stmt(id).name = name }

    @Mutation()
    setStmtZoom(id: number, zoom: number) { this.stmt(id).curZoom = zoom }

	@Mutation()
    addStmt() {
        var newId = this.proof.maxStmtId++
        this.proof.stmtIds.push(newId)
        Vue.set(this.proof.stmts, newId, new Stmt(newId))
	}

    @Mutation()
    addDetail(stmtId: number, zoom: number) {
        var newId = this.proof.maxDetailId++
        var stmt = this.stmt(stmtId)
        stmt.details.push(newId)
        Vue.set(this.proof.details, newId, new StmtDetail(newId, zoom))
        stmt.details.sort((id1, id2) => this.proof.details[id1].zoom - this.proof.details[id2].zoom)
	}
}

export const store: MyStore = new MyStore()
export const vuexStore: Store<MyStore> = createVuexStore(store)
