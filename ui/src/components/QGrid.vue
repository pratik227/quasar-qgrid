<template>
  <div
    class="qgrid"
    :class="rootClass"
    :tabindex="copy_selection ? 0 : void 0"
    @keydown="onKeydown"
    @contextmenu.capture="onContextCapture"
  >
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
        <q-tr v-if="!hasHeaderSlot" key="qgrid-header" :props="props" class="qgrid__header-row" @click.capture="onHeaderClickCapture">
          <q-th v-if="selectionMode !== 'none'" auto-width class="ignore-elements" :class="leadClass" :style="leadStyle(0)">
            <q-checkbox
              v-if="selectionMode === 'multiple'"
              v-model="props.selected"
              indeterminate-value="some"
              :dense="dense"
              :aria-label="mergedLabels.selectAll"
            />
          </q-th>
          <q-th v-if="hasDetailSlot && !isGrouped" auto-width class="ignore-elements" :class="leadClass" :style="leadStyle(1)" />
          <q-th
            v-for="(col, colIndex) in props.cols"
            :key="col.name"
            :props="props"
            :data-col="col.name"
            :class="[isIgnoredCol(colIndex) ? 'ignore-elements' : '', cellClass(col)]"
            :style="cellStyle(col)"
            :aria-sort="ariaSort(col)"
          >
            <slot :name="'header-cell-' + col.name" :col="col" :cols="props.cols" :sort="props.sort">
              <span class="qgrid__label">{{ col.label }}</span>
            </slot>

            <span v-if="sortIndex(col) !== -1 && sortModelActive" class="qgrid__sort-badge">
              <q-icon v-if="sortIndex(col) > 0" :name="isSortDesc(col) ? mergedIcons.sortDesc : mergedIcons.sortAsc" size="13px" />{{ sortIndex(col) + 1 }}
            </span>

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

            <span
              v-if="isResizable(col)"
              class="qgrid__resizer"
              role="separator"
              aria-orientation="vertical"
              :aria-label="mergedLabels.resize + ': ' + col.label"
              @pointerdown.stop.prevent="startResize($event, col)"
              @click.stop
              @dblclick.stop="autoSize(col)"
            />
          </q-th>
        </q-tr>
        <slot-proxy v-else key="qgrid-header-slot" :render="$slots.header" :scope="props" />

        <!-- column filters row -->
        <q-tr v-if="columns_filter && showFilterRow" key="qgrid-filters" :props="props" class="ignore-elements qgrid__filter-row">
          <q-th v-if="selectionMode !== 'none'" auto-width :class="leadClass" :style="leadStyle(0)" />
          <q-th v-if="hasDetailSlot && !isGrouped" auto-width :class="leadClass" :style="leadStyle(1)" />
          <q-th v-for="col in props.cols" :key="col.name" class="qgrid__filter-cell" :class="cellClass(col)" :style="cellStyle(col)">
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
          :data-qgrid-row="props.pageIndex"
          @click="rowClick(props.row, $event, props.pageIndex)"
        >
          <q-td v-if="selectionMode !== 'none'" auto-width :class="leadClass" :style="leadStyle(0)">
            <q-checkbox v-model="props.selected" color="primary" :dense="dense" />
          </q-td>
          <q-td v-if="hasDetailSlot && !isGrouped" auto-width :class="leadClass" :style="leadStyle(1)">
            <q-btn
              flat round dense size="sm"
              :icon="props.expand ? mergedIcons.detailOpen : mergedIcons.detailClosed"
              :aria-label="props.expand ? mergedLabels.collapse : mergedLabels.expand"
              :aria-expanded="props.expand ? 'true' : 'false'"
              @click.stop="props.expand = !props.expand"
            />
          </q-td>
          <q-td
            v-for="(col, colIndex) in props.cols"
            :key="col.name"
            :props="props"
            :data-col="col.name"
            :class="cellClass(col)"
            :style="cellStyle(col)"
          >
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

      <!-- ============================== pinned rows ============================== -->
      <template #top-row="props" v-if="pinnedTop.length > 0 && !isGrouped && !$slots['top-row']">
        <q-tr
          v-for="(row, i) in pinnedTop"
          :key="'pin-top-' + i"
          class="qgrid__static-row qgrid__pinned-row qgrid__pinned-row--top ignore-elements"
          :data-qgrid-pinned="'top:' + i"
        >
          <q-td v-if="selectionMode !== 'none'" auto-width :class="leadClass" :style="leadStyle(0)" />
          <q-td v-if="hasDetailSlot" auto-width :class="leadClass" :style="leadStyle(1)" />
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :data-col="col.name"
            :class="['text-' + (col.align || 'right'), cellClass(col)]"
            :style="cellStyle(col)"
          >{{ cellText(getCellValue(row, col)) }}</q-td>
        </q-tr>
      </template>

      <!-- ============================== aggregates ============================== -->
      <template #bottom-row="props" v-if="(hasAggregates || pinnedBottom.length > 0) && !isGrouped && !$slots['bottom-row']">
        <q-tr
          v-for="(row, i) in pinnedBottom"
          :key="'pin-bottom-' + i"
          class="qgrid__static-row qgrid__pinned-row qgrid__pinned-row--bottom ignore-elements"
          :data-qgrid-pinned="'bottom:' + i"
        >
          <q-td v-if="selectionMode !== 'none'" auto-width :class="leadClass" :style="leadStyle(0)" />
          <q-td v-if="hasDetailSlot" auto-width :class="leadClass" :style="leadStyle(1)" />
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :data-col="col.name"
            :class="['text-' + (col.align || 'right'), cellClass(col)]"
            :style="cellStyle(col)"
          >{{ cellText(getCellValue(row, col)) }}</q-td>
        </q-tr>
        <q-tr v-if="hasAggregates" key="qgrid-aggregates" class="qgrid__static-row qgrid__aggregate-row ignore-elements">
          <q-td v-if="selectionMode !== 'none'" auto-width :class="leadClass" :style="leadStyle(0)" />
          <q-td v-if="hasDetailSlot && !isGrouped" auto-width :class="leadClass" :style="leadStyle(1)" />
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :class="['text-' + (col.align || 'right'), cellClass(col)]"
            :style="cellStyle(col)"
          >
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

    <!-- ============================== status bar ============================== -->
    <div v-if="status_bar" class="qgrid__status" :class="{ 'qgrid__status--dark': isDark }" role="status" aria-live="polite">
      <span>{{ mergedLabels.statusRows }} <b>{{ formatCount(totalCount) }}</b></span>
      <span v-if="shownCount !== totalCount">{{ mergedLabels.statusFiltered }} <b>{{ formatCount(shownCount) }}</b></span>
      <span v-if="selectionMode !== 'none'">{{ mergedLabels.statusSelected }} <b>{{ formatCount(selected_prop.length) }}</b></span>
      <span v-for="agg in selectionAggregates" :key="agg.name" class="qgrid__status-agg">
        {{ agg.label }} <span class="qgrid__agg-label">{{ agg.type }}</span><b>{{ agg.text }}</b>
      </span>
    </div>

    <!-- ============================== context menu ============================== -->
    <q-menu v-if="context_menu" context-menu touch-position :dark="dark" @hide="ctx = null">
      <q-list dense class="qgrid__menu qgrid__context-menu">
        <template v-for="(item, i) in contextItems" :key="i">
          <q-separator v-if="item.separator" :dark="dark" />
          <q-item v-else clickable v-close-popup :disable="item.disable === true" @click="runContextItem(item)">
            <q-item-section side class="qgrid__context-icon">
              <q-icon v-if="item.icon" :name="item.icon" size="18px" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-menu>
  </div>
