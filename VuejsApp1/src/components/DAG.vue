<template>
    <div class="dag" v-bind:style="style">
        <DAGEdge v-for="edge in edges" :edge="graph.edge(edge)"></DAGEdge>
        <DAGStmt v-for="id in nodeIds" :node="graph.node(id)" :stmtId="parseFloat(id)"></DAGStmt>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { store } from '@/model'
    import DAGStmt from '@/components/DAGStmt.vue'
    import DAGEdge from '@/components/DAGEdge.vue'
    //@ts-ignore
    import TWEEN from '@tweenjs/tween.js'
    import dagre from 'dagre'

    @Component({
        components: {
            DAGStmt,
            DAGEdge
        }
    })
    export default class DAG extends Vue {
        get graph() {
            var graph = store.stmtGraph
            dagre.layout(graph)
            var nodes = graph.nodes().map((id) => graph.node(id))
            var edges = graph.edges().map((edge) => graph.edge(edge))
            var minHeight = nodes.length === 0 ? 0 : Math.min(...nodes.map((n) => n.height))
            var minWidth = nodes.length === 0 ? 0 : Math.min(...nodes.map((n) => n.width))
            edges.forEach((e) => e.points.forEach((p) => { p.y += minHeight / 2; p.x += minWidth / 2; }))
            graph.graph().height! += minHeight
            graph.graph().width! += minWidth
            return graph
        }

        get style() {
            return {
            //    height: this.graph.graph().height! + 'px',
            //    width:  this.graph.graph().width! + 'px',
            }
        }

        get nodeIds(): Array<string> { return this.graph.nodes() }
        get nodes(): Array<dagre.Node> { return this.nodeIds.map((id) => this.graph.node(id)) }
        get edges(): Array<dagre.Edge> { return this.graph.edges() }
    }
</script>

<style lang="scss" scoped>
    .dag {
        position: absolute;
        height: 100%;
        width: 100%;
        padding: 5px;
        overflow: auto;
    }
</style>