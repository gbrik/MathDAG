<template>
    <div class="dag">
        <DAGEdge v-for="edge in edges" :edge="edge" :dims="dims"></DAGEdge>
        <DAGStmt v-for="id in stmtIds" :stmtId="parseFloat(id)"></DAGStmt>
        <div class="xtra" v-bind:style="xtraStyle"></div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { StmtId, Edge, Dimensions } from '@/model'
    import { store } from '@/store'

    @Component
    export default class DAG extends Vue {
        get dims(): Dimensions { return store.dims }

        get stmtIds(): Array<StmtId> {
            return store.proof.stmtIds.filter((id) => store.node(id) !== undefined)
        }

        get edges(): Array<Edge> {
            return store.edges.filter(({ v, w }) =>
                store.node(v) !== undefined && store.node(w) !== undefined)
        }

        get xtraStyle() {
            return {
                left: this.dims.width + 'px',
                top:  this.dims.height! + 'px',
            }
        }
    }
</script>

<style lang="scss" scoped>
    .dag {
        position: absolute;
        height: 100%;
        width: 100%;
        overflow: auto;
    }

    .xtra {
        position: absolute;
        width: 10px;
        height: 10px;
    }
</style>