<template>
    <div v-bind:style="style">
        <TextEdit expanding="true" math="true" v-model="name" placeholder="name"/>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
    import { store } from '@/model'
    import TextEdit from '@/components/TextEdit.vue'
    //@ts-ignore
    import TWEEN from '@tweenjs/tween.js'
    import dagre from 'dagre'

    @Component({
        components: {
            TextEdit
        }
    })
    export default class DAGStmt extends Vue {
        @Prop()
        node!: dagre.Node

        tweenedNode: dagre.Node = this.node

        @Prop(Number)
        stmtId!: number

        get name(): string { return store.stmt(this.stmtId).name }
        set name(s: string) { store.setStmtName({ stmtId: this.stmtId, name: s }) }

        get style() {
            return {
                width: this.tweenedNode.width + 'px',
                height: this.tweenedNode.height + 'px',
                left: this.tweenedNode.x + 'px',
                top: this.tweenedNode.y + 'px'
            }
        }

        @Watch('node')
        tweenNode(node: dagre.Node, oldNode: dagre.Node) {
            const tween = new TWEEN.Tween(this.tweenedNode)
                .to(node, 500)
                .easing(TWEEN.Easing.Quadratic.Out)

            this.runTween(tween)
        }

        runTween(tween: TWEEN.Tween) {
            let frameHandler: number

            // Handles updating the tween on each frame.
            const animate = function (currentTime: number) {
                TWEEN.update(currentTime)
                frameHandler = requestAnimationFrame(animate)
            }

            tween.onComplete(() => {
                cancelAnimationFrame(frameHandler)
            })
            .start()
                .onComplete(() => {
                    // Make sure to clean up after ourselves.
                    cancelAnimationFrame(frameHandler)
                })
                // This actually starts the tween.
                .start()

            frameHandler = requestAnimationFrame(animate)
        }
    }
</script>

<style lang="scss" scoped>
    div {
        position: absolute;
        box-shadow: 0 0 4px 1px grey;
        background: white;
    }
</style>