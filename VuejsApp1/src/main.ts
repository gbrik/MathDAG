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
import { vuexStore } from '@/model'

Vue.config.productionTip = true

new Vue({
    render: h => h(App),
    store: vuexStore,
}).$mount('#app')
