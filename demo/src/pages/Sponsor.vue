<template>
  <q-page>
    <div :class="($q.platform.is.mobile ? '' : 'q-mx-xl')">

      <div class="markdown-nav-bar shadow-10">
        <div class="title">
          <span class="ellipsis">{{ title }}</span>
        </div>
      </div>

      <q-card class="no-shadow text-grey-8 bg-transparent q-mt-md no-border">
        <q-card-section>
          <div class="text-h6">
            Introduction
          </div>
        </q-card-section>
        <q-card-section>
          My name is Pratik Patel (also known as <a
          href="https://twitter.com/pratikPatel_227"
          target="_blank"
          class="markdown-link"
        >
          @pratik227
        </a>). I noticed myself pulling into programming since 2013, and
          then determined myself to become a skilled and knowledgeable programmer. I started my career by working with
          HTML5, CSS3, AngularJS, Vue.js, Elasticsearch, and Python and eventually introduced myself with
          Quasar-Framework. After getting hands-on experience on Quasar-Framework for 2 years, I got heavily involved in
          creating plugins for Quasar Framework such as QHierarchy-Quasar App Extension.

          <br/>
          <br/>
          I have also written some of the articles on Quasar Framework and many more open source projects. You may have
          heard of some of my articles:

          <br/>

          <li class="q-mt-sm">Adding Charts in Quasar</li>
          <li>Adding Charts in Quasar using UMD (Unified Module Definition)</li>
          <li>Dashboard using Quasar and ECharts</li>
          <li>Adding Charts in Quasar</li>
          <li>
            <a
              href="https://github.com/pratik227/quasar-qhierarchy"
              target="_blank"
              class="markdown-link"
            >
              QHierarchy
            </a>
          </li>
          <li>
            <a
              href="https://github.com/pratik227/quasar-qgrid"
              target="_blank"
              class="markdown-link"
            >
              QGrid
            </a>

          </li>
          <li>
            <a
              href="https://github.com/pratik227/quasar-admin"
              target="_blank"
              class="markdown-link"
            >
              Quasar Admin
            </a></li>
          <li>
            <a
              href="https://github.com/pratik227/quasar-gaming"
              target="_blank"
              class="markdown-link"
            >
              Quasar Gaming
            </a></li>
          <li>
            <a
              href="https://github.com/pratik227/quasar-echarts"
              target="_blank"
              class="markdown-link"
            >
              Quasar Echarts
            </a></li>

          <br/>


          <div class="q-mt-sm">
            Also, I do believe in Free or Open Source Software (FOSS) because sharing of knowledge makes the world a
            better place to live in. Also, for sustaining in the market, there are several ways to sustain FOSS.
          </div>

          <ol class="q-mt-sm">
            <li>Financial backing</li>
            <li>Contributing
              <ol type="a">
                <li>
                  Reporting bugs
                </li>
                <li>
                  Requesting features
                </li>
                <li>
                  Fixing bugs
                </li>
                <li>
                  Adding features
                </li>
                <li>
                  Community involvement
                </li>
              </ol>
            </li>
          </ol>
        </q-card-section>
      </q-card>


      <page-footer></page-footer>

    </div>
  </q-page>
</template>

<script>
import {defineAsyncComponent, defineComponent, ref} from 'vue'

const year = (new Date()).getFullYear()

export default defineComponent({
  name: "Sponsor",
  setup() {
    return {
      title: 'Sponsor',
      year,
      openLink(href) {
        window.open(href)
      }
    }
  },
  components:{
    PageFooter: defineAsyncComponent(() => import('components/PageFooter')),
  }
})
</script>

<style scoped>

</style>
