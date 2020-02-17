<template>
  <q-page class="q-pa-md text-grey-7 shadow-2">
    <q-markdown :src="markdown"/>
    <json-api-viewer
      title="QGrid API"
      :json="json"
      starting-inner-tab="style"
    />

    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">
      <q-btn
        fab
        icon="keyboard_arrow_up"
        :class="{ 'text-black bg-grey-4': $q.dark.isActive, 'text-white bg-primary': !$q.dark.isActive }"
      />
    </q-page-scroller>
  </q-page>
</template>

<script>

    import markdown from '../markdown/qgrid.md'

    export default {
        name: 'PageIndex',
        data() {
            return {
                markdown: markdown,
                json: {
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
                            "desc":"Slot to define how a body row looks like; Suggestion: tr + td"
                        }
                    },
                    "General": {
                        "data": {
                            "type": "Array",
                            "desc":"Rows of data to display",
                            "examples": [":data=\"myData\""],
                        },
                        "columns": {
                            "type": "Array",
                            "desc":"The column definitions (Array of Objects)",
                            "examples": [":columns=\"tableColumns\""],
                        },
                        "file_name": {
                            "type": "String",
                            "desc":"Name of the CSV File to export",
                            "examples": ["Download"],
                        },
                        "classes": {
                            "type": "String",
                            "desc":"For custom classes"
                        },
                        "csv_download": {
                            "type": "boolean",
                            "desc":"For enabling CSV File download",
                        },
                        "columns_filter": {
                            "type": "boolean",
                            "desc":"For enabling column filter",
                        },
                        "global_search": {
                            "type": "boolean",
                            "desc":"For enabling Global Search filter",
                        },
                        "fullscreen": {
                            "type": "boolean",
                            "desc":"Fullscreen mode",
                        }
                    },
                    "Events":{
                        "@selected-val -> function(val)": {
                            "desc": "Returns the selected value",
                            "examples": ["@selected-val=\"GetSelected($event)\""],
                            "category": "Selection"
                        }
                    }
                }

            }
        },
    }
</script>
