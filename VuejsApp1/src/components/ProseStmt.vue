<template>
    <div class="proseStmtContainer" @focus.capture="focused">
        <div class="proseStmt">
            <div class="header">
                <TextEdit class="titleText" expanding="true" math="true" v-model="stmtName" placeholder="name"/>
                <div class="headerBttnContainer">
                    <Button v-if="!editing" v-model="stmtPinned" v-bind:text="stmtPinned ? 'Pin' : 'Unpin'"></Button>
                    <Button v-if="editing" @click="deleteStmt" icon="delete"></Button>
                </div>
            </div>
            <div v-show="visible" class="detailContainer">
                <TextEdit v-if="detail" class="bodyText" expanding="true" math="true" v-model="detailStmt" placeholder="statement"/>
                <TextEdit v-if="detail" class="bodyText" expanding="true" math="true" v-model="detailJustification" placeholder="justification"/>
            </div>
            <div class="dimmed" v-bind:class="{ undimmed: isRelevant }"></div>
        </div>
        <div v-show="visible" class="proseBttnContainer">
            <div v-for="det in details" >
                <Button @click="setZoom(det.zoom)" 
                        v-bind:text="det.zoom.toString()"
                        v-bind:active="det.zoom === detail.zoom">
                </Button>
                <Button v-if="editing" class="smol" @click="deleteDetail(det.zoom)" icon="delete"></Button>
            </div>
            <div v-if="editing "style="display: flex; flex-direction: row;">
                <input class="newZoomInput"  @keydown="detailKeydown" placeholder="new zoom" v-model.number="newZoom" />
                <Button @click="addDetail" icon="add"></Button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
	import { Component, Vue, Prop } from 'vue-property-decorator'
    import { Key } from 'ts-key-enum'
    import { Stmt, StmtDetail } from '@/model'
    import { store } from '@/store'

	@Component
	export default class ProseStmt extends Vue {
		@Prop(Number)
		stmtId!: number

        stmt: Stmt = store.stmt(this.stmtId)

        get stmtName(): string { return store.stmt(this.stmtId).name }
        set stmtName(name: string) { store.setStmtName({ stmtId: this.stmtId, name: name }) }

        get stmtPinned(): boolean { return store.stmt(this.stmtId).pinned }
        set stmtPinned(pinned: boolean) { store.setStmtPinned({ stmtId: this.stmtId, pinned: pinned }) }

        get details(): Array<StmtDetail> { return store.details(this.stmtId) }

        get detail(): StmtDetail | undefined { return store.zoomedDetail(this.stmtId) }

        get detailStmt(): string | undefined { return this.detail ? this.detail.statement : undefined}
        set detailStmt(s) { store.setDetailStmt({ detailId: this.detail!.id, stmt: s! }) }

        get detailJustification(): string | undefined { return this.detail ? this.detail.justification : undefined }
        set detailJustification(s) { store.setDetailJustification({ detailId: this.detail!.id, justification: s! }) }

        get minZoom(): number { return store.minZoom(this.stmtId) }

        get isRelevant() {
            return true
            /*
            if (store.proof.active === this.stmtId) return true
            if (store.activeDetail === undefined) return false
            return store.activeDetail.dependents.find((id) => id === this.stmtId) !== undefined
            */
        }

        get visible(): boolean { return this.minZoom <= store.proof.globalZoom || this.isRelevant }
        get editing(): boolean { return store.editing }

        newZoom: number | string = ''

        detailKeydown(event: KeyboardEvent) {
            if (event.key === Key.Enter) this.addDetail()
        }

        focused() {
            store.setActive(this.stmtId)
        }

        addDetail() {
            if (typeof (this.newZoom) !== "number") return
            if (this.details.find((det) => det.zoom === this.newZoom)) return
            store.addDetail({ stmtId: this.stmtId, zoom: this.newZoom })
            store.setStmtZoom({ stmtId: this.stmtId, zoom: this.newZoom })
            this.newZoom = ''
        }

        setZoom(newZoom: number) {
            store.setStmtZoom({ stmtId: this.stmtId, zoom: newZoom })
        }

        deleteStmt() {
            store.deleteStmt(this.stmtId)
        }

        deleteDetail(zoom: number) {
            store.deleteDetailByZoom({ stmtId: this.stmtId, zoom: zoom })
        }

        togglePinned() {
            this.stmtPinned = !this.stmtPinned
        }
	}
</script>

<style lang="scss" scoped>
    .hovering {
        box-shadow: 0 0 5px 2px grey;
    }

    .proseStmtContainer {
        display: flex;
    }

    .proseStmt {
        position: relative;
        flex-grow: 1;
        margin-bottom: 10px;
        box-shadow: 0 0 5px 2px grey;
    }

    .proseBttnContainer {
        margin-left: 10px;
    }

    .smol {
        transform: scale(0.666) translate(-30%, -30%);
    }

    .smol:active {
        transform: scale(0.666) translate(-30%, -30%) translate(1px, 1px);
    }

    .titleText {
        font-size: 1.7em;
        font-weight: 600;
        flex-grow: 1;
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
        background: rgb(30, 30, 30);
        opacity: 0.15;
        pointer-events: none;
        transition: opacity 0.3s;
    }

    .undimmed {
        opacity: 0;
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

    .header {
        display: flex;
    }
</style>