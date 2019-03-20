<template>
	<div class="containerDiv">
		<textarea v-show="!showingRendered" 
                  v-bind:class="{ expanding: expanding }"
                  v-bind:placeholder="placeholder"
                  @change="onChange" 
                  @keydown="onKeydown"
                  @blur="renderMath"
                  v-model="textValue">
		</textarea>
        <pre v-if="expanding" v-show="!showingRendered"><span>{{textValue}}</span><br/></pre>
		<div class="mathjaxDiv" v-show="showingRendered" @click="focusTextArea">
		</div>
	</div>
</template>

<script lang="ts">
/// <reference types="mathjax" />
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
    import { Key } from 'ts-key-enum'
    import S from 'string'

	@Component
	export default class TextEdit extends Vue {
        @Prop({ default: '' })
        value!: string

        @Prop({ default: null })
        placeholder!: string

        @Prop({ default: false })
        expanding!: boolean

        @Prop({ default: false })
        math!: boolean

        textArea() { return this.$el.querySelector('textarea')! as HTMLTextAreaElement }
        mathJaxContainer() { return this.$el.querySelector('.mathjaxDiv')! as HTMLDivElement }

        showingRendered: boolean = false
        textValue: string = ''

		mounted() {
			this.textValue = this.value
            this.renderMath()
		}

		@Watch('value')
		onValueChanged() {
			if (this.textValue !== this.value) {
				this.textValue = this.value
                this.renderMath()
            }
		}

		onChange(event: Event) {
			this.$emit('input', this.textValue)
        }

        onKeydown(event: KeyboardEvent) {
            if (event.shiftKey && event.key === Key.Enter) {
                this.textArea().blur()
                event.preventDefault()
                return false
            }
        }

        focusTextArea(event: Event) {
            this.showingRendered = false
            Vue.nextTick(() => this.textArea().focus())
        }

        renderMath() {
            if (!this.math) return
            if (this.textValue === '') {
                this.showingRendered = false
                return
            }
            // @ts-ignore
			MathJax.Hub.Queue(() => this.mathJaxContainer().innerText = this.textValue.replace(/[\[\]]/g, ''),
                ['Typeset', MathJax.Hub, this.mathJaxContainer()],
                () => this.showingRendered = true)
        }
	}
</script>

<style lang="scss" scoped>
	textArea, pre {
        margin: 0;
        padding: 5px;
        outline: 0;
        border: 0;

        font: 'Consolas';
        font-size: inherit;

        white-space: pre-wrap;
        word-wrap: break-word;
	}

    textarea {
        overflow: hidden;
        width: 100%;
        height: 100%;
        resize: none;
    }

    textarea.expanding {
        position: absolute;
        top: 0;
        left: 0;
    }

    pre {
        display: block;
        visibility: hidden;
    }

    .containerDiv {
        position: relative;
    }
</style>