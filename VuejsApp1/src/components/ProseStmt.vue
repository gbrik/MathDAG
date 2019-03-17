<template>
    <div class="proseStmtContainer" @focus.capture="focused" style="position: relative;">
        <TextEdit class="titleText" expanding="true" math="true" v-model="stmt.name" placeholder="name"/>
        <TextEdit class="bodyText" expanding="true" math="true" v-if="detail" v-model="detail.statement" placeholder="statement"/>
        <TextEdit class="bodyText" expanding="true" math="true" v-if="detail" v-model="detail.justification" placeholder="justification"/>
        <div class="proseBttnContainer">
            <div v-for="det in stmt.details" ><button class="bttn" @click="setZoom(det.zoom)">{{det.zoom}}</button></div>
            <div style="display: flex; flex-direction: row;">
                <input class="newZoomInput"  @keydown="detailKeydown" placeholder="new zoom level" v-model.number="newZoom" />
                <button class="bttn" @click="addDetail">+</button>
            </div>
        </div>
        <div class="dimmed" v-if="!isRelevant"></div>
    </div>
</template>

<script lang="ts">
	import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
    import { Key } from 'ts-key-enum'
    import { Stmt, StmtDetail, data } from '@/model'
	import TextEdit from '@/components/TextEdit.vue'

	@Component({
		components: {
			TextEdit
		}
	})
	export default class ProseStmt extends Vue {
		@Prop(Number)
		index!: number

        stmt = data.stmts[this.index]

        newZoom: number | string = ''

        detailKeydown(event: KeyboardEvent) {
            if (event.key === Key.Enter) this.addDetail()
        }

        focused() {
            data.active = this.index
        }

        addDetail() {
            if (typeof (this.newZoom) !== "number") return
            if (this.stmt.details.find((det) => det.zoom === this.newZoom)) return
            this.stmt.details.push(new StmtDetail(this.newZoom))
            this.stmt.curZoom = this.newZoom
            this.newZoom = ''
        }

        setZoom(newZoom: number) {
            this.stmt.curZoom = newZoom
        }

        get detailIndex() {
            return this.stmt.details.findIndex((det) => det.zoom === this.stmt.curZoom)
        }

        get detail() {
            return this.stmt.details[this.detailIndex]
        }

        get isRelevant() {
            if (data.active === this.index) return true
            var active = data.stmts[data.active]
            if (active.details.length === 0) return false
            if (!active.details[active.curZoom]) {
                active.curZoom = active.details[0].zoom
            }
            return active.details[active.curZoom].dependents.find((name) => name === this.stmt.name) !== undefined
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
        width: 120px;
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
</style>