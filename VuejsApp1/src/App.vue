<template>
    <div id="app">
		<ProseStmt v-for="stmt, index in stmts" :id="stmt.id" :key="stmt.id">
		</ProseStmt>
        <div style="position: absolute; left: 0; top: 0; margin: 5px;">
		    <div><button @click="addStmt">Add Statement</button></div>
            <div><button @click="save">Save</button></div>
            <div><input id="fileInput" style="width: 90px;" type="file" accept=".yaml"></input><button @click="load">Load</button></div>
            <div>
                <span style="margin-right: 5px">Global zoom: {{proof.globalZoom}}</span>
                <button @click="proof.globalZoom++">+</button>
                <button @click="proof.globalZoom = Math.max(0, proof.globalZoom - 1)">-</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator'
    import YAML from 'yaml'
    import $ from 'jquery'
	import Home from '@/components/Home.vue'
	import ProseStmt from '@/components/ProseStmt.vue'
    import { Stmt, Proof, data } from '@/model'

	@Component({
		components: {
			ProseStmt
		}
	})
	export default class App extends Vue {
        proof: Proof = data.proof

        get stmts(): Array<Stmt> { return this.proof.stmtIds.map((id) => this.proof.stmts[id])}

        reader: FileReader = new FileReader()

        mounted() {
            this.reader.onload = (event: ProgressEvent) => {
                //@ts-ignore
                var newData = YAML.parse(decodeURIComponent(event.target.result))
                console.log(data, newData)
                Object.assign(data.proof, newData)
            }
        }

        addStmt() {
            var newId = this.proof.stmtIds.length
            this.proof.stmtIds.push(newId)
            Vue.set(this.proof.stmts, newId, new Stmt(newId))
        }

        save() {
            var text = encodeURIComponent(YAML.stringify(data.proof))
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
	}
</script>

<style>
	#app {
		margin: auto;
		max-width: 800px;
		width: 100%;
		padding: 20px;
	}

    .stmts-move {
        transition: transform 1s;
    }
</style>
