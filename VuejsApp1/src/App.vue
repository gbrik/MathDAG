<template>
    <div id="app">
		<ProseStmt v-for="stmt, index in data.stmts" :index="index" :key="stmt.id">
		</ProseStmt>
        <div style="position: absolute; left: 0; top: 0; margin: 5px;">
		    <div><button @click="addStmt">Add Statement</button></div>
            <div><button @click="save">Save</button></div>
            <div><input id="fileInput" style="width: 90px;" type="file" accept=".yaml"></input><button @click="load">Load</button></div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator'
    import YAML from 'yaml'
    import $ from 'jquery'
	import Home from '@/components/Home.vue'
	import ProseStmt from '@/components/ProseStmt.vue'
    import { Stmt, Store, data } from '@/model'

	@Component({
		components: {
			ProseStmt
		}
	})
	export default class App extends Vue {
        data: Store = data

        reader: FileReader = new FileReader()

        mounted() {
            this.reader.onload = (event: ProgressEvent) => {
                //@ts-ignore
                var newStmts = YAML.parse(decodeURIComponent(event.target.result))
                var vm = new Vue({ data: { stmts: newStmts } })
                Vue.set(this.data, 'stmts', newStmts)
            }
        }

		addStmt() {
			this.data.stmts.push(new Stmt())
        }

        save() {
            var text = encodeURIComponent(YAML.stringify(data.stmts))
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
</style>
