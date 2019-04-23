<template>
    <button class="bttn" v-bind:class="{ icon: icon, active: active }" v-on="$listeners" @click="toggle">
        <i v-if="icon" class="material-icons">{{icon}}</i>
        <span v-if="text">{{text}}</span>
    </button>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator'

    @Component
    export default class Button extends Vue {
        @Prop(String)
        icon!: string

        @Prop(String)
        text!: string

        @Prop(Boolean)
        value: boolean | undefined

        @Prop(Boolean)
        active!: boolean

        toggle() {
            if (this.value === undefined) return
            this.$emit('input', !this.value)
        }
    }
</script>

<style lang="scss" scoped>
    i.material-icons {
        display: block;
        margin: auto;
        font-size: 24px;
    }

    span {
        display: block;
    }
    
    .bttn {
        margin: 2px;
        background: none;
        border: none;
        box-shadow: 0 0 3px 1px black;
        padding-left: 8px;
        padding-right: 8px;
        vertical-align: top;
    }

    .bttn:active {
        transform: translate(1px, 0px);
        box-shadow: 0 0 2px 1px black;
    }
    
    .bttn.active {
        transform: translate(1px, 0px);
        box-shadow: 0 0 2px 1px black;
    }

    .bttn.icon {
        padding: 0;
    }
</style>