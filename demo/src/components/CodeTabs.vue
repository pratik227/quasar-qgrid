<template>
  <div>
    <q-expansion-item
      group="someGroup"
      caption="Code"
      :class="$q.dark.isActive?'bg-dark':'bg-white'"
    >
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="template" v-if="parts.template" label="Template"/>
          <q-tab name="script" v-if="parts.script" label="Script"/>
          <q-tab name="style" v-if="parts.style" label="Style"/>
        </q-tabs>

        <q-separator/>

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel v-if="parts.template" name="template">
            <q-markdown :src="parts.template"/>
          </q-tab-panel>

          <q-tab-panel v-if="parts.script" name="script">
            <q-markdown :src="parts.script"/>
          </q-tab-panel>

          <q-tab-panel v-if="parts.style" name="style">
            <q-markdown :src="parts.style"/>
          </q-tab-panel>

        </q-tab-panels>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script>
    export default {
        name: "CodeTabs",
        data() {
            return {
                tab: 'template',
                parts: {}
            }
        },
        props: ['tagParts'],
        mounted() {
            this.updateParts()
        },
        methods: {
            updateParts() {
                this.parts = {}
                Object.keys(this.tagParts).forEach(key => {
                    if (this.tagParts[key] !== '') {
                        this.parts[key] = '```\n' + this.tagParts[key] + '\n```'
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>
