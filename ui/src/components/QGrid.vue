<template>
  <div class="qgrid" :class="rootClass">
    <q-table
      ref="tableRef"
      :id="uuid"
      v-bind="tableBindings()"
      :loading="loading"
      :rows="tableRows"
      :columns="final_column"
      :row-key="effectiveRowKey"
      :class="classes"
      :visible-columns="effectiveVisibleColumns"
      :separator="separator"
      :dense="dense"
      :dark="dark"
      :flat="flat"
      :bordered="bordered"
      :square="square"
      :selection="selectionMode"
      v-model:selected="selected_prop"
      :filter="global_filter || filter"
      @request="onRequest"
    >
      <!-- ============================== header ============================== -->
      <template #header="props">
        <q-tr v-if="!hasHeaderSlot" key="qgrid-header" :props="props" class="qgrid__header-row">
          <q-th v-if="selectionMode !== 'none'" auto-width class="ignore-elements">
            <q-checkbox
              v-if="selectionMode === 'multiple'"
              v-model="props.selected"
              indeterminate-value="some"
              :dense="dense"
              :aria-label="mergedLabels.selectAll"
            />
          </q-th>
          <q-th v-if="hasDetailSlot && !isGrouped" auto-width class="ignore-elements" />
          <q-th
            v-for="(col, colIndex) in props.cols"
            :key="col.name"
            :props="props"
            :data-col="col.name"
            :class="isIgnoredCol(colIndex) ? 'ignore-elements' : ''"
          >
            <slot :name="'header-cell-' + col.name" :col="col" :cols="props.cols" :sort="props.sort">
              <span class="qgrid__label">{{ col.label }}</span>
            </slot>

            <q-btn
              v-if="header_filter && col.show_filter && !isGrouped"
              flat round dense size="sm"
              class="qgrid__header-filter-btn"
              :class="{ 'qgrid__header-filter-btn--active': selectionCount(filterKey(col)) > 0 }"
              :icon="mergedIcons.filter"
              :aria-label="mergedLabels.filterValues + ': ' + col.label"
              @click.stop
            >
              <q-badge
                v-if="selectionCount(filterKey(col)) > 0"
                floating rounded color="negative"
                class="qgrid__badge"
                :label="selectionCount(filterKey(col))"
              />
              <q-menu anchor="bottom right" self="top right" @hide="headerSearch[filterKey(col)] = ''">
                <div class="qgrid__menu" @click.stop>
                  <div class="row items-center no-wrap q-pl-md q-pr-xs q-pt-xs">
                    <div class="qgrid__menu-title ellipsis">{{ col.label }}</div>
                    <q-space />
                    <q-btn flat round dense size="sm" :icon="mergedIcons.close" v-close-popup :aria-label="mergedLabels.close" />
                  </div>
                  <div class="q-px-sm q-pb-xs">
                    <q-input
                      v-model="headerSearch[filterKey(col)]"
                      dense outlined clearable autofocus
                      :placeholder="mergedLabels.filterValues"
                      :dark="dark"
                    >
                      <template #prepend>
                        <q-icon :name="mergedIcons.search" size="18px" />
                      </template>
                    </q-input>
                  </div>
                  <q-item tag="label" dense class="qgrid__menu-item" :dark="dark">
                    <q-item-section side>
                      <q-checkbox
                        dense
                        :model-value="selectAllState(filterKey(col), headerOptions(col))"
                        @update:model-value="toggleAll(filterKey(col), headerOptions(col))"
                      />
                    </q-item-section>
                    <q-item-section class="text-weight-medium">{{ mergedLabels.selectAll }}</q-item-section>
                  </q-item>
                  <q-separator :dark="dark" />
                  <q-virtual-scroll
                    v-if="headerOptions(col).length > 0"
                    class="qgrid__menu-list"
                    :items="headerOptions(col)"
                    :virtual-scroll-item-size="32"
                    v-slot="{ item }"
                  >
                    <q-item :key="item.value" tag="label" dense class="qgrid__menu-item" :dark="dark">
                      <q-item-section side>
                        <q-checkbox
                          dense
                          :model-value="isOptionSelected(filterKey(col), item.value)"
                          @update:model-value="toggleOption(filterKey(col), item.value)"
                        />
                      </q-item-section>
                      <q-item-section class="ellipsis">{{ item.label }}</q-item-section>
                    </q-item>
                  </q-virtual-scroll>
                  <div v-else class="qgrid__menu-empty">{{ mergedLabels.noValues }}</div>
                  <q-separator :dark="dark" />
                  <div class="row justify-end q-pa-xs">
                    <q-btn
                      flat dense no-caps size="sm" color="primary"
                      :label="mergedLabels.clear"
                      v-close-popup
                      @click="clearSelection(filterKey(col))"
                    />
                  </div>
                </div>
              </q-menu>
            </q-btn>
          </q-th>
        </q-tr>
        <slot-proxy v-else key="qgrid-header-slot" :render="$slots.header" :scope="props" />

        <!-- column filters row -->
        <q-tr v-if="columns_filter && showFilterRow" key="qgrid-filters" :props="props" class="ignore-elements qgrid__filter-row">
          <q-th v-if="selectionMode !== 'none'" auto-width />
          <q-th v-if="hasDetailSlot && !isGrouped" auto-width />
          <q-th v-for="col in props.cols" :key="col.name" class="qgrid__filter-cell">
            <q-select
              v-if="filterTypeOf(col) === 'select'"
              v-model="column_options_selected[filterKey(col)]"
              :options="getColumnOptions(filterKey(col))"
              multiple emit-value map-options dense options-dense
              v-bind="filterInputPropsComputed"
              :aria-label="col.label"
            >
              <template #append>
                <q-icon
                  v-if="selectionCount(filterKey(col)) > 0"
                  :name="mergedIcons.cancel"
                  class="cursor-pointer"
                  @click.stop="clearSelection(filterKey(col))"
                />
              </template>
              <template #before-options>
                <q-item tag="label" dense class="sticky-top qgrid__select-all">
                  <q-item-section side>
                    <q-checkbox
                      dense
                      :model-value="selectAllState(filterKey(col), getColumnOptions(filterKey(col)))"
                      @update:model-value="toggleAll(filterKey(col), getColumnOptions(filterKey(col)))"
                    />
                  </q-item-section>
                  <q-item-section>{{ mergedLabels.selectAll }}</q-item-section>
                </q-item>
              </template>
              <template #option="scope">
                <q-item v-bind="scope.itemProps" dense>
                  <q-item-section side>
                    <q-checkbox
                      dense
                      :model-value="scope.selected"
                      @update:model-value="scope.toggleOption(scope.opt)"
                    />
                  </q-item-section>
                  <q-item-section>{{ scope.opt.label }}</q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              v-else-if="filterTypeOf(col) === 'date'"
              dense readonly
              v-bind="filterInputPropsComputed"
              :model-value="dateLabel(filterKey(col))"
              :aria-label="col.label"
            >
              <template #append>
                <q-icon
                  v-if="isFilterActive(col)"
                  :name="mergedIcons.cancel"
                  class="cursor-pointer"
                  @click.stop="resetFilter(col)"
                />
                <q-icon :name="mergedIcons.date" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      range
                      :model-value="filter_data[filterKey(col)]"
                      :dark="dark"
                      @update:model-value="val => setDateFilter(filterKey(col), val)"
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="mergedLabels.close" no-caps color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-else-if="filterTypeOf(col) === 'number_range'"
              dense readonly
              v-bind="filterInputPropsComputed"
              :model-value="numberLabel(filterKey(col))"
              :aria-label="col.label"
            >
              <template #append>
                <q-icon
                  v-if="isFilterActive(col)"
                  :name="mergedIcons.cancel"
                  class="cursor-pointer"
                  @click.stop="resetFilter(col)"
                />
                <q-icon :name="mergedIcons.numberRange" class="cursor-pointer">
                  <q-popup-proxy cover class="row no-wrap q-pa-sm q-gutter-x-sm" transition-show="scale" transition-hide="scale">
                    <q-input
                      v-model.number="filter_data[filterKey(col)].from"
                      type="number"
                      :label="mergedLabels.from"
                      v-bind="filterInputPropsComputed"
                    />
                    <q-input
                      v-model.number="filter_data[filterKey(col)].to"
                      type="number"
                      :label="mergedLabels.to"
                      v-bind="filterInputPropsComputed"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-else
              v-model="filter_data[filterKey(col)]"
              dense
              v-bind="filterInputPropsComputed"
              :debounce="filter_debounce"
              :aria-label="col.label"
            >
              <template v-if="filter_data[filterKey(col)]" #append>
                <q-icon :name="mergedIcons.cancel" class="cursor-pointer" @click.stop="filter_data[filterKey(col)] = ''" />
              </template>
            </q-input>
          </q-th>
        </q-tr>
      </template>

      <!-- ============================== top right ============================== -->
      <template #top-right="props" v-if="hasTopRight">
        <slot
          v-if="hasTopRightSlot"
          name="top_right"
          :excel_download="excel_download"
          :csv_download="csv_download"
          :fullscreen="fullscreen"
          :global_search="global_search"
          :groupby_filter="groupby_filter"
          :toggleFullscreen="props.toggleFullscreen"
          :inFullscreen="props.inFullscreen"
          :exportTable="exportTable"
          :gorupby_option="gorupby_option"
          :selected_group_by_filed="selected_group_by_filed"
          :set_group_by="setGroupBy"
          :filter="filter"
          :set_filter="setGlobalSearch"
          :show_filter_row="showFilterRow"
          :toggle_filter_row="toggleFilterRow"
          :clear_filters="clearFilters"
          :filters_active="filtersActive"
          :visible_columns="effectiveVisibleColumns"
          :toggle_column="toggleColumn"
        />
        <div v-else class="qgrid__toolbar row items-center no-wrap">
          <q-input
            v-if="global_search"
            v-model="filter"
            filled borderless dense
            debounce="300"
            class="qgrid__search q-mr-sm"
            :placeholder="mergedLabels.search"
            :dark="dark"
            :aria-label="mergedLabels.search"
          >
            <template #append>
              <q-icon :name="mergedIcons.search" />
            </template>
          </q-input>

          <q-select
            v-if="groupby_filter"
            v-model="selected_group_by_filed"
            outlined dense options-dense
            class="qgrid__group-select q-mr-sm"
            :options="gorupby_option"
            :dark="dark"
          />

          <q-btn
            v-if="clear_filters && filtersActive"
            flat dense no-caps
            class="q-mr-xs"
            :icon="mergedIcons.clearFilters"
            :label="$q.screen.gt.xs ? mergedLabels.clearFilters : void 0"
            :aria-label="mergedLabels.clearFilters"
            @click="clearFilters"
          />

          <q-btn
            v-if="excel_download"
            unelevated dense no-caps
            class="qgrid__export-btn bg-grey-2 text-grey-9 q-mr-sm"
            :icon="mergedIcons.excel"
            :aria-label="mergedLabels.exportExcel"
            @click="exportTable('xlsx')"
          >
            <q-tooltip :disable="$q.platform.is.mobile">{{ mergedLabels.exportExcel }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="csv_download"
            unelevated dense no-caps
            class="qgrid__export-btn bg-primary text-white"
            :icon="mergedIcons.csv"
            :aria-label="mergedLabels.exportCsv"
            @click="exportTable('csv')"
          >
            <q-tooltip :disable="$q.platform.is.mobile">{{ mergedLabels.exportCsv }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="column_chooser"
            flat round dense
            class="q-ml-sm"
            :icon="mergedIcons.columns"
            :aria-label="mergedLabels.columns"
          >
            <q-tooltip :disable="$q.platform.is.mobile">{{ mergedLabels.columns }}</q-tooltip>
            <q-menu anchor="bottom right" self="top right">
              <q-list dense class="qgrid__menu" :dark="dark">
                <q-item-label header class="qgrid__menu-title">{{ mergedLabels.columns }}</q-item-label>
                <q-item
                  v-for="col in orderedColumns"
                  :key="col.name"
                  tag="label"
                  dense
                  :disable="col.required === true"
                  class="qgrid__menu-item"
                >
                  <q-item-section side>
                    <q-checkbox
                      dense
                      :model-value="isColumnVisible(col)"
                      :disable="col.required === true"
                      @update:model-value="toggleColumn(col)"
                    />
                  </q-item-section>
                  <q-item-section>{{ col.label }}</q-item-section>
                </q-item>
                <q-separator :dark="dark" />
                <q-item clickable dense class="text-primary" @click="showAllColumns">
                  <q-item-section>{{ mergedLabels.showAllColumns }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn
            v-if="fullscreen"
            flat round dense
            class="q-ml-sm"
            :icon="props.inFullscreen ? mergedIcons.fullscreenExit : mergedIcons.fullscreen"
            :aria-label="props.inFullscreen ? mergedLabels.exitFullscreen : mergedLabels.fullscreen"
            @click="props.toggleFullscreen"
          >
            <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
              {{ props.inFullscreen ? mergedLabels.exitFullscreen : mergedLabels.fullscreen }}
            </q-tooltip>
          </q-btn>

          <q-btn
            v-if="columns_filter && columns_filter_toggle"
            flat round dense
            class="q-ml-sm"
            :icon="showFilterRow ? mergedIcons.filterRowOff : mergedIcons.filterRowOn"
            :aria-label="showFilterRow ? mergedLabels.hideFilters : mergedLabels.showFilters"
            @click="toggleFilterRow"
          >
            <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
              {{ showFilterRow ? mergedLabels.hideFilters : mergedLabels.showFilters }}
            </q-tooltip>
          </q-btn>
        </div>
      </template>

      <!-- ============================== body ============================== -->
      <template #body="props">
        <q-tr
          v-if="!hasDefaultSlot"
          :key="props.key + ':row'"
          :props="props"
          class="qgrid__row"
          :class="rowClass(props.row)"
          @click="rowClick(props.row, $event, props.pageIndex)"
        >
          <q-td v-if="selectionMode !== 'none'" auto-width>
            <q-checkbox v-model="props.selected" color="primary" :dense="dense" />
          </q-td>
          <q-td v-if="hasDetailSlot && !isGrouped" auto-width>
            <q-btn
              flat round dense size="sm"
              :icon="props.expand ? mergedIcons.detailOpen : mergedIcons.detailClosed"
              :aria-label="props.expand ? mergedLabels.collapse : mergedLabels.expand"
              :aria-expanded="props.expand ? 'true' : 'false'"
              @click.stop="props.expand = !props.expand"
            />
          </q-td>
          <q-td v-for="(col, colIndex) in props.cols" :key="col.name" :props="props">
            <template v-if="isGrouped && colIndex === 0">
              <q-btn
                size="sm" color="accent" round dense
                class="q-mr-sm"
                :icon="props.expand ? mergedIcons.collapse : mergedIcons.expand"
                :aria-label="props.expand ? mergedLabels.collapse : mergedLabels.expand"
                @click.stop="props.expand = !props.expand"
              />
              <span class="qgrid__group-name">{{ props.row.name === '' ? '—' : props.row.name }}</span>
              <q-badge rounded class="qgrid__group-count q-ml-sm" :label="props.row.__qgrid_count" />
            </template>
            <slot
              v-else
              :name="'body-cell-' + col.name"
              :row="props.row"
              :col="col"
              :value="col.value"
              :key-value="props.key"
              :page-index="props.pageIndex"
            >{{ cellText(col.value) }}</slot>

            <q-popup-edit
              v-if="col.editable && !isGrouped"
              :model-value="getRawValue(props.row, col)"
              :validate="val => validateCell(col, val, props.row)"
              :buttons="col.edit_buttons === true"
              v-slot="scope"
              @save="(val, initial) => onCellSave(props.row, col, val, initial)"
              @hide="editError = ''"
            >
              <q-select
                v-if="col.edit_type === 'select'"
                v-model="scope.value"
                :options="col.edit_options || getColumnOptions(filterKey(col)).map(o => o.label)"
                dense autofocus options-dense emit-value map-options
                :error="editError !== ''"
                :error-message="editError"
                @update:model-value="scope.set"
              />
              <q-input
                v-else-if="col.edit_type === 'number'"
                v-model.number="scope.value"
                type="number"
                dense autofocus
                :error="editError !== ''"
                :error-message="editError"
                @keyup.enter="scope.set"
              />
              <q-input
                v-else
                v-model="scope.value"
                dense autofocus
                :type="col.edit_type === 'textarea' ? 'textarea' : 'text'"
                :error="editError !== ''"
                :error-message="editError"
                @keyup.enter.stop="col.edit_type === 'textarea' ? void 0 : scope.set()"
              />
            </q-popup-edit>
          </q-td>
        </q-tr>
        <slot-proxy v-else :key="props.key + ':slot'" :render="$slots.body" :scope="props" />

        <!-- grouped rows -->
        <q-tr v-if="isGrouped" :key="props.key + ':group'" v-show="props.expand" :props="props" class="qgrid__static-row qgrid__group-detail ignore-elements">
          <q-td :colspan="fullColspan(props.cols)" class="q-pa-none">
            <q-table
              v-if="props.expand"
              flat
              hide-bottom
              :dense="dense"
              :dark="dark"
              :rows="groupRowsOf(props.row.name)"
              :columns="subColumns"
              :row-key="row_key || 'name'"
              :pagination="group_pagination"
            />
          </q-td>
        </q-tr>

        <!-- master / detail -->
        <q-tr v-else-if="hasDetailSlot" :key="props.key + ':detail'" v-show="props.expand" :props="props" class="qgrid__static-row qgrid__detail-row ignore-elements">
          <q-td :colspan="fullColspan(props.cols)">
            <slot v-if="props.expand" name="detail" :row="props.row" :cols="props.cols" :key-value="props.key" :page-index="props.pageIndex" />
          </q-td>
        </q-tr>
      </template>

      <!-- ============================== aggregates ============================== -->
      <template #bottom-row="props" v-if="hasAggregates && !isGrouped && !$slots['bottom-row']">
        <q-tr class="qgrid__static-row qgrid__aggregate-row ignore-elements">
          <q-td v-if="selectionMode !== 'none'" auto-width />
          <q-td v-if="hasDetailSlot && !isGrouped" auto-width />
          <q-td v-for="col in props.cols" :key="col.name" :class="'text-' + (col.align || 'right')">
            <template v-if="col.aggregate !== void 0">
              <span class="qgrid__agg-label">{{ aggregateLabel(col) }}</span>
              <span class="qgrid__agg-value">{{ aggregateText(col) }}</span>
            </template>
          </q-td>
        </q-tr>
      </template>

      <template #loading v-if="$slots.loading">
        <slot name="loading" />
      </template>

      <!-- any other QTable slot (top-left, no-data, pagination, bottom, top-row...) -->
      <template v-for="name in forwardedSlots" :key="name" #[name]="scope">
        <slot :name="name" v-bind="scope || {}" />
      </template>
    </q-table>
  </div>
</template>

<script>
import {
  defineComponent, ref, reactive, computed, watch, effectScope,
  onMounted, onBeforeUnmount, onUpdated, nextTick
} from 'vue'
import { uid, exportFile, useQuasar } from 'quasar'

import {
  GROUP_FILTER_KEY, fieldKey, getRawValue, filterTypeOf, normalizeColumn, buildOptions,
  normalizeDateRange, isFilterValueActive, compileColumnFilters, compileSelectFilters,
  applyPredicates, groupRows, aggregate, formatAggregate, moveItem, toCsv, toNumber
} from './qgrid-utils.js'
import { toXlsx, XLSX_MIME } from './qgrid-xlsx.js'
import ICONS from './qgrid-icons.js'

const DEFAULT_LABELS = {
  search: 'Search',
  selectAll: 'Select All',
  clear: 'Clear',
  close: 'Close',
  groupBy: 'Group By Field',
  groupedColumn: 'Grouped Column Values',
  exportCsv: 'Export CSV',
  exportExcel: 'Export Excel',
  fullscreen: 'Toggle Fullscreen',
  exitFullscreen: 'Exit Fullscreen',
  showFilters: 'Show Filters',
  hideFilters: 'Hide Filters',
  columns: 'Columns',
  showAllColumns: 'Show all columns',
  clearFilters: 'Clear filters',
  filterValues: 'Search values',
  noValues: 'No values',
  from: 'From',
  to: 'To',
  expand: 'Expand',
  collapse: 'Collapse',
  downloadDenied: 'Browser denied file download...',
  sum: 'Sum',
  avg: 'Avg',
  min: 'Min',
  max: 'Max',
  count: 'Count',
  total: 'Total'
}

const STATE_VERSION = 1

// QTable slots QGrid renders itself (everything else is forwarded as-is)
const OWN_SLOTS = ['header', 'body', 'top_right', 'top-right', 'loading', 'detail', 'bottom-row']

// renders a slot with the *original* QTable scope object, so getters/setters
// like `props.selected` / `props.expand` keep working inside user slots
const SlotProxy = props => props.render(props.scope)
SlotProxy.props = ['render', 'scope']

export default defineComponent({
  name: 'QGrid',

  components: { SlotProxy },

  inheritAttrs: false,

  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    row_key: { type: [String, Function], default: 'name' },
    file_name: String,
    csv_download: Boolean,
    excel_download: Boolean,
    columns_filter: Boolean,
    columns_filter_toggle: Boolean,
    filter_input_props: Object,
    filter_debounce: { type: [Number, String], default: 0 },
    header_filter: Boolean,
    draggable: Boolean,
    draggable_columns: Boolean,
    ignore_rows: Array,
    ignore_cols: Array,
    classes: [String, Array, Object],
    separator: String,
    dense: Boolean,
    dark: { type: Boolean, default: null },
    flat: Boolean,
    bordered: Boolean,
    square: Boolean,
    selection: { type: String, default: 'none' },
    selected: Array,
    fullscreen: Boolean,
    global_search: Boolean,
    global_filter: [String, Object],
    groupby_filter: Boolean,
    visible_columns: Array,
    pagination: Object,
    ssr_pagination: Boolean,
    loading: Boolean,
    // v1.1+
    column_chooser: Boolean,
    clear_filters: Boolean,
    server_side_filters: Boolean,
    virtual_scroll: Boolean,
    sticky_header: Boolean,
    height: String,
    state_key: String,
    labels: Object,
    icons: Object
  },

  emits: [
    'selected-val', 'update:selected', 'dragged_column', 'dragged_row', 'row-click',
    'OnRequest', 'FilteredData', 'update:pagination', 'update:visible_columns',
    'cell-edit', 'state-change'
  ],

  setup (props, { slots, emit, attrs }) {
    const $q = useQuasar()
    const scope = effectScope()
    const tableRef = ref(null)
    const uuid = uid()

    // bumped on internal in-place mutations (drag, edit) so non-reactive data still refreshes
    const dataVersion = ref(0)

    const mergedLabels = computed(() => Object.assign({}, DEFAULT_LABELS, props.labels))
    const mergedIcons = computed(() => Object.assign({}, ICONS, props.icons))
    const selectionMode = computed(() => props.selection || 'none')

    const hasHeaderSlot = computed(() => slots.header !== void 0)
    const hasDefaultSlot = computed(() => slots.body !== void 0)
    const hasTopRightSlot = computed(() => slots.top_right !== void 0)
    const hasDetailSlot = computed(() => slots.detail !== void 0)
    const forwardedSlots = computed(() => Object.keys(slots).filter(name =>
      OWN_SLOTS.indexOf(name) === -1 && name.indexOf('body-cell-') !== 0 && name.indexOf('header-cell-') !== 0
    ))

    /* ------------------------------------------------------------ columns */

    const normalizedColumns = computed(() => (props.columns || []).map(normalizeColumn))
    const columnOrder = ref(null)

    const orderedColumns = computed(() => {
      const cols = normalizedColumns.value
      const order = columnOrder.value
      if (order === null) return cols
      const byName = new Map(cols.map(col => [col.name, col]))
      const out = []
      order.forEach(name => {
        const col = byName.get(name)
        if (col !== void 0) {
          out.push(col)
          byName.delete(name)
        }
      })
      byName.forEach(col => out.push(col))
      return out
    })

    const columnsByKey = computed(() => {
      const map = Object.create(null)
      orderedColumns.value.forEach(col => { map[fieldKey(col)] = col })
      return map
    })

    /* ----------------------------------------------------------- grouping */

    const groupByPlaceholder = { label: DEFAULT_LABELS.groupBy, value: '' }
    const selected_group_by_filed = ref(groupByPlaceholder)

    const gorupby_option = computed(() =>
      [{ label: mergedLabels.value.groupBy, value: '' }].concat(
        orderedColumns.value
          .filter(col => col.grouping === true)
          .map(col => ({ label: col.label, value: col.field }))
      )
    )

    const groupField = computed(() =>
      props.groupby_filter && selected_group_by_filed.value && selected_group_by_filed.value.value
        ? selected_group_by_filed.value.value
        : ''
    )
    const isGrouped = computed(() => groupField.value !== '')
    const groupColumn = computed(() =>
      orderedColumns.value.find(col => col.field === groupField.value) || { name: groupField.value, field: groupField.value }
    )

    const groupedColumnDef = computed(() => ({
      name: 'Grouped',
      required: true,
      label: mergedLabels.value.groupedColumn,
      align: 'left',
      field: 'name',
      sortable: true,
      filter_key: GROUP_FILTER_KEY
    }))

    // the columns handed to QTable (name kept for backwards compatibility)
    const final_column = computed(() => isGrouped.value ? [groupedColumnDef.value] : orderedColumns.value)

    const subColumns = computed(() =>
      orderedColumns.value.filter(col => col.field !== groupField.value && isColumnVisible(col))
    )

    function setGroupBy (field) {
      const opt = gorupby_option.value.find(o => o.value === field)
      selected_group_by_filed.value = opt || groupByPlaceholder
    }

    /* ------------------------------------------------------- filter state */

    const filter_data = reactive({})
    const column_options_selected = reactive({})
    const headerSearch = reactive({})
    const filter = ref('')
    const showFilterRow = ref(true)

    function emptyFilterValue (col) {
      const type = filterTypeOf(col)
      return type === 'date' || type === 'number_range' ? { from: '', to: '' } : ''
    }

    function initFilterState () {
      orderedColumns.value.forEach(col => {
        const key = fieldKey(col)
        const type = filterTypeOf(col)
        const current = filter_data[key]
        if ((type === 'date' || type === 'number_range') && (current === null || typeof current !== 'object')) {
          filter_data[key] = type === 'date' ? normalizeDateRange(current) : { from: '', to: '' }
        }
        else if (current === void 0) {
          filter_data[key] = ''
        }
        if (Array.isArray(column_options_selected[key]) === false) column_options_selected[key] = []
        if (headerSearch[key] === void 0) headerSearch[key] = ''
      })
      if (filter_data[GROUP_FILTER_KEY] === void 0) filter_data[GROUP_FILTER_KEY] = ''
    }

    initFilterState()

    watch(() => props.columns, () => {
      columnOrder.value = null
      initFilterState()
    })
    watch(normalizedColumns, initFilterState)

    const filterKey = col => fieldKey(col)
    const isFilterActive = col => isFilterValueActive(col, filter_data[fieldKey(col)])
    const resetFilter = col => { filter_data[fieldKey(col)] = emptyFilterValue(col) }

    function setDateFilter (key, val) {
      filter_data[key] = normalizeDateRange(val)
    }

    function dateLabel (key) {
      const range = normalizeDateRange(filter_data[key])
      if (range.from === '') return ''
      return range.from === range.to ? range.from : range.from + ' - ' + range.to
    }

    function numberLabel (key) {
      const val = filter_data[key] || {}
      const hasFrom = isNaN(toNumber(val.from)) === false
      const hasTo = isNaN(toNumber(val.to)) === false
      if (hasFrom && hasTo) return val.from + ' - ' + val.to
      if (hasFrom) return '≥ ' + val.from
      if (hasTo) return '≤ ' + val.to
      return ''
    }

    const filterInputPropsComputed = computed(() => {
      const styleProps = ['filled', 'outlined', 'standout', 'borderless']
      const custom = props.filter_input_props
      const hasStyle = custom && styleProps.some(p => p in custom)
      return Object.assign(hasStyle ? {} : { filled: true }, { color: 'teal', dark: props.dark }, custom)
    })

    function toggleFilterRow () {
      showFilterRow.value = !showFilterRow.value
    }

    function setGlobalSearch (val) {
      filter.value = val === null || val === void 0 ? '' : val
    }

    /* ------------------------------------------------------ select values */

    // lazily created, cached per column; stopped together on unmount
    const optionComputeds = new Map()
    const selectedSetComputeds = new Map()

    function getColumnOptions (key) {
      let c = optionComputeds.get(key)
      if (c === void 0) {
        c = scope.run(() => computed(() => {
          // eslint-disable-next-line no-unused-expressions
          dataVersion.value
          const col = columnsByKey.value[key]
          return col === void 0 ? [] : buildOptions(props.data || [], col)
        }))
        optionComputeds.set(key, c)
      }
      return c.value
    }

    function selectedSet (key) {
      let c = selectedSetComputeds.get(key)
      if (c === void 0) {
        c = scope.run(() => computed(() => new Set(column_options_selected[key] || [])))
        selectedSetComputeds.set(key, c)
      }
      return c.value
    }

    function headerOptions (col) {
      const key = fieldKey(col)
      const options = getColumnOptions(key)
      const needle = (headerSearch[key] || '').toLowerCase()
      return needle === '' ? options : options.filter(opt => opt.label.toLowerCase().indexOf(needle) !== -1)
    }

    const selectionCount = key => (column_options_selected[key] || []).length
    const isOptionSelected = (key, value) => selectedSet(key).has(value)

    function toggleOption (key, value) {
      const current = column_options_selected[key] || []
      column_options_selected[key] = selectedSet(key).has(value)
        ? current.filter(v => v !== value)
        : current.concat(value)
    }

    function selectAllState (key, options) {
      if (options.length === 0) return false
      const set = selectedSet(key)
      let count = 0
      for (let i = 0; i < options.length; i++) {
        if (set.has(options[i].value)) count++
      }
      return count === 0 ? false : (count === options.length ? true : null)
    }

    function toggleAll (key, options) {
      const set = selectedSet(key)
      const values = options.map(opt => opt.value)
      if (selectAllState(key, options) === true) {
        const remove = new Set(values)
        column_options_selected[key] = (column_options_selected[key] || []).filter(v => remove.has(v) === false)
      }
      else {
        column_options_selected[key] = (column_options_selected[key] || []).concat(values.filter(v => set.has(v) === false))
      }
    }

    function clearSelection (key) {
      column_options_selected[key] = []
    }

    /* ------------------------------------------------------ data pipeline */

    let dateCaches = Object.create(null)
    const getDateCache = key => dateCaches[key] || (dateCaches[key] = new Map())
    watch(() => props.data, () => { dateCaches = Object.create(null) })

    const clientFiltering = computed(() => props.server_side_filters !== true)

    const columnPredicates = computed(() =>
      clientFiltering.value ? compileColumnFilters(orderedColumns.value, filter_data, getDateCache) : []
    )
    const selectPredicates = computed(() =>
      clientFiltering.value ? compileSelectFilters(orderedColumns.value, column_options_selected) : []
    )

    // text / date / number range filters (name kept for backwards compatibility)
    const getFilteredData = computed(() => applyPredicates(props.data || [], columnPredicates.value))

    // + select / header value filters (name kept for backwards compatibility)
    const getFilteredValuesData = computed(() => {
      const rows = applyPredicates(getFilteredData.value, selectPredicates.value)
      // after an in-place mutation of a non-reactive array, hand QTable a new reference
      return dataVersion.value > 0 && rows === props.data ? rows.slice() : rows
    })

    const groups = computed(() =>
      isGrouped.value ? groupRows(getFilteredValuesData.value, groupColumn.value) : null
    )

    const tableRows = computed(() => {
      if (groups.value === null) return getFilteredValuesData.value
      const needle = String(filter_data[GROUP_FILTER_KEY] || '').toLowerCase()
      const out = []
      groups.value.forEach((rows, name) => {
        if (needle === '' || name.toLowerCase().indexOf(needle) !== -1) {
          out.push({ name, __qgrid_count: rows.length })
        }
      })
      return out
    })

    const groupRowsOf = name => (groups.value !== null && groups.value.get(name)) || []
    const effectiveRowKey = computed(() => isGrouped.value ? 'name' : (props.row_key || 'name'))
    const group_pagination = { rowsPerPage: 0 }

    watch(
      () => [tableRows.value, tableRows.value.length],
      () => { emit('FilteredData', tableRows.value) },
      { immediate: true }
    )

    const filtersActive = computed(() => {
      if (filter.value) return true
      return orderedColumns.value.some(col =>
        isFilterValueActive(col, filter_data[fieldKey(col)]) || selectionCount(fieldKey(col)) > 0
      ) || Boolean(filter_data[GROUP_FILTER_KEY])
    })

    function clearFilters () {
      orderedColumns.value.forEach(col => {
        const key = fieldKey(col)
        filter_data[key] = emptyFilterValue(col)
        column_options_selected[key] = []
      })
      filter_data[GROUP_FILTER_KEY] = ''
      filter.value = ''
    }

    /** Serializable description of the active filters (sent with OnRequest). */
    function getFilterModel () {
      const model = {}
      orderedColumns.value.forEach(col => {
        const key = fieldKey(col)
        const type = filterTypeOf(col)
        const val = filter_data[key]
        if (type !== 'select' && isFilterValueActive(col, val)) {
          model[key] = {
            type,
            value: type === 'date'
              ? normalizeDateRange(val)
              : (type === 'number_range' ? { from: val.from, to: val.to } : val)
          }
        }
        const sel = column_options_selected[key]
        if (sel && sel.length > 0) {
          model[key] = Object.assign(model[key] || { type }, { values: sel.slice() })
        }
      })
      return model
    }

    const ignoredRowSet = computed(() => {
      const list = props.ignore_rows
      if (!list || list.length === 0) return null
      const rows = getFilteredValuesData.value
      const set = new Set()
      list.forEach(i => { if (rows[i] !== void 0) set.add(rows[i]) })
      return set
    })

    const rowClass = row => ignoredRowSet.value !== null && ignoredRowSet.value.has(row) ? 'ignore-elements' : ''
    const isIgnoredCol = index => Boolean(props.ignore_cols && props.ignore_cols.indexOf(index) !== -1)

    const fullColspan = cols =>
      cols.length + (selectionMode.value !== 'none' ? 1 : 0) + (hasDetailSlot.value && !isGrouped.value ? 1 : 0)

    function cellText (val) {
      if (val === null || val === void 0) return ''
      return Array.isArray(val) ? val.join(', ') : val
    }

    /* --------------------------------------------------- visible columns */

    const innerVisibleColumns = ref(null)
    watch(() => props.visible_columns, () => { innerVisibleColumns.value = null })

    const effectiveVisibleColumns = computed(() =>
      innerVisibleColumns.value !== null ? innerVisibleColumns.value : props.visible_columns
    )

    function isColumnVisible (col) {
      const visible = effectiveVisibleColumns.value
      return col.required === true || !visible || visible.indexOf(col.name) !== -1
    }

    function setVisibleColumns (names) {
      innerVisibleColumns.value = names
      emit('update:visible_columns', names)
    }

    function toggleColumn (col) {
      const current = effectiveVisibleColumns.value || orderedColumns.value.map(c => c.name)
      setVisibleColumns(current.indexOf(col.name) !== -1
        ? current.filter(name => name !== col.name)
        : current.concat(col.name))
    }

    function showAllColumns () {
      setVisibleColumns(orderedColumns.value.map(c => c.name))
    }

    /* ------------------------------------------------------- pagination */

    const innerPagination = ref(Object.assign(props.virtual_scroll ? { rowsPerPage: 0 } : {}, props.pagination))

    watch(() => props.pagination, val => {
      if (props.ssr_pagination !== true && val) {
        innerPagination.value = Object.assign({}, innerPagination.value, val)
      }
    }, { deep: true })

    function onPaginationUpdate (val) {
      if (props.ssr_pagination !== true) innerPagination.value = val
      emit('update:pagination', val)
    }

    // all $attrs are forwarded to QTable, so any QTable prop / event works on QGrid
    function tableBindings () {
      const bindings = Object.assign({}, attrs, {
        pagination: props.ssr_pagination === true ? props.pagination : innerPagination.value,
        'onUpdate:pagination': onPaginationUpdate
      })
      if (props.virtual_scroll === true) {
        bindings.virtualScroll = true
        if (attrs['rows-per-page-options'] === void 0 && attrs.rowsPerPageOptions === void 0) {
          bindings.rowsPerPageOptions = [0]
        }
      }
      if (props.height) {
        bindings.style = [attrs.style, { height: props.height }]
      }
      return bindings
    }

    const rootClass = computed(() => ({
      'qgrid--sticky-header': props.sticky_header === true || props.virtual_scroll === true,
      'qgrid--dense': props.dense === true
    }))

    const hasTopRight = computed(() =>
      props.excel_download || props.csv_download || props.fullscreen || props.global_search ||
      props.groupby_filter || props.column_chooser || props.clear_filters ||
      (props.columns_filter && props.columns_filter_toggle) || hasTopRightSlot.value
    )

    /* -------------------------------------------------------- selection */

    const selected_prop = ref(props.selected || [])
    watch(() => props.selected, val => { selected_prop.value = val || [] })
    watch(selected_prop, val => {
      emit('selected-val', val)
      emit('update:selected', val)
    })

    /* ----------------------------------------------------------- events */

    function rowClick (row, evt, pageIndex) {
      emit('row-click', row, evt, pageIndex)
    }

    function onRequest (data) {
      emit('OnRequest', Object.assign({}, data, { filters: getFilterModel() }))
    }

    if (props.server_side_filters === true) {
      let timer = null
      watch(() => JSON.stringify(getFilterModel()), () => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          const table = tableRef.value
          if (table !== null && typeof table.requestServerInteraction === 'function') {
            table.requestServerInteraction({
              pagination: Object.assign({}, props.ssr_pagination ? props.pagination : innerPagination.value, { page: 1 })
            })
          }
        }, 300)
      })
      onBeforeUnmount(() => clearTimeout(timer))
    }

    /* ------------------------------------------------------- aggregation */

    const hasAggregates = computed(() => orderedColumns.value.some(col => col.aggregate !== void 0))

    function aggregateRows () {
      const table = tableRef.value
      if (isGrouped.value || table === null || table.filteredSortedRows === void 0) {
        return getFilteredValuesData.value
      }
      return table.filteredSortedRows
    }

    function aggregateLabel (col) {
      if (col.aggregate_label !== void 0) return col.aggregate_label
      return typeof col.aggregate === 'string'
        ? (mergedLabels.value[col.aggregate] || col.aggregate)
        : mergedLabels.value.total
    }

    function aggregateText (col) {
      const value = aggregate(aggregateRows(), col)
      return typeof col.aggregate_format === 'function' ? col.aggregate_format(value) : formatAggregate(value)
    }

    /* ---------------------------------------------------------- editing */

    const editError = ref('')

    function validateCell (col, val, row) {
      if (typeof col.validate !== 'function') return true
      const res = col.validate(val, row)
      if (res === true || res === void 0) {
        editError.value = ''
        return true
      }
      editError.value = typeof res === 'string' ? res : 'Invalid value'
      return false
    }

    function onCellSave (row, col, val, initial) {
      if (typeof col.field === 'string') {
        row[col.field] = val
      }
      else if (col.field === void 0) {
        row[col.name] = val
      }
      dataVersion.value++
      emit('cell-edit', { row, column: col, field: col.field, value: val, old_value: initial })
    }

    /* ----------------------------------------------------------- export */

    function exportTable (type) {
      const isExcel = type === 'xlsx' || type === 'excel'
      const cols = orderedColumns.value.filter(isColumnVisible)
      const rows = aggregateRows()
      const name = props.file_name || 'table-export'

      const status = isExcel
        ? exportFile(name + '.xlsx', toXlsx(rows, cols, { sheetName: name }), XLSX_MIME)
        : exportFile(name + '.csv', toCsv(rows, cols), 'text/csv;charset=utf-8')

      if (status !== true) {
        if (typeof $q.notify === 'function') {
          $q.notify({ message: mergedLabels.value.downloadDenied, color: 'negative', icon: 'warning' })
        }
        else {
          console.warn('[QGrid] ' + mergedLabels.value.downloadDenied)
        }
      }
      return status
    }

    /* ------------------------------------------------------- drag & drop */

    let sortableLib = null
    let rowSortable = null, rowSortableEl = null
    let colSortable = null, colSortableEl = null
    let unmounted = false

    function loadSortable () {
      if (sortableLib !== null) return Promise.resolve(sortableLib)
      return import('sortablejs').then(mod => {
        sortableLib = mod.default || mod
        return sortableLib
      })
    }

    function getTableParts () {
      const table = tableRef.value
      const el = table !== null ? table.$el : null
      if (!el || typeof el.querySelector !== 'function') return { tbody: null, headRow: null }
      return {
        tbody: el.querySelector('.q-table__middle > table > tbody') || el.querySelector('tbody'),
        headRow: el.querySelector('.q-table__middle > table > thead > tr') || el.querySelector('thead > tr')
      }
    }

    // Sortable moves the DOM node; put it back and let Vue render the new order
    function revertDomMove (evt) {
      const anchor = evt.item.__qgridAnchor
      if (anchor !== void 0 && evt.from) {
        evt.from.insertBefore(evt.item, anchor && anchor.parentNode === evt.from ? anchor : null)
      }
      delete evt.item.__qgridAnchor
    }

    const rememberAnchor = evt => { evt.item.__qgridAnchor = evt.item.nextSibling }
    const preventIgnored = evt => evt.related && evt.related.classList && evt.related.classList.contains('ignore-elements') ? false : void 0

    function onRowDragEnd (evt) {
      revertDomMove(evt)
      const oldIndex = evt.oldDraggableIndex, newIndex = evt.newDraggableIndex
      if (oldIndex === newIndex || isGrouped.value) return

      const table = tableRef.value
      const pageRows = table !== null && table.computedRows !== void 0 ? table.computedRows : tableRows.value
      const dragged = pageRows[oldIndex], target = pageRows[newIndex]
      const data = props.data
      const from = data.indexOf(dragged), to = data.indexOf(target)
      if (from === -1 || to === -1) return

      moveItem(data, from, to)
      dataVersion.value++
      emit('dragged_row', { dragged_row: dragged, old_index: from, new_index: to })
    }

    function onColumnDragEnd (evt) {
      revertDomMove(evt)
      const oldIndex = evt.oldDraggableIndex, newIndex = evt.newDraggableIndex
      if (oldIndex === newIndex || isGrouped.value) return

      const all = orderedColumns.value
      const visible = all.filter(isColumnVisible)
      const dragged = visible[oldIndex], target = visible[newIndex]
      if (dragged === void 0 || target === void 0) return

      const from = all.indexOf(dragged), to = all.indexOf(target)
      const names = all.map(col => col.name)
      moveItem(names, from, to)
      columnOrder.value = names

      // keep the historical behaviour: the parent's columns array is reordered in place
      const source = props.columns
      if (Array.isArray(source)) {
        const reordered = names.map(name => source.find(col => col.name === name)).filter(Boolean)
        if (reordered.length === source.length) source.splice.apply(source, [0, source.length].concat(reordered))
      }

      emit('dragged_column', { dragged_column: dragged, old_index: from, new_index: to })
    }

    function destroyRowSortable () {
      if (rowSortable !== null) rowSortable.destroy()
      rowSortable = rowSortableEl = null
    }

    function destroyColSortable () {
      if (colSortable !== null) colSortable.destroy()
      colSortable = colSortableEl = null
    }

    function syncSortables () {
      if (unmounted) return
      const wantRows = props.draggable === true && props.virtual_scroll !== true
      const wantCols = props.draggable_columns === true

      if (!wantRows) destroyRowSortable()
      if (!wantCols) destroyColSortable()
      if (!wantRows && !wantCols) return

      loadSortable().then(Sortable => {
        if (unmounted) return
        const parts = getTableParts()

        if (wantRows && parts.tbody !== null && parts.tbody !== rowSortableEl) {
          destroyRowSortable()
          rowSortableEl = parts.tbody
          rowSortable = Sortable.create(parts.tbody, {
            draggable: 'tr:not(.qgrid__static-row)',
            filter: '.ignore-elements',
            preventOnFilter: false,
            onStart: rememberAnchor,
            onMove: preventIgnored,
            onEnd: onRowDragEnd
          })
        }

        if (wantCols && parts.headRow !== null && parts.headRow !== colSortableEl) {
          destroyColSortable()
          colSortableEl = parts.headRow
          colSortable = Sortable.create(parts.headRow, {
            draggable: hasHeaderSlot.value ? 'th:not(.ignore-elements)' : 'th[data-col]',
            filter: '.ignore-elements, .q-btn',
            preventOnFilter: false,
            onStart: rememberAnchor,
            onMove: preventIgnored,
            onEnd: onColumnDragEnd
          })
        }
      })
    }

    watch(() => [props.draggable, props.draggable_columns, props.virtual_scroll], () => nextTick(syncSortables))

    /* ------------------------------------------------- state persistence */

    function getState () {
      const pagination = props.ssr_pagination === true ? (props.pagination || {}) : innerPagination.value
      return {
        version: STATE_VERSION,
        filters: JSON.parse(JSON.stringify(filter_data)),
        selections: JSON.parse(JSON.stringify(column_options_selected)),
        search: filter.value,
        columnOrder: columnOrder.value,
        visibleColumns: innerVisibleColumns.value,
        groupBy: groupField.value,
        showFilterRow: showFilterRow.value,
        sortBy: pagination.sortBy === void 0 ? null : pagination.sortBy,
        descending: pagination.descending === true,
        rowsPerPage: pagination.rowsPerPage
      }
    }

    function setState (state) {
      if (!state || typeof state !== 'object') return
      const cols = columnsByKey.value
      if (state.filters) {
        Object.keys(state.filters).forEach(key => {
          if (cols[key] !== void 0 || key === GROUP_FILTER_KEY) filter_data[key] = state.filters[key]
        })
      }
      if (state.selections) {
        Object.keys(state.selections).forEach(key => {
          if (cols[key] !== void 0 && Array.isArray(state.selections[key])) column_options_selected[key] = state.selections[key]
        })
      }
      if (typeof state.search === 'string') filter.value = state.search
      if (Array.isArray(state.columnOrder)) columnOrder.value = state.columnOrder
      if (Array.isArray(state.visibleColumns)) innerVisibleColumns.value = state.visibleColumns
      if (typeof state.groupBy === 'string') setGroupBy(state.groupBy)
      if (typeof state.showFilterRow === 'boolean') showFilterRow.value = state.showFilterRow
      if (props.ssr_pagination !== true) {
        const patch = {}
        if (state.sortBy !== void 0) patch.sortBy = state.sortBy
        if (typeof state.descending === 'boolean') patch.descending = state.descending
        if (typeof state.rowsPerPage === 'number') patch.rowsPerPage = state.rowsPerPage
        innerPagination.value = Object.assign({}, innerPagination.value, patch)
      }
    }

    const storageKey = () => 'qgrid:' + props.state_key

    function readStoredState () {
      try {
        const raw = window.localStorage.getItem(storageKey())
        const state = raw ? JSON.parse(raw) : null
        return state && state.version === STATE_VERSION ? state : null
      }
      catch (e) {
        return null
      }
    }

    function resetState () {
      clearFilters()
      columnOrder.value = null
      innerVisibleColumns.value = null
      setGroupBy('')
      showFilterRow.value = true
      if (props.state_key) {
        try { window.localStorage.removeItem(storageKey()) }
        catch (e) {}
      }
    }

    let stateTimer = null
    watch(() => JSON.stringify(getState()), json => {
      emit('state-change', JSON.parse(json))
      if (!props.state_key) return
      clearTimeout(stateTimer)
      stateTimer = setTimeout(() => {
        try { window.localStorage.setItem(storageKey(), json) }
        catch (e) {}
      }, 250)
    })

    /* -------------------------------------------------------- lifecycle */

    onMounted(() => {
      // restored on mount (not during setup) so SSR hydration stays consistent
      if (props.state_key) {
        const state = readStoredState()
        if (state !== null) setState(state)
      }
      syncSortables()
    })

    onUpdated(() => {
      if (rowSortable !== null || colSortable !== null) syncSortables()
    })

    onBeforeUnmount(() => {
      unmounted = true
      clearTimeout(stateTimer)
      destroyRowSortable()
      destroyColSortable()
      scope.stop()
    })

    return {
      tableRef,
      uuid,
      mergedLabels,
      mergedIcons,
      selectionMode,
      hasHeaderSlot,
      hasDefaultSlot,
      hasTopRightSlot,
      hasDetailSlot,
      hasTopRight,
      forwardedSlots,
      rootClass,
      tableBindings,

      orderedColumns,
      final_column,
      subColumns,
      isColumnVisible,
      effectiveVisibleColumns,
      toggleColumn,
      showAllColumns,

      gorupby_option,
      selected_group_by_filed,
      setGroupBy,
      isGrouped,
      groupRowsOf,
      group_pagination,
      effectiveRowKey,

      filter,
      setGlobalSearch,
      filter_data,
      column_options_selected,
      headerSearch,
      showFilterRow,
      toggleFilterRow,
      filterInputPropsComputed,
      filterKey,
      filterTypeOf,
      isFilterActive,
      resetFilter,
      setDateFilter,
      dateLabel,
      numberLabel,
      filtersActive,
      clearFilters,
      getFilterModel,

      getColumnOptions,
      headerOptions,
      selectionCount,
      isOptionSelected,
      toggleOption,
      selectAllState,
      toggleAll,
      clearSelection,

      getFilteredData,
      getFilteredValuesData,
      tableRows,
      rowClass,
      isIgnoredCol,
      fullColspan,
      cellText,
      getRawValue,

      selected_prop,
      rowClick,
      onRequest,

      hasAggregates,
      aggregateLabel,
      aggregateText,

      editError,
      validateCell,
      onCellSave,

      exportTable,
      getState,
      setState,
      resetState
    }
  }
})
</script>

