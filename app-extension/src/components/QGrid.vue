<template>
  <span>
      <q-table :id="uuid"
               :data="getFilteredValuesData"
               :columns="final_column"
               row-key="name" :class="classes"  :visible-columns="visible_columns" :pagination="pagination"
               :separator="separator" :dense="dense" :dark="dark" :flat="flat" :bordered="bordered"
               :square="square" :selection="selection_prop" :selected.sync="selected_prop" :filter="filter" :loading="loading"
      >

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width v-if="selection_prop!='none'">
              <q-checkbox
                      v-if="props.multipleSelect"
                      v-model="props.selected"
                      indeterminate-value="some"
              />
            </q-th>
              <!-- {{props}} -->
            <q-th
                    :props="props"
                    @hover.native.stop
                    v-for="col in props.cols"
                    :key="col.name"
            >
              <div class="row inline">
                <div class="column">
                  <p>{{ col.label }}</p>
                </div>
                <div class="column">
                  <q-btn flat dense size="sm" icon="fa fa-filter" class="q-ml-xs" @click.stop v-if="header_filter">
                    <q-icon name="fas fa-asterisk" color="red" style="font-size: 7px;"
                            v-if="column_options_selected[col.field].length>0"></q-icon>
                    <q-menu>
                      <q-space/>

                      <q-btn dense class="float-right q-ma-sm bg-red text-white" round size="sm" v-close-popup flat
                             icon="close"/>

                      <div class="q-pa-sm q-mt-md">
                        <q-select map-options multiple emit-value filled v-model="column_options_selected[col.field]"
                                  :options="column_options[col.field]" style="width: 150px !important;"/>
                      </div>
                      <q-btn color="primary" class="float-right  q-mr-sm q-mb-sm text-capitalize" size="sm"
                             v-close-popup @click="$set(column_options_selected,col.field,[])" label="Clear"/>
                    </q-menu>
                  </q-btn>
                </div>

              </div>
            </q-th>
          </q-tr>
          <q-tr :props="props" class="ignore-elements" v-if="columns_filter">

            <q-th auto-width v-if="selection_prop!='none'">

            </q-th>
            <q-th :key="col.name" v-for="col in props.cols" style="padding: 0px 0px 0px 0px;">
              <q-input v-if="!col.hasOwnProperty('filter_type') || col.filter_type=='text'" dense color="teal"
                       class="q-pl-xs q-pr-xs" filled v-model="filter_data[col.field]">
                <template v-if="filter_data[col.field]" v-slot:append>
                  <q-icon name="cancel" @click.stop="filter_data[col.field] = ''" class="cursor-pointer"/>
                </template>
              </q-input>

              <q-select v-if="col.hasOwnProperty('filter_type') && col.filter_type=='select'" map-options
                        multiple emit-value filled v-model="column_options_selected[col.field]"
                        :options="column_options[col.field]" dense>
                <template v-slot:append>
                  <q-icon v-if="column_options_selected[col.field].length>0" name="close"
                          @click.stop="$set(column_options_selected,col.field,[])" class="cursor-pointer"/>
                </template>
              </q-select>
            </q-th>
          </q-tr>

        </template>


        <template v-slot:top-right="props" v-if="excel_download || csv_download || fullscreen || global_search">


           <q-input filled v-if="global_search" borderless dense debounce="300" v-model="filter" class="q-mr-md"
                    placeholder="Search">
            <template v-slot:append>
              <q-icon name="search"/>
            </template>
          </q-input>

          <q-btn
                  class="bg-grey-2 q-mr-sm" icon="fas fa-file-excel"
                  no-caps v-if="excel_download"
                  @click="exportTable('xlsx')"
          />

          <q-btn
                  class="bg-primary text-white " icon="fas fa-file-csv"
                  no-caps v-if="csv_download"
                  @click="exportTable('csv')"
          />

          <q-select class="q-mr-sm q-ml-sm" outlined dense
                    v-model="selected_group_by_filed" v-if="groupby_filter"
                    :options="gorupby_option" style="width: 150px;"></q-select>


          <q-btn v-if="fullscreen"
                 flat
                 round
                 class="q-ml-sm"
                 dense
                 :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                 @click="props.toggleFullscreen"

          >
              <q-tooltip
                      :disable="$q.platform.is.mobile"
                      v-close-popup
              >{{props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}}</q-tooltip>
            </q-btn>

        </template>

        <template v-slot:body="props">
          <q-tr :props="props" v-if="!hasDefaultSlot">

            <q-td v-if="selection_prop!='none'">
              <q-checkbox color="primary" v-model="props.selected"/>
            </q-td>
            <q-td
                    v-for="col,col_index in props.cols"
                    :key="col.name"
                    :props="props"
            >
              <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand" class="q-mr-sm"
                     :icon="props.expand ? 'remove' : 'add'"
                     v-if="groupby_filter && selected_group_by_filed['value']!='' && col_index==0"/>

              {{ props.row[col.field] }}
            </q-td>
          </q-tr>
          <q-tr v-if="groupby_filter &&  selected_group_by_filed['value']!=''" v-show="props.expand" :props="props">
            <q-td :colspan="2">
            <q-table
                    :data="sub_grouped_data[props.row.name]"
                    :columns="columns"
                    row-key="name"
                    :pagination="group_pagination"
                    hide-bottom
            >
              <q-tr slot="header" slot-scope="props">
                <q-th v-for="col in props.cols"
                      :key="col.name" v-if="col.field!=selected_group_by_filed"
                      :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
              <template slot="body" slot-scope="props">
                <q-tr :props="props">
                  <q-td :key="col.name" v-if="col.field!=selected_group_by_filed" v-for="col in props.cols"
                        :props="props">
                    {{ props.row[col.field] }}
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-td>
          </q-tr>
          <slot name="body" v-bind:row="props.row" v-if="hasDefaultSlot">
          </slot>
        </template>
        <template v-slot:loading v-if="this.$slots['loading']">
            <slot name="loading"></slot>
        </template>
      </q-table>
  </span>
