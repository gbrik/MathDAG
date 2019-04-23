import { Stmt, Proof, StmtDetail, Edge, StmtId, DetId, Dimensions, DAGNode, Coords } from '@/model'
import dagre from 'dagre'
import Vue from 'vue'
import Vuex from 'vuex'
import { Store } from 'vuex'
import { State, Mutation, createVuexStore } from 'vuex-simple'
import { autoLayoutStmts, distances } from './dag';
Vue.use(Vuex)

export class MyStore {
    // Global Vars

    @State()
    proof: Proof = new Proof()

    @State()
    editing: boolean = true

    get active(): Stmt | undefined {
        if (this.proof.active !== undefined) return this.stmt(this.proof.active)
    }

    get activeDetail(): StmtDetail | undefined {
        if (this.proof.active !== undefined) return this.zoomedDetail(this.proof.active)
    }

    @Mutation()
    setEditing(editing: boolean) { this.editing = editing }

    @Mutation()
    setProof(newProof: Proof) { Object.assign(this.proof, newProof) }

    @Mutation()
    setActive(id: StmtId | undefined) { this.proof.active = id }

    @Mutation()
    setZoom(zoom: number) { this.proof.globalZoom = zoom }

    // Stmt

    stmt(stmtId: StmtId): Stmt { return this.proof.stmts[stmtId] }

    get stmts(): Array<Stmt> {
        return this.proof.stmtIds.map((id) => this.proof.stmts[id])
    }

    zoomedDetail(stmtId: StmtId): StmtDetail | undefined {
        return this.details(stmtId).find((det) => det.zoom === this.stmt(stmtId).curZoom)
    }

    isActive(stmtId: StmtId): boolean {
        return (this.active !== undefined) && this.active.id === stmtId;
    }

    minZoom(stmtId: StmtId): number {
        const details = this.details(stmtId)
        return details.length === 0 ? 0 : Math.min(...details.map((det) => det.zoom))
    }

    @Mutation()
    addStmt() {
        var newId = this.proof.maxStmtId++
        this.proof.stmtIds.push(newId)
        Vue.set(this.proof.stmts, newId, new Stmt(newId))
    }

    @Mutation()
    setStmtName({ stmtId, name }: { stmtId: StmtId, name: string }) { this.stmt(stmtId).name = name }

    @Mutation()
    setStmtZoom({ stmtId, zoom }: { stmtId: StmtId, zoom: number | undefined }) { this.stmt(stmtId).curZoom = zoom }

    @Mutation()
    setStmtPinned({ stmtId, pinned }: { stmtId: StmtId, pinned: boolean }) { this.stmt(stmtId).pinned = pinned }

    @Mutation()
    setStmtExpanded({ stmtId, expanded }: { stmtId: StmtId, expanded: boolean }) { this.stmt(stmtId).dagExpanded = expanded }

    @Mutation()
    deleteStmt(stmtId: StmtId) {
        const stmt = this.stmt(stmtId)
        stmt.details.forEach((detId) => this.deleteDetailById({ stmtId: stmtId, detId: detId }))

        Vue.delete(this.proof.stmts, stmtId)
        this.proof.stmtIds = this.proof.stmtIds.filter((otherId) => otherId !== stmtId)

        this.setActive(undefined)
    }

    // Detail

    details(stmtId: StmtId): Array<StmtDetail> {
        return this.stmt(stmtId).details.map((id) => this.proof.details[id])
    }

    detail(detailId: StmtId): StmtDetail {
        return this.proof.details[detailId] as StmtDetail
    }

    @Mutation()
    addDetail({ stmtId, zoom }: { stmtId: StmtId, zoom: number }) {
        var newId = this.proof.maxDetailId++
        var stmt = this.stmt(stmtId)
        stmt.details.push(newId)
        Vue.set(this.proof.details, newId, new StmtDetail(newId, zoom))
        stmt.details.sort((id1, id2) => this.proof.details[id1].zoom - this.proof.details[id2].zoom)
    }

    @Mutation()
    setDetailStmt({ detailId, stmt }: { detailId: DetId, stmt: string }) {
        this.detail(detailId).statement = stmt
    }

    @Mutation()
    setDetailJustification({ detailId, justification }: { detailId: DetId, justification: string }) {
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
    deleteDetailByZoom({ stmtId, zoom }: { stmtId: StmtId, zoom: number }) {
        const detId = this.stmt(stmtId).details.find((id) => this.detail(id).zoom === zoom)!

        this.deleteDetailById({ stmtId: stmtId, detId: detId })
    }

    @Mutation()
    deleteDetailById({ stmtId, detId }: { stmtId: StmtId, detId: DetId }) {
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

    // Node

    get edges(): Array<Edge> {
        return this.stmts.flatMap((stmt) => {
            const detail = this.zoomedDetail(stmt.id)
            if (detail === undefined) return []

            return detail.dependents.map((depId) => { return { v: depId, w: stmt.id } })
        })
    }

    get dims(): Dimensions {
        return {
            height: Math.max(...this.nodes.map((n) => n.y + n.height)) + 25,
            width: Math.max(...this.nodes.map((n) => n.x + n.width / 2)) + 25,
        }
    }

    node(stmtId: StmtId): DAGNode | undefined {
        const stmt = this.stmt(stmtId)
        return Object.assign({}, stmt.coords, stmt.dagExpanded ? stmt.expandedDims : stmt.collapsedDims)
    }

    get nodes(): Array<DAGNode> {
        return this.proof.stmtIds.flatMap((id) => {
            const node = this.node(id)
            return node ? [node] : []
        })
    }

    private get _distances() { return distances(this.proof.stmtIds, this.edges) }

    distance(stmt1: StmtId, stmt2: StmtId): number | undefined {
        const dists = this._distances
        return dists.get(stmt1)!.get(stmt2) || dists.get(stmt2)!.get(stmt1)
    }

    @Mutation()
    autoLayoutStmts() {
        const nodes = this.stmts.map((stmt) => {
            let existingNode = this.node(stmt.id)
            return [stmt.id, existingNode] as [number, dagre.Node]
        })
        const nodeMap = autoLayoutStmts(new Map(nodes), this.edges)
        nodeMap.forEach((node, stmtId) => this.setNode({ stmtId: stmtId, node: node }))
    }

    @Mutation()
    setNode({ stmtId, node }: { stmtId: StmtId, node: DAGNode }) {
        this.setNodeDims({ stmtId: stmtId, dims: { height: node.height, width: node.width } })
        this.setNodeCoords({ stmtId: stmtId, coords: { x: node.x, y: node.y } })
    }

    @Mutation()
    setNodeDims({ stmtId, dims }: { stmtId: StmtId, dims: Dimensions }) {
        const stmt = this.stmt(stmtId)
        if (stmt.dagExpanded) stmt.expandedDims = dims
        else stmt.collapsedDims = dims
    }

    @Mutation()
    setNodeCoords({ stmtId, coords }: { stmtId: StmtId, coords: Coords }) {
        this.stmt(stmtId).coords = coords
    }
}

export const store: MyStore = new MyStore()
export const vuexStore: Store<MyStore> = createVuexStore(store)
