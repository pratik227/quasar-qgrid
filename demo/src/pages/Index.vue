<template>
  <q-page class="">
    <div :class="($q.platform.is.mobile ? '' : 'q-mx-xl')">
      <div class="markdown-nav-bar shadow-10">
        <div class="title">
          <span class="ellipsis">{{ title }}</span>
        </div>
      </div>

      <q-card class="q-mt-sm q-pb-none no-shadow bg-transparent no-border">
        <q-card-section>
          <div class="text-h6">WARNING</div>
          <q-banner inline-actions class="text-white bg-red rounded-borders">
            Please note that the codepen links, in the documentation examples, do not work at this time.
          </q-banner>
        </q-card-section>
        <q-card-section>
          <div class="text-h6">Note</div>
          <q-banner inline-actions class="text-white bg-info rounded-borders">
            Added new Select All and Date Range Functionality.
            <br/>
            For Date Range filter I'm using moment package. So if you want then you need to pass this 2 fields in columns
            <br/>
            filter_type: 'date',<br/>
            format:'DD/MM/YYYY'
          </q-banner>
        </q-card-section>
      </q-card>

      <q-markdown
        no-line-numbers :src="source"
        show-copy
      >
      </q-markdown>

      <json-api-viewer
        title="QGrid API"
        :json="json"
        starting-tab="General"
        no-menu
      />

      <page-footer></page-footer>
    </div>
  </q-page>
</template>

<script>
import {defineComponent, ref, defineAsyncComponent} from 'vue';
import {useRoute} from 'vue-router'
import MarkdownLink from "components/MarkdownLink";
import markdown from '../markdown/qgrid.md'

import {
  mdiCharity
} from '@quasar/extras/mdi-v5'

import 'highlight.js/styles/monokai.css';

const year = (new Date()).getFullYear()

import {QMarkdown} from '@quasar/quasar-ui-qmarkdown/src/QMarkdown.js'
import '@quasar/quasar-ui-qmarkdown/src/QMarkdown.sass'

