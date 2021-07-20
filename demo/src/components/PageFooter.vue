<template>
  <q-card class="no-shadow bg-transparent q-mt-md no-border">
    <q-card-section class="text-center">
      <a href="https://github.com/pratik227" target="_blank" rel="noopener">
        <q-avatar size="28px"><img src="https://avatars.githubusercontent.com/u/34883558?v=4"></q-avatar>
      </a>
      <q-btn type="a" rounded dense href="https://github.com/pratik227/quasar-qhierarchy" target="__blank" size="md"
             icon="fab fa-github" flat color="primary"></q-btn>
      <q-btn type="a" rounded dense href="https://twitter.com/pratikPatel_227" target="__blank" icon="fab fa-twitter"
             flat color="primary"></q-btn>
      <q-btn type="a" rounded dense href="https://github.com/sponsors/pratik227" target="__blank" flat color="primary">
        <q-icon :name="mdiCharity"/>
      </q-btn>
    </q-card-section>
    <q-card-section class="text-center q-pb-none">
      <div class="full-width row justify-center items-center q-my-sm">
        <p class="markdown-copyright">CC-BY / MIT License | Copyright &copy; 2020 - {{ year }} Pratik Patel</p>
      </div>
    </q-card-section>
    <q-card-section class="text-center q-pt-none">
      <a href="https://www.netlify.com" class="row justify-center">
        <img src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg" alt="Deploys by Netlify"/>
      </a>
    </q-card-section>
  </q-card>
</template>

<script>
import {defineComponent, ref} from 'vue'

const year = (new Date()).getFullYear()

import {
  mdiCharity
} from '@quasar/extras/mdi-v5'

export default defineComponent({
  name: "PageFooter",
  setup() {
    return {
      year,
      mdiCharity
    }
  }
})
</script>

<style scoped>

</style>
