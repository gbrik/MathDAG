<template>
    <div class="dagStmtContainer" v-bind:style="containerStyle">
        <div class="dagStmt" v-bind:style="dagStmtStyle" @focus.capture="focused" @click="focused">
            <div class="dagStmtHeader" @mousedown="mousedownPosition">
                <TextEdit class="dagStmtText" expanding="true" math="true" v-model="stmtName" placeholder="name"/>
                <div class="dagStmtBttns" v-bind:style="counterTransform">
                    <Button v-if="detail"
                            v-model="stmtExpanded" 
                            v-bind:icon="stmtExpanded ? 'unfold_less' : 'unfold_more'"></Button>
                    <Button icon="control_camera" @mousedown="mousedownPosition"></Button>
                </div>
            </div> 
            <div class="dagStmtDetailContainer" v-bind:class="{ tweening: tweening }">
                <TextEdit v-if="detail && stmtExpanded" expanding="true" math="true" v-model="detailStmt" placeholder="statement"/>
                <TextEdit v-if="detail && stmtExpanded" expanding="true" math="true" v-model="detailJustification" placeholder="justification"/>
            </div>
            <div v-for="resizer in resizers" v-bind:style="resizer.style" @mousedown.prevent="mousedownResizer($event, resizer)">
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { StmtDetail, DAGNode, Coords, Dimensions } from '@/model'
    import { store } from '@/store'
    import { runTween } from '@/animate'

    //@ts-ignore
    import TWEEN from '@tweenjs/tween.js'
    import dagre from 'dagre'
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

    interface Resizer {
        x: number,
        y: number,
        style: any,
    }

    @Component
    export default class DAGStmt extends Vue {
        @Prop(Number)
        stmtId!: number

        get node(): DAGNode { return store.node(this.stmtId)! }

        pauseTween: boolean = false
        tweening: boolean = false
        tweenedNode: DAGNode = this.node
        tweenedScale = { scale: this.scale }

        get stmtName(): string { return store.stmt(this.stmtId).name }
        set stmtName(s: string) { store.setStmtName({ stmtId: this.stmtId, name: s }) }

        get stmtExpanded(): boolean { return store.stmt(this.stmtId).dagExpanded }
        set stmtExpanded(b: boolean) { store.setStmtExpanded({ stmtId: this.stmtId, expanded: b }) }

        get detail(): StmtDetail | undefined { return store.zoomedDetail(this.stmtId) }

        get detailStmt(): string | undefined { return this.detail ? this.detail.statement : undefined}
        set detailStmt(s) { store.setDetailStmt({ detailId: this.detail!.id, stmt: s! }) }

        get detailJustification(): string | undefined { return this.detail ? this.detail.justification : undefined }
        set detailJustification(s) { store.setDetailJustification({ detailId: this.detail!.id, justification: s! }) }

        get active(): boolean { return store.isActive(this.stmtId) }
        get minZoom(): number { return store.minZoom(this.stmtId) }

        get scale(): number {
            const maxFactor = 3

            let distanceFactor: number | undefined
            if (store.proof.active !== undefined) {
                distanceFactor = store.distance(this.stmtId, store.proof.active)
                if (this.stmtId === store.proof.active) distanceFactor = 0
            }
            if (distanceFactor === undefined) distanceFactor = maxFactor

            const zoomFactor = Math.max(0, this.minZoom - store.proof.globalZoom)

            const factor = Math.min(distanceFactor, zoomFactor, maxFactor)
            return 1.15**(-factor)
        }

        get containerStyle() {
            const tn = this.tweenedNode
            return {
                width: tn.width + 'px',
                height: tn.height + 'px',
                left: (tn.x - tn.width / 2) + 'px',
                top: tn.y + 'px',
                //'overflow-y': this.active ? 'auto' : 'hidden',
            }
        }

        get dagStmtStyle() {
            return {
                'max-width': this.tweenedNode.width + 'px',
                'max-height': this.tweenedNode.height + 'px',
                transform: 'scale(' + this.tweenedScale.scale + ', ' + this.tweenedScale.scale + ')',
            }
        }

        get counterTransform() {
            const scale = this.tweenedScale.scale
            if (scale < 1) return
            const inverseScale = 1 / this.tweenedScale.scale
            const translate = (1 - inverseScale) / 2
            const scaleText = ' scale(' + inverseScale + ', ' + inverseScale + ')'
            const translateText = ' translate(' + translate * 100 + '%, ' + -translate * 100 + '%)'
            return {
                transform: translateText + scaleText
            }
        }

        @Watch('node', { deep: true })
        tweenNode(node: dagre.Node) {
            const tween = new TWEEN.Tween(this.tweenedNode)
                .to(node, this.pauseTween ? 0 : 500)
                .easing(TWEEN.Easing.Quadratic.Out)

            this.tweening = true
            runTween(tween, () => this.tweening = false)
        }

        @Watch('scale')
        tweenScale(scale: number) {
            if (this.pauseTween) return

            const tween = new TWEEN.Tween(this.tweenedScale)
                .to({ scale: scale }, this.pauseTween ? 0 : 500)
                .easing(TWEEN.Easing.Quadratic.Out)

            this.tweening = true
            runTween(tween, () => this.tweening = false)
        }

        focused() {
            store.setActive(this.stmtId)
        }

        mousedownPosition(event: MouseEvent) {
            const initialPos = { x: event.pageX, y: event.pageY }
            const initialNode = Object.assign({}, this.node)

            const mousemove = (event: MouseEvent) => {
                const newCoords = {
                    x: Math.max(initialNode.width / 2 + 10, initialNode.x + event.pageX - initialPos.x),
                    y: Math.max(10, initialNode.y + event.pageY - initialPos.y),
                }
                store.setNodeCoords({ stmtId: this.stmtId, coords: newCoords })
            }

            const mouseup = () => {
                window.removeEventListener('mousemove', mousemove)
                window.removeEventListener('mouseup', mouseup)
                this.pauseTween = false
            }

            window.addEventListener('mousemove', mousemove)
            window.addEventListener('mouseup', mouseup)
            this.pauseTween = true
        }

        get resizers(): Array<Resizer> {
            const coords = [-1, 0, 1].flatMap(
                (i) => (i === 0 ? [-1, 1] : [-1, 0, 1]).map((j) => { return { x: i, y: j } }))
            return coords.map((r) => {
                    return Object.assign({}, r, {
                        style: {
                            width: r.x === 0 ? 'calc(100% - 10px)' : '8px',
                            left: r.x === -1 ? '-3px' :
                                r.x === 0 ? '5px' : 'calc(100% - 5px)',
                            height: r.y === 0 ? 'calc(100% - 10px)' : '8px',
                            top: r.y === -1 ? '-3px' :
                                r.y === 0 ? '5px' : 'calc(100% - 5px)',
                            cursor: r.x === 0 ? 'ns-resize' :
                                r.y === 0 ? 'ew-resize' :
                                (r.y * r.x === 1) ? 'nw-resize' : 'ne-resize',
                            position: 'absolute',
                        }
                    })
                })
        }

        mousedownResizer(event: MouseEvent, resizer: Resizer) {
            if (this.pauseTween) return

            const initPos = { x: event.pageX, y: event.pageY }
            const initNode = Object.assign({}, this.node)
            const minBounds = {
                x: initPos.x - (initNode.x - initNode.width / 2) + 10,
                y: initPos.y - initNode.y + 10,
            }

            const mousemove = (event: MouseEvent) => {
                const bounded: Coords = { x: Math.max(minBounds.x, event.pageX), y: Math.max(minBounds.y, event.pageY) }
                const newDims: Dimensions = {
                    width: Math.max(150, initNode.width + resizer.x * (bounded.x - initPos.x)),
                    height: Math.max(40, initNode.height + resizer.y * (bounded.y - initPos.y)),
                }
                const newCoords = {
                    x: initNode.x + (newDims.width - initNode.width) / 2 * resizer.x,
                    y: initNode.y + (resizer.y < 0 ? (initNode.height - newDims.height) : 0),
                }
                store.setNode({ stmtId: this.stmtId, node: Object.assign({}, newDims, newCoords) })
            }

            const mouseup = () => {
                window.removeEventListener('mousemove', mousemove)
                window.removeEventListener('mouseup', mouseup)
                this.pauseTween = false
            }

            window.addEventListener('mousemove', mousemove)
            window.addEventListener('mouseup', mouseup)
            this.pauseTween = true
        }
    }
</script>

<style lang="scss" scoped>
    .dagStmtContainer {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .dagStmt {
        box-shadow: 0 0 4px 1px grey;
        background: white;
        transition: transform;
        display: flex;
        flex-direction: column;
        padding: 5px;
        width: 100%;
        height: 100%;
    }

    .dagStmtHeader {
        display: flex;
        cursor: grab;
    }

    .dagStmtText {
        flex-grow: 1;
    }

    .dagStmtDetailContainer {
        width: 100%;
        overflow-y: auto;
    }
    
    .dagStmtDetailContainer.tweening {
        width: 100%;
        overflow-y: hidden;
    }
</style>