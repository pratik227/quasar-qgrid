/**
 * Inline SVG icons (Quasar QIcon "svg path" format) so QGrid renders correctly
 * whatever icon set / icon fonts the host app uses.
 *
 * Paths: Google Material Icons (Apache License 2.0), as distributed by
 * @quasar/extras/material-icons. Override any of them with the `icons` prop.
 */
export default {
  search: 'M0 0h24v24H0z@@fill:none;&&M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  filter: 'M0,0h24 M24,24H0@@fill:none;&&M4.25,5.61C6.27,8.2,10,13,10,13v6c0,0.55,0.45,1,1,1h2c0.55,0,1-0.45,1-1v-6c0,0,3.72-4.8,5.74-7.39 C20.25,4.95,19.78,4,18.95,4H5.04C4.21,4,3.74,4.95,4.25,5.61z&&M0,0h24v24H0V0z@@fill:none;',
  clearFilters: 'M0 0 H24 V24 H0 V0 z@@fill:none;&&M19.79,5.61C20.3,4.95,19.83,4,19,4H6.83l7.97,7.97L19.79,5.61z&&M2.81,2.81L1.39,4.22L10,13v6c0,0.55,0.45,1,1,1h2c0.55,0,1-0.45,1-1v-2.17l5.78,5.78l1.41-1.41L2.81,2.81z',
  close: 'M0 0h24v24H0z@@fill:none;&&M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  cancel: 'M0 0h24v24H0z@@fill:none;&&M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z',
  fullscreen: 'M0 0h24v24H0z@@fill:none;&&M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
  fullscreenExit: 'M0 0h24v24H0z@@fill:none;&&M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z',
  filterRowOn: 'M0 0h24v24H0z@@fill:none;&&M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z',
  filterRowOff: 'M0 0 H24 V24 H0 V0 z@@fill:none;&&M10.83,8H21V6H8.83L10.83,8z M15.83,13H18v-2h-4.17L15.83,13z M14,16.83V18h-4v-2h3.17l-3-3H6v-2h2.17l-3-3H3V6h0.17 L1.39,4.22l1.41-1.41l18.38,18.38l-1.41,1.41L14,16.83z',
  date: 'M0 0h24v24H0z@@fill:none;&&M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z',
  numberRange: 'M20 10V8h-4V4h-2v4h-4V4H8v4H4v2h4v4H4v2h4v4h2v-4h4v4h2v-4h4v-2h-4v-4h4zm-6 4h-4v-4h4v4z',
  expand: 'M0 0h24v24H0z@@fill:none;&&M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  collapse: 'M0 0h24v24H0z@@fill:none;&&M19 13H5v-2h14v2z',
  detailOpen: 'M0 0h24v24H0z@@fill:none;&&M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z',
  detailClosed: 'M0 0h24v24H0z@@fill:none;&&M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  columns: 'M0 0 H24 V24 H0 V0 z@@fill:none;&&M14.67,5v14H9.33V5H14.67z M15.67,19H21V5h-5.33V19z M8.33,19V5H3v14H8.33z',
  csv: 'M0 0h24v24H0z@@fill:none;&&M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
  excel: 'M0 0h24v24H0z@@fill:none;&&M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z'
}
