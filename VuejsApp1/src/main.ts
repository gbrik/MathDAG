import Vue from 'vue'

import Vuex from 'vuex'
Vue.use(Vuex)

import BootstrapVue from 'bootstrap-vue'
import { Layout, Form, ButtonGroup } from 'bootstrap-vue/es/components'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(BootstrapVue)
Vue.use(Layout)
Vue.use(Form)
Vue.use(ButtonGroup)

import App from '@/App.vue'
import DAG from '@/components/DAG.vue'
import DAGEdge from '@/components/DAGEdge.vue'
import DAGStmt from '@/components/DAGStmt.vue'
import Button from '@/components/Button.vue'
import ProseStmt from '@/components/ProseStmt.vue'
import TextEdit from '@/components/TextEdit.vue'
import { vuexStore } from '@/store'

Vue.config.productionTip = true

Vue.component('DAG', DAG)
Vue.component('Button', Button)
Vue.component('DAGEdge', DAGEdge)
Vue.component('DAGStmt', DAGStmt)
Vue.component('ProseStmt', ProseStmt)
Vue.component('TextEdit', TextEdit)

new Vue({
    render: h => h(App),
    store: vuexStore,
}).$mount('#app')
