<template>
    <div class="proseStmtContainer" @focus.capture="focused" style="position: relative;">
        <TextEdit class="titleText" expanding="true" math="true" v-model="stmt.name" placeholder="name"/>
        <div v-show="visible && detail" class="detailContainer">
            <TextEdit class="bodyText" expanding="true" math="true" v-model="detail.statement" placeholder="statement"/>
            <TextEdit class="bodyText" expanding="true" math="true" v-model="detail.justification" placeholder="justification"/>
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
    import { Stmt, StmtDetail, Proof, data } from '@/model'
	import TextEdit from '@/components/TextEdit.vue'

	@Component({
		components: {
			TextEdit
		}
	})
	export default class ProseStmt extends Vue {
		@Prop(Number)
		id!: number

        proof: Proof = data.proof
        stmt: Stmt = this.proof.stmts[this.id]

        get details(): Array<StmtDetail> { return this.stmt.details.map((id) => this.proof.details[id]) }
        get minZoom(): number { return this.details.length === 0 ? 0 : Math.min(...this.details.map((det) => det.zoom)) }
        get visible(): boolean {
            return this.minZoom <= this.proof.globalZoom || this.isRelevant
        }

        newZoom: number | string = ''

        detailKeydown(event: KeyboardEvent) {
            if (event.key === Key.Enter) this.addDetail()
        }

        focused() {
            this.proof.active = this.id
        }

        addDetail() {
            if (typeof (this.newZoom) !== "number") return
            if (this.details.find((det) => det.zoom === this.newZoom)) return
            var newId = this.proof.detailCount++
            this.stmt.details.push(newId)
            Vue.set(this.proof.details, newId, new StmtDetail(newId, this.newZoom))
            this.stmt.details.sort((id1, id2) => this.proof.details[id1].zoom - this.proof.details[id2].zoom)
            this.stmt.curZoom = this.newZoom
            this.newZoom = ''
        }

        setZoom(newZoom: number) {
            this.stmt.curZoom = newZoom
        }

        get detail(): StmtDetail | undefined {
            return this.details.find((det) => det.zoom === this.stmt.curZoom)
        }

        get isRelevant() {
            if (this.proof.active === this.id) return true
            var active = this.proof.stmts[this.proof.active] as Stmt
            if (active.details.length === 0) return false
            var activeDetail = active.details.find((id) => this.proof.details[id].zoom === active.curZoom)
            if (!activeDetail) {
                activeDetail = active.details[0]
                active.curZoom = this.proof.details[activeDetail].zoom
            }
            return (this.proof.details[activeDetail] as StmtDetail).dependents.find((id) => id === this.id) !== undefined
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

            var stmtIds = matches.map((match) => this.proof.stmtIds.find((id) => this.proof.stmts[id].name === match));
            (this.detail as StmtDetail).dependents = stmtIds.filter((id) => id !== undefined) as Array<number>
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