<style>
.qgrid {
  position: relative;
}

.qgrid__label {
  vertical-align: middle;
}

.qgrid__header-filter-btn {
  margin-left: 2px;
  opacity: .55;
  transition: opacity .2s;
}

.qgrid th:hover .qgrid__header-filter-btn,
.qgrid__header-filter-btn--active {
  opacity: 1;
}

.qgrid__header-filter-btn--active {
  color: var(--q-primary);
}

.qgrid__badge {
  top: -2px;
  right: -4px;
  font-size: 9px;
  min-height: 14px;
  padding: 1px 4px;
}

.qgrid__menu {
  min-width: 240px;
  max-width: 320px;
}

.qgrid__menu-title {
  font-size: 13px;
  font-weight: 600;
}

.qgrid__menu-list {
  max-height: 260px;
}

.qgrid__menu-item {
  min-height: 32px;
}

.qgrid__menu-empty {
  padding: 16px;
  font-size: 13px;
  opacity: .6;
  text-align: center;
}

.qgrid__filter-row th.qgrid__filter-cell {
  padding: 4px;
  font-weight: normal;
}

.qgrid__filter-row .q-field {
  min-width: 90px;
}

.qgrid__search {
  min-width: 180px;
}

.qgrid__group-select {
  min-width: 160px;
}

