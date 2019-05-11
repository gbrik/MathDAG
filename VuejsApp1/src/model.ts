export type StmtId = number
export type DetId = number
export interface Edge {
    v: StmtId,
    w: StmtId,
}
export interface Dimensions {
    height: number,
    width: number,
}
export interface Coords {
    x: number,
    y: number,
}
export type DAGNode = Dimensions & Coords

export class Stmt {
    constructor(
        public id: StmtId,
        public name: string = '',
        public details: Array<DetId> = [],
        public curZoom: number | undefined = undefined,
        public pinned: boolean = false,
        public dagExpanded: boolean = false,
        public collapsedDims: Dimensions = { width: 200, height: 40 },
        public expandedDims: Dimensions = { width: 250, height: 150 },
        public coords: Coords = { x: 200, y: 10 },
    ) { }
}

export class StmtDetail {
    constructor(
        public id: DetId,
        public zoom: number,
        public statement: string = '',
        public justification: string = '',
        public dependents: Array<number> = [],
    ) { }
}

export class Proof {
    constructor(
        public stmts: any = {}, // StmtId -> Stmt
        public stmtIds: Array<StmtId> = [],
        public maxStmtId: number = 0,
        public active: number | undefined = undefined,
        public details: any = {}, // DetId -> StmtDetail
        public detailIds: Array<DetId> = [],
        public maxDetailId: number = 0,
        public globalZoom: number = 0,
    ) { }
}

export function copyDAGNode(n: DAGNode): DAGNode {
    return {
        x: n.x,
        y: n.y,
        height: n.height,
        width: n.width,
    }
}