</template>

<script>
    import Sortable from 'sortablejs';

    import {
        uid
    } from 'quasar'


    import {exportFile} from 'quasar'

    function wrapCsvValue(val, formatFn) {
        let formatted = formatFn !== void 0
            ? formatFn(val)
            : val;

        formatted = formatted === void 0 || formatted === null
            ? ''
            : String(formatted)

        formatted = formatted.split('"').join('""');
        /**
         * Excel accepts \n and \r in strings, but some other CSV parsers do not
         * Uncomment the next two lines to escape new lines
         */
        // .split('\n').join('\\n')
        // .split('\r').join('\\r')

        return `"${formatted}"`
    }

    export default {
        name: "Grid",
        props: ['data', 'columns', 'file_name', 'csv_download', 'excel_download', 'columns_filter', 'header_filter', 'draggable', 'classes', 'separator', 'dense', 'dark', 'flat', 'bordered', 'square', 'selection', 'selected', 'fullscreen', 'global_search', 'groupby_filter','visible_columns','pagination','loading'],
        // props: {
        //   data: {
        //     type: [Array, Object],
        //     default: null
        //   },
        //   // column definition
        //   columns: {
        //     type: [Array, Object],
        //     default: null
        //   },
        //   // column definition
        //   file_name: {
        //     type: String,
        //     default: ''
        //   },
        //   csv_download: {
        //     type: Boolean,
        //     default: () => false
        //   },
        //   excel_download: {
        //     type: Boolean,
        //     default: () => false
        //   },
        //   columns_filter: {
        //     type: Boolean,
        //     default: () => false
        //   },
        //   header_filter: {
        //     type: Boolean,
        //     default: () => false
        //   },
        //   draggable: {
        //     type: Boolean,
        //     default: () => false
        //   },
        //   dense: {
        //     type: Boolean,
        //     default: () => false
        //   },
        //   dark: {
        //     type: Boolean,
        //     default: () => false
        //   },
        //   flat: {
        //     type: Boolean,
        //     default: () => false
        //   },
        //   bordered: {
        //     type: Boolean,
        //     default: () => false
        //   },
        //   square: {
        //     type: Boolean,
        //     default: () => false
        //   },
        //   classes: {
        //     type: String,
        //     default: ''
        //   },
        //   separator: {
        //     type: String,
        //     default: 'horizontal'
        //   },
        // },
        data() {
            return {
                filter_data: {},
                uuid: '',
                column_options: {},
                column_options_selected: {},
                filter_flags: {},
                selection_prop: '',
                name: '',
                selected_prop: [],
                filter: '',
                gorupby_option: [],
                group_pagination: {
                    rowsPerPage: 0
                },
                grouped_column: [
                    {
                        name: 'Grouped',
                        required: true,
                        label: 'Grouped Column Values',
                        align: 'left',
                        field: 'name',
                        sortable: true
                    }
                ],
                sub_grouped_data: {},
                sub_grouped_columns: [],
                selected_group_by_filed: {"label": 'Group By Field', "value": ''},
                final_column: []
            }
        },
        computed: {
            getFilteredData() {
                let self = this;

                let table_columns = this.final_column.map(function (item) {
                    return item.field
                });


                let table_Data = this.data.filter(function (item) {
                    let i = '';
                    for (i = 0; i < table_columns.length; i++) {
                        if (self.filter_data[table_columns[i]] == '')
                            continue;
                        if (item[table_columns[i]]==null)
                           return true

                        if (table_columns[i] in self.filter_data && item[table_columns[i]].toString().toLowerCase().indexOf(self.filter_data[table_columns[i]].toLowerCase()) == -1) {
                            return false;
                        }
                    }
                    return true
                });

                return table_Data
            },
            getFilteredValuesData() {
                let self = this;

                this.column_options_selected = Object.assign({}, this.column_options_selected);
                let table_Data = this.getFilteredData.filter(function (item) {
                    let i = '';
                    for (i = 0; i < self.columns.length; i++) {
                        if (self.column_options_selected[self.columns[i].field].length == 0)
                            continue;

                        if (self.column_options_selected[self.columns[i].field].indexOf(item[self.columns[i].field].toString().toLowerCase()) == -1) {
                            return false;
                        }
                    }
                    return true
                });

                if (this.groupby_filter && this.selected_group_by_filed['value'] != '') {
                    let grouped_data = this.groupBy(table_Data, this.selected_group_by_filed['value']);

                    table_Data = [];

                    Object.keys(grouped_data).filter(function (item) {
                        table_Data.push({"name": item});
                        return item
                    });
                    this.sub_grouped_data = grouped_data;
                }

                return table_Data;
            },
            hasDefaultSlot() {
                return this.$scopedSlots.hasOwnProperty("body");
            },

        },
        mounted() {
            this.Sorting();
        },
        created() {
            this.uuid = uid();

            // console.log(this.selection===undefined);
            if (this.selection === undefined) {
                this.selection_prop = 'none';
            } else {
                this.selection_prop = this.selection;
            }

            if (this.file_name === undefined) {
                this.name = 'Download';
            } else {
                this.name = this.file_name;
            }

            if (this.selected === undefined) {
                this.selected_prop = [];
            } else {
                this.selected_prop = this.selected;
            }
            this.gorupby_option = [{"label": 'Group By Field', "value": ''}];

            this.setColumnsDefinition()
        },
        methods: {
            exportTable(type) {
                // naive encoding to csv format
                const content = [this.columns.map(col => wrapCsvValue(col.label))].concat(
                    this.data.map(row => this.columns.map(col => wrapCsvValue(
                        typeof col.field === 'function'
                            ? col.field(row)
                            : row[col.field === void 0 ? col.name : col.field],
                        col.format
                    )).join(','))
                ).join('\r\n')

                const status = exportFile(
                    this.file_name + '.' + type,
                    content,
                    'text/' + type
                )

                if (status !== true) {
                    this.$q.notify({
                        message: 'Browser denied file download...',
                        color: 'negative',
                        icon: 'warning'
                    })
                }
            },
            groupBy(array, key) {
                const result = {};
                array.forEach(item => {
                    if (!result[item[key]]) {
                        result[item[key]] = []
                    }
                    result[item[key]].push(item)
                });
                return result
            },
            Sorting() {

                let dom = document.getElementById(this.uuid);
                const element = dom.querySelector("table tbody");
                let self = this;
                const sortable = Sortable.create(element, {
                    // filter:'.ignore-elements',
                    // preventOnFilter: true,
                    disabled: !this.draggable,
                    onEnd(event) {
                        // if (event.newIndex != 0) {
                        let tmp = self.data[(event.oldIndex)];
                        self.data[(event.oldIndex)] = self.data[(event.newIndex)];
                        self.data[(event.newIndex)] = tmp;
                        // }
                    },
                    onMove: function (/**Event*/evt, /**Event*/originalEvent) {
                        if (evt.related.className == 'ignore-elements q-tr') {
                            return false
                        }
                    },
                });
            },
            setColumnsDefinition() {

              let self = this;
              self.column_options = {};
              self.columns.filter(function (item) {
                self.column_options[item.field] = [];
                self.$set(self.column_options_selected, item.field, []);
                self.filter_flags[item.field] = false;
                if (item.hasOwnProperty('grouping') && item.grouping)
                {
                    self.gorupby_option.push({"label": item.label, "value": item.field});
                }
                return item
              });

              self.data.filter(function (item) {
                self.columns.filter(function (column) {
                    if(item[column.field] != null) {
                      self.column_options[column.field].push({
                        label: item[column.field].toString(),
                        value: item[column.field].toString().toLowerCase().replace(/_/g, '_')
                      })
                    }
                });
              });

              self.columns.filter(function (column) {
                self.column_options[column.field] = [...new Map(self.column_options[column.field].map(item =>
                    [item['value'], item])).values()];
              });

              this.final_column = this.selected_group_by_filed['value'] != '' ? this.grouped_column : this.columns;
          }
        },
        watch: {
            'selected_group_by_filed': function () {
                this.final_column = this.groupby_filter && this.selected_group_by_filed['value'] != '' ? this.grouped_column : this.columns;
            },
            'selected_prop': function () {
                this.$emit('selected-val', this.selected_prop)
            },
            'columns': function () {

              this.setColumnsDefinition()

            }
        }
    }
</script>

<style scoped>

</style>
