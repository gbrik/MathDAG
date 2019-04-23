import { Edge, StmtId, DAGNode } from '@/model'
import dagre from 'dagre'

export function autoLayoutStmts(
    nodes: Map<StmtId, dagre.Node>,
    edges: Array<Edge>):
    Map<StmtId, dagre.Node>
{
    let graph = new dagre.graphlib.Graph({ directed: true })

    graph.setGraph({})
    graph.setDefaultEdgeLabel(function () { return {} })
    nodes.forEach((node, stmtId) => graph.setNode(stmtId.toString(), node))
    edges.forEach(({ v, w }) => graph.setEdge(v.toString(), w.toString()))

    dagre.layout(graph)

    const newNodes = graph.nodes().map((id) => graph.node(id))
    const minHeight = newNodes.length === 0 ? 0 : Math.min(...newNodes.map((n) => n.height))
    const minWidth = newNodes.length === 0 ? 0 : Math.min(...newNodes.map((n) => n.width))
    graph.edges().forEach((edge) => {
        const edgeObj = graph.edge(edge)
        edgeObj.points.forEach((p) => { p.y += minHeight / 2; p.x += minWidth / 2; })
        function center(node: dagre.Node) { return { x: node.x + node.width / 2, y: node.y } }
        edgeObj.points = [center(graph.node(edge.v))].concat(edgeObj.points, [center(graph.node(edge.w))])
    })
    newNodes.forEach((node) => { node.x += node.width / 2 })

    let retNodes = new Map<StmtId, dagre.Node>()
    nodes.forEach((__, stmtId) => retNodes.set(stmtId, graph.node(stmtId.toString())))
    return retNodes
}

export function distances(stmts: Array<StmtId>, edges: Array<Edge>): Map<StmtId, Map<StmtId, number>> {
    const dists = new Map<StmtId, Map<StmtId, number>>()
    stmts.forEach((n) => dists.set(n, new Map<StmtId, number>([[n, 0]])))
    edges.forEach(({ v, w }) => dists.get(v)!.set(w, 1))
    let updated = true
    while (updated) {
        updated = false
        edges.forEach(({ v, w }) => {
            for (const u of dists.get(w)!.keys()) {
                if (!dists.get(v)!.has(u)) {
                    dists.get(v)!.set(u, dists.get(w)!.get(u)! + 1)
                    updated = true
                }
            }
        })
    }
    return dists
}

export function vgaps(nodes: Array<DAGNode>, gapsize: number): Array<{ idx: number, delta: number }> {
    return gaps(nodes.map((n) => n.y), nodes.map((n) => n.y + n.height), gapsize)
}

export function hgaps(nodes: Array<DAGNode>, gapsize: number): Array<{ idx: number, delta: number }> {
    return gaps(nodes.map((n) => n.x - n.height / 2), nodes.map((n) => n.x + n.height / 2), gapsize)
}

function gaps(starts: Array<number>, ends: Array<number>, gapsize: number): Array<{ idx: number, delta: number }> {
    const startIdxs = sortedIdxs(starts)
    const endIdxs = sortedIdxs(ends)

    let startCursor = 0
    let endCursor = 0
    let gaps: Array<{ idx: number, delta: number }> = []
    while (endCursor < endIdxs.length) {
        while (startCursor < startIdxs.length && startCursor < endCursor) {
            startCursor++
            const gap = starts[startIdxs[startCursor]] - ends[endIdxs[endCursor]]
            if (gap > 25) {
                gaps.push({idx: endIdxs[endCursor], delta: gap - 25})
            }
        }
    }
    return gaps
}

function sortedIdxs(nums: Array<number>): Array<number> {
    let with_idxs = nums.map((n, i) => [i, n])
    with_idxs.sort((x, y) => x[1] - y[1])
    return with_idxs.map((a) => a[0])
}