</template>

<script>
import {
  defineComponent, ref, reactive, computed, watch, effectScope,
  onMounted, onBeforeUnmount, onUpdated, nextTick, toRaw
} from 'vue'
import { uid, exportFile, copyToClipboard, useQuasar } from 'quasar'

import {
  GROUP_FILTER_KEY, fieldKey, getRawValue, filterTypeOf, normalizeColumn, buildOptions,
  normalizeDateRange, isFilterValueActive, compileColumnFilters, compileSelectFilters,
  applyPredicates, groupRows, aggregate, formatAggregate, moveItem, toCsv, toNumber,
  getCellValue, sortRows, toggleSortModel, partitionPinned, pinOffsets, parseWidth, toTsv
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
  total: 'Total',
  resize: 'Resize column',
  copyCell: 'Copy cell',
  copyRow: 'Copy row',
  copySelected: 'Copy selected rows ({n})',
  copied: 'Copied to clipboard',
  pinLeft: 'Pin column left',
  pinRight: 'Pin column right',
  unpinColumn: 'Unpin column',
  hideColumn: 'Hide column',
  autoSize: 'Auto-size column',
  pinRowTop: 'Pin row to top',
  pinRowBottom: 'Pin row to bottom',
  unpinRow: 'Unpin row',
  statusRows: 'Rows',
  statusFiltered: 'Filtered',
  statusSelected: 'Selected'
}

