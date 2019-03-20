<template>
    <div class="proseStmtContainer" @focus.capture="focused" style="position: relative;">
        <TextEdit class="titleText" expanding="true" math="true" v-model="stmt.name" placeholder="name"/>
        <div v-show="visible" class="detailContainer">
            <TextEdit v-if="detail" class="bodyText" expanding="true" math="true" v-model="detail.statement" placeholder="statement"/>
            <TextEdit v-if="detail" class="bodyText" expanding="true" math="true" v-model="detail.justification" placeholder="justification"/>
        </div>
        <div v-show="visible" class="proseBttnContainer">
            <div v-for="det in details" ><button class="bttn" @click="setZoom(det.zoom)">{{det.zoom}}</button></div>
            <div style="display: flex; flex-direction: row;">
                <input class="newZoomInput"  @keydown="detailKeydown" placeholder="new zoom" v-model.number="newZoom" />
                <button class="bttn" @click="addDetail">+</button>
            </div>
        </div>
        <div class="dimmed" v-if="!isRelevant"></div>
    </div>
</template>

<script lang="ts">
	import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
    import { Key } from 'ts-key-enum'
    import { Stmt, StmtDetail, Proof, store } from '@/model'
	import TextEdit from '@/components/TextEdit.vue'

	@Component({
		components: {
			TextEdit
		}
	})
	export default class ProseStmt extends Vue {
		@Prop(Number)
		id!: number

        stmt: Stmt = store.proof.stmts[this.id]

        get details(): Array<StmtDetail> { return store.details(this.id) }

        get detail(): StmtDetail | undefined { return store.zoomedDetail(this.id) }

        get minZoom(): number { return this.details.length === 0 ? 0 : Math.min(...this.details.map((det) => det.zoom)) }

        get isRelevant() {
            if (store.proof.active === this.id) return true
            if (store.activeDetail === undefined) return false
            return store.activeDetail.dependents.find((id) => id === this.id) !== undefined
        }

        get visible(): boolean { return this.minZoom <= store.proof.globalZoom || this.isRelevant }

        newZoom: number | string = ''

        detailKeydown(event: KeyboardEvent) {
            if (event.key === Key.Enter) this.addDetail()
        }

        focused() {
            store.setActive(this.id)
        }

        addDetail() {
            if (typeof (this.newZoom) !== "number") return
            if (this.details.find((det) => det.zoom === this.newZoom)) return
            store.addDetail(this.id, this.newZoom)
            store.setStmtZoom(this.id, this.newZoom)
            this.newZoom = ''
        }

        setZoom(newZoom: number) {
            store.setStmtZoom(this.id, newZoom)
        }

        @Watch('detail.justification')
        onJustificationChange(val: string) {
            var matches = []
            var re = /\[(.*?)\]/g
            var match = re.exec(val)
            while (match) {
                matches.push(match[1])
                match = re.exec(val)
            }
            console.log(matches)

            var stmts = matches.map((match) => store.stmts.find((stmt) => stmt.name === match));
            (this.detail as StmtDetail).dependents = stmts.flatMap((stmt) => stmt ? [stmt.id] : [])
        }
	}
</script>

<style lang="scss" scoped>
    .hovering {
        box-shadow: 0 0 5px 2px grey;
    }

    .proseStmtContainer {
        position: relative;
        margin-bottom: 10px;
        box-shadow: 0 0 5px 2px grey;
    }

    .proseBttnContainer {
        position: absolute;
        left: calc(100% + 10px);
        top: 0;
    }
    
    .bttn {
        margin: 2px;
        background: none;
        border: none;
        box-shadow: 0 0 3px 1px black;
    }

    .bttn:active {
        box-shadow: inset;
    }

    .titleText {
        font-size: 1.7em;
        font-weight: 600;
    }

    .bodyText {
        font-size: 1.3em;
    }

    .newZoomInput {
        width: 80px;
        overflow: hidden;
    }

    .dimmed {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        background: rgba(30, 30, 30, 0.15);
        pointer-events: none;
    }

    .collapse-enter-active, .collapse-leave-active {
        transition: height 0.5s;
    }
    .collapse-enter, .collapse-leave-to {
        height: 0;
    }

    detailContainer {
        overflow: hidden;
    }
</style>