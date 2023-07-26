<template>
  <span>
      <q-table v-if="ssr_pagination" :id="uuid" :loading="loading"
               :rows="getFilteredValuesData"
               :columns="final_column"
               :row-key="row_key?row_key:'name'" :class="classes" :visible-columns="visible_columns"
               :separator="separator" :dense="dense" :dark="dark" :flat="flat" :bordered="bordered"
               :square="square" :selection="selection_prop" v-model:selected="selected_prop" :filter="global_filter || filter"
               v-model:pagination="pagination_this"
               @request="onRequest"
      >

        <template v-slot:header="props">

          <q-tr :props="props" v-show="!hasHeaderSlot">
            <q-th auto-width class="ignore-elements" v-if="selection_prop!='none'">
              <q-checkbox
                  v-if="selection_prop=='multiple'"
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
                :class="ignore_cols && ignore_cols.includes(props.cols.indexOf(col))?'ignore-elements':''"
            >
              <div class="row inline">
                <div class="column">
                  <p>{{ col.label }}</p>
                </div>
                <div class="column">
                  <q-btn flat dense size="sm" icon="fa fa-filter" class="q-ml-xs" @click.stop=""
                         v-if="header_filter && col.hasOwnProperty('show_filter') && col['show_filter']">
                    <q-icon name="fas fa-asterisk" color="red" style="font-size: 7px;"
                            v-if="column_options_selected[col.field].length>0"></q-icon>
                    <q-menu>
                      <q-space/>

                      <q-btn dense class="float-right q-ma-sm bg-red text-white" round size="sm" v-close-popup flat
                             icon="close"/>

                      <div class="q-pa-sm q-mt-md">
                        <q-select map-options multiple emit-value filled v-model="column_options_selected[col.field]"
                                  :options="getColumnOptions(col.field)" style="width: 150px !important;">
                          <template v-slot:before-options>
                              <q-item class="sticky-top">
                                <q-item-section avatar>
                                   <q-checkbox
                                       @update:model-value="getColumnOptions(col.field).length == column_options_selected[col.field].length?column_options_selected[col.field]=[]:column_options_selected[col.field] = getColumnOptions(col.field).map(item=> item.value)"
                                       :model-value="getColumnOptions(col.field).length == column_options_selected[col.field].length?true:(column_options_selected[col.field].length==0?false:null)"
                                       color="teal"/>
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label v-html="'Select All'"></q-item-label>
                                </q-item-section>
                              </q-item>
                          </template>
                          <template v-slot:option="scope">
                    <q-item
                        v-bind="scope.itemProps"
                        v-on="scope.itemEvents"
                    >
                      <q-item-section avatar>
                        <q-checkbox v-model="column_options_selected[col.field]" :val="scope.opt.value" color="teal"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-black" v-html="scope.opt.label"></q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                        </q-select>
                      </div>
                      <q-btn color="primary" class="float-right  q-mr-sm q-mb-sm text-capitalize" size="sm"
                             v-close-popup @click="column_options_selected[col.field]=[]" label="Clear"/>
                    </q-menu>
                  </q-btn>
                </div>

              </div>
            </q-th>
          </q-tr>
          <slot name="header" v-bind:cols="props.cols" v-if="hasHeaderSlot">
          </slot>
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
                        :options="getColumnOptions(col.field)" dense>
                <template v-slot:append>
                  <q-icon v-if="column_options_selected[col.field].length>0" name="close"
                          @click.stop="column_options_selected[col.field]=[]" class="cursor-pointer"/>
                </template>
                <template v-slot:before-options>
                              <q-item class="sticky-top">
                                <q-item-section avatar>
                                   <q-checkbox
                                       @update:model-value="getColumnOptions(col.field).length == column_options_selected[col.field].length?column_options_selected[col.field]=[]:column_options_selected[col.field] = getColumnOptions(col.field).map(item=> item.value)"
                                       :model-value="getColumnOptions(col.field).length == column_options_selected[col.field].length?true:(column_options_selected[col.field].length==0?false:null)"
                                       color="teal"/>
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label v-html="'Select All'"></q-item-label>
                                </q-item-section>
                              </q-item>
                          </template>
                          <template v-slot:option="scope">
                    <q-item
                        v-bind="scope.itemProps"
                        v-on="scope.itemEvents"
                    >
                      <q-item-section avatar>
                        <q-checkbox v-model="column_options_selected[col.field]" :val="scope.opt.value" color="teal"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label v-html="scope.opt.label"></q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>

              </q-select>

              <q-input v-if="col.hasOwnProperty('filter_type') && col.filter_type=='date'" dense color="teal"
                       class="q-pl-xs q-pr-xs" filled
                       :model-value="filter_data[col.field].from+(filter_data[col.field].from?'-':'')+filter_data[col.field].to">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="filter_data[col.field]" range>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" class="text-capitalize" color="primary" flat></q-btn>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                  <q-icon name="cancel" v-if="filter_data[col.field].from!=''"
                          @click.stop="filter_data[col.field] = {'from': '', 'to': ''}" class="cursor-pointer"/>
                </template>
              </q-input>

              <q-input v-if="col.hasOwnProperty('filter_type') && col.filter_type=='number_range'" dense color="teal"
                       class="q-pl-xs q-pr-xs" filled
                       :model-value="filter_data[col.field].from+(typeof filter_data[col.field].from!='string'?'-':'')+filter_data[col.field].to">
                <template v-slot:append>
                  <q-icon name="tag" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" cover class="row q-pa-sm"
                                   transition-show="scale"
                                   transition-hide="scale">
                        <q-input label="From"
                                 type="number"
                                 color="teal" v-model.number="filter_data[col.field].from"
                                 class="q-pl-xs q-pr-xs" filled>
                        </q-input>
                        <q-input label="To"
                                 type="number"
                                 color="teal" v-model.number="filter_data[col.field].to"
                                 class="q-pl-xs  q-pr-xs" filled>
                        </q-input>
                    </q-popup-proxy>
                  </q-icon>
                  <q-icon name="cancel" v-if="typeof filter_data[col.field].from!='string'"
                          @click.stop="filter_data[col.field] = {'from': '', 'to': ''}" class="cursor-pointer"/>
                </template>
              </q-input>
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
              >{{ props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen' }}</q-tooltip>
            </q-btn>

        </template>

        <template v-slot:body="props">
          <q-tr :props="props" v-if="!hasDefaultSlot" @click="rowClick(props.row)" :class="ignore_rows && ignore_rows.includes(getFilteredValuesData.indexOf(props.row))?'ignore-elements':''">

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
                     v-if="groupby_filter && selected_group_by_filed.value!='' && col_index==0"/>

              {{ props.row[col.field] }}
            </q-td>
          </q-tr>
          <q-tr v-if="groupby_filter &&  selected_group_by_filed.value!=''" v-show="props.expand" :props="props">
            <q-td :colspan="2">
            <q-table
                :rows="sub_grouped_data[props.row.name]"
                :columns="columns"
                :row-key="row_key?row_key:'name'"
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

        <template v-slot:loading v-if="$slots['loading']">
            <slot name="loading"></slot>
        </template>
      </q-table>
      <q-table v-else :id="uuid" :loading="loading"
               :rows="getFilteredValuesData"
               :columns="final_column"
               :row-key="row_key?row_key:'name'" :class="classes" :visible-columns="visible_columns"
               :separator="separator" :dense="dense" :dark="dark" :flat="flat" :bordered="bordered"
               :square="square" :selection="selection_prop" v-model:selected="selected_prop" :filter="global_filter || filter"
               :pagination="pagination_this"
               @request="onRequest"
      >

        <template v-slot:header="props">

          <q-tr :props="props" v-show="!hasHeaderSlot">
            <q-th auto-width class="ignore-elements" v-if="selection_prop!='none'">
              <q-checkbox
                  v-if="selection_prop=='multiple'"
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
                :class="ignore_cols && ignore_cols.includes(props.cols.indexOf(col))?'ignore-elements':''"
            >
              <div class="row inline">
                <div class="column">
                  <p>{{ col.label }}</p>
                </div>
                <div class="column">
                  <q-btn flat dense size="sm" icon="fa fa-filter" class="q-ml-xs" @click.stop=""
                         v-if="header_filter && col.hasOwnProperty('show_filter') && col['show_filter']">
                    <q-icon name="fas fa-asterisk" color="red" style="font-size: 7px;"
                            v-if="column_options_selected[col.field].length>0"></q-icon>
                    <q-menu>
                      <q-space/>

                      <q-btn dense class="float-right q-ma-sm bg-red text-white" round size="sm" v-close-popup flat
                             icon="close"/>

                      <div class="q-pa-sm q-mt-md">
                        <q-select map-options multiple emit-value filled v-model="column_options_selected[col.field]"
                                  :options="getColumnOptions(col.field)" style="width: 150px !important;">
                          <template v-slot:before-options>
                              <q-item class="sticky-top">
                                <q-item-section avatar>
                                   <q-checkbox
                                       @update:model-value="getColumnOptions(col.field).length == column_options_selected[col.field].length?column_options_selected[col.field]=[]:column_options_selected[col.field] = getColumnOptions(col.field).map(item=> item.value)"
                                       :model-value="getColumnOptions(col.field).length == column_options_selected[col.field].length?true:(column_options_selected[col.field].length==0?false:null)"
                                       color="teal"/>
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label v-html="'Select All'"></q-item-label>
                                </q-item-section>
                              </q-item>
                          </template>
                          <template v-slot:option="scope">
                    <q-item
                        v-bind="scope.itemProps"
                        v-on="scope.itemEvents"
                    >
                      <q-item-section avatar>
                        <q-checkbox v-model="column_options_selected[col.field]" :val="scope.opt.value" color="teal"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-black" v-html="scope.opt.label"></q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                        </q-select>
                      </div>
                      <q-btn color="primary" class="float-right  q-mr-sm q-mb-sm text-capitalize" size="sm"
                             v-close-popup @click="column_options_selected[col.field]=[]" label="Clear"/>
                    </q-menu>
                  </q-btn>
                </div>

              </div>
            </q-th>
          </q-tr>
          <slot name="header" v-bind:cols="props.cols" v-if="hasHeaderSlot">
          </slot>
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
                        :options="getColumnOptions(col.field)" dense>
                <template v-slot:append>
                  <q-icon v-if="column_options_selected[col.field].length>0" name="close"
                          @click.stop="column_options_selected[col.field]=[]" class="cursor-pointer"/>
                </template>
                <template v-slot:before-options>
                              <q-item class="sticky-top">
                                <q-item-section avatar>
                                   <q-checkbox
                                       @update:model-value="getColumnOptions(col.field).length == column_options_selected[col.field].length?column_options_selected[col.field]=[]:column_options_selected[col.field] = getColumnOptions(col.field).map(item=> item.value)"
                                       :model-value="getColumnOptions(col.field).length == column_options_selected[col.field].length?true:(column_options_selected[col.field].length==0?false:null)"
                                       color="teal"/>
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label v-html="'Select All'"></q-item-label>
                                </q-item-section>
                              </q-item>
                          </template>
                          <template v-slot:option="scope">
                    <q-item
                        v-bind="scope.itemProps"
                        v-on="scope.itemEvents"
                    >
                      <q-item-section avatar>
                        <q-checkbox v-model="column_options_selected[col.field]" :val="scope.opt.value" color="teal"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label v-html="scope.opt.label"></q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>

              </q-select>

              <q-input v-if="col.hasOwnProperty('filter_type') && col.filter_type=='date'" dense color="teal"
                       class="q-pl-xs q-pr-xs" filled
                       :model-value="filter_data[col.field].from+(filter_data[col.field].from?'-':'')+filter_data[col.field].to">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="filter_data[col.field]" range>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" class="text-capitalize" color="primary" flat></q-btn>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                  <q-icon name="cancel" v-if="filter_data[col.field].from!=''"
                          @click.stop="filter_data[col.field] = {'from': '', 'to': ''}" class="cursor-pointer"/>
                </template>
              </q-input>

              <q-input v-if="col.hasOwnProperty('filter_type') && col.filter_type=='number_range'" dense color="teal"
                       class="q-pl-xs q-pr-xs" filled
                       :model-value="filter_data[col.field].from+(typeof filter_data[col.field].from!='string'?'-':'')+filter_data[col.field].to">
                <template v-slot:append>
                  <q-icon name="tag" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" cover class="row q-pa-sm"
                                   transition-show="scale"
                                   transition-hide="scale">
                        <q-input label="From"
                                 type="number"
                                 color="teal" v-model.number="filter_data[col.field].from"
                                 class="q-pl-xs q-pr-xs" filled>
                        </q-input>
                        <q-input label="To"
                                 type="number"
                                 color="teal" v-model.number="filter_data[col.field].to"
                                 class="q-pl-xs  q-pr-xs" filled>
                        </q-input>
                    </q-popup-proxy>
                  </q-icon>
                  <q-icon name="cancel" v-if="typeof filter_data[col.field].from!='string'"
                          @click.stop="filter_data[col.field] = {'from': '', 'to': ''}" class="cursor-pointer"/>
                </template>
              </q-input>
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
              >{{ props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen' }}</q-tooltip>
            </q-btn>

        </template>

        <template v-slot:body="props">
          <q-tr :props="props" v-if="!hasDefaultSlot" @click="rowClick(props.row)" :class="ignore_rows && ignore_rows.includes(getFilteredValuesData.indexOf(props.row))?'ignore-elements':''">

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
                     v-if="groupby_filter && selected_group_by_filed.value!='' && col_index==0"/>

              {{ props.row[col.field] }}
            </q-td>
          </q-tr>
          <q-tr v-if="groupby_filter &&  selected_group_by_filed.value!=''" v-show="props.expand" :props="props">
            <q-td :colspan="2">
            <q-table
                :rows="sub_grouped_data[props.row.name]"
                :columns="columns"
                :row-key="row_key?row_key:'name'"
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

        <template v-slot:loading v-if="$slots['loading']">
            <slot name="loading"></slot>
        </template>
      </q-table>
  </span>
</template>

<script>
import {defineComponent, ref, computed} from 'vue';
import Sortable from 'sortablejs';
import moment from 'moment'

import {
  uid
} from 'quasar'
import {exportFile} from 'quasar'

function wrapCsvValue (val, formatFn, row) {
  let formatted = formatFn !== void 0
    ? formatFn(val, row)
    : val

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`
}


export default defineComponent({
  name: "QGrid",
  props: ['data', 'columns', 'file_name', 'csv_download', 'excel_download', 'columns_filter', 'header_filter', 'draggable', 'draggable_columns', 'classes', 'separator', 'dense', 'dark', 'flat', 'bordered', 'square', 'selection', 'selected', 'fullscreen', 'global_search', 'groupby_filter', 'visible_columns', 'pagination', 'loading', 'row_key', 'global_filter','ssr_pagination', 'ignore_rows', 'ignore_cols'],
  setup(props) {

    // onMounted(()=>{
    //   this.Sorting();
    // })

    const pagination_this = computed({
      get: () => props.pagination,
      set: () => {
      },
    });

    return {
      filter_data: ref({}),
      pagination_this,
      uuid: ref(''),
      column_options: ref({}),
      column_options_selected: ref({}),
      filter_flags: ref({}),
      selection_prop: ref(''),
      name: ref(''),
      selected_prop: ref([]),
      filter: ref(''),
      gorupby_option: ref([]),
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
      sub_grouped_data: ref({}),
      sub_grouped_columns: ref([]),
      selected_group_by_filed: ref({"label": 'Group By Field', "value": ''}),
      final_column: ref([])
    }
  },
  mounted() {
    this.Sorting();
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
          if (item[table_columns[i]] == null)
            return true

          if (!self.final_column[i].hasOwnProperty('filter_type') || self.final_column[i].filter_type == 'text') {
            if (table_columns[i] in self.filter_data && item[table_columns[i]].toString().toLowerCase().indexOf(self.filter_data[table_columns[i]].toLowerCase()) == -1) {
              return false;
            }
          }
          if (self.final_column[i].hasOwnProperty('filter_type') && self.final_column[i].filter_type == 'date') {
            let compareDate = moment(item[table_columns[i]], self.final_column[i].format)
            let startDate = moment(self.filter_data[table_columns[i]].from, 'YYYY/MM/DD')
            let endDate = moment(self.filter_data[table_columns[i]].to, 'YYYY/MM/DD')
            // const.js range = moment.range(startDate, endDate);
            if (table_columns[i] in self.filter_data && self.filter_data[table_columns[i]].to && self.filter_data[table_columns[i]].from && !(startDate <= compareDate && compareDate <= endDate)) {
              return false;
            }
          }
          if (self.final_column[i].hasOwnProperty('filter_type') && self.final_column[i].filter_type == 'number_range') {
            if (table_columns[i] in self.filter_data && typeof self.filter_data[table_columns[i]].from!='string' && typeof self.filter_data[table_columns[i]].to!='string' && !(parseFloat(item[table_columns[i]]) >= self.filter_data[table_columns[i]].from && parseFloat(item[table_columns[i]]) <= self.filter_data[table_columns[i]].to)) {
              return false;
            }
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
      if (this.groupby_filter && this.selected_group_by_filed.value != '') {
        let grouped_data = this.groupBy(table_Data, this.selected_group_by_filed.value);
        table_Data = [];
        Object.keys(grouped_data).filter(function (item) {
          table_Data.push({"name": item});
          return item
        });
        this.sub_grouped_data = grouped_data;
      }
      this.$emit("FilteredData", table_Data);
      return table_Data;
    },
    hasDefaultSlot() {
      return this.$slots.hasOwnProperty("body");
    },
    hasHeaderSlot() {
      return this.$slots.hasOwnProperty("header");
    },
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
    // let self = this;
    // self.column_options = {};
    // self.columns.filter(function (item) {
    //     self.column_options[item.field] = [];
    //     self.column_options_selected[item.field] = []
    //     self.filter_flags[item.field] = false;
    //     if (item.hasOwnProperty('grouping') && item.grouping)
    //     {
    //         self.gorupby_option.push({"label": item.label, "value": item.field});
    //     }
    //     return item
    // });
    // self.data.filter(function (item) {
    //     self.columns.filter(function (column) {
    //         if(item[column.field] != null) {
    //           self.column_options[column.field].push({
    //             label: item[column.field].toString(),
    //             value: item[column.field].toString().toLowerCase().replace(/_/g, '_')
    //           })
    //         }
    //     });
    // });
    // self.columns.filter(function (column) {
    //     self.column_options[column.field] = [...new Map(self.column_options[column.field].map(item =>
    //         [item['value'], item])).values()];
    // });
    // this.final_column = this.selected_group_by_filed.value != '' ? this.grouped_column : this.columns;
  },
  methods: {
    onRequest(data) {
      this.$emit("OnRequest", data);
    },
    rowClick(row) {
      this.$emit('row-click', row)
    },
    setColumnsDefinition() {
      let self = this;
      self.column_options = {};
      self.columns.filter(function (item) {
        self.column_options[item.field] = [];
        self.column_options_selected[item.field] = []
        self.filter_flags[item.field] = false;
        if (item.hasOwnProperty('grouping') && item.grouping) {
          self.gorupby_option.push({"label": item.label, "value": item.field});
        }
        return item
      });
      self.data.filter(function (item) {
        self.columns.filter(function (column) {
          if (item[column.field] != null) {
            self.column_options[column.field].push({
              label: item[column.field].toString(),
              value: item[column.field].toString().toLowerCase().replace(/_/g, '_')
            })
          }
        });
      });
      self.columns.filter(function (column) {
        if (column.hasOwnProperty('filter_type') && column.filter_type == 'date') {
          self.filter_data[column.field] = {'from': '', 'to': ''}
        }
        if (column.hasOwnProperty('filter_type') && column.filter_type == 'number_range') {
          self.filter_data[column.field] = {'from': '', 'to': ''}
        }
        self.column_options[column.field] = [...new Map(self.column_options[column.field].map(item =>
            [item['value'], item])).values()];
      });
      this.final_column = this.selected_group_by_filed.value != '' ? this.grouped_column : this.columns;
    },
    getColumnOptions(column) {
      let column_option_simple = [...new Set(this.data.map(item => item[column]))];
      let column_option = []

      column_option_simple.filter(function (col) {
        column_option.push({'label': col.toString(), 'value': col.toString().toLowerCase().replace(/_/g, '_')})
        return col
      })
      return column_option
    },
    exportTable () {
        // naive encoding to csv format
        const content = [this.columns.map(col => wrapCsvValue(col.label))].concat(
          this.data.map(row => this.columns.map(col => wrapCsvValue(
            typeof col.field === 'function'
              ? col.field(row)
              : row[ col.field === void 0 ? col.name : col.field ],
            col.format,
            row
          )).join(','))
        ).join('\r\n')

        const status = exportFile(
          'table-export.csv',
          content,
          'text/csv'
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
      const element2 = dom.querySelector("table thead tr:nth-of-type(1)");
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
          self.$emit('dragged_row', {
            'dragged_row': self.data[(event.oldIndex)],
            'old_index': event.oldIndex,
            'new_index': event.newIndex
          })
          // }
        },
        filter: ".ignore-elements",
        onMove: function (/**Event*/evt, /**Event*/originalEvent) {
          if (evt.related.className.includes('ignore-elements')) {
            return false
          }
        },
      });
      const sortable2 = Sortable.create(element2, {
        filter:'.ignore-elements',
        // preventOnFilter: true,
        disabled: !this.draggable_columns,
        onEnd(event) {
          // if (event.newIndex != 0) {
          let old_index, new_index;
          if (self.selection) {
            old_index = event.oldIndex - 1
            new_index = event.newIndex - 1
          } else {
            old_index = event.oldIndex
            new_index = event.newIndex
          }
          let tmp = self.final_column[old_index];
          self.final_column[old_index] = self.final_column[new_index];
          self.final_column[new_index] = tmp;
          self.$emit('dragged_column', {
            'dragged_column': self.final_column[old_index],
            'old_index': old_index,
            'new_index': new_index
          })
        },
        onMove: function (/**Event*/evt, /**Event*/originalEvent) {
          if (evt.related.className.includes('ignore-elements')) {
            return false
          }
        },
      });
    }
  },
  watch: {
    'selected_group_by_filed': function () {
      // console.log(this.selected_group_by_filed.value)
      this.final_column = this.groupby_filter && this.selected_group_by_filed.value != '' ? this.grouped_column : this.columns;
    },
    'selected_prop': function () {
      this.$emit('selected-val', this.selected_prop)
    },
    'columns': function () {
      this.setColumnsDefinition()
    },
    'selected': function () {
      if (this.selected === undefined) {
        this.selected_prop = [];
      } else {
        this.selected_prop = this.selected;
      }
    }
  },
  emits: ['selected-val', 'dragged_column', 'row-click', 'OnRequest', 'FilteredData']
})
</script>

<style scoped>
</style>