const columns = [
  {
    name: 'label',
    label: 'Label',
    align: 'left',
    field: 'label',
    // (optional) tell QHierarchy you want this column sortable
    sortable: true
  },
  {
    name: 'Description',
    label: 'Description',
    sortable: true,
    field: 'description',
    align: 'center'
  },
  {
    name: 'note',
    label: 'Note',
    sortable: true,
    field: 'note',
    align: 'left'
  }
];
const data = [
  {
    label: "Node 1",
    description: "Node 1 description",
    note: "Node 1 note",
    // id: 1,
    children: [
      {
        label: "Node 1.1",
        description: "Node 1.1 description",
        note: "Node 1.1 note",
        // id: 2
      },
      {
        label: "Node 1.2",
        description: "Node 1.2 description",
        note: "Node 1.2 note",
        // id: 3,
        children: [
          {
            label: "Node 1.2.1",
            description: "Node 1.2.1 description",
            note: "Node 1.2.1 note",
            // id: 4
          },
          {
            label: "Node 1.2.2",
            description: "Node 1.2.2 description",
            note: "Node 1.2.2 note",
            // id: 5
          }
        ],
      }
    ],
  },
  {
    label: "Node 2",
    description: "Node 2 description",
    note: "Node 2 note",
    // id: 6,
    children: [
      {
        label: "Node 2.1",
        description: "Node 2.1 description",
        note: "Node 2.1 note",
        // id: 7,
        children: [
          {
            label: "Node 2.1.1",
            description: "Node 2.1.1 description",
            note: "Node 2.1.1 note",
            // id: 8
          },
          {
            label: "Node 2.1.2",
            description: "Node 2.1.2 description",
            note: "Node 2.1.2 note",
            // id: 9
          }
        ],
      },
      {
        label: "Node 2.2",
        description: "Node 2.2 description",
        note: "Node 2.2 note",
        // id: 10
      }
    ],
  }
];
const json = {
  "props": {
    "dense": {
      "extends": "dense",
      "type": "boolean",
      "desc": "Dense mode; occupies less space",
      "category": "style"
    },
    "dark": {
      "extends": "dark",
      "type": "boolean",
      "desc": "Notify the component that the background is a dark color",
      "category": "style"
    },
    "flat": {
      "extends": "flat",
      "type": "boolean",
      "desc": "Applies a 'flat' design (no default shadow)",
      "category": "style"
    },
    "bordered": {
      "extends": "bordered",
      "type": "boolean",
      "desc": "Applies a default border to the component",
      "category": "style"
    },
    "square": {
      "extends": "square",
      "type": "boolean",
      "desc": "Removes border-radius so borders are squared",
      "category": "style"
    },
    "separator": {
      "type": "String",
      "desc": "Use a separator/border between rows, columns or all cells",
      "default": "horizontal",
      "values": ["horizontal", "vertical", "cell", "none"],
      "examples": ["cell"],
      "category": "content"
    },
    "selected": {
      "type": "Array",
      "desc": "Keeps the user selection array",
      "examples": [":selected=\"selected\""],
      "category": "Selection"
    }
  },
  "slots": {
    "body": {
      "extends": "default",
      "desc": "Slot to define how a body row looks like; Suggestion: tr + td"
    },
    "header": {
      "extends": "default",
      "desc": "Slot to define how a header row looks like; Suggestion: tr + th"
    }
  },
  "General": {
    "data": {
      "type": "Array",
      "desc": "Rows of data to display",
      "examples": [":data=\"myData\""],
    },
    "columns": {
      "type": "Array",
      "desc": "The column definitions (Array of Objects)",
      "examples": [":columns=\"tableColumns\""],
    },
    "visible_columns": {
      "type": "Array",
      "desc": "Array of Strings defining column names ('name' property of each column from 'columns' prop definitions);",
      "examples": [":visible_columns=\"myCols\"", "[ 'desc', 'carbs', 'protein' ]"],
    },
    "file_name": {
      "type": "String",
      "desc": "Name of the CSV File to export",
      "examples": ["Download"],
    },
    "classes": {
      "type": "String",
      "desc": "For custom classes"
    },
    "csv_download": {
      "type": "boolean",
      "desc": "For enabling CSV File download",
    },
    "columns_filter": {
      "type": "boolean",
      "desc": "For enabling column filter",
    },
    "global_search": {
      "type": "boolean",
      "desc": "For enabling Global Search filter",
    },
    "groupby_filter": {
      "type": "boolean",
      "desc": "For enabling Grouping of columns",
    },
    "draggable": {
      "type": "boolean",
      "desc": "For draggable rows",
    },
    "draggable_columns": {
      "type": "boolean",
      "desc": "For draggable columns",
    },
    "fullscreen": {
      "type": "boolean",
      "desc": "Fullscreen mode",
    },
    "pagination": {
      "type": "Object",
      "desc": "Pagination object; You can use the '.sync' modifier on it if you want to have access on the current pagination in your components; When not using the .sync modifier it simply initializes the pagination on first render",
    },
    "visible-columns": {
      "type": "Array ",
      "desc": "Array of Strings defining column names ('name' property of each column from 'columns' prop definitions); Columns marked as 'required' are not affected by this property",
    }
  },
  "Events": {
    "@selected-val -> function(val)": {
      "desc": "Returns the selected value",
      "examples": ["@selected-val=\"GetSelected($event)\""],
      "category": "Selection"
    }
  }
}
import md from "markdown-it";