const STATE_VERSION = 1
const MIN_COL_WIDTH = 48

// QTable slots QGrid renders itself (everything else is forwarded as-is)
const OWN_SLOTS = ['header', 'body', 'top_right', 'top-right', 'loading', 'detail']

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
    icons: Object,
    // v1.2+
    multi_sort: Boolean,
    resizable_columns: Boolean,
    status_bar: Boolean,
    copy_selection: Boolean,
    context_menu: [Boolean, Array],
    pinned_top_rows: Array,
    pinned_bottom_rows: Array
  },

  emits: [
    'selected-val', 'update:selected', 'dragged_column', 'dragged_row', 'row-click',
    'OnRequest', 'FilteredData', 'update:pagination', 'update:visible_columns',
    'cell-edit', 'state-change', 'sort-change', 'column-resize', 'column-pin', 'copy',
    'context-action', 'update:pinned_top_rows', 'update:pinned_bottom_rows'
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

    // runtime pin overrides (context menu / setState): name -> 'left' | 'right' | null
    const pinState = reactive({})
    const pinOf = col => {
      const side = col.name in pinState ? pinState[col.name] : col.pinned
      return side === 'left' || side === 'right' ? side : null
    }

    // pinned left, unpinned, pinned right
    const displayColumns = computed(() => partitionPinned(orderedColumns.value, pinOf))

    const columnsByName = computed(() => {
      const map = Object.create(null)
      orderedColumns.value.forEach(col => { map[col.name] = col })
      return map
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
    const final_column = computed(() => isGrouped.value ? [groupedColumnDef.value] : displayColumns.value)

    const subColumns = computed(() =>
      displayColumns.value.filter(col => col.field !== groupField.value && isColumnVisible(col))
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

    /* ------------------------------------------------------- pinned rows */

    const innerPinnedTop = ref(null)
    const innerPinnedBottom = ref(null)
    watch(() => props.pinned_top_rows, () => { innerPinnedTop.value = null })
    watch(() => props.pinned_bottom_rows, () => { innerPinnedBottom.value = null })

    const pinnedTop = computed(() => innerPinnedTop.value || props.pinned_top_rows || [])
    const pinnedBottom = computed(() => innerPinnedBottom.value || props.pinned_bottom_rows || [])
    // rows may arrive as reactive proxies (e.g. from a ref) or raw objects: compare raw
    const pinnedRowSet = computed(() =>
      pinnedTop.value.length + pinnedBottom.value.length === 0
        ? null
        : new Set(pinnedTop.value.concat(pinnedBottom.value).map(row => toRaw(row)))
    )

    const sameRow = (a, b) => toRaw(a) === toRaw(b)

    function rowPinSide (row) {
      if (pinnedTop.value.some(r => sameRow(r, row))) return 'top'
      if (pinnedBottom.value.some(r => sameRow(r, row))) return 'bottom'
      return null
    }

    function pinRow (row, side) {
      const top = pinnedTop.value.filter(r => sameRow(r, row) === false)
      const bottom = pinnedBottom.value.filter(r => sameRow(r, row) === false)
      if (side === 'top') top.push(row)
      else if (side === 'bottom') bottom.push(row)
      innerPinnedTop.value = top
      innerPinnedBottom.value = bottom
      emit('update:pinned_top_rows', top)
      emit('update:pinned_bottom_rows', bottom)
    }

    // pinned rows are shown above/below the body, so they are left out of it (and of the totals)
    const bodyRows = computed(() => {
      const set = pinnedRowSet.value
      return set === null ? getFilteredValuesData.value : getFilteredValuesData.value.filter(row => set.has(toRaw(row)) === false)
    })

    const groups = computed(() =>
      isGrouped.value ? groupRows(bodyRows.value, groupColumn.value) : null
    )

    const tableRows = computed(() => {
      if (groups.value === null) return bodyRows.value
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
      const rows = bodyRows.value
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
      const current = effectiveVisibleColumns.value || displayColumns.value.map(c => c.name)
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
      // a plain (non shift) header click: back to a single-column sort
      const primary = sortModel.value[0]
      const sortBy = val.sortBy || null
      if ((primary ? primary.name : null) !== sortBy || (primary !== void 0 && primary.descending !== (val.descending === true))) {
        sortModel.value = sortBy === null ? [] : [{ name: sortBy, descending: val.descending === true }]
        emit('sort-change', sortModel.value)
      }
      emit('update:pagination', val)
    }

    /* ------------------------------------------------------- multi sort */

    const initialSort = props.pagination && props.pagination.sortBy
    const sortModel = ref(initialSort ? [{ name: initialSort, descending: props.pagination.descending === true }] : [])
    const sortModelActive = computed(() => props.multi_sort === true && sortModel.value.length > 1)
    const sortIndex = col => sortModel.value.findIndex(s => s.name === col.name)
    const isSortDesc = col => {
      const spec = sortModel.value.find(s => s.name === col.name)
      return spec !== void 0 && spec.descending === true
    }

    function ariaSort (col) {
      if (col.sortable !== true) return void 0
      const spec = sortModel.value.find(s => s.name === col.name)
      return spec === void 0 ? 'none' : (spec.descending ? 'descending' : 'ascending')
    }

    function applySortModel (model) {
      sortModel.value = model
      const primary = model[0]
      const patch = primary !== void 0
        ? { sortBy: primary.name, descending: primary.descending }
        : { sortBy: null, descending: false }
      if (props.ssr_pagination === true) {
        const table = tableRef.value
        if (table !== null) {
          table.requestServerInteraction({ pagination: Object.assign({}, props.pagination, patch, { page: 1 }) })
        }
      }
      else {
        innerPagination.value = Object.assign({}, innerPagination.value, patch)
      }
      emit('sort-change', model)
    }

    // Shift + click on a sortable header adds / toggles a secondary sort
    function onHeaderClickCapture (evt) {
      if (props.multi_sort !== true || evt.shiftKey !== true || isGrouped.value) return
      const target = evt.target
      if (!target || typeof target.closest !== 'function' || target.closest('.qgrid__resizer, .q-btn, .q-checkbox, .q-field')) return
      const th = target.closest('th[data-col]')
      if (th === null) return
      const col = columnsByName.value[th.getAttribute('data-col')]
      if (col === void 0 || col.sortable !== true) return
      evt.stopPropagation()
      evt.preventDefault()
      applySortModel(toggleSortModel(sortModel.value, col.name))
    }

    function multiSortMethod (rows, sortBy, descending) {
      let model = sortModel.value
      if (model.length === 0 || model[0].name !== sortBy || model[0].descending !== descending) {
        model = [{ name: sortBy, descending }]
      }
      return sortRows(rows, model, columnsByName.value)
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
      if (props.multi_sort === true && attrs['sort-method'] === void 0 && attrs.sortMethod === void 0) {
        bindings.sortMethod = multiSortMethod
      }
      return bindings
    }

    const isDark = computed(() => props.dark === true || (props.dark === null && $q.dark.isActive === true))

    const rootClass = computed(() => ({
      'qgrid--sticky-header': props.sticky_header === true || props.virtual_scroll === true,
      'qgrid--dense': props.dense === true,
      'qgrid--dark': isDark.value,
      'qgrid--resizing': resizing.value === true,
      'qgrid--copyable': props.copy_selection === true
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
      const sortBy = data.pagination && data.pagination.sortBy
      const model = sortModel.value.length > 0 && sortModel.value[0].name === sortBy
        ? sortModel.value.slice()
        : (sortBy ? [{ name: sortBy, descending: data.pagination.descending === true }] : [])
      emit('OnRequest', Object.assign({}, data, { filters: getFilterModel(), sort_model: model }))
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
        return bodyRows.value
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

    /* ------------------------------------------- column widths & pinning */

    const colWidths = reactive({}) // user resized: name -> px
    const measuredWidths = reactive({}) // rendered: name -> px
    const leadWidths = ref([]) // selection / expand cells
    const resizing = ref(false)

    const fixedWidthOf = col => colWidths[col.name] || parseWidth(col.width)
    const widthOf = col => fixedWidthOf(col) || measuredWidths[col.name] || 100

    const visibleDisplayColumns = computed(() => displayColumns.value.filter(isColumnVisible))
    const hasPinnedColumns = computed(() => isGrouped.value === false && visibleDisplayColumns.value.some(col => pinOf(col) !== null))

    const offsets = computed(() => {
      if (hasPinnedColumns.value === false) return {}
      const lead = leadWidths.value.reduce((a, b) => a + b, 0)
      return pinOffsets(visibleDisplayColumns.value, pinOf, widthOf, lead)
    })

    const hasLeftPins = computed(() => Object.keys(offsets.value).some(name => offsets.value[name].side === 'left'))
    const leadClass = computed(() => hasLeftPins.value ? 'qgrid__pin qgrid__pin--left' : '')

    function leadStyle (index) {
      if (hasLeftPins.value === false) return null
      let left = 0
      for (let i = 0; i < index && i < leadWidths.value.length; i++) left += leadWidths.value[i]
      return { left: left + 'px' }
    }

    function cellClass (col) {
      if (isGrouped.value) return ''
      const pin = offsets.value[col.name]
      const sized = fixedWidthOf(col) ? ' qgrid__sized' : ''
      if (pin === void 0) return sized
      return 'qgrid__pin qgrid__pin--' + pin.side + (pin.edge ? ' qgrid__pin--edge-' + pin.side : '') + sized
    }

    function cellStyle (col) {
      if (isGrouped.value) return null
      const style = {}
      const width = fixedWidthOf(col)
      if (width) {
        style.width = style.minWidth = style.maxWidth = width + 'px'
      }
      const pin = offsets.value[col.name]
      if (pin !== void 0) style[pin.side] = pin.offset + 'px'
      return width || pin !== void 0 ? style : null
    }

    const isResizable = col => isGrouped.value === false && col.resizable !== false && (props.resizable_columns === true || col.resizable === true)

    // sticky offsets depend on rendered widths: keep them measured
    function measureColumns () {
      const head = getTableParts().headRow
      if (head === null) return
      const leads = []
      let seenColumn = false
      for (let i = 0; i < head.children.length; i++) {
        const th = head.children[i]
        const name = th.getAttribute('data-col')
        if (name === null) {
          if (seenColumn === false) leads.push(th.offsetWidth)
          continue
        }
        seenColumn = true
        if (measuredWidths[name] !== th.offsetWidth) measuredWidths[name] = th.offsetWidth
      }
      if (leads.join() !== leadWidths.value.join()) leadWidths.value = leads
    }

    let resizeObserver = null
    function syncMeasureObserver () {
      if (unmounted || typeof ResizeObserver === 'undefined') return
      if (hasPinnedColumns.value === false) {
        if (resizeObserver !== null) {
          resizeObserver.disconnect()
          resizeObserver = null
        }
        return
      }
      const head = getTableParts().headRow
      if (head === null) return
      if (resizeObserver === null) resizeObserver = new ResizeObserver(measureColumns)
      resizeObserver.disconnect()
      for (let i = 0; i < head.children.length; i++) resizeObserver.observe(head.children[i])
      measureColumns()
    }

    watch([hasPinnedColumns, visibleDisplayColumns], () => nextTick(syncMeasureObserver))

    let stopResize = null
    function startResize (evt, col) {
      const th = evt.target.closest('th')
      if (th === null) return
      const startX = evt.clientX
      const startWidth = th.offsetWidth
      const rtl = $q.lang.rtl === true ? -1 : 1
      resizing.value = true

      const onMove = e => {
        colWidths[col.name] = Math.max(MIN_COL_WIDTH, Math.round(startWidth + (e.clientX - startX) * rtl))
      }
      const onUp = () => {
        cleanup()
        emit('column-resize', { column: col, width: colWidths[col.name] })
      }
      const cleanup = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        resizing.value = false
        stopResize = null
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      stopResize = cleanup
    }

    let measureCanvas = null
    function autoSize (col) {
      const table = tableRef.value
      const el = table !== null ? table.$el : null
      if (!el || typeof document === 'undefined') return
      const sel = '[data-col="' + String(col.name).replace(/["\\]/g, '\\$&') + '"]'
      const th = el.querySelector('thead tr.qgrid__header-row th' + sel)
      if (th === null) return
      if (measureCanvas === null) measureCanvas = document.createElement('canvas')
      const ctx2d = measureCanvas.getContext('2d')
      if (ctx2d === null) return

      const measure = node => {
        const cs = window.getComputedStyle(node)
        ctx2d.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily
        return ctx2d.measureText(node.innerText || '').width + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      }

      // header: label + room for the sort icon / filter / resize handle
      let max = measure(th.querySelector('.qgrid__label') || th) + 44
      const cells = el.querySelectorAll('tbody td' + sel)
      for (let i = 0; i < cells.length; i++) max = Math.max(max, measure(cells[i]) + 2)

      colWidths[col.name] = Math.min(Math.max(Math.ceil(max), MIN_COL_WIDTH), 800)
      emit('column-resize', { column: col, width: colWidths[col.name] })
    }

    function setColumnPin (col, side) {
      pinState[col.name] = side === 'left' || side === 'right' ? side : null
      emit('column-pin', { column: col, pinned: pinState[col.name] })
    }

    /* --------------------------------------------------------- clipboard */

    function notify (message) {
      if (typeof $q.notify === 'function') $q.notify({ message, timeout: 1200 })
    }

    function copyRows (rows, withHeader) {
      const list = rows || (selected_prop.value.length > 0 ? selected_prop.value : aggregateRows())
      const text = toTsv(list, visibleDisplayColumns.value, withHeader)
      return copyToClipboard(text).then(() => {
        emit('copy', { rows: list, text })
        notify(mergedLabels.value.copied)
        return text
      })
    }

    function copyText (text) {
      return copyToClipboard(text).then(() => {
        emit('copy', { rows: [], text })
        notify(mergedLabels.value.copied)
        return text
      })
    }

    function onKeydown (evt) {
      if (props.copy_selection !== true) return
      if ((evt.ctrlKey || evt.metaKey) !== true || String(evt.key).toLowerCase() !== 'c') return
      const tag = evt.target && evt.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (evt.target && evt.target.isContentEditable)) return
      const textSelection = typeof window !== 'undefined' && window.getSelection ? String(window.getSelection()) : ''
      if (textSelection !== '' || selected_prop.value.length === 0) return
      evt.preventDefault()
      copyRows(selected_prop.value)
    }

    /* ------------------------------------------------------ context menu */

    const ctx = ref(null)

    function onContextCapture (evt) {
      if (!props.context_menu) return
      const target = evt.target
      if (!target || typeof target.closest !== 'function') return
      let row = null
      const tr = target.closest('tr[data-qgrid-row]')
      const pinnedTr = target.closest('tr[data-qgrid-pinned]')
      if (tr !== null && isGrouped.value === false) {
        const table = tableRef.value
        const page = table !== null && table.computedRows !== void 0 ? table.computedRows : tableRows.value
        row = page[parseInt(tr.getAttribute('data-qgrid-row'), 10)] || null
      }
      else if (pinnedTr !== null) {
        const parts = pinnedTr.getAttribute('data-qgrid-pinned').split(':')
        row = (parts[0] === 'top' ? pinnedTop.value : pinnedBottom.value)[parseInt(parts[1], 10)] || null
      }
      const cell = target.closest('td[data-col], th[data-col]')
      const col = cell !== null ? (columnsByName.value[cell.getAttribute('data-col')] || null) : null
      ctx.value = {
        row,
        col,
        value: row !== null && col !== null ? getCellValue(row, col) : void 0,
        area: tr !== null || pinnedTr !== null ? 'body' : (target.closest('thead') !== null ? 'header' : 'other')
      }
    }

    const contextItems = computed(() => {
      const c = ctx.value || {}
      const L = mergedLabels.value
      const I = mergedIcons.value
      const items = []
      const sep = { separator: true }

      if (c.row && c.col) items.push({ action: 'copy-cell', label: L.copyCell, icon: I.copy })
      if (c.row) items.push({ action: 'copy-row', label: L.copyRow, icon: I.copy })
      if (selected_prop.value.length > 0) {
        items.push({ action: 'copy-selected', label: L.copySelected.replace('{n}', selected_prop.value.length), icon: I.copy })
      }

      if (c.row && isGrouped.value === false) {
        items.push(sep)
        if (rowPinSide(c.row) !== null) items.push({ action: 'unpin-row', label: L.unpinRow, icon: I.unpin })
        else {
          items.push({ action: 'pin-row-top', label: L.pinRowTop, icon: I.pinTop })
          items.push({ action: 'pin-row-bottom', label: L.pinRowBottom, icon: I.pinBottom })
        }
      }

      if (c.col && isGrouped.value === false) {
        items.push(sep)
        const side = pinOf(c.col)
        if (side !== 'left') items.push({ action: 'pin-left', label: L.pinLeft, icon: I.pin })
        if (side !== 'right') items.push({ action: 'pin-right', label: L.pinRight, icon: I.pin })
        if (side !== null) items.push({ action: 'unpin-column', label: L.unpinColumn, icon: I.unpin })
        if (isResizable(c.col)) items.push({ action: 'auto-size', label: L.autoSize, icon: I.autoSize })
        if (c.col.required !== true) items.push({ action: 'hide-column', label: L.hideColumn, icon: I.hide })
      }

      items.push(sep)
      items.push({ action: 'export-csv', label: L.exportCsv, icon: I.csv })
      items.push({ action: 'export-xlsx', label: L.exportExcel, icon: I.excel })

      if (Array.isArray(props.context_menu)) {
        items.push(sep)
        props.context_menu.forEach(item => { items.push(item && item.separator ? sep : Object.assign({ custom: true }, item)) })
      }

      // drop leading, trailing and repeated separators
      return items.filter((item, i, list) =>
        item.separator !== true || (i > 0 && i < list.length - 1 && list[i - 1].separator !== true)
      )
    })

    function runContextItem (item) {
      const c = Object.assign({ row: null, col: null, value: void 0 }, ctx.value, { selected: selected_prop.value })
      switch (item.action) {
        case 'copy-cell': copyText(cellText(c.value) === '' ? '' : String(cellText(c.value))); break
        case 'copy-row': copyRows([c.row], false); break
        case 'copy-selected': copyRows(selected_prop.value); break
        case 'pin-row-top': pinRow(c.row, 'top'); break
        case 'pin-row-bottom': pinRow(c.row, 'bottom'); break
        case 'unpin-row': pinRow(c.row, null); break
        case 'pin-left': setColumnPin(c.col, 'left'); break
        case 'pin-right': setColumnPin(c.col, 'right'); break
        case 'unpin-column': setColumnPin(c.col, null); break
        case 'auto-size': nextTick(() => autoSize(c.col)); break
        case 'hide-column': toggleColumn(c.col); break
        case 'export-csv': exportTable('csv'); break
        case 'export-xlsx': exportTable('xlsx'); break
        default:
          if (typeof item.handler === 'function') item.handler(c)
      }
      emit('context-action', Object.assign({ action: item.action || item.label }, c))
    }

    /* -------------------------------------------------------- status bar */

    const totalCount = computed(() => {
      const p = props.pagination
      if (props.ssr_pagination === true && p && typeof p.rowsNumber === 'number') return p.rowsNumber
      return (props.data || []).length
    })

    const shownCount = computed(() => {
      const table = tableRef.value
      if (props.ssr_pagination === true) return totalCount.value
      if (isGrouped.value || table === null || table.filteredSortedRows === void 0) return bodyRows.value.length
      return table.filteredSortedRows.length
    })

    const selectionAggregates = computed(() => {
      const rows = selected_prop.value
      if (rows.length === 0 || isGrouped.value) return []
      return visibleDisplayColumns.value
        .filter(col => typeof col.aggregate === 'string')
        .map(col => {
          const value = aggregate(rows, col)
          return {
            name: col.name,
            label: col.label,
            type: aggregateLabel(col),
            text: typeof col.aggregate_format === 'function' ? col.aggregate_format(value) : formatAggregate(value)
          }
        })
    })

    const formatCount = n => Number(n).toLocaleString()

    /* ----------------------------------------------------------- export */

    function exportTable (type) {
      const isExcel = type === 'xlsx' || type === 'excel'
      const cols = displayColumns.value.filter(isColumnVisible)
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

      const all = displayColumns.value
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
            filter: '.ignore-elements, .q-btn, .qgrid__resizer',
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
        rowsPerPage: pagination.rowsPerPage,
        sortModel: sortModel.value.slice(),
        columnWidths: Object.assign({}, colWidths),
        pinnedColumns: Object.assign({}, pinState)
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
      if (state.columnWidths && typeof state.columnWidths === 'object') {
        Object.keys(state.columnWidths).forEach(name => {
          const width = parseWidth(state.columnWidths[name])
          if (width !== null) colWidths[name] = Math.max(MIN_COL_WIDTH, width)
        })
      }
      if (state.pinnedColumns && typeof state.pinnedColumns === 'object') {
        Object.keys(state.pinnedColumns).forEach(name => {
          const side = state.pinnedColumns[name]
          pinState[name] = side === 'left' || side === 'right' ? side : null
        })
      }
      if (props.ssr_pagination !== true) {
        const patch = {}
        if (state.sortBy !== void 0) patch.sortBy = state.sortBy
        if (typeof state.descending === 'boolean') patch.descending = state.descending
        if (typeof state.rowsPerPage === 'number') patch.rowsPerPage = state.rowsPerPage
        innerPagination.value = Object.assign({}, innerPagination.value, patch)
      }
      if (Array.isArray(state.sortModel) && state.sortModel.length > 0) {
        sortModel.value = state.sortModel.filter(spec => spec && columnsByName.value[spec.name] !== void 0)
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
      sortModel.value = []
      if (props.ssr_pagination !== true) {
        innerPagination.value = Object.assign({}, innerPagination.value, { sortBy: null, descending: false })
      }
      Object.keys(colWidths).forEach(name => { delete colWidths[name] })
      Object.keys(pinState).forEach(name => { delete pinState[name] })
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
      nextTick(syncMeasureObserver)
    })

    onUpdated(() => {
      if (rowSortable !== null || colSortable !== null) syncSortables()
      if (hasPinnedColumns.value) syncMeasureObserver()
    })

    onBeforeUnmount(() => {
      unmounted = true
      clearTimeout(stateTimer)
      if (stopResize !== null) stopResize()
      if (resizeObserver !== null) resizeObserver.disconnect()
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
      resetState,

      // v1.2
      isDark,
      getCellValue,
      displayColumns,
      pinOf,
      setColumnPin,
      cellClass,
      cellStyle,
      leadClass,
      leadStyle,
      isResizable,
      startResize,
      autoSize,
      sortModel,
      sortModelActive,
      sortIndex,
      isSortDesc,
      ariaSort,
      applySortModel,
      onHeaderClickCapture,
      pinnedTop,
      pinnedBottom,
      pinRow,
      copyRows,
      onKeydown,
      ctx,
      contextItems,
      onContextCapture,
      runContextItem,
      totalCount,
      shownCount,
      selectionAggregates,
      formatCount
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
/* ---------------------------------------------------------------- v1.2 */

.qgrid .q-table--dark,
.qgrid--dark .q-table__middle {
  color-scheme: dark;
}

.qgrid:focus {
  outline: none;
}

.qgrid--copyable:focus-visible .q-table__container {
  box-shadow: 0 0 0 2px var(--q-primary);
}

/* pinned (frozen) columns */
.qgrid .q-table th.qgrid__pin,
.qgrid .q-table td.qgrid__pin {
  position: sticky;
  z-index: 1;
  background: var(--qgrid-pin-bg, #fff);
}

.qgrid .q-table thead th.qgrid__pin {
  z-index: 3;
}

.qgrid .q-table--dark th.qgrid__pin,
.qgrid .q-table--dark td.qgrid__pin {
  background: var(--qgrid-pin-bg-dark, var(--q-dark, #1d1d1d));
}

.qgrid .q-table .qgrid__pin--edge-left {
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1), 6px 0 8px -6px rgba(0, 0, 0, .22);
}

.qgrid .q-table .qgrid__pin--edge-right {
  box-shadow: inset 1px 0 0 rgba(0, 0, 0, .1), -6px 0 8px -6px rgba(0, 0, 0, .22);
}

.qgrid .q-table--dark .qgrid__pin--edge-left {
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, .14), 6px 0 8px -6px rgba(0, 0, 0, .6);
}

.qgrid .q-table--dark .qgrid__pin--edge-right {
  box-shadow: inset 1px 0 0 rgba(255, 255, 255, .14), -6px 0 8px -6px rgba(0, 0, 0, .6);
}

/* fixed / resized widths */
.qgrid .q-table td.qgrid__sized {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* resize handle */
.qgrid__header-row th:not(.qgrid__pin) {
  position: relative;
}

.qgrid__resizer {
  position: absolute;
  top: 0;
  right: -5px;
  z-index: 2;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  touch-action: none;
}

.qgrid__resizer::after {
  content: '';
  position: absolute;
  top: 20%;
  bottom: 20%;
  left: 4px;
  width: 2px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0;
  transition: opacity .15s;
}

.qgrid th:hover .qgrid__resizer::after {
  opacity: .18;
}

.qgrid__resizer:hover::after,
.qgrid--resizing .qgrid__resizer::after {
  opacity: .6;
  background: var(--q-primary);
}

.qgrid--resizing,
.qgrid--resizing * {
  cursor: col-resize !important;
  user-select: none;
}

/* multi-sort priority */
.qgrid__sort-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 2px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  opacity: .75;
  vertical-align: middle;
}

/* pinned rows */
.qgrid__pinned-row td {
  font-weight: 500;
  background: rgba(0, 0, 0, .025);
}

.q-table--dark .qgrid__pinned-row td {
  background: rgba(255, 255, 255, .04);
}

.qgrid__pinned-row--top:last-child td {
  border-bottom: 2px solid rgba(0, 0, 0, .12);
}

.q-table--dark .qgrid__pinned-row--top:last-child td {
  border-bottom-color: rgba(255, 255, 255, .24);
}

/* status bar */
.qgrid__status {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  padding: 8px 16px;
  font-size: 12px;
  line-height: 18px;
  color: rgba(0, 0, 0, .6);
}

.qgrid__status b {
  margin-left: 4px;
  font-weight: 600;
  color: rgba(0, 0, 0, .87);
}

.qgrid__status--dark {
  color: rgba(255, 255, 255, .6);
}

.qgrid__status--dark b {
  color: rgba(255, 255, 255, .9);
}

.qgrid__status-agg .qgrid__agg-label {
  margin: 0 0 0 4px;
}

.qgrid__context-menu {
  min-width: 220px;
}

.qgrid__context-icon {
  min-width: 28px;
  padding-right: 8px;
}
</style>
