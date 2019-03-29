<template>
    <svg>
        <path stroke-width="2" stroke="#000" fill-opacity="0" v-bind:d="path"></path>
    </svg>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator'
    import { store, Stmt } from '@/model'
    //@ts-ignore
    import TWEEN from '@tweenjs/tween.js'
    import dagre from 'dagre'

    @Component
    export default class DAGStmt extends Vue {
        @Prop()
        edge!: dagre.GraphEdge

        get path() {
            var pts = this.edge.points
            var pathStr = "M " + pts[0].x + " " + pts[0].y
            pts.forEach(({ x, y }) => pathStr = pathStr + " L " + x + " " + y)
            return pathStr
        }
    }
</script>

<style scoped>
    svg {
        position: absolute;
        width: 100%;
        height: 100%;
    }
</style>