let mds_data = "# QGrid\n" +
  "\n" +
  "QGrid is a [Quasar App Extension](https://quasar.dev/app-extensions/introduction).  It allows you to filter data for each column, Drag and Drop Rows and also allows you to filter data using header filters. \n" +
  "## Install\n" +
  "\n" +
  "To add this App Extension to your Quasar application, run the following (in your Quasar app folder):\n" +
  "\n" +
  "```bash\n" +
  "quasar ext add qgrid\n" +
  "```\n" +
  "\n" +
  "# Uninstall\n" +
  "To remove this App Extension from your Quasar application, run the following (in your Quasar app folder):\n" +
  "\n" +
  "```\n" +
  "quasar ext remove qgrid\n" +
  "```\n" +
  "\n" +
  "\n" +
  "# Defining the columns\n" +
  "\n" +
  "\n" +
  "\n" +
  "        [\n" +
  "                    {\n" +
  "                        name: 'name',\n" +
  "                        required: true,\n" +
  "                        label: 'Dessert (100g serving)',\n" +
  "                        align: 'left',\n" +
  "                        field: 'name',\n" +
  "                        sortable: true,\n" +
  "                        filter_type:'select' // Default is text with input filed\n" +
  "                    },\n" +
  "                    {name: 'calories', align: 'center', label: 'Calories', field: 'calories', sortable: true},\n" +
  "                    {name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true},\n" +
  "                    {name: 'carbs', label: 'Carbs (g)', field: 'carbs'},\n" +
  "                    {name: 'protein', label: 'Protein (g)', field: 'protein'},\n" +
  "                    {name: 'sodium', label: 'Sodium (mg)', field: 'sodium'},\n" +
  "                    {\n" +
  "                        name: 'calcium',\n" +
  "                        label: 'Calcium (%)',\n" +
  "                        field: 'calcium',\n" +
  "                        sortable: true,\n" +
  "                        sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)\n" +
  "                    },\n" +
  "                    {\n" +
  "                        name: 'iron',\n" +
  "                        label: 'Iron (%)',\n" +
  "                        field: 'iron',\n" +
  "                        sortable: true,\n" +
  "                        sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)\n" +
  "                    }\n" +
  "                ]\n" +
  "\n" +
  "\n" +
  "# Defining Data\n" +
  "\n" +
  "     [\n" +
  "                    {\n" +
  "                        name: 'Frozen Yogurt',\n" +
  "                        calories: 159,\n" +
  "                        fat: 6.0,\n" +
  "                        carbs: 24,\n" +
  "                        protein: 4.0,\n" +
  "                        sodium: 87,\n" +
  "                        calcium: '14%',\n" +
  "                        iron: '1%'\n" +
  "                    },\n" +
  "                    {\n" +
  "                        name: 'Ice cream sandwich',\n" +
  "                        calories: 237,\n" +
  "                        fat: 9.0,\n" +
  "                        carbs: 37,\n" +
  "                        protein: 4.3,\n" +
  "                        sodium: 129,\n" +
  "                        calcium: '8%',\n" +
  "                        iron: '1%'\n" +
  "                    },\n" +
  "                    {\n" +
  "                        name: 'Eclair',\n" +
  "                        calories: 262,\n" +
  "                        fat: 16.0,\n" +
  "                        carbs: 23,\n" +
  "                        protein: 6.0,\n" +
  "                        sodium: 337,\n" +
  "                        calcium: '6%',\n" +
  "                        iron: '7%'\n" +
  "                    }, //....\n" +
  "      ]\n" +
  "\n" +
  "# Source\n" +
  "\n" +
  "can be found [here](https://github.com/pratik227/quasar-qgrid).\n" +
  "\n" +
  "# Docs\n" +
  "\n" +
  "can be found [here](https://next-quasar-qgrid.netlify.app/).\n" +
  "\n" +
  "# Examples\n" +
  "\n" +
  "can be found [here](https://next-quasar-qgrid.netlify.app/).\n" +
  "\n" +
  "# Demo (source) Project.\n" +
  "\n" +
  "can be found [here](https://github.com/pratik227/quasar-qgrid/tree/next/demo).\n" +
  "\n" +
  "\n" +
  "# Support\n" +
  "\n" +
  "If this helped you in any way, you can contribute to the package's long term survival by supporting me:\n" +
  "\n" +
  "### [💜 Support my open-source work on GitHub](https://github.com/sponsors/pratik227)\n" +
  "\n" +
  "Be sure to check out my sponsor page.\n" +
  "\n" +
  "(GitHub currently **doubles your support**! So if you support me with $10/mo, I will get $20 instead! They're alchemists 😉)\n" +
  "\n" +
  "Thank you so much!!!\n"

export default defineComponent({
  name: 'PageIndex',
  components: {
    MarkdownLink,
    PageFooter: defineAsyncComponent(() => import('components/PageFooter')),
    QMarkdown

  },
  setup(props) {
    const $route = useRoute(), path = $route.path;
    return {
      filterString: 'Sub-Value Test',
      classes: 'bg-deep-purple-10',
      dense: ref(false),
      dark: ref(true),
      default_expand_all: ref(true),
      columns,
      data,
      path,
      title: 'What is QGrid',
      year,
      json,
      md_data: '',
      source: mds_data,
      mdiCharity
    }
  },
  created() {
  }
})
</script>

<style>
.markdown-nav-bar {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 80px;
  padding: 6px;
  background: # # # #0d47a1;
  color: # # # #bbdefb;
  border-radius: 0 0 6px 6px;
}

.markdown-nav-bar .title {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  font-size: 2.4em;
}

.markdown-nav-bar .inner {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
}


.markdown-copyright {
  font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace
}
</style>
