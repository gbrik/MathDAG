import Vue from 'vue'
import Vuex from 'vuex'
import { Store } from 'vuex'
import { State, Mutation, createVuexStore } from 'vuex-simple'
import dagre from 'dagre'
Vue.use(Vuex)

export class Stmt {
    constructor(
        public id: number,
        public name: string = '',
        public details: Array<number> = [],
        public curZoom: number | undefined = undefined
    ) { }
}

export class StmtDetail {
    constructor(
        public id: number,
        public zoom: number,
        public statement: string = '',
        public justification: string = '',
        public dependents: Array<number> = [],
    ) { }
}

export class Proof {
    stmts: any = {}
    stmtIds: Array<number> = []
    maxStmtId: number = 0
    active: number | undefined = undefined
    details: any = {}
    detailIds: Array<number> = []
    maxDetailId: number = 0
    globalZoom: number = 0
}

export class MyStore {
    @State()
    proof: Proof = new Proof()

    @State()
    editing: boolean = true

    stmt(stmtId: number): Stmt { return this.proof.stmts[stmtId] }

    get stmts(): Array<Stmt> {
        return this.proof.stmtIds.map((id) => this.proof.stmts[id])
    }

    details(stmtId: number): Array<StmtDetail> {
        return this.stmt(stmtId).details.map((id) => this.proof.details[id])
    }

    detail(detailId: number): StmtDetail {
        return this.proof.details[detailId] as StmtDetail
    }

    zoomedDetail(stmtId: number): StmtDetail | undefined {
        return this.details(stmtId).find((det) => det.zoom === this.stmt(stmtId).curZoom)
    }

    get active(): Stmt | undefined {
        if (this.proof.active !== undefined) return this.stmt(this.proof.active)
    }

    get activeDetail(): StmtDetail | undefined {
        if (this.proof.active !== undefined) return this.zoomedDetail(this.proof.active)
    }

    get stmtGraph(): dagre.graphlib.Graph {
        var g = new dagre.graphlib.Graph()
        g.setGraph({})
        g.setDefaultEdgeLabel(function () { return {} })
        this.stmts.forEach((stmt) => {
            g.setNode(stmt.id.toString(), { width: 200, height: 50 })
            var detail = this.zoomedDetail(stmt.id)
            if (detail) {
                detail.dependents.forEach((depId) => {
                    g.setEdge(depId.toString(), stmt.id.toString())
                })
            }
        })
        return g
    }

    @Mutation()
    setEditing(editing: boolean) { this.editing = editing }

    @Mutation()
    setProof(newProof: Proof) { Object.assign(this.proof, newProof) }

    @Mutation()
    setActive(id: number | undefined) { this.proof.active = id }

    @Mutation()
    setZoom(zoom: number) { this.proof.globalZoom = zoom }

    @Mutation()
    setStmtName({ stmtId, name }: { stmtId: number, name: string }) { this.stmt(stmtId).name = name }

    @Mutation()
    setStmtZoom({ stmtId, zoom }: { stmtId: number, zoom: number | undefined }) { this.stmt(stmtId).curZoom = zoom }

    @Mutation()
    addStmt() {
        var newId = this.proof.maxStmtId++
        this.proof.stmtIds.push(newId)
        Vue.set(this.proof.stmts, newId, new Stmt(newId))
    }

    @Mutation()
    addDetail({ stmtId, zoom }: { stmtId: number, zoom: number }) {
        var newId = this.proof.maxDetailId++
        var stmt = this.stmt(stmtId)
        stmt.details.push(newId)
        Vue.set(this.proof.details, newId, new StmtDetail(newId, zoom))
        stmt.details.sort((id1, id2) => this.proof.details[id1].zoom - this.proof.details[id2].zoom)
    }

    @Mutation()
    setDetailStmt({ detailId, stmt }: { detailId: number, stmt: string }) {
        this.detail(detailId).statement = stmt
    }

    @Mutation()
    setDetailJustification({ detailId, justification }: { detailId: number, justification: string }) {
        this.detail(detailId).justification = justification

        var matches = []
        const re = /\[(.*?)\]/g
        var match = re.exec(justification)
        while (match) {
            matches.push(match[1])
            match = re.exec(justification)
        }

        const stmts = matches.map((match) => this.stmts.find((stmt) => stmt.name === match));
        this.detail(detailId).dependents = stmts.flatMap((stmt) => stmt ? [stmt.id] : [])
    }

    @Mutation()
    deleteStmt(stmtId: number) {
        const stmt = this.stmt(stmtId)
        stmt.details.forEach((detId) => this.deleteDetailById({ stmtId: stmtId, detId: detId }))

        Vue.delete(this.proof.stmts, stmtId)
        this.proof.stmtIds = this.proof.stmtIds.filter((otherId) => otherId !== stmtId)

        this.setActive(undefined)
    }

    @Mutation()
    deleteDetailByZoom({ stmtId, zoom }: { stmtId: number, zoom: number }) {
        const detId = this.stmt(stmtId).details.find((id) => this.detail(id).zoom === zoom)!

        this.deleteDetailById({ stmtId: stmtId, detId: detId })
    }

    @Mutation()
    deleteDetailById({ stmtId, detId }: { stmtId: number, detId: number }) {
        const stmt = this.stmt(stmtId)
        const det = this.detail(detId)

        stmt.details = stmt.details.filter((otherId) => otherId !== detId)
        Vue.delete(this.proof.details, detId)
        this.proof.detailIds = this.proof.detailIds.filter((otherId) => otherId !== detId)

        let newZoom: number | undefined = undefined
        if (stmt.details.length > 0) {
            const belowZooms = stmt.details.filter((id) => this.detail(id).zoom < det.zoom)
            if (belowZooms.length > 0) {
                newZoom = Math.max(...belowZooms.map((id) => this.detail(id).zoom))
            }
            else {
                newZoom = Math.min(...stmt.details.map((id) => this.detail(id).zoom))
            }
        }
        this.setStmtZoom({ stmtId: stmtId, zoom: newZoom })
    }
}

export const store: MyStore = new MyStore()
export const vuexStore: Store<MyStore> = createVuexStore(store)
