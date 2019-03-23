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
        </div>
        <div class="proseContainer">
		    <ProseStmt v-for="stmt, index in stmts" :id="stmt.id" :key="stmt.id">
		    </ProseStmt>
        </div>
        <div class="dagContainer">

        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator'
    import YAML from 'yaml'
    import $ from 'jquery'
	import ProseStmt from '@/components/ProseStmt.vue'
    import { Stmt, store } from '@/model'

	@Component({
		components: {
			ProseStmt
		}
	})
    export default class App extends Vue {
        get stmts(): Array<Stmt> { return store.stmts }
        get globalZoom(): number { return store.proof.globalZoom }

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
	}
</script>

<style>
	#app {
        display: flex;
        margin: 10px;
	}

    .buttonContainer {
        width: 200px;
    }

    .proseContainer {
        flex-grow: 1;
        width: 0;
    }
    
    .dagContainer {
        flex-grow: 1;
        width: 0;
    }
</style>