.qgrid__export-btn {
  padding: 4px 8px;
}

.qgrid__group-name {
  font-weight: 500;
}

.qgrid__group-count {
  background: rgba(0, 0, 0, .08);
  color: inherit;
}

.q-table--dark .qgrid__group-count {
  background: rgba(255, 255, 255, .14);
}

.qgrid__aggregate-row td {
  border-top: 2px solid rgba(0, 0, 0, .12);
  font-weight: 600;
  white-space: nowrap;
}

.q-table--dark .qgrid__aggregate-row td {
  border-top-color: rgba(255, 255, 255, .28);
}

.qgrid__agg-label {
  margin-right: 6px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: .04em;
  text-transform: uppercase;
  opacity: .6;
}

.qgrid__row.sortable-chosen {
  background: rgba(0, 0, 0, .04);
}

.qgrid .sortable-ghost {
  opacity: .4;
}

/* sticky header (also used with virtual scroll) */
.qgrid--sticky-header thead {
  position: sticky;
  top: 0;
  z-index: 2;
}

.qgrid--sticky-header thead th {
  background: #fff;
}

.qgrid--sticky-header .q-table--dark thead th {
  background: var(--q-dark, #1d1d1d);
}

.qgrid--sticky-header .q-table__middle {
  scroll-padding-top: 48px;
}
</style>
