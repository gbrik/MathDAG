<template>
    <div class="dagStmt" v-bind:style="style" @focus.capture="focused" @click="focused">
        <TextEdit expanding="true" math="true" v-model="name" placeholder="name"/>
    </div>
</template>

<script lang="ts">
    import { store } from '@/model'
    import TextEdit from '@/components/TextEdit.vue'
    import { runTween } from '@/animate'
    //@ts-ignore
    import TWEEN from '@tweenjs/tween.js'
    import dagre from 'dagre'
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

    @Component({
        components: {
            TextEdit
        }
    })
    export default class DAGStmt extends Vue {
        @Prop()
        node!: dagre.Node

        tweenedNode: dagre.Node = this.node
        tweenedScale = { scale: this.scale }

        @Prop(Number)
        stmtId!: number

        get name(): string { return store.stmt(this.stmtId).name }
        set name(s: string) { store.setStmtName({ stmtId: this.stmtId, name: s }) }

        get scale(): number { return (store.active && store.active.id === this.stmtId) ? 1.3 : 1.0 }

        get style() {
            return {
                width: this.tweenedNode.width + 'px',
                height: this.tweenedNode.height + 'px',
                left: this.tweenedNode.x + 'px',
                top: this.tweenedNode.y + 'px',
                transform: 'scale(' + this.tweenedScale.scale + ', ' + this.tweenedScale.scale + ')'
            }
        }

        @Watch('node')
        tweenNode(node: dagre.Node) {
            const tween = new TWEEN.Tween(this.tweenedNode)
                .to(node, 500)
                .easing(TWEEN.Easing.Quadratic.Out)

            runTween(tween)
        }

        @Watch('scale')
        tweenScale(scale: number) {
            const tween = new TWEEN.Tween(this.tweenedScale)
                .to({ scale: scale }, 500)
                .easing(TWEEN.Easing.Quadratic.Out)

            runTween(tween)
        }

        focused() {
            store.setActive(this.stmtId)
        }
    }
</script>

<style lang="scss" scoped>
    .dagStmt {
        position: absolute;
        box-shadow: 0 0 4px 1px grey;
        background: white;
        transition: transform;
    }
</style>