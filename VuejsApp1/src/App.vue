<template>
    <div id="app">
        <div class="buttonContainer" >
		    <div><Button @click="addStmt" text="Add Statement"></Button></div>
            <div>
                <Button @click="save" text="Save"></Button>
                <input id="fileInput" @change="doLoad" hidden style="width: 90px;" type="file" accept=".yaml">
                <Button @click="load" text="Load"></Button>
            </div>
            <div>
                <span style="margin-right: 5px; vertical-align: top;">{{globalZoom}}</span>
                <Button @click="incZoom" icon="zoom_in"></Button>
                <Button @click="decZoom" icon="zoom_out"></Button>
            </div>
            <div><Button v-model="editing" v-bind:text="editText"></Button></div>
            <div><Button @click="autoLayout" text="Auto Layout"></Button></div>
        </div>
        <div class="proseContainer">
		    <ProseStmt v-for="stmt, index in stmts" :stmtId="stmt.id" :key="stmt.id">
		    </ProseStmt>
        </div>
        <div class="dagContainer">
            <DAG></DAG>
        </div>
    </div>
</template>

<script lang="ts">
    import { Stmt } from '@/model'
    import { store } from '@/store'

    import { Component, Vue, Prop } from 'vue-property-decorator'
    import YAML from 'yaml'
    import $ from 'jquery'

	@Component
    export default class App extends Vue {
        get stmts(): Array<Stmt> { return store.stmts }
        get globalZoom(): number { return store.proof.globalZoom }

        get editing(): boolean { return store.editing }
        set editing(b: boolean) { store.setEditing(b) }
        get editText(): string { return this.editing ? 'View Mode' : 'Edit Mode' }

        reader: FileReader = new FileReader()

        mounted() {
            this.reader.onload = (event: ProgressEvent) => {
                //@ts-ignore
                var newProof = YAML.parse(decodeURIComponent(event.target.result))
                store.setProof(newProof)
            }
        }

        save() {
            var text = encodeURIComponent(YAML.stringify(store.proof))
            var $link = $('<a/>')

            $link
                .attr('download', 'proof.yaml')
                .attr('href', 'data:application/octet-stream,' + text)
                .appendTo('body')
                .get(0)
                .click()

            $link.remove()
        }

        load() {
            var input = this.$el.querySelector('#fileInput')! as HTMLInputElement
            input.click()
        }

        doLoad() {
            var input = this.$el.querySelector('#fileInput')! as HTMLInputElement
            this.reader.readAsText(input.files![0])
        }

        addStmt() { store.addStmt() }
        incZoom() { store.setZoom(store.proof.globalZoom + 1) }
        decZoom() { store.setZoom(Math.max(store.proof.globalZoom - 1, 0)) }
        autoLayout() { store.autoLayoutStmts() }
	}
</script>

<style lang="scss">
	#app {
        display: flex;
        margin: 10px;
        height: calc(100vh - 20px);
	}

    .buttonContainer {
        width: 200px;
    }

    .proseContainer {
        width: 600px;
        overflow-x: hidden;
        overflow-y: auto;
        padding: 5px;
        resize: horizontal;
    }
    
    .dagContainer {
        flex-grow: 1;
        width: 0;
        position: relative;
    }
</style>
