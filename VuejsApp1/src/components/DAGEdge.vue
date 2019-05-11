<template>
    <svg v-bind:style="svgStyle">
        <path stroke-width="2" stroke="#000" fill-opacity="0" v-bind:d="path"></path>
    </svg>
</template>

<script lang="ts">
    import { Edge, Dimensions, DAGNode } from '@/model'
    import { store } from '@/store'
    import { Component, Prop, Vue } from 'vue-property-decorator'

    @Component
    export default class DAGStmt extends Vue {
        @Prop()
        edge!: Edge

        @Prop()
        dims!: Dimensions

        get pts(): Array<{ x: number, y: number }> {
            function nodeToPoint(n: DAGNode) {
                return { x: n.x, y: n.y + n.height / 2 }
            }
            return [store.displayedNode(this.edge.v)!, store.displayedNode(this.edge.w)!].map(nodeToPoint)
        }

        get path() {
            let pts = this.pts.map((p) => p.x + " " + p.y)
            pts.splice(1, pts.length - 2)
            let pathStr = "M " + pts.join(" L ")
            return pathStr
        }

        get svgStyle() {
            return {
                height: this.dims.height + 'px',
                width:  this.dims.width + 'px',
            }
        }
    }
</script>

<style lang="scss" scoped>
    svg {
        position: absolute;
        width: 100%;
        height: 100%;
    }
</style>