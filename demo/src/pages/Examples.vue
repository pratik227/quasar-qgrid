<template>
  <q-page>
    <div class="q-markdown">
      <basic :tag-parts="getTagParts(require('!!raw-loader!../examples/Basic.vue').default)"></basic>
      <column-filter :tag-parts="getTagParts(require('!!raw-loader!../examples/ColumnFilter').default)"></column-filter>
      <header-filter :tag-parts="getTagParts(require('!!raw-loader!../examples/HeaderFilter').default)"></header-filter>
      <custom-column :tag-parts="getTagParts(require('!!raw-loader!../examples/CustomColumn').default)"></custom-column>
      <draggable :tag-parts="getTagParts(require('!!raw-loader!../examples/Draggable').default)"></draggable>
      <slot-demo :tag-parts="getTagParts(require('!!raw-loader!../examples/SlotDemo').default)"></slot-demo>
      <selection :tag-parts="getTagParts(require('!!raw-loader!../examples/Selection').default)"></selection>
<!--      <sticky-column :tag-parts="getTagParts(require('!!raw-loader!../examples/StickyColumn').default)"></sticky-column>-->
    </div>
  </q-page>
</template>

<script>
    import {getTagParts} from '@quasar/quasar-ui-qmarkdown'
    import Basic from "../examples/Basic";
    import ColumnFilter from "../examples/ColumnFilter";
    import HeaderFilter from "../examples/HeaderFilter";
    import CustomColumn from "../examples/CustomColumn";
    import StickyColumn from "../examples/StickyColumn";
    import Draggable from "../examples/Draggable";
    import SlotDemo from "../examples/SlotDemo";
    import Selection from "../examples/Selection";


    export default {
        name: "Examples",
        components: {Selection, SlotDemo, Draggable, StickyColumn, CustomColumn, HeaderFilter, ColumnFilter, Basic},
        data() {
            return {
                tableTitle: "My Custom Table",
                selectionMode: "multiple",
                loading: false,
                columns_filter: true,
                draggable: true,
                header_filter: true,
                filter: "",
                selected: [],
                file_name: 'Download',
                columns: [
                    {
                        name: 'name',
                        required: true,
                        label: 'Dessert (100g serving)',
                        align: 'left',
                        field: 'name',
                        format: val => `${val}`,
                        sortable: true,
                        // classes: 'bg-grey-2 ellipsis',
                        // style: 'max-width: 100px',
                        // headerClasses: 'bg-primary text-white'
                    },
                    {name: 'calories', align: 'center', label: 'Calories', field: 'calories', sortable: true},
                    {name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true},
                    {name: 'carbs', label: 'Carbs (g)', field: 'carbs'},
                    {name: 'protein', label: 'Protein (g)', field: 'protein'},
                    {name: 'sodium', label: 'Sodium (mg)', field: 'sodium'},
                    {
                        name: 'calcium',
                        label: 'Calcium (%)',
                        field: 'calcium',
                        sortable: true,
                        sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
                    },
                    {
                        name: 'iron',
                        label: 'Iron (%)',
                        field: 'iron',
                        sortable: true,
                        sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
                    }
                ],
                data: [
                    {
                        name: 'Frozen Yogurt',
                        calories: 159,
                        fat: 6.0,
                        carbs: 24,
                        protein: 4.0,
                        sodium: 87,
                        calcium: '14%',
                        iron: '1%'
                    },
                    {
                        name: 'Ice cream sandwich',
                        calories: 237,
                        fat: 9.0,
                        carbs: 37,
                        protein: 4.3,
                        sodium: 129,
                        calcium: '8%',
                        iron: '1%'
                    },
                    {
                        name: 'Eclair',
                        calories: 262,
                        fat: 16.0,
                        carbs: 23,
                        protein: 6.0,
                        sodium: 337,
                        calcium: '6%',
                        iron: '7%'
                    },
                    {
                        name: 'Cupcake',
                        calories: 305,
                        fat: 3.7,
                        carbs: 67,
                        protein: 4.3,
                        sodium: 413,
                        calcium: '3%',
                        iron: '8%'
                    },
                    {
                        name: 'Gingerbread',
                        calories: 356,
                        fat: 16.0,
                        carbs: 49,
                        protein: 3.9,
                        sodium: 327,
                        calcium: '7%',
                        iron: '16%'
                    },
                    {
                        name: 'Jelly bean',
                        calories: 375,
                        fat: 0.0,
                        carbs: 94,
                        protein: 0.0,
                        sodium: 50,
                        calcium: '0%',
                        iron: '0%'
                    },
                    {
                        name: 'Lollipop',
                        calories: 392,
                        fat: 0.2,
                        carbs: 98,
                        protein: 0,
                        sodium: 38,
                        calcium: '0%',
                        iron: '2%'
                    },
                    {
                        name: 'Honeycomb',
                        calories: 408,
                        fat: 3.2,
                        carbs: 87,
                        protein: 6.5,
                        sodium: 562,
                        calcium: '0%',
                        iron: '45%'
                    },
                    {
                        name: 'Donut',
                        calories: 452,
                        fat: 25.0,
                        carbs: 51,
                        protein: 4.9,
                        sodium: 326,
                        calcium: '2%',
                        iron: '22%'
                    },
                    {
                        name: 'KitKat',
                        calories: 518,
                        fat: 26.0,
                        carbs: 65,
                        protein: 7,
                        sodium: 54,
                        calcium: '12%',
                        iron: '6%'
                    }
                ]
            };
        },
        methods: {
            getTagParts
        }
    }
</script>

<style scoped>

</style>
