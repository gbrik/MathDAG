<template>
    <div id="app">
        <div class="buttonContainer" >
		    <div><button @click="addStmt">Add Statement</button></div>
            <div><button @click="save">Save</button></div>
            <div><input id="fileInput" style="width: 90px;" type="file" accept=".yaml"></input><button @click="load">Load</button></div>
            <div>
                <span style="margin-right: 5px">Global zoom: {{globalZoom}}</span>
                <button @click="incZoom">+</button>
                <button @click="decZoom">-</button>
            </div>
            <button @click="toggleEdit">{{editText}}</button>
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
    import { Component, Vue, Prop } from 'vue-property-decorator'
    import YAML from 'yaml'
    import $ from 'jquery'
    import ProseStmt from '@/components/ProseStmt.vue'
    import DAG from '@/components/DAG.vue'
    import { Stmt, store } from '@/model'

	@Component({
		components: {
            ProseStmt,
            DAG
		}
	})
    export default class App extends Vue {
        get stmts(): Array<Stmt> { return store.stmts }
        get globalZoom(): number { return store.proof.globalZoom }
        get editText(): string { return store.editing ? 'View Mode' : 'Edit Mode' }

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
            this.reader.readAsText(input.files![0])
        }

        addStmt() { store.addStmt() }
        incZoom() { store.setZoom(store.proof.globalZoom + 1) }
        decZoom() { store.setZoom(Math.max(store.proof.globalZoom - 1, 0)) }
        toggleEdit() { store.setEditing(!store.editing) }
	}
</script>

<style>
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
