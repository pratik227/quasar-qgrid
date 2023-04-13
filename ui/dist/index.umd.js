/*!
 * quasar-ui-qgrid v1.0.18
 * (c) 2023 pratikpatelpp802@gmail.com
 * Released under the MIT License.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue'), require('quasar')) :
  typeof define === 'function' && define.amd ? define(['vue', 'quasar'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.QGrid = factory(global.Vue, global.Quasar));
}(this, (function (vue, quasar) { 'use strict';

  /**!
   * Sortable 1.13.0
   * @author	RubaXa   <trash@rubaxa.org>
   * @author	owenm    <owen23355@gmail.com>
   * @license MIT
   */
  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      var arguments$1 = arguments;

      for (var i = 1; i < arguments.length; i++) {
        var source = arguments$1[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _objectSpread(target) {
    var arguments$1 = arguments;

    for (var i = 1; i < arguments.length; i++) {
      var source = arguments$1[i] != null ? arguments$1[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) { return {}; }
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) { continue; }
      target[key] = source[key];
    }

    return target;
  }

  function _objectWithoutProperties(source, excluded) {
    if (source == null) { return {}; }

    var target = _objectWithoutPropertiesLoose(source, excluded);

    var key, i;

    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) { continue; }
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) { continue; }
        target[key] = source[key];
      }
    }

    return target;
  }

  var version$2 = "1.13.0";

  function userAgent(pattern) {
    if (typeof window !== 'undefined' && window.navigator) {
      return !!
      /*@__PURE__*/
      navigator.userAgent.match(pattern);
    }
  }

  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var FireFox = userAgent(/firefox/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
  var IOS = userAgent(/iP(ad|od|hone)/i);
  var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);

  var captureMode = {
    capture: false,
    passive: false
  };

  function on(el, event, fn) {
    el.addEventListener(event, fn, !IE11OrLess && captureMode);
  }

  function off(el, event, fn) {
    el.removeEventListener(event, fn, !IE11OrLess && captureMode);
  }

  function matches(
  /**HTMLElement*/
  el,
  /**String*/
  selector) {
    if (!selector) { return; }
    selector[0] === '>' && (selector = selector.substring(1));

    if (el) {
      try {
        if (el.matches) {
          return el.matches(selector);
        } else if (el.msMatchesSelector) {
          return el.msMatchesSelector(selector);
        } else if (el.webkitMatchesSelector) {
          return el.webkitMatchesSelector(selector);
        }
      } catch (_) {
        return false;
      }
    }

    return false;
  }

  function getParentOrHost(el) {
    return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
  }

  function closest(
  /**HTMLElement*/
  el,
  /**String*/
  selector,
  /**HTMLElement*/
  ctx, includeCTX) {
    if (el) {
      ctx = ctx || document;

      do {
        if (selector != null && (selector[0] === '>' ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
          return el;
        }

        if (el === ctx) { break; }
        /* jshint boss:true */
      } while (el = getParentOrHost(el));
    }

    return null;
  }

  var R_SPACE = /\s+/g;

  function toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? 'add' : 'remove'](name);
      } else {
        var className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ');
        el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
      }
    }
  }

  function css(el, prop, val) {
    var style = el && el.style;

    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el, '');
        } else if (el.currentStyle) {
          val = el.currentStyle;
        }

        return prop === void 0 ? val : val[prop];
      } else {
        if (!(prop in style) && prop.indexOf('webkit') === -1) {
          prop = '-webkit-' + prop;
        }

        style[prop] = val + (typeof val === 'string' ? '' : 'px');
      }
    }
  }

  function matrix(el, selfOnly) {
    var appliedTransforms = '';

    if (typeof el === 'string') {
      appliedTransforms = el;
    } else {
      do {
        var transform = css(el, 'transform');

        if (transform && transform !== 'none') {
          appliedTransforms = transform + ' ' + appliedTransforms;
        }
        /* jshint boss:true */

      } while (!selfOnly && (el = el.parentNode));
    }

    var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
    /*jshint -W056 */

    return matrixFn && new matrixFn(appliedTransforms);
  }

  function find(ctx, tagName, iterator) {
    if (ctx) {
      var list = ctx.getElementsByTagName(tagName),
          i = 0,
          n = list.length;

      if (iterator) {
        for (; i < n; i++) {
          iterator(list[i], i);
        }
      }

      return list;
    }

    return [];
  }

  function getWindowScrollingElement() {
    var scrollingElement = document.scrollingElement;

    if (scrollingElement) {
      return scrollingElement;
    } else {
      return document.documentElement;
    }
  }
  /**
   * Returns the "bounding client rect" of given element
   * @param  {HTMLElement} el                       The element whose boundingClientRect is wanted
   * @param  {[Boolean]} relativeToContainingBlock  Whether the rect should be relative to the containing block of (including) the container
   * @param  {[Boolean]} relativeToNonStaticParent  Whether the rect should be relative to the relative parent of (including) the contaienr
   * @param  {[Boolean]} undoScale                  Whether the container's scale() should be undone
   * @param  {[HTMLElement]} container              The parent the element will be placed in
   * @return {Object}                               The boundingClientRect of el, with specified adjustments
   */


  function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
    if (!el.getBoundingClientRect && el !== window) { return; }
    var elRect, top, left, bottom, right, height, width;

    if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width;
    } else {
      top = 0;
      left = 0;
      bottom = window.innerHeight;
      right = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth;
    }

    if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
      // Adjust for translate()
      container = container || el.parentNode; // solves #1123 (see: https://stackoverflow.com/a/37953806/6088312)
      // Not needed on <= IE11

      if (!IE11OrLess) {
        do {
          if (container && container.getBoundingClientRect && (css(container, 'transform') !== 'none' || relativeToNonStaticParent && css(container, 'position') !== 'static')) {
            var containerRect = container.getBoundingClientRect(); // Set relative to edges of padding box of container

            top -= containerRect.top + parseInt(css(container, 'border-top-width'));
            left -= containerRect.left + parseInt(css(container, 'border-left-width'));
            bottom = top + elRect.height;
            right = left + elRect.width;
            break;
          }
          /* jshint boss:true */

        } while (container = container.parentNode);
      }
    }

    if (undoScale && el !== window) {
      // Adjust for scale()
      var elMatrix = matrix(container || el),
          scaleX = elMatrix && elMatrix.a,
          scaleY = elMatrix && elMatrix.d;

      if (elMatrix) {
        top /= scaleY;
        left /= scaleX;
        width /= scaleX;
        height /= scaleY;
        bottom = top + height;
        right = left + width;
      }
    }

    return {
      top: top,
      left: left,
      bottom: bottom,
      right: right,
      width: width,
      height: height
    };
  }
  /**
   * Checks if a side of an element is scrolled past a side of its parents
   * @param  {HTMLElement}  el           The element who's side being scrolled out of view is in question
   * @param  {String}       elSide       Side of the element in question ('top', 'left', 'right', 'bottom')
   * @param  {String}       parentSide   Side of the parent in question ('top', 'left', 'right', 'bottom')
   * @return {HTMLElement}               The parent scroll element that the el's side is scrolled past, or null if there is no such element
   */


  function isScrolledPast(el, elSide, parentSide) {
    var parent = getParentAutoScrollElement(el, true),
        elSideVal = getRect(el)[elSide];
    /* jshint boss:true */

    while (parent) {
      var parentSideVal = getRect(parent)[parentSide],
          visible = void 0;

      if (parentSide === 'top' || parentSide === 'left') {
        visible = elSideVal >= parentSideVal;
      } else {
        visible = elSideVal <= parentSideVal;
      }

      if (!visible) { return parent; }
      if (parent === getWindowScrollingElement()) { break; }
      parent = getParentAutoScrollElement(parent, false);
    }

    return false;
  }
  /**
   * Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible)
   * and non-draggable elements
   * @param  {HTMLElement} el       The parent element
   * @param  {Number} childNum      The index of the child
   * @param  {Object} options       Parent Sortable's options
   * @return {HTMLElement}          The child at index childNum, or null if not found
   */


  function getChild(el, childNum, options) {
    var currentChild = 0,
        i = 0,
        children = el.children;

    while (i < children.length) {
      if (children[i].style.display !== 'none' && children[i] !== Sortable.ghost && children[i] !== Sortable.dragged && closest(children[i], options.draggable, el, false)) {
        if (currentChild === childNum) {
          return children[i];
        }

        currentChild++;
      }

      i++;
    }

    return null;
  }
  /**
   * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
   * @param  {HTMLElement} el       Parent element
   * @param  {selector} selector    Any other elements that should be ignored
   * @return {HTMLElement}          The last child, ignoring ghostEl
   */


  function lastChild(el, selector) {
    var last = el.lastElementChild;

    while (last && (last === Sortable.ghost || css(last, 'display') === 'none' || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }

    return last || null;
  }
  /**
   * Returns the index of an element within its parent for a selected set of
   * elements
   * @param  {HTMLElement} el
   * @param  {selector} selector
   * @return {number}
   */


  function index(el, selector) {
    var index = 0;

    if (!el || !el.parentNode) {
      return -1;
    }
    /* jshint boss:true */


    while (el = el.previousElementSibling) {
      if (el.nodeName.toUpperCase() !== 'TEMPLATE' && el !== Sortable.clone && (!selector || matches(el, selector))) {
        index++;
      }
    }

    return index;
  }
  /**
   * Returns the scroll offset of the given element, added with all the scroll offsets of parent elements.
   * The value is returned in real pixels.
   * @param  {HTMLElement} el
   * @return {Array}             Offsets in the format of [left, top]
   */


  function getRelativeScrollOffset(el) {
    var offsetLeft = 0,
        offsetTop = 0,
        winScroller = getWindowScrollingElement();

    if (el) {
      do {
        var elMatrix = matrix(el),
            scaleX = elMatrix.a,
            scaleY = elMatrix.d;
        offsetLeft += el.scrollLeft * scaleX;
        offsetTop += el.scrollTop * scaleY;
      } while (el !== winScroller && (el = el.parentNode));
    }

    return [offsetLeft, offsetTop];
  }
  /**
   * Returns the index of the object within the given array
   * @param  {Array} arr   Array that may or may not hold the object
   * @param  {Object} obj  An object that has a key-value pair unique to and identical to a key-value pair in the object you want to find
   * @return {Number}      The index of the object in the array, or -1
   */


  function indexOfObject(arr, obj) {
    for (var i in arr) {
      if (!arr.hasOwnProperty(i)) { continue; }

      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) { return Number(i); }
      }
    }

    return -1;
  }

  function getParentAutoScrollElement(el, includeSelf) {
    // skip to window
    if (!el || !el.getBoundingClientRect) { return getWindowScrollingElement(); }
    var elem = el;
    var gotSelf = false;

    do {
      // we don't need to get elem css if it isn't even overflowing in the first place (performance)
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);

        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll') || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll')) {
          if (!elem.getBoundingClientRect || elem === document.body) { return getWindowScrollingElement(); }
          if (gotSelf || includeSelf) { return elem; }
          gotSelf = true;
        }
      }
      /* jshint boss:true */

    } while (elem = elem.parentNode);

    return getWindowScrollingElement();
  }

  function extend(dst, src) {
    if (dst && src) {
      for (var key in src) {
        if (src.hasOwnProperty(key)) {
          dst[key] = src[key];
        }
      }
    }

    return dst;
  }

  function isRectEqual(rect1, rect2) {
    return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
  }

  var _throttleTimeout;

  function throttle(callback, ms) {
    return function () {
      if (!_throttleTimeout) {
        var args = arguments,
            _this = this;

        if (args.length === 1) {
          callback.call(_this, args[0]);
        } else {
          callback.apply(_this, args);
        }

        _throttleTimeout = setTimeout(function () {
          _throttleTimeout = void 0;
        }, ms);
      }
    };
  }

  function cancelThrottle() {
    clearTimeout(_throttleTimeout);
    _throttleTimeout = void 0;
  }

  function scrollBy(el, x, y) {
    el.scrollLeft += x;
    el.scrollTop += y;
  }

  function clone(el) {
    var Polymer = window.Polymer;
    var $ = window.jQuery || window.Zepto;

    if (Polymer && Polymer.dom) {
      return Polymer.dom(el).cloneNode(true);
    } else if ($) {
      return $(el).clone(true)[0];
    } else {
      return el.cloneNode(true);
    }
  }

  var expando = 'Sortable' + new Date().getTime();

  function AnimationStateManager() {
    var animationStates = [],
        animationCallbackId;
    return {
      captureAnimationState: function captureAnimationState() {
        animationStates = [];
        if (!this.options.animation) { return; }
        var children = [].slice.call(this.el.children);
        children.forEach(function (child) {
          if (css(child, 'display') === 'none' || child === Sortable.ghost) { return; }
          animationStates.push({
            target: child,
            rect: getRect(child)
          });

          var fromRect = _objectSpread({}, animationStates[animationStates.length - 1].rect); // If animating: compensate for current animation


          if (child.thisAnimationDuration) {
            var childMatrix = matrix(child, true);

            if (childMatrix) {
              fromRect.top -= childMatrix.f;
              fromRect.left -= childMatrix.e;
            }
          }

          child.fromRect = fromRect;
        });
      },
      addAnimationState: function addAnimationState(state) {
        animationStates.push(state);
      },
      removeAnimationState: function removeAnimationState(target) {
        animationStates.splice(indexOfObject(animationStates, {
          target: target
        }), 1);
      },
      animateAll: function animateAll(callback) {
        var _this = this;

        if (!this.options.animation) {
          clearTimeout(animationCallbackId);
          if (typeof callback === 'function') { callback(); }
          return;
        }

        var animating = false,
            animationTime = 0;
        animationStates.forEach(function (state) {
          var time = 0,
              target = state.target,
              fromRect = target.fromRect,
              toRect = getRect(target),
              prevFromRect = target.prevFromRect,
              prevToRect = target.prevToRect,
              animatingRect = state.rect,
              targetMatrix = matrix(target, true);

          if (targetMatrix) {
            // Compensate for current animation
            toRect.top -= targetMatrix.f;
            toRect.left -= targetMatrix.e;
          }

          target.toRect = toRect;

          if (target.thisAnimationDuration) {
            // Could also check if animatingRect is between fromRect and toRect
            if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
            (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
              // If returning to same place as started from animation and on same axis
              time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
            }
          } // if fromRect != toRect: animate


          if (!isRectEqual(toRect, fromRect)) {
            target.prevFromRect = fromRect;
            target.prevToRect = toRect;

            if (!time) {
              time = _this.options.animation;
            }

            _this.animate(target, animatingRect, toRect, time);
          }

          if (time) {
            animating = true;
            animationTime = Math.max(animationTime, time);
            clearTimeout(target.animationResetTimer);
            target.animationResetTimer = setTimeout(function () {
              target.animationTime = 0;
              target.prevFromRect = null;
              target.fromRect = null;
              target.prevToRect = null;
              target.thisAnimationDuration = null;
            }, time);
            target.thisAnimationDuration = time;
          }
        });
        clearTimeout(animationCallbackId);

        if (!animating) {
          if (typeof callback === 'function') { callback(); }
        } else {
          animationCallbackId = setTimeout(function () {
            if (typeof callback === 'function') { callback(); }
          }, animationTime);
        }

        animationStates = [];
      },
      animate: function animate(target, currentRect, toRect, duration) {
        if (duration) {
          css(target, 'transition', '');
          css(target, 'transform', '');
          var elMatrix = matrix(this.el),
              scaleX = elMatrix && elMatrix.a,
              scaleY = elMatrix && elMatrix.d,
              translateX = (currentRect.left - toRect.left) / (scaleX || 1),
              translateY = (currentRect.top - toRect.top) / (scaleY || 1);
          target.animatingX = !!translateX;
          target.animatingY = !!translateY;
          css(target, 'transform', 'translate3d(' + translateX + 'px,' + translateY + 'px,0)');
          this.forRepaintDummy = repaint(target); // repaint

          css(target, 'transition', 'transform ' + duration + 'ms' + (this.options.easing ? ' ' + this.options.easing : ''));
          css(target, 'transform', 'translate3d(0,0,0)');
          typeof target.animated === 'number' && clearTimeout(target.animated);
          target.animated = setTimeout(function () {
            css(target, 'transition', '');
            css(target, 'transform', '');
            target.animated = false;
            target.animatingX = false;
            target.animatingY = false;
          }, duration);
        }
      }
    };
  }

  function repaint(target) {
    return target.offsetWidth;
  }

  function calculateRealTime(animatingRect, fromRect, toRect, options) {
    return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
  }

  var plugins = [];
  var defaults = {
    initializeByDefault: true
  };
  var PluginManager = {
    mount: function mount(plugin) {
      // Set default static properties
      for (var option in defaults) {
        if (defaults.hasOwnProperty(option) && !(option in plugin)) {
          plugin[option] = defaults[option];
        }
      }

      plugins.forEach(function (p) {
        if (p.pluginName === plugin.pluginName) {
          throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
        }
      });
      plugins.push(plugin);
    },
    pluginEvent: function pluginEvent(eventName, sortable, evt) {
      var _this = this;

      this.eventCanceled = false;

      evt.cancel = function () {
        _this.eventCanceled = true;
      };

      var eventNameGlobal = eventName + 'Global';
      plugins.forEach(function (plugin) {
        if (!sortable[plugin.pluginName]) { return; } // Fire global events if it exists in this sortable

        if (sortable[plugin.pluginName][eventNameGlobal]) {
          sortable[plugin.pluginName][eventNameGlobal](_objectSpread({
            sortable: sortable
          }, evt));
        } // Only fire plugin event if plugin is enabled in this sortable,
        // and plugin has event defined


        if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
          sortable[plugin.pluginName][eventName](_objectSpread({
            sortable: sortable
          }, evt));
        }
      });
    },
    initializePlugins: function initializePlugins(sortable, el, defaults, options) {
      plugins.forEach(function (plugin) {
        var pluginName = plugin.pluginName;
        if (!sortable.options[pluginName] && !plugin.initializeByDefault) { return; }
        var initialized = new plugin(sortable, el, sortable.options);
        initialized.sortable = sortable;
        initialized.options = sortable.options;
        sortable[pluginName] = initialized; // Add default options from plugin

        _extends(defaults, initialized.defaults);
      });

      for (var option in sortable.options) {
        if (!sortable.options.hasOwnProperty(option)) { continue; }
        var modified = this.modifyOption(sortable, option, sortable.options[option]);

        if (typeof modified !== 'undefined') {
          sortable.options[option] = modified;
        }
      }
    },
    getEventProperties: function getEventProperties(name, sortable) {
      var eventProperties = {};
      plugins.forEach(function (plugin) {
        if (typeof plugin.eventProperties !== 'function') { return; }

        _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
      });
      return eventProperties;
    },
    modifyOption: function modifyOption(sortable, name, value) {
      var modifiedValue;
      plugins.forEach(function (plugin) {
        // Plugin must exist on the Sortable
        if (!sortable[plugin.pluginName]) { return; } // If static option listener exists for this option, call in the context of the Sortable's instance of this plugin

        if (plugin.optionListeners && typeof plugin.optionListeners[name] === 'function') {
          modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
        }
      });
      return modifiedValue;
    }
  };

  function dispatchEvent(_ref) {
    var sortable = _ref.sortable,
        rootEl = _ref.rootEl,
        name = _ref.name,
        targetEl = _ref.targetEl,
        cloneEl = _ref.cloneEl,
        toEl = _ref.toEl,
        fromEl = _ref.fromEl,
        oldIndex = _ref.oldIndex,
        newIndex = _ref.newIndex,
        oldDraggableIndex = _ref.oldDraggableIndex,
        newDraggableIndex = _ref.newDraggableIndex,
        originalEvent = _ref.originalEvent,
        putSortable = _ref.putSortable,
        extraEventProperties = _ref.extraEventProperties;
    sortable = sortable || rootEl && rootEl[expando];
    if (!sortable) { return; }
    var evt,
        options = sortable.options,
        onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1); // Support for new CustomEvent feature

    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent(name, {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent('Event');
      evt.initEvent(name, true, true);
    }

    evt.to = toEl || rootEl;
    evt.from = fromEl || rootEl;
    evt.item = targetEl || rootEl;
    evt.clone = cloneEl;
    evt.oldIndex = oldIndex;
    evt.newIndex = newIndex;
    evt.oldDraggableIndex = oldDraggableIndex;
    evt.newDraggableIndex = newDraggableIndex;
    evt.originalEvent = originalEvent;
    evt.pullMode = putSortable ? putSortable.lastPutMode : undefined;

    var allEventProperties = _objectSpread({}, extraEventProperties, PluginManager.getEventProperties(name, sortable));

    for (var option in allEventProperties) {
      evt[option] = allEventProperties[option];
    }

    if (rootEl) {
      rootEl.dispatchEvent(evt);
    }

    if (options[onName]) {
      options[onName].call(sortable, evt);
    }
  }

  var pluginEvent = function pluginEvent(eventName, sortable) {
    var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        originalEvent = _ref.evt,
        data = _objectWithoutProperties(_ref, ["evt"]);

    PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread({
      dragEl: dragEl,
      parentEl: parentEl,
      ghostEl: ghostEl,
      rootEl: rootEl,
      nextEl: nextEl,
      lastDownEl: lastDownEl,
      cloneEl: cloneEl,
      cloneHidden: cloneHidden,
      dragStarted: moved,
      putSortable: putSortable,
      activeSortable: Sortable.active,
      originalEvent: originalEvent,
      oldIndex: oldIndex,
      oldDraggableIndex: oldDraggableIndex,
      newIndex: newIndex,
      newDraggableIndex: newDraggableIndex,
      hideGhostForTarget: _hideGhostForTarget,
      unhideGhostForTarget: _unhideGhostForTarget,
      cloneNowHidden: function cloneNowHidden() {
        cloneHidden = true;
      },
      cloneNowShown: function cloneNowShown() {
        cloneHidden = false;
      },
      dispatchSortableEvent: function dispatchSortableEvent(name) {
        _dispatchEvent({
          sortable: sortable,
          name: name,
          originalEvent: originalEvent
        });
      }
    }, data));
  };

  function _dispatchEvent(info) {
    dispatchEvent(_objectSpread({
      putSortable: putSortable,
      cloneEl: cloneEl,
      targetEl: dragEl,
      rootEl: rootEl,
      oldIndex: oldIndex,
      oldDraggableIndex: oldDraggableIndex,
      newIndex: newIndex,
      newDraggableIndex: newDraggableIndex
    }, info));
  }

  var dragEl,
      parentEl,
      ghostEl,
      rootEl,
      nextEl,
      lastDownEl,
      cloneEl,
      cloneHidden,
      oldIndex,
      newIndex,
      oldDraggableIndex,
      newDraggableIndex,
      activeGroup,
      putSortable,
      awaitingDragStarted = false,
      ignoreNextClick = false,
      sortables = [],
      tapEvt,
      touchEvt,
      lastDx,
      lastDy,
      tapDistanceLeft,
      tapDistanceTop,
      moved,
      lastTarget,
      lastDirection,
      pastFirstInvertThresh = false,
      isCircumstantialInvert = false,
      targetMoveDistance,
      // For positioning ghost absolutely
  ghostRelativeParent,
      ghostRelativeParentInitialScroll = [],
      // (left, top)
  _silent = false,
      savedInputChecked = [];
  /** @const */

  var documentExists = typeof document !== 'undefined',
      PositionGhostAbsolutely = IOS,
      CSSFloatProperty = Edge || IE11OrLess ? 'cssFloat' : 'float',
      // This will not pass for IE9, because IE9 DnD only works on anchors
  supportDraggable = documentExists && !ChromeForAndroid && !IOS && 'draggable' in document.createElement('div'),
      supportCssPointerEvents = function () {
    if (!documentExists) { return; } // false when <= IE11

    if (IE11OrLess) {
      return false;
    }

    var el = document.createElement('x');
    el.style.cssText = 'pointer-events:auto';
    return el.style.pointerEvents === 'auto';
  }(),
      _detectDirection = function _detectDirection(el, options) {
    var elCSS = css(el),
        elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth),
        child1 = getChild(el, 0, options),
        child2 = getChild(el, 1, options),
        firstChildCSS = child1 && css(child1),
        secondChildCSS = child2 && css(child2),
        firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width,
        secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;

    if (elCSS.display === 'flex') {
      return elCSS.flexDirection === 'column' || elCSS.flexDirection === 'column-reverse' ? 'vertical' : 'horizontal';
    }

    if (elCSS.display === 'grid') {
      return elCSS.gridTemplateColumns.split(' ').length <= 1 ? 'vertical' : 'horizontal';
    }

    if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== 'none') {
      var touchingSideChild2 = firstChildCSS["float"] === 'left' ? 'left' : 'right';
      return child2 && (secondChildCSS.clear === 'both' || secondChildCSS.clear === touchingSideChild2) ? 'vertical' : 'horizontal';
    }

    return child1 && (firstChildCSS.display === 'block' || firstChildCSS.display === 'flex' || firstChildCSS.display === 'table' || firstChildCSS.display === 'grid' || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === 'none' || child2 && elCSS[CSSFloatProperty] === 'none' && firstChildWidth + secondChildWidth > elWidth) ? 'vertical' : 'horizontal';
  },
      _dragElInRowColumn = function _dragElInRowColumn(dragRect, targetRect, vertical) {
    var dragElS1Opp = vertical ? dragRect.left : dragRect.top,
        dragElS2Opp = vertical ? dragRect.right : dragRect.bottom,
        dragElOppLength = vertical ? dragRect.width : dragRect.height,
        targetS1Opp = vertical ? targetRect.left : targetRect.top,
        targetS2Opp = vertical ? targetRect.right : targetRect.bottom,
        targetOppLength = vertical ? targetRect.width : targetRect.height;
    return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
  },

  /**
   * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
   * @param  {Number} x      X position
   * @param  {Number} y      Y position
   * @return {HTMLElement}   Element of the first found nearest Sortable
   */
  _detectNearestEmptySortable = function _detectNearestEmptySortable(x, y) {
    var ret;
    sortables.some(function (sortable) {
      if (lastChild(sortable)) { return; }
      var rect = getRect(sortable),
          threshold = sortable[expando].options.emptyInsertThreshold,
          insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
          insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;

      if (threshold && insideHorizontally && insideVertically) {
        return ret = sortable;
      }
    });
    return ret;
  },
      _prepareGroup = function _prepareGroup(options) {
    function toFn(value, pull) {
      return function (to, from, dragEl, evt) {
        var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;

        if (value == null && (pull || sameGroup)) {
          // Default pull value
          // Default pull and put value if same group
          return true;
        } else if (value == null || value === false) {
          return false;
        } else if (pull && value === 'clone') {
          return value;
        } else if (typeof value === 'function') {
          return toFn(value(to, from, dragEl, evt), pull)(to, from, dragEl, evt);
        } else {
          var otherGroup = (pull ? to : from).options.group.name;
          return value === true || typeof value === 'string' && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
        }
      };
    }

    var group = {};
    var originalGroup = options.group;

    if (!originalGroup || _typeof(originalGroup) != 'object') {
      originalGroup = {
        name: originalGroup
      };
    }

    group.name = originalGroup.name;
    group.checkPull = toFn(originalGroup.pull, true);
    group.checkPut = toFn(originalGroup.put);
    group.revertClone = originalGroup.revertClone;
    options.group = group;
  },
      _hideGhostForTarget = function _hideGhostForTarget() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, 'display', 'none');
    }
  },
      _unhideGhostForTarget = function _unhideGhostForTarget() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, 'display', '');
    }
  }; // #1184 fix - Prevent click event on fallback if dragged but item not changed position


  if (documentExists) {
    document.addEventListener('click', function (evt) {
      if (ignoreNextClick) {
        evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.stopImmediatePropagation && evt.stopImmediatePropagation();
        ignoreNextClick = false;
        return false;
      }
    }, true);
  }

  var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent(evt) {
    if (dragEl) {
      evt = evt.touches ? evt.touches[0] : evt;

      var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);

      if (nearest) {
        // Create imitation event
        var event = {};

        for (var i in evt) {
          if (evt.hasOwnProperty(i)) {
            event[i] = evt[i];
          }
        }

        event.target = event.rootEl = nearest;
        event.preventDefault = void 0;
        event.stopPropagation = void 0;

        nearest[expando]._onDragOver(event);
      }
    }
  };

  var _checkOutsideTargetEl = function _checkOutsideTargetEl(evt) {
    if (dragEl) {
      dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
    }
  };
  /**
   * @class  Sortable
   * @param  {HTMLElement}  el
   * @param  {Object}       [options]
   */


  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }

    this.el = el; // root element

    this.options = options = _extends({}, options); // Export instance

    el[expando] = this;
    var defaults = {
      group: null,
      sort: true,
      disabled: false,
      store: null,
      handle: null,
      draggable: /^[uo]l$/i.test(el.nodeName) ? '>li' : '>*',
      swapThreshold: 1,
      // percentage; 0 <= x <= 1
      invertSwap: false,
      // invert always
      invertedSwapThreshold: null,
      // will be set to same as swapThreshold if default
      removeCloneOnHide: true,
      direction: function direction() {
        return _detectDirection(el, this.options);
      },
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      ignore: 'a, img',
      filter: null,
      preventOnFilter: true,
      animation: 0,
      easing: null,
      setData: function setData(dataTransfer, dragEl) {
        dataTransfer.setData('Text', dragEl.textContent);
      },
      dropBubble: false,
      dragoverBubble: false,
      dataIdAttr: 'data-id',
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      forceFallback: false,
      fallbackClass: 'sortable-fallback',
      fallbackOnBody: false,
      fallbackTolerance: 0,
      fallbackOffset: {
        x: 0,
        y: 0
      },
      supportPointer: Sortable.supportPointer !== false && 'PointerEvent' in window && !Safari,
      emptyInsertThreshold: 5
    };
    PluginManager.initializePlugins(this, el, defaults); // Set default options

    for (var name in defaults) {
      !(name in options) && (options[name] = defaults[name]);
    }

    _prepareGroup(options); // Bind all private methods


    for (var fn in this) {
      if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
        this[fn] = this[fn].bind(this);
      }
    } // Setup drag mode


    this.nativeDraggable = options.forceFallback ? false : supportDraggable;

    if (this.nativeDraggable) {
      // Touch start threshold cannot be greater than the native dragstart threshold
      this.options.touchStartThreshold = 1;
    } // Bind events


    if (options.supportPointer) {
      on(el, 'pointerdown', this._onTapStart);
    } else {
      on(el, 'mousedown', this._onTapStart);
      on(el, 'touchstart', this._onTapStart);
    }

    if (this.nativeDraggable) {
      on(el, 'dragover', this);
      on(el, 'dragenter', this);
    }

    sortables.push(this.el); // Restore sorting

    options.store && options.store.get && this.sort(options.store.get(this) || []); // Add animation state manager

    _extends(this, AnimationStateManager());
  }

  Sortable.prototype =
  /** @lends Sortable.prototype */
  {
    constructor: Sortable,
    _isOutsideThisEl: function _isOutsideThisEl(target) {
      if (!this.el.contains(target) && target !== this.el) {
        lastTarget = null;
      }
    },
    _getDirection: function _getDirection(evt, target) {
      return typeof this.options.direction === 'function' ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
    },
    _onTapStart: function _onTapStart(
    /** Event|TouchEvent */
    evt) {
      if (!evt.cancelable) { return; }

      var _this = this,
          el = this.el,
          options = this.options,
          preventOnFilter = options.preventOnFilter,
          type = evt.type,
          touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === 'touch' && evt,
          target = (touch || evt).target,
          originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target,
          filter = options.filter;

      _saveInputCheckedState(el); // Don't trigger start event when an element is been dragged, otherwise the evt.oldindex always wrong when set option.group.


      if (dragEl) {
        return;
      }

      if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
        return; // only left button and enabled
      } // cancel dnd if original target is content editable


      if (originalTarget.isContentEditable) {
        return;
      } // Safari ignores further event handling after mousedown


      if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === 'SELECT') {
        return;
      }

      target = closest(target, options.draggable, el, false);

      if (target && target.animated) {
        return;
      }

      if (lastDownEl === target) {
        // Ignoring duplicate `down`
        return;
      } // Get the index of the dragged element within its parent


      oldIndex = index(target);
      oldDraggableIndex = index(target, options.draggable); // Check filter

      if (typeof filter === 'function') {
        if (filter.call(this, evt, target, this)) {
          _dispatchEvent({
            sortable: _this,
            rootEl: originalTarget,
            name: 'filter',
            targetEl: target,
            toEl: el,
            fromEl: el
          });

          pluginEvent('filter', _this, {
            evt: evt
          });
          preventOnFilter && evt.cancelable && evt.preventDefault();
          return; // cancel dnd
        }
      } else if (filter) {
        filter = filter.split(',').some(function (criteria) {
          criteria = closest(originalTarget, criteria.trim(), el, false);

          if (criteria) {
            _dispatchEvent({
              sortable: _this,
              rootEl: criteria,
              name: 'filter',
              targetEl: target,
              fromEl: el,
              toEl: el
            });

            pluginEvent('filter', _this, {
              evt: evt
            });
            return true;
          }
        });

        if (filter) {
          preventOnFilter && evt.cancelable && evt.preventDefault();
          return; // cancel dnd
        }
      }

      if (options.handle && !closest(originalTarget, options.handle, el, false)) {
        return;
      } // Prepare `dragstart`


      this._prepareDragStart(evt, touch, target);
    },
    _prepareDragStart: function _prepareDragStart(
    /** Event */
    evt,
    /** Touch */
    touch,
    /** HTMLElement */
    target) {
      var _this = this,
          el = _this.el,
          options = _this.options,
          ownerDocument = el.ownerDocument,
          dragStartFn;

      if (target && !dragEl && target.parentNode === el) {
        var dragRect = getRect(target);
        rootEl = el;
        dragEl = target;
        parentEl = dragEl.parentNode;
        nextEl = dragEl.nextSibling;
        lastDownEl = target;
        activeGroup = options.group;
        Sortable.dragged = dragEl;
        tapEvt = {
          target: dragEl,
          clientX: (touch || evt).clientX,
          clientY: (touch || evt).clientY
        };
        tapDistanceLeft = tapEvt.clientX - dragRect.left;
        tapDistanceTop = tapEvt.clientY - dragRect.top;
        this._lastX = (touch || evt).clientX;
        this._lastY = (touch || evt).clientY;
        dragEl.style['will-change'] = 'all';

        dragStartFn = function dragStartFn() {
          pluginEvent('delayEnded', _this, {
            evt: evt
          });

          if (Sortable.eventCanceled) {
            _this._onDrop();

            return;
          } // Delayed drag has been triggered
          // we can re-enable the events: touchmove/mousemove


          _this._disableDelayedDragEvents();

          if (!FireFox && _this.nativeDraggable) {
            dragEl.draggable = true;
          } // Bind the events: dragstart/dragend


          _this._triggerDragStart(evt, touch); // Drag start event


          _dispatchEvent({
            sortable: _this,
            name: 'choose',
            originalEvent: evt
          }); // Chosen item


          toggleClass(dragEl, options.chosenClass, true);
        }; // Disable "draggable"


        options.ignore.split(',').forEach(function (criteria) {
          find(dragEl, criteria.trim(), _disableDraggable);
        });
        on(ownerDocument, 'dragover', nearestEmptyInsertDetectEvent);
        on(ownerDocument, 'mousemove', nearestEmptyInsertDetectEvent);
        on(ownerDocument, 'touchmove', nearestEmptyInsertDetectEvent);
        on(ownerDocument, 'mouseup', _this._onDrop);
        on(ownerDocument, 'touchend', _this._onDrop);
        on(ownerDocument, 'touchcancel', _this._onDrop); // Make dragEl draggable (must be before delay for FireFox)

        if (FireFox && this.nativeDraggable) {
          this.options.touchStartThreshold = 4;
          dragEl.draggable = true;
        }

        pluginEvent('delayStart', this, {
          evt: evt
        }); // Delay is impossible for native DnD in Edge or IE

        if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
          if (Sortable.eventCanceled) {
            this._onDrop();

            return;
          } // If the user moves the pointer or let go the click or touch
          // before the delay has been reached:
          // disable the delayed drag


          on(ownerDocument, 'mouseup', _this._disableDelayedDrag);
          on(ownerDocument, 'touchend', _this._disableDelayedDrag);
          on(ownerDocument, 'touchcancel', _this._disableDelayedDrag);
          on(ownerDocument, 'mousemove', _this._delayedDragTouchMoveHandler);
          on(ownerDocument, 'touchmove', _this._delayedDragTouchMoveHandler);
          options.supportPointer && on(ownerDocument, 'pointermove', _this._delayedDragTouchMoveHandler);
          _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
        } else {
          dragStartFn();
        }
      }
    },
    _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(
    /** TouchEvent|PointerEvent **/
    e) {
      var touch = e.touches ? e.touches[0] : e;

      if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
        this._disableDelayedDrag();
      }
    },
    _disableDelayedDrag: function _disableDelayedDrag() {
      dragEl && _disableDraggable(dragEl);
      clearTimeout(this._dragStartTimer);

      this._disableDelayedDragEvents();
    },
    _disableDelayedDragEvents: function _disableDelayedDragEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, 'mouseup', this._disableDelayedDrag);
      off(ownerDocument, 'touchend', this._disableDelayedDrag);
      off(ownerDocument, 'touchcancel', this._disableDelayedDrag);
      off(ownerDocument, 'mousemove', this._delayedDragTouchMoveHandler);
      off(ownerDocument, 'touchmove', this._delayedDragTouchMoveHandler);
      off(ownerDocument, 'pointermove', this._delayedDragTouchMoveHandler);
    },
    _triggerDragStart: function _triggerDragStart(
    /** Event */
    evt,
    /** Touch */
    touch) {
      touch = touch || evt.pointerType == 'touch' && evt;

      if (!this.nativeDraggable || touch) {
        if (this.options.supportPointer) {
          on(document, 'pointermove', this._onTouchMove);
        } else if (touch) {
          on(document, 'touchmove', this._onTouchMove);
        } else {
          on(document, 'mousemove', this._onTouchMove);
        }
      } else {
        on(dragEl, 'dragend', this);
        on(rootEl, 'dragstart', this._onDragStart);
      }

      try {
        if (document.selection) {
          // Timeout neccessary for IE9
          _nextTick(function () {
            document.selection.empty();
          });
        } else {
          window.getSelection().removeAllRanges();
        }
      } catch (err) {}
    },
    _dragStarted: function _dragStarted(fallback, evt) {

      awaitingDragStarted = false;

      if (rootEl && dragEl) {
        pluginEvent('dragStarted', this, {
          evt: evt
        });

        if (this.nativeDraggable) {
          on(document, 'dragover', _checkOutsideTargetEl);
        }

        var options = this.options; // Apply effect

        !fallback && toggleClass(dragEl, options.dragClass, false);
        toggleClass(dragEl, options.ghostClass, true);
        Sortable.active = this;
        fallback && this._appendGhost(); // Drag start event

        _dispatchEvent({
          sortable: this,
          name: 'start',
          originalEvent: evt
        });
      } else {
        this._nulling();
      }
    },
    _emulateDragOver: function _emulateDragOver() {
      if (touchEvt) {
        this._lastX = touchEvt.clientX;
        this._lastY = touchEvt.clientY;

        _hideGhostForTarget();

        var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        var parent = target;

        while (target && target.shadowRoot) {
          target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
          if (target === parent) { break; }
          parent = target;
        }

        dragEl.parentNode[expando]._isOutsideThisEl(target);

        if (parent) {
          do {
            if (parent[expando]) {
              var inserted = void 0;
              inserted = parent[expando]._onDragOver({
                clientX: touchEvt.clientX,
                clientY: touchEvt.clientY,
                target: target,
                rootEl: parent
              });

              if (inserted && !this.options.dragoverBubble) {
                break;
              }
            }

            target = parent; // store last element
          }
          /* jshint boss:true */
          while (parent = parent.parentNode);
        }

        _unhideGhostForTarget();
      }
    },
    _onTouchMove: function _onTouchMove(
    /**TouchEvent*/
    evt) {
      if (tapEvt) {
        var options = this.options,
            fallbackTolerance = options.fallbackTolerance,
            fallbackOffset = options.fallbackOffset,
            touch = evt.touches ? evt.touches[0] : evt,
            ghostMatrix = ghostEl && matrix(ghostEl, true),
            scaleX = ghostEl && ghostMatrix && ghostMatrix.a,
            scaleY = ghostEl && ghostMatrix && ghostMatrix.d,
            relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent),
            dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1),
            dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1); // only set the status to dragging, when we are actually dragging

        if (!Sortable.active && !awaitingDragStarted) {
          if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
            return;
          }

          this._onDragStart(evt, true);
        }

        if (ghostEl) {
          if (ghostMatrix) {
            ghostMatrix.e += dx - (lastDx || 0);
            ghostMatrix.f += dy - (lastDy || 0);
          } else {
            ghostMatrix = {
              a: 1,
              b: 0,
              c: 0,
              d: 1,
              e: dx,
              f: dy
            };
          }

          var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
          css(ghostEl, 'webkitTransform', cssMatrix);
          css(ghostEl, 'mozTransform', cssMatrix);
          css(ghostEl, 'msTransform', cssMatrix);
          css(ghostEl, 'transform', cssMatrix);
          lastDx = dx;
          lastDy = dy;
          touchEvt = touch;
        }

        evt.cancelable && evt.preventDefault();
      }
    },
    _appendGhost: function _appendGhost() {
      // Bug if using scale(): https://stackoverflow.com/questions/2637058
      // Not being adjusted for
      if (!ghostEl) {
        var container = this.options.fallbackOnBody ? document.body : rootEl,
            rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container),
            options = this.options; // Position absolutely

        if (PositionGhostAbsolutely) {
          // Get relatively positioned parent
          ghostRelativeParent = container;

          while (css(ghostRelativeParent, 'position') === 'static' && css(ghostRelativeParent, 'transform') === 'none' && ghostRelativeParent !== document) {
            ghostRelativeParent = ghostRelativeParent.parentNode;
          }

          if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
            if (ghostRelativeParent === document) { ghostRelativeParent = getWindowScrollingElement(); }
            rect.top += ghostRelativeParent.scrollTop;
            rect.left += ghostRelativeParent.scrollLeft;
          } else {
            ghostRelativeParent = getWindowScrollingElement();
          }

          ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
        }

        ghostEl = dragEl.cloneNode(true);
        toggleClass(ghostEl, options.ghostClass, false);
        toggleClass(ghostEl, options.fallbackClass, true);
        toggleClass(ghostEl, options.dragClass, true);
        css(ghostEl, 'transition', '');
        css(ghostEl, 'transform', '');
        css(ghostEl, 'box-sizing', 'border-box');
        css(ghostEl, 'margin', 0);
        css(ghostEl, 'top', rect.top);
        css(ghostEl, 'left', rect.left);
        css(ghostEl, 'width', rect.width);
        css(ghostEl, 'height', rect.height);
        css(ghostEl, 'opacity', '0.8');
        css(ghostEl, 'position', PositionGhostAbsolutely ? 'absolute' : 'fixed');
        css(ghostEl, 'zIndex', '100000');
        css(ghostEl, 'pointerEvents', 'none');
        Sortable.ghost = ghostEl;
        container.appendChild(ghostEl); // Set transform-origin

        css(ghostEl, 'transform-origin', tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + '% ' + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + '%');
      }
    },
    _onDragStart: function _onDragStart(
    /**Event*/
    evt,
    /**boolean*/
    fallback) {
      var _this = this;

      var dataTransfer = evt.dataTransfer;
      var options = _this.options;
      pluginEvent('dragStart', this, {
        evt: evt
      });

      if (Sortable.eventCanceled) {
        this._onDrop();

        return;
      }

      pluginEvent('setupClone', this);

      if (!Sortable.eventCanceled) {
        cloneEl = clone(dragEl);
        cloneEl.draggable = false;
        cloneEl.style['will-change'] = '';

        this._hideClone();

        toggleClass(cloneEl, this.options.chosenClass, false);
        Sortable.clone = cloneEl;
      } // #1143: IFrame support workaround


      _this.cloneId = _nextTick(function () {
        pluginEvent('clone', _this);
        if (Sortable.eventCanceled) { return; }

        if (!_this.options.removeCloneOnHide) {
          rootEl.insertBefore(cloneEl, dragEl);
        }

        _this._hideClone();

        _dispatchEvent({
          sortable: _this,
          name: 'clone'
        });
      });
      !fallback && toggleClass(dragEl, options.dragClass, true); // Set proper drop events

      if (fallback) {
        ignoreNextClick = true;
        _this._loopId = setInterval(_this._emulateDragOver, 50);
      } else {
        // Undo what was set in _prepareDragStart before drag started
        off(document, 'mouseup', _this._onDrop);
        off(document, 'touchend', _this._onDrop);
        off(document, 'touchcancel', _this._onDrop);

        if (dataTransfer) {
          dataTransfer.effectAllowed = 'move';
          options.setData && options.setData.call(_this, dataTransfer, dragEl);
        }

        on(document, 'drop', _this); // #1276 fix:

        css(dragEl, 'transform', 'translateZ(0)');
      }

      awaitingDragStarted = true;
      _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
      on(document, 'selectstart', _this);
      moved = true;

      if (Safari) {
        css(document.body, 'user-select', 'none');
      }
    },
    // Returns true - if no further action is needed (either inserted or another condition)
    _onDragOver: function _onDragOver(
    /**Event*/
    evt) {
      var el = this.el,
          target = evt.target,
          dragRect,
          targetRect,
          revert,
          options = this.options,
          group = options.group,
          activeSortable = Sortable.active,
          isOwner = activeGroup === group,
          canSort = options.sort,
          fromSortable = putSortable || activeSortable,
          vertical,
          _this = this,
          completedFired = false;

      if (_silent) { return; }

      function dragOverEvent(name, extra) {
        pluginEvent(name, _this, _objectSpread({
          evt: evt,
          isOwner: isOwner,
          axis: vertical ? 'vertical' : 'horizontal',
          revert: revert,
          dragRect: dragRect,
          targetRect: targetRect,
          canSort: canSort,
          fromSortable: fromSortable,
          target: target,
          completed: completed,
          onMove: function onMove(target, after) {
            return _onMove(rootEl, el, dragEl, dragRect, target, getRect(target), evt, after);
          },
          changed: changed
        }, extra));
      } // Capture animation state


      function capture() {
        dragOverEvent('dragOverAnimationCapture');

        _this.captureAnimationState();

        if (_this !== fromSortable) {
          fromSortable.captureAnimationState();
        }
      } // Return invocation when dragEl is inserted (or completed)


      function completed(insertion) {
        dragOverEvent('dragOverCompleted', {
          insertion: insertion
        });

        if (insertion) {
          // Clones must be hidden before folding animation to capture dragRectAbsolute properly
          if (isOwner) {
            activeSortable._hideClone();
          } else {
            activeSortable._showClone(_this);
          }

          if (_this !== fromSortable) {
            // Set ghost class to new sortable's ghost class
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
            toggleClass(dragEl, options.ghostClass, true);
          }

          if (putSortable !== _this && _this !== Sortable.active) {
            putSortable = _this;
          } else if (_this === Sortable.active && putSortable) {
            putSortable = null;
          } // Animation


          if (fromSortable === _this) {
            _this._ignoreWhileAnimating = target;
          }

          _this.animateAll(function () {
            dragOverEvent('dragOverAnimationComplete');
            _this._ignoreWhileAnimating = null;
          });

          if (_this !== fromSortable) {
            fromSortable.animateAll();
            fromSortable._ignoreWhileAnimating = null;
          }
        } // Null lastTarget if it is not inside a previously swapped element


        if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
          lastTarget = null;
        } // no bubbling and not fallback


        if (!options.dragoverBubble && !evt.rootEl && target !== document) {
          dragEl.parentNode[expando]._isOutsideThisEl(evt.target); // Do not detect for empty insert if already inserted


          !insertion && nearestEmptyInsertDetectEvent(evt);
        }

        !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
        return completedFired = true;
      } // Call when dragEl has been inserted


      function changed() {
        newIndex = index(dragEl);
        newDraggableIndex = index(dragEl, options.draggable);

        _dispatchEvent({
          sortable: _this,
          name: 'change',
          toEl: el,
          newIndex: newIndex,
          newDraggableIndex: newDraggableIndex,
          originalEvent: evt
        });
      }

      if (evt.preventDefault !== void 0) {
        evt.cancelable && evt.preventDefault();
      }

      target = closest(target, options.draggable, el, true);
      dragOverEvent('dragOver');
      if (Sortable.eventCanceled) { return completedFired; }

      if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
        return completed(false);
      }

      ignoreNextClick = false;

      if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = !rootEl.contains(dragEl)) // Reverting item into the original list
      : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
        vertical = this._getDirection(evt, target) === 'vertical';
        dragRect = getRect(dragEl);
        dragOverEvent('dragOverValid');
        if (Sortable.eventCanceled) { return completedFired; }

        if (revert) {
          parentEl = rootEl; // actualization

          capture();

          this._hideClone();

          dragOverEvent('revert');

          if (!Sortable.eventCanceled) {
            if (nextEl) {
              rootEl.insertBefore(dragEl, nextEl);
            } else {
              rootEl.appendChild(dragEl);
            }
          }

          return completed(true);
        }

        var elLastChild = lastChild(el, options.draggable);

        if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
          // If already at end of list: Do not insert
          if (elLastChild === dragEl) {
            return completed(false);
          } // assign target only if condition is true


          if (elLastChild && el === evt.target) {
            target = elLastChild;
          }

          if (target) {
            targetRect = getRect(target);
          }

          if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
            capture();
            el.appendChild(dragEl);
            parentEl = el; // actualization

            changed();
            return completed(true);
          }
        } else if (target.parentNode === el) {
          targetRect = getRect(target);
          var direction = 0,
              targetBeforeFirstSwap,
              differentLevel = dragEl.parentNode !== el,
              differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical),
              side1 = vertical ? 'top' : 'left',
              scrolledPastTop = isScrolledPast(target, 'top', 'top') || isScrolledPast(dragEl, 'top', 'top'),
              scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;

          if (lastTarget !== target) {
            targetBeforeFirstSwap = targetRect[side1];
            pastFirstInvertThresh = false;
            isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
          }

          direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
          var sibling;

          if (direction !== 0) {
            // Check if target is beside dragEl in respective direction (ignoring hidden elements)
            var dragIndex = index(dragEl);

            do {
              dragIndex -= direction;
              sibling = parentEl.children[dragIndex];
            } while (sibling && (css(sibling, 'display') === 'none' || sibling === ghostEl));
          } // If dragEl is already beside target: Do not insert


          if (direction === 0 || sibling === target) {
            return completed(false);
          }

          lastTarget = target;
          lastDirection = direction;
          var nextSibling = target.nextElementSibling,
              after = false;
          after = direction === 1;

          var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);

          if (moveVector !== false) {
            if (moveVector === 1 || moveVector === -1) {
              after = moveVector === 1;
            }

            _silent = true;
            setTimeout(_unsilent, 30);
            capture();

            if (after && !nextSibling) {
              el.appendChild(dragEl);
            } else {
              target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
            } // Undo chrome's scroll adjustment (has no effect on other browsers)


            if (scrolledPastTop) {
              scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
            }

            parentEl = dragEl.parentNode; // actualization
            // must be done before animation

            if (targetBeforeFirstSwap !== undefined && !isCircumstantialInvert) {
              targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
            }

            changed();
            return completed(true);
          }
        }

        if (el.contains(dragEl)) {
          return completed(false);
        }
      }

      return false;
    },
    _ignoreWhileAnimating: null,
    _offMoveEvents: function _offMoveEvents() {
      off(document, 'mousemove', this._onTouchMove);
      off(document, 'touchmove', this._onTouchMove);
      off(document, 'pointermove', this._onTouchMove);
      off(document, 'dragover', nearestEmptyInsertDetectEvent);
      off(document, 'mousemove', nearestEmptyInsertDetectEvent);
      off(document, 'touchmove', nearestEmptyInsertDetectEvent);
    },
    _offUpEvents: function _offUpEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, 'mouseup', this._onDrop);
      off(ownerDocument, 'touchend', this._onDrop);
      off(ownerDocument, 'pointerup', this._onDrop);
      off(ownerDocument, 'touchcancel', this._onDrop);
      off(document, 'selectstart', this);
    },
    _onDrop: function _onDrop(
    /**Event*/
    evt) {
      var el = this.el,
          options = this.options; // Get the index of the dragged element within its parent

      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      pluginEvent('drop', this, {
        evt: evt
      });
      parentEl = dragEl && dragEl.parentNode; // Get again after plugin event

      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);

      if (Sortable.eventCanceled) {
        this._nulling();

        return;
      }

      awaitingDragStarted = false;
      isCircumstantialInvert = false;
      pastFirstInvertThresh = false;
      clearInterval(this._loopId);
      clearTimeout(this._dragStartTimer);

      _cancelNextTick(this.cloneId);

      _cancelNextTick(this._dragStartId); // Unbind events


      if (this.nativeDraggable) {
        off(document, 'drop', this);
        off(el, 'dragstart', this._onDragStart);
      }

      this._offMoveEvents();

      this._offUpEvents();

      if (Safari) {
        css(document.body, 'user-select', '');
      }

      css(dragEl, 'transform', '');

      if (evt) {
        if (moved) {
          evt.cancelable && evt.preventDefault();
          !options.dropBubble && evt.stopPropagation();
        }

        ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);

        if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== 'clone') {
          // Remove clone(s)
          cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
        }

        if (dragEl) {
          if (this.nativeDraggable) {
            off(dragEl, 'dragend', this);
          }

          _disableDraggable(dragEl);

          dragEl.style['will-change'] = ''; // Remove classes
          // ghostClass is added in dragStarted

          if (moved && !awaitingDragStarted) {
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
          }

          toggleClass(dragEl, this.options.chosenClass, false); // Drag stop event

          _dispatchEvent({
            sortable: this,
            name: 'unchoose',
            toEl: parentEl,
            newIndex: null,
            newDraggableIndex: null,
            originalEvent: evt
          });

          if (rootEl !== parentEl) {
            if (newIndex >= 0) {
              // Add event
              _dispatchEvent({
                rootEl: parentEl,
                name: 'add',
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              }); // Remove event


              _dispatchEvent({
                sortable: this,
                name: 'remove',
                toEl: parentEl,
                originalEvent: evt
              }); // drag from one list and drop into another


              _dispatchEvent({
                rootEl: parentEl,
                name: 'sort',
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });

              _dispatchEvent({
                sortable: this,
                name: 'sort',
                toEl: parentEl,
                originalEvent: evt
              });
            }

            putSortable && putSortable.save();
          } else {
            if (newIndex !== oldIndex) {
              if (newIndex >= 0) {
                // drag & drop within the same list
                _dispatchEvent({
                  sortable: this,
                  name: 'update',
                  toEl: parentEl,
                  originalEvent: evt
                });

                _dispatchEvent({
                  sortable: this,
                  name: 'sort',
                  toEl: parentEl,
                  originalEvent: evt
                });
              }
            }
          }

          if (Sortable.active) {
            /* jshint eqnull:true */
            if (newIndex == null || newIndex === -1) {
              newIndex = oldIndex;
              newDraggableIndex = oldDraggableIndex;
            }

            _dispatchEvent({
              sortable: this,
              name: 'end',
              toEl: parentEl,
              originalEvent: evt
            }); // Save sorting


            this.save();
          }
        }
      }

      this._nulling();
    },
    _nulling: function _nulling() {
      pluginEvent('nulling', this);
      rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
      savedInputChecked.forEach(function (el) {
        el.checked = true;
      });
      savedInputChecked.length = lastDx = lastDy = 0;
    },
    handleEvent: function handleEvent(
    /**Event*/
    evt) {
      switch (evt.type) {
        case 'drop':
        case 'dragend':
          this._onDrop(evt);

          break;

        case 'dragenter':
        case 'dragover':
          if (dragEl) {
            this._onDragOver(evt);

            _globalDragOver(evt);
          }

          break;

        case 'selectstart':
          evt.preventDefault();
          break;
      }
    },

    /**
     * Serializes the item into an array of string.
     * @returns {String[]}
     */
    toArray: function toArray() {
      var order = [],
          el,
          children = this.el.children,
          i = 0,
          n = children.length,
          options = this.options;

      for (; i < n; i++) {
        el = children[i];

        if (closest(el, options.draggable, this.el, false)) {
          order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
        }
      }

      return order;
    },

    /**
     * Sorts the elements according to the array.
     * @param  {String[]}  order  order of the items
     */
    sort: function sort(order, useAnimation) {
      var items = {},
          rootEl = this.el;
      this.toArray().forEach(function (id, i) {
        var el = rootEl.children[i];

        if (closest(el, this.options.draggable, rootEl, false)) {
          items[id] = el;
        }
      }, this);
      useAnimation && this.captureAnimationState();
      order.forEach(function (id) {
        if (items[id]) {
          rootEl.removeChild(items[id]);
          rootEl.appendChild(items[id]);
        }
      });
      useAnimation && this.animateAll();
    },

    /**
     * Save the current sorting
     */
    save: function save() {
      var store = this.options.store;
      store && store.set && store.set(this);
    },

    /**
     * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
     * @param   {HTMLElement}  el
     * @param   {String}       [selector]  default: `options.draggable`
     * @returns {HTMLElement|null}
     */
    closest: function closest$1(el, selector) {
      return closest(el, selector || this.options.draggable, this.el, false);
    },

    /**
     * Set/get option
     * @param   {string} name
     * @param   {*}      [value]
     * @returns {*}
     */
    option: function option(name, value) {
      var options = this.options;

      if (value === void 0) {
        return options[name];
      } else {
        var modifiedValue = PluginManager.modifyOption(this, name, value);

        if (typeof modifiedValue !== 'undefined') {
          options[name] = modifiedValue;
        } else {
          options[name] = value;
        }

        if (name === 'group') {
          _prepareGroup(options);
        }
      }
    },

    /**
     * Destroy
     */
    destroy: function destroy() {
      pluginEvent('destroy', this);
      var el = this.el;
      el[expando] = null;
      off(el, 'mousedown', this._onTapStart);
      off(el, 'touchstart', this._onTapStart);
      off(el, 'pointerdown', this._onTapStart);

      if (this.nativeDraggable) {
        off(el, 'dragover', this);
        off(el, 'dragenter', this);
      } // Remove draggable attributes


      Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el) {
        el.removeAttribute('draggable');
      });

      this._onDrop();

      this._disableDelayedDragEvents();

      sortables.splice(sortables.indexOf(this.el), 1);
      this.el = el = null;
    },
    _hideClone: function _hideClone() {
      if (!cloneHidden) {
        pluginEvent('hideClone', this);
        if (Sortable.eventCanceled) { return; }
        css(cloneEl, 'display', 'none');

        if (this.options.removeCloneOnHide && cloneEl.parentNode) {
          cloneEl.parentNode.removeChild(cloneEl);
        }

        cloneHidden = true;
      }
    },
    _showClone: function _showClone(putSortable) {
      if (putSortable.lastPutMode !== 'clone') {
        this._hideClone();

        return;
      }

      if (cloneHidden) {
        pluginEvent('showClone', this);
        if (Sortable.eventCanceled) { return; } // show clone at dragEl or original position

        if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
          rootEl.insertBefore(cloneEl, dragEl);
        } else if (nextEl) {
          rootEl.insertBefore(cloneEl, nextEl);
        } else {
          rootEl.appendChild(cloneEl);
        }

        if (this.options.group.revertClone) {
          this.animate(dragEl, cloneEl);
        }

        css(cloneEl, 'display', '');
        cloneHidden = false;
      }
    }
  };

  function _globalDragOver(
  /**Event*/
  evt) {
    if (evt.dataTransfer) {
      evt.dataTransfer.dropEffect = 'move';
    }

    evt.cancelable && evt.preventDefault();
  }

  function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
    var evt,
        sortable = fromEl[expando],
        onMoveFn = sortable.options.onMove,
        retVal; // Support for new CustomEvent feature

    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent('move', {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent('Event');
      evt.initEvent('move', true, true);
    }

    evt.to = toEl;
    evt.from = fromEl;
    evt.dragged = dragEl;
    evt.draggedRect = dragRect;
    evt.related = targetEl || toEl;
    evt.relatedRect = targetRect || getRect(toEl);
    evt.willInsertAfter = willInsertAfter;
    evt.originalEvent = originalEvent;
    fromEl.dispatchEvent(evt);

    if (onMoveFn) {
      retVal = onMoveFn.call(sortable, evt, originalEvent);
    }

    return retVal;
  }

  function _disableDraggable(el) {
    el.draggable = false;
  }

  function _unsilent() {
    _silent = false;
  }

  function _ghostIsLast(evt, vertical, sortable) {
    var rect = getRect(lastChild(sortable.el, sortable.options.draggable));
    var spacer = 10;
    return vertical ? evt.clientX > rect.right + spacer || evt.clientX <= rect.right && evt.clientY > rect.bottom && evt.clientX >= rect.left : evt.clientX > rect.right && evt.clientY > rect.top || evt.clientX <= rect.right && evt.clientY > rect.bottom + spacer;
  }

  function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
    var mouseOnAxis = vertical ? evt.clientY : evt.clientX,
        targetLength = vertical ? targetRect.height : targetRect.width,
        targetS1 = vertical ? targetRect.top : targetRect.left,
        targetS2 = vertical ? targetRect.bottom : targetRect.right,
        invert = false;

    if (!invertSwap) {
      // Never invert or create dragEl shadow when target movemenet causes mouse to move past the end of regular swapThreshold
      if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
        // multiplied only by swapThreshold because mouse will already be inside target by (1 - threshold) * targetLength / 2
        // check if past first invert threshold on side opposite of lastDirection
        if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
          // past first invert threshold, do not restrict inverted threshold to dragEl shadow
          pastFirstInvertThresh = true;
        }

        if (!pastFirstInvertThresh) {
          // dragEl shadow (target move distance shadow)
          if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance // over dragEl shadow
          : mouseOnAxis > targetS2 - targetMoveDistance) {
            return -lastDirection;
          }
        } else {
          invert = true;
        }
      } else {
        // Regular
        if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
          return _getInsertDirection(target);
        }
      }
    }

    invert = invert || invertSwap;

    if (invert) {
      // Invert of regular
      if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
        return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
      }
    }

    return 0;
  }
  /**
   * Gets the direction dragEl must be swapped relative to target in order to make it
   * seem that dragEl has been "inserted" into that element's position
   * @param  {HTMLElement} target       The target whose position dragEl is being inserted at
   * @return {Number}                   Direction dragEl must be swapped
   */


  function _getInsertDirection(target) {
    if (index(dragEl) < index(target)) {
      return 1;
    } else {
      return -1;
    }
  }
  /**
   * Generate id
   * @param   {HTMLElement} el
   * @returns {String}
   * @private
   */


  function _generateId(el) {
    var str = el.tagName + el.className + el.src + el.href + el.textContent,
        i = str.length,
        sum = 0;

    while (i--) {
      sum += str.charCodeAt(i);
    }

    return sum.toString(36);
  }

  function _saveInputCheckedState(root) {
    savedInputChecked.length = 0;
    var inputs = root.getElementsByTagName('input');
    var idx = inputs.length;

    while (idx--) {
      var el = inputs[idx];
      el.checked && savedInputChecked.push(el);
    }
  }

  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }

  function _cancelNextTick(id) {
    return clearTimeout(id);
  } // Fixed #973:


  if (documentExists) {
    on(document, 'touchmove', function (evt) {
      if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
        evt.preventDefault();
      }
    });
  } // Export utils


  Sortable.utils = {
    on: on,
    off: off,
    css: css,
    find: find,
    is: function is(el, selector) {
      return !!closest(el, selector, el, false);
    },
    extend: extend,
    throttle: throttle,
    closest: closest,
    toggleClass: toggleClass,
    clone: clone,
    index: index,
    nextTick: _nextTick,
    cancelNextTick: _cancelNextTick,
    detectDirection: _detectDirection,
    getChild: getChild
  };
  /**
   * Get the Sortable instance of an element
   * @param  {HTMLElement} element The element
   * @return {Sortable|undefined}         The instance of Sortable
   */

  Sortable.get = function (element) {
    return element[expando];
  };
  /**
   * Mount a plugin to Sortable
   * @param  {...SortablePlugin|SortablePlugin[]} plugins       Plugins being mounted
   */


  Sortable.mount = function () {
    var arguments$1 = arguments;

    for (var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++) {
      plugins[_key] = arguments$1[_key];
    }

    if (plugins[0].constructor === Array) { plugins = plugins[0]; }
    plugins.forEach(function (plugin) {
      if (!plugin.prototype || !plugin.prototype.constructor) {
        throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
      }

      if (plugin.utils) { Sortable.utils = _objectSpread({}, Sortable.utils, plugin.utils); }
      PluginManager.mount(plugin);
    });
  };
  /**
   * Create sortable instance
   * @param {HTMLElement}  el
   * @param {Object}      [options]
   */


  Sortable.create = function (el, options) {
    return new Sortable(el, options);
  }; // Export


  Sortable.version = version$2;

  var autoScrolls = [],
      scrollEl,
      scrollRootEl,
      scrolling = false,
      lastAutoScrollX,
      lastAutoScrollY,
      touchEvt$1,
      pointerElemChangedInterval;

  function AutoScrollPlugin() {
    function AutoScroll() {
      this.defaults = {
        scroll: true,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        bubbleScroll: true
      }; // Bind all private methods

      for (var fn in this) {
        if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
          this[fn] = this[fn].bind(this);
        }
      }
    }

    AutoScroll.prototype = {
      dragStarted: function dragStarted(_ref) {
        var originalEvent = _ref.originalEvent;

        if (this.sortable.nativeDraggable) {
          on(document, 'dragover', this._handleAutoScroll);
        } else {
          if (this.options.supportPointer) {
            on(document, 'pointermove', this._handleFallbackAutoScroll);
          } else if (originalEvent.touches) {
            on(document, 'touchmove', this._handleFallbackAutoScroll);
          } else {
            on(document, 'mousemove', this._handleFallbackAutoScroll);
          }
        }
      },
      dragOverCompleted: function dragOverCompleted(_ref2) {
        var originalEvent = _ref2.originalEvent;

        // For when bubbling is canceled and using fallback (fallback 'touchmove' always reached)
        if (!this.options.dragOverBubble && !originalEvent.rootEl) {
          this._handleAutoScroll(originalEvent);
        }
      },
      drop: function drop() {
        if (this.sortable.nativeDraggable) {
          off(document, 'dragover', this._handleAutoScroll);
        } else {
          off(document, 'pointermove', this._handleFallbackAutoScroll);
          off(document, 'touchmove', this._handleFallbackAutoScroll);
          off(document, 'mousemove', this._handleFallbackAutoScroll);
        }

        clearPointerElemChangedInterval();
        clearAutoScrolls();
        cancelThrottle();
      },
      nulling: function nulling() {
        touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
        autoScrolls.length = 0;
      },
      _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
        this._handleAutoScroll(evt, true);
      },
      _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
        var _this = this;

        var x = (evt.touches ? evt.touches[0] : evt).clientX,
            y = (evt.touches ? evt.touches[0] : evt).clientY,
            elem = document.elementFromPoint(x, y);
        touchEvt$1 = evt; // IE does not seem to have native autoscroll,
        // Edge's autoscroll seems too conditional,
        // MACOS Safari does not have autoscroll,
        // Firefox and Chrome are good

        if (fallback || Edge || IE11OrLess || Safari) {
          autoScroll(evt, this.options, elem, fallback); // Listener for pointer element change

          var ogElemScroller = getParentAutoScrollElement(elem, true);

          if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
            pointerElemChangedInterval && clearPointerElemChangedInterval(); // Detect for pointer elem change, emulating native DnD behaviour

            pointerElemChangedInterval = setInterval(function () {
              var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);

              if (newElem !== ogElemScroller) {
                ogElemScroller = newElem;
                clearAutoScrolls();
              }

              autoScroll(evt, _this.options, newElem, fallback);
            }, 10);
            lastAutoScrollX = x;
            lastAutoScrollY = y;
          }
        } else {
          // if DnD is enabled (and browser has good autoscrolling), first autoscroll will already scroll, so get parent autoscroll of first autoscroll
          if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
            clearAutoScrolls();
            return;
          }

          autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
        }
      }
    };
    return _extends(AutoScroll, {
      pluginName: 'scroll',
      initializeByDefault: true
    });
  }

  function clearAutoScrolls() {
    autoScrolls.forEach(function (autoScroll) {
      clearInterval(autoScroll.pid);
    });
    autoScrolls = [];
  }

  function clearPointerElemChangedInterval() {
    clearInterval(pointerElemChangedInterval);
  }

  var autoScroll = throttle(function (evt, options, rootEl, isFallback) {
    // Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=505521
    if (!options.scroll) { return; }
    var x = (evt.touches ? evt.touches[0] : evt).clientX,
        y = (evt.touches ? evt.touches[0] : evt).clientY,
        sens = options.scrollSensitivity,
        speed = options.scrollSpeed,
        winScroller = getWindowScrollingElement();
    var scrollThisInstance = false,
        scrollCustomFn; // New scroll root, set scrollEl

    if (scrollRootEl !== rootEl) {
      scrollRootEl = rootEl;
      clearAutoScrolls();
      scrollEl = options.scroll;
      scrollCustomFn = options.scrollFn;

      if (scrollEl === true) {
        scrollEl = getParentAutoScrollElement(rootEl, true);
      }
    }

    var layersOut = 0;
    var currentParent = scrollEl;

    do {
      var el = currentParent,
          rect = getRect(el),
          top = rect.top,
          bottom = rect.bottom,
          left = rect.left,
          right = rect.right,
          width = rect.width,
          height = rect.height,
          canScrollX = void 0,
          canScrollY = void 0,
          scrollWidth = el.scrollWidth,
          scrollHeight = el.scrollHeight,
          elCSS = css(el),
          scrollPosX = el.scrollLeft,
          scrollPosY = el.scrollTop;

      if (el === winScroller) {
        canScrollX = width < scrollWidth && (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll' || elCSS.overflowX === 'visible');
        canScrollY = height < scrollHeight && (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll' || elCSS.overflowY === 'visible');
      } else {
        canScrollX = width < scrollWidth && (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll');
        canScrollY = height < scrollHeight && (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll');
      }

      var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
      var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);

      if (!autoScrolls[layersOut]) {
        for (var i = 0; i <= layersOut; i++) {
          if (!autoScrolls[i]) {
            autoScrolls[i] = {};
          }
        }
      }

      if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
        autoScrolls[layersOut].el = el;
        autoScrolls[layersOut].vx = vx;
        autoScrolls[layersOut].vy = vy;
        clearInterval(autoScrolls[layersOut].pid);

        if (vx != 0 || vy != 0) {
          scrollThisInstance = true;
          /* jshint loopfunc:true */

          autoScrolls[layersOut].pid = setInterval(function () {
            // emulate drag over during autoscroll (fallback), emulating native DnD behaviour
            if (isFallback && this.layer === 0) {
              Sortable.active._onTouchMove(touchEvt$1); // To move ghost if it is positioned absolutely

            }

            var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
            var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;

            if (typeof scrollCustomFn === 'function') {
              if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== 'continue') {
                return;
              }
            }

            scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
          }.bind({
            layer: layersOut
          }), 24);
        }
      }

      layersOut++;
    } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));

    scrolling = scrollThisInstance; // in case another function catches scrolling as false in between when it is not
  }, 30);

  var drop = function drop(_ref) {
    var originalEvent = _ref.originalEvent,
        putSortable = _ref.putSortable,
        dragEl = _ref.dragEl,
        activeSortable = _ref.activeSortable,
        dispatchSortableEvent = _ref.dispatchSortableEvent,
        hideGhostForTarget = _ref.hideGhostForTarget,
        unhideGhostForTarget = _ref.unhideGhostForTarget;
    if (!originalEvent) { return; }
    var toSortable = putSortable || activeSortable;
    hideGhostForTarget();
    var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
    var target = document.elementFromPoint(touch.clientX, touch.clientY);
    unhideGhostForTarget();

    if (toSortable && !toSortable.el.contains(target)) {
      dispatchSortableEvent('spill');
      this.onSpill({
        dragEl: dragEl,
        putSortable: putSortable
      });
    }
  };

  function Revert() {}

  Revert.prototype = {
    startIndex: null,
    dragStart: function dragStart(_ref2) {
      var oldDraggableIndex = _ref2.oldDraggableIndex;
      this.startIndex = oldDraggableIndex;
    },
    onSpill: function onSpill(_ref3) {
      var dragEl = _ref3.dragEl,
          putSortable = _ref3.putSortable;
      this.sortable.captureAnimationState();

      if (putSortable) {
        putSortable.captureAnimationState();
      }

      var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);

      if (nextSibling) {
        this.sortable.el.insertBefore(dragEl, nextSibling);
      } else {
        this.sortable.el.appendChild(dragEl);
      }

      this.sortable.animateAll();

      if (putSortable) {
        putSortable.animateAll();
      }
    },
    drop: drop
  };

  _extends(Revert, {
    pluginName: 'revertOnSpill'
  });

  function Remove() {}

  Remove.prototype = {
    onSpill: function onSpill(_ref4) {
      var dragEl = _ref4.dragEl,
          putSortable = _ref4.putSortable;
      var parentSortable = putSortable || this.sortable;
      parentSortable.captureAnimationState();
      dragEl.parentNode && dragEl.parentNode.removeChild(dragEl);
      parentSortable.animateAll();
    },
    drop: drop
  };

  _extends(Remove, {
    pluginName: 'removeOnSpill'
  });

  Sortable.mount(new AutoScrollPlugin());
  Sortable.mount(Remove, Revert);

  //! moment.js
  (function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
      typeof define === 'function' && define.amd ? define(factory) :
      global.moment = factory();
  }(undefined, (function () {
      var hookCallback;

      function hooks() {
          return hookCallback.apply(null, arguments);
      }

      // This is done to register the method called with moment()
      // without creating circular dependencies.
      function setHookCallback(callback) {
          hookCallback = callback;
      }

      function isArray(input) {
          return (
              input instanceof Array ||
              Object.prototype.toString.call(input) === '[object Array]'
          );
      }

      function isObject(input) {
          // IE8 will treat undefined and null as object if it wasn't for
          // input != null
          return (
              input != null &&
              Object.prototype.toString.call(input) === '[object Object]'
          );
      }

      function hasOwnProp(a, b) {
          return Object.prototype.hasOwnProperty.call(a, b);
      }

      function isObjectEmpty(obj) {
          if (Object.getOwnPropertyNames) {
              return Object.getOwnPropertyNames(obj).length === 0;
          } else {
              var k;
              for (k in obj) {
                  if (hasOwnProp(obj, k)) {
                      return false;
                  }
              }
              return true;
          }
      }

      function isUndefined(input) {
          return input === void 0;
      }

      function isNumber(input) {
          return (
              typeof input === 'number' ||
              Object.prototype.toString.call(input) === '[object Number]'
          );
      }

      function isDate(input) {
          return (
              input instanceof Date ||
              Object.prototype.toString.call(input) === '[object Date]'
          );
      }

      function map(arr, fn) {
          var res = [],
              i,
              arrLen = arr.length;
          for (i = 0; i < arrLen; ++i) {
              res.push(fn(arr[i], i));
          }
          return res;
      }

      function extend(a, b) {
          for (var i in b) {
              if (hasOwnProp(b, i)) {
                  a[i] = b[i];
              }
          }

          if (hasOwnProp(b, 'toString')) {
              a.toString = b.toString;
          }

          if (hasOwnProp(b, 'valueOf')) {
              a.valueOf = b.valueOf;
          }

          return a;
      }

      function createUTC(input, format, locale, strict) {
          return createLocalOrUTC(input, format, locale, strict, true).utc();
      }

      function defaultParsingFlags() {
          // We need to deep clone this object.
          return {
              empty: false,
              unusedTokens: [],
              unusedInput: [],
              overflow: -2,
              charsLeftOver: 0,
              nullInput: false,
              invalidEra: null,
              invalidMonth: null,
              invalidFormat: false,
              userInvalidated: false,
              iso: false,
              parsedDateParts: [],
              era: null,
              meridiem: null,
              rfc2822: false,
              weekdayMismatch: false,
          };
      }

      function getParsingFlags(m) {
          if (m._pf == null) {
              m._pf = defaultParsingFlags();
          }
          return m._pf;
      }

      var some;
      if (Array.prototype.some) {
          some = Array.prototype.some;
      } else {
          some = function (fun) {
              var t = Object(this),
                  len = t.length >>> 0,
                  i;

              for (i = 0; i < len; i++) {
                  if (i in t && fun.call(this, t[i], i, t)) {
                      return true;
                  }
              }

              return false;
          };
      }

      function isValid(m) {
          if (m._isValid == null) {
              var flags = getParsingFlags(m),
                  parsedParts = some.call(flags.parsedDateParts, function (i) {
                      return i != null;
                  }),
                  isNowValid =
                      !isNaN(m._d.getTime()) &&
                      flags.overflow < 0 &&
                      !flags.empty &&
                      !flags.invalidEra &&
                      !flags.invalidMonth &&
                      !flags.invalidWeekday &&
                      !flags.weekdayMismatch &&
                      !flags.nullInput &&
                      !flags.invalidFormat &&
                      !flags.userInvalidated &&
                      (!flags.meridiem || (flags.meridiem && parsedParts));

              if (m._strict) {
                  isNowValid =
                      isNowValid &&
                      flags.charsLeftOver === 0 &&
                      flags.unusedTokens.length === 0 &&
                      flags.bigHour === undefined;
              }

              if (Object.isFrozen == null || !Object.isFrozen(m)) {
                  m._isValid = isNowValid;
              } else {
                  return isNowValid;
              }
          }
          return m._isValid;
      }

      function createInvalid(flags) {
          var m = createUTC(NaN);
          if (flags != null) {
              extend(getParsingFlags(m), flags);
          } else {
              getParsingFlags(m).userInvalidated = true;
          }

          return m;
      }

      // Plugins that add properties should also add the key here (null value),
      // so we can properly clone ourselves.
      var momentProperties = (hooks.momentProperties = []),
          updateInProgress = false;

      function copyConfig(to, from) {
          var i,
              prop,
              val,
              momentPropertiesLen = momentProperties.length;

          if (!isUndefined(from._isAMomentObject)) {
              to._isAMomentObject = from._isAMomentObject;
          }
          if (!isUndefined(from._i)) {
              to._i = from._i;
          }
          if (!isUndefined(from._f)) {
              to._f = from._f;
          }
          if (!isUndefined(from._l)) {
              to._l = from._l;
          }
          if (!isUndefined(from._strict)) {
              to._strict = from._strict;
          }
          if (!isUndefined(from._tzm)) {
              to._tzm = from._tzm;
          }
          if (!isUndefined(from._isUTC)) {
              to._isUTC = from._isUTC;
          }
          if (!isUndefined(from._offset)) {
              to._offset = from._offset;
          }
          if (!isUndefined(from._pf)) {
              to._pf = getParsingFlags(from);
          }
          if (!isUndefined(from._locale)) {
              to._locale = from._locale;
          }

          if (momentPropertiesLen > 0) {
              for (i = 0; i < momentPropertiesLen; i++) {
                  prop = momentProperties[i];
                  val = from[prop];
                  if (!isUndefined(val)) {
                      to[prop] = val;
                  }
              }
          }

          return to;
      }

      // Moment prototype object
      function Moment(config) {
          copyConfig(this, config);
          this._d = new Date(config._d != null ? config._d.getTime() : NaN);
          if (!this.isValid()) {
              this._d = new Date(NaN);
          }
          // Prevent infinite loop in case updateOffset creates new moment
          // objects.
          if (updateInProgress === false) {
              updateInProgress = true;
              hooks.updateOffset(this);
              updateInProgress = false;
          }
      }

      function isMoment(obj) {
          return (
              obj instanceof Moment || (obj != null && obj._isAMomentObject != null)
          );
      }

      function warn(msg) {
          if (
              hooks.suppressDeprecationWarnings === false &&
              typeof console !== 'undefined' &&
              console.warn
          ) {
              console.warn('Deprecation warning: ' + msg);
          }
      }

      function deprecate(msg, fn) {
          var firstTime = true;

          return extend(function () {
              var arguments$1 = arguments;

              if (hooks.deprecationHandler != null) {
                  hooks.deprecationHandler(null, msg);
              }
              if (firstTime) {
                  var args = [],
                      arg,
                      i,
                      key,
                      argLen = arguments.length;
                  for (i = 0; i < argLen; i++) {
                      arg = '';
                      if (typeof arguments$1[i] === 'object') {
                          arg += '\n[' + i + '] ';
                          for (key in arguments[0]) {
                              if (hasOwnProp(arguments$1[0], key)) {
                                  arg += key + ': ' + arguments$1[0][key] + ', ';
                              }
                          }
                          arg = arg.slice(0, -2); // Remove trailing comma and space
                      } else {
                          arg = arguments$1[i];
                      }
                      args.push(arg);
                  }
                  warn(
                      msg +
                          '\nArguments: ' +
                          Array.prototype.slice.call(args).join('') +
                          '\n' +
                          new Error().stack
                  );
                  firstTime = false;
              }
              return fn.apply(this, arguments);
          }, fn);
      }

      var deprecations = {};

      function deprecateSimple(name, msg) {
          if (hooks.deprecationHandler != null) {
              hooks.deprecationHandler(name, msg);
          }
          if (!deprecations[name]) {
              warn(msg);
              deprecations[name] = true;
          }
      }

      hooks.suppressDeprecationWarnings = false;
      hooks.deprecationHandler = null;

      function isFunction(input) {
          return (
              (typeof Function !== 'undefined' && input instanceof Function) ||
              Object.prototype.toString.call(input) === '[object Function]'
          );
      }

      function set(config) {
          var prop, i;
          for (i in config) {
              if (hasOwnProp(config, i)) {
                  prop = config[i];
                  if (isFunction(prop)) {
                      this[i] = prop;
                  } else {
                      this['_' + i] = prop;
                  }
              }
          }
          this._config = config;
          // Lenient ordinal parsing accepts just a number in addition to
          // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
          // TODO: Remove "ordinalParse" fallback in next major release.
          this._dayOfMonthOrdinalParseLenient = new RegExp(
              (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                  '|' +
                  /\d{1,2}/.source
          );
      }

      function mergeConfigs(parentConfig, childConfig) {
          var res = extend({}, parentConfig),
              prop;
          for (prop in childConfig) {
              if (hasOwnProp(childConfig, prop)) {
                  if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                      res[prop] = {};
                      extend(res[prop], parentConfig[prop]);
                      extend(res[prop], childConfig[prop]);
                  } else if (childConfig[prop] != null) {
                      res[prop] = childConfig[prop];
                  } else {
                      delete res[prop];
                  }
              }
          }
          for (prop in parentConfig) {
              if (
                  hasOwnProp(parentConfig, prop) &&
                  !hasOwnProp(childConfig, prop) &&
                  isObject(parentConfig[prop])
              ) {
                  // make sure changes to properties don't modify parent config
                  res[prop] = extend({}, res[prop]);
              }
          }
          return res;
      }

      function Locale(config) {
          if (config != null) {
              this.set(config);
          }
      }

      var keys;

      if (Object.keys) {
          keys = Object.keys;
      } else {
          keys = function (obj) {
              var i,
                  res = [];
              for (i in obj) {
                  if (hasOwnProp(obj, i)) {
                      res.push(i);
                  }
              }
              return res;
          };
      }

      var defaultCalendar = {
          sameDay: '[Today at] LT',
          nextDay: '[Tomorrow at] LT',
          nextWeek: 'dddd [at] LT',
          lastDay: '[Yesterday at] LT',
          lastWeek: '[Last] dddd [at] LT',
          sameElse: 'L',
      };

      function calendar(key, mom, now) {
          var output = this._calendar[key] || this._calendar['sameElse'];
          return isFunction(output) ? output.call(mom, now) : output;
      }

      function zeroFill(number, targetLength, forceSign) {
          var absNumber = '' + Math.abs(number),
              zerosToFill = targetLength - absNumber.length,
              sign = number >= 0;
          return (
              (sign ? (forceSign ? '+' : '') : '-') +
              Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) +
              absNumber
          );
      }

      var formattingTokens =
              /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
          localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
          formatFunctions = {},
          formatTokenFunctions = {};

      // token:    'M'
      // padded:   ['MM', 2]
      // ordinal:  'Mo'
      // callback: function () { this.month() + 1 }
      function addFormatToken(token, padded, ordinal, callback) {
          var func = callback;
          if (typeof callback === 'string') {
              func = function () {
                  return this[callback]();
              };
          }
          if (token) {
              formatTokenFunctions[token] = func;
          }
          if (padded) {
              formatTokenFunctions[padded[0]] = function () {
                  return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
              };
          }
          if (ordinal) {
              formatTokenFunctions[ordinal] = function () {
                  return this.localeData().ordinal(
                      func.apply(this, arguments),
                      token
                  );
              };
          }
      }

      function removeFormattingTokens(input) {
          if (input.match(/\[[\s\S]/)) {
              return input.replace(/^\[|\]$/g, '');
          }
          return input.replace(/\\/g, '');
      }

      function makeFormatFunction(format) {
          var array = format.match(formattingTokens),
              i,
              length;

          for (i = 0, length = array.length; i < length; i++) {
              if (formatTokenFunctions[array[i]]) {
                  array[i] = formatTokenFunctions[array[i]];
              } else {
                  array[i] = removeFormattingTokens(array[i]);
              }
          }

          return function (mom) {
              var output = '',
                  i;
              for (i = 0; i < length; i++) {
                  output += isFunction(array[i])
                      ? array[i].call(mom, format)
                      : array[i];
              }
              return output;
          };
      }

      // format date using native date object
      function formatMoment(m, format) {
          if (!m.isValid()) {
              return m.localeData().invalidDate();
          }

          format = expandFormat(format, m.localeData());
          formatFunctions[format] =
              formatFunctions[format] || makeFormatFunction(format);

          return formatFunctions[format](m);
      }

      function expandFormat(format, locale) {
          var i = 5;

          function replaceLongDateFormatTokens(input) {
              return locale.longDateFormat(input) || input;
          }

          localFormattingTokens.lastIndex = 0;
          while (i >= 0 && localFormattingTokens.test(format)) {
              format = format.replace(
                  localFormattingTokens,
                  replaceLongDateFormatTokens
              );
              localFormattingTokens.lastIndex = 0;
              i -= 1;
          }

          return format;
      }

      var defaultLongDateFormat = {
          LTS: 'h:mm:ss A',
          LT: 'h:mm A',
          L: 'MM/DD/YYYY',
          LL: 'MMMM D, YYYY',
          LLL: 'MMMM D, YYYY h:mm A',
          LLLL: 'dddd, MMMM D, YYYY h:mm A',
      };

      function longDateFormat(key) {
          var format = this._longDateFormat[key],
              formatUpper = this._longDateFormat[key.toUpperCase()];

          if (format || !formatUpper) {
              return format;
          }

          this._longDateFormat[key] = formatUpper
              .match(formattingTokens)
              .map(function (tok) {
                  if (
                      tok === 'MMMM' ||
                      tok === 'MM' ||
                      tok === 'DD' ||
                      tok === 'dddd'
                  ) {
                      return tok.slice(1);
                  }
                  return tok;
              })
              .join('');

          return this._longDateFormat[key];
      }

      var defaultInvalidDate = 'Invalid date';

      function invalidDate() {
          return this._invalidDate;
      }

      var defaultOrdinal = '%d',
          defaultDayOfMonthOrdinalParse = /\d{1,2}/;

      function ordinal(number) {
          return this._ordinal.replace('%d', number);
      }

      var defaultRelativeTime = {
          future: 'in %s',
          past: '%s ago',
          s: 'a few seconds',
          ss: '%d seconds',
          m: 'a minute',
          mm: '%d minutes',
          h: 'an hour',
          hh: '%d hours',
          d: 'a day',
          dd: '%d days',
          w: 'a week',
          ww: '%d weeks',
          M: 'a month',
          MM: '%d months',
          y: 'a year',
          yy: '%d years',
      };

      function relativeTime(number, withoutSuffix, string, isFuture) {
          var output = this._relativeTime[string];
          return isFunction(output)
              ? output(number, withoutSuffix, string, isFuture)
              : output.replace(/%d/i, number);
      }

      function pastFuture(diff, output) {
          var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
          return isFunction(format) ? format(output) : format.replace(/%s/i, output);
      }

      var aliases = {};

      function addUnitAlias(unit, shorthand) {
          var lowerCase = unit.toLowerCase();
          aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
      }

      function normalizeUnits(units) {
          return typeof units === 'string'
              ? aliases[units] || aliases[units.toLowerCase()]
              : undefined;
      }

      function normalizeObjectUnits(inputObject) {
          var normalizedInput = {},
              normalizedProp,
              prop;

          for (prop in inputObject) {
              if (hasOwnProp(inputObject, prop)) {
                  normalizedProp = normalizeUnits(prop);
                  if (normalizedProp) {
                      normalizedInput[normalizedProp] = inputObject[prop];
                  }
              }
          }

          return normalizedInput;
      }

      var priorities = {};

      function addUnitPriority(unit, priority) {
          priorities[unit] = priority;
      }

      function getPrioritizedUnits(unitsObj) {
          var units = [],
              u;
          for (u in unitsObj) {
              if (hasOwnProp(unitsObj, u)) {
                  units.push({ unit: u, priority: priorities[u] });
              }
          }
          units.sort(function (a, b) {
              return a.priority - b.priority;
          });
          return units;
      }

      function isLeapYear(year) {
          return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      }

      function absFloor(number) {
          if (number < 0) {
              // -0 -> 0
              return Math.ceil(number) || 0;
          } else {
              return Math.floor(number);
          }
      }

      function toInt(argumentForCoercion) {
          var coercedNumber = +argumentForCoercion,
              value = 0;

          if (coercedNumber !== 0 && isFinite(coercedNumber)) {
              value = absFloor(coercedNumber);
          }

          return value;
      }

      function makeGetSet(unit, keepTime) {
          return function (value) {
              if (value != null) {
                  set$1(this, unit, value);
                  hooks.updateOffset(this, keepTime);
                  return this;
              } else {
                  return get(this, unit);
              }
          };
      }

      function get(mom, unit) {
          return mom.isValid()
              ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]()
              : NaN;
      }

      function set$1(mom, unit, value) {
          if (mom.isValid() && !isNaN(value)) {
              if (
                  unit === 'FullYear' &&
                  isLeapYear(mom.year()) &&
                  mom.month() === 1 &&
                  mom.date() === 29
              ) {
                  value = toInt(value);
                  mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](
                      value,
                      mom.month(),
                      daysInMonth(value, mom.month())
                  );
              } else {
                  mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
              }
          }
      }

      // MOMENTS

      function stringGet(units) {
          units = normalizeUnits(units);
          if (isFunction(this[units])) {
              return this[units]();
          }
          return this;
      }

      function stringSet(units, value) {
          if (typeof units === 'object') {
              units = normalizeObjectUnits(units);
              var prioritized = getPrioritizedUnits(units),
                  i,
                  prioritizedLen = prioritized.length;
              for (i = 0; i < prioritizedLen; i++) {
                  this[prioritized[i].unit](units[prioritized[i].unit]);
              }
          } else {
              units = normalizeUnits(units);
              if (isFunction(this[units])) {
                  return this[units](value);
              }
          }
          return this;
      }

      var match1 = /\d/, //       0 - 9
          match2 = /\d\d/, //      00 - 99
          match3 = /\d{3}/, //     000 - 999
          match4 = /\d{4}/, //    0000 - 9999
          match6 = /[+-]?\d{6}/, // -999999 - 999999
          match1to2 = /\d\d?/, //       0 - 99
          match3to4 = /\d\d\d\d?/, //     999 - 9999
          match5to6 = /\d\d\d\d\d\d?/, //   99999 - 999999
          match1to3 = /\d{1,3}/, //       0 - 999
          match1to4 = /\d{1,4}/, //       0 - 9999
          match1to6 = /[+-]?\d{1,6}/, // -999999 - 999999
          matchUnsigned = /\d+/, //       0 - inf
          matchSigned = /[+-]?\d+/, //    -inf - inf
          matchOffset = /Z|[+-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
          matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi, // +00 -00 +00:00 -00:00 +0000 -0000 or Z
          matchTimestamp = /[+-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
          // any word (or two) characters or numbers including two/three word month in arabic.
          // includes scottish gaelic two word and hyphenated months
          matchWord =
              /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
          regexes;

      regexes = {};

      function addRegexToken(token, regex, strictRegex) {
          regexes[token] = isFunction(regex)
              ? regex
              : function (isStrict, localeData) {
                    return isStrict && strictRegex ? strictRegex : regex;
                };
      }

      function getParseRegexForToken(token, config) {
          if (!hasOwnProp(regexes, token)) {
              return new RegExp(unescapeFormat(token));
          }

          return regexes[token](config._strict, config._locale);
      }

      // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
      function unescapeFormat(s) {
          return regexEscape(
              s
                  .replace('\\', '')
                  .replace(
                      /\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,
                      function (matched, p1, p2, p3, p4) {
                          return p1 || p2 || p3 || p4;
                      }
                  )
          );
      }

      function regexEscape(s) {
          return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      }

      var tokens = {};

      function addParseToken(token, callback) {
          var i,
              func = callback,
              tokenLen;
          if (typeof token === 'string') {
              token = [token];
          }
          if (isNumber(callback)) {
              func = function (input, array) {
                  array[callback] = toInt(input);
              };
          }
          tokenLen = token.length;
          for (i = 0; i < tokenLen; i++) {
              tokens[token[i]] = func;
          }
      }

      function addWeekParseToken(token, callback) {
          addParseToken(token, function (input, array, config, token) {
              config._w = config._w || {};
              callback(input, config._w, config, token);
          });
      }

      function addTimeToArrayFromToken(token, input, config) {
          if (input != null && hasOwnProp(tokens, token)) {
              tokens[token](input, config._a, config, token);
          }
      }

      var YEAR = 0,
          MONTH = 1,
          DATE = 2,
          HOUR = 3,
          MINUTE = 4,
          SECOND = 5,
          MILLISECOND = 6,
          WEEK = 7,
          WEEKDAY = 8;

      function mod(n, x) {
          return ((n % x) + x) % x;
      }

      var indexOf;

      if (Array.prototype.indexOf) {
          indexOf = Array.prototype.indexOf;
      } else {
          indexOf = function (o) {
              // I know
              var i;
              for (i = 0; i < this.length; ++i) {
                  if (this[i] === o) {
                      return i;
                  }
              }
              return -1;
          };
      }

      function daysInMonth(year, month) {
          if (isNaN(year) || isNaN(month)) {
              return NaN;
          }
          var modMonth = mod(month, 12);
          year += (month - modMonth) / 12;
          return modMonth === 1
              ? isLeapYear(year)
                  ? 29
                  : 28
              : 31 - ((modMonth % 7) % 2);
      }

      // FORMATTING

      addFormatToken('M', ['MM', 2], 'Mo', function () {
          return this.month() + 1;
      });

      addFormatToken('MMM', 0, 0, function (format) {
          return this.localeData().monthsShort(this, format);
      });

      addFormatToken('MMMM', 0, 0, function (format) {
          return this.localeData().months(this, format);
      });

      // ALIASES

      addUnitAlias('month', 'M');

      // PRIORITY

      addUnitPriority('month', 8);

      // PARSING

      addRegexToken('M', match1to2);
      addRegexToken('MM', match1to2, match2);
      addRegexToken('MMM', function (isStrict, locale) {
          return locale.monthsShortRegex(isStrict);
      });
      addRegexToken('MMMM', function (isStrict, locale) {
          return locale.monthsRegex(isStrict);
      });

      addParseToken(['M', 'MM'], function (input, array) {
          array[MONTH] = toInt(input) - 1;
      });

      addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
          var month = config._locale.monthsParse(input, token, config._strict);
          // if we didn't find a month name, mark the date as invalid.
          if (month != null) {
              array[MONTH] = month;
          } else {
              getParsingFlags(config).invalidMonth = input;
          }
      });

      // LOCALES

      var defaultLocaleMonths =
              'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                  '_'
              ),
          defaultLocaleMonthsShort =
              'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
          MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
          defaultMonthsShortRegex = matchWord,
          defaultMonthsRegex = matchWord;

      function localeMonths(m, format) {
          if (!m) {
              return isArray(this._months)
                  ? this._months
                  : this._months['standalone'];
          }
          return isArray(this._months)
              ? this._months[m.month()]
              : this._months[
                    (this._months.isFormat || MONTHS_IN_FORMAT).test(format)
                        ? 'format'
                        : 'standalone'
                ][m.month()];
      }

      function localeMonthsShort(m, format) {
          if (!m) {
              return isArray(this._monthsShort)
                  ? this._monthsShort
                  : this._monthsShort['standalone'];
          }
          return isArray(this._monthsShort)
              ? this._monthsShort[m.month()]
              : this._monthsShort[
                    MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'
                ][m.month()];
      }

      function handleStrictParse(monthName, format, strict) {
          var i,
              ii,
              mom,
              llc = monthName.toLocaleLowerCase();
          if (!this._monthsParse) {
              // this is not used
              this._monthsParse = [];
              this._longMonthsParse = [];
              this._shortMonthsParse = [];
              for (i = 0; i < 12; ++i) {
                  mom = createUTC([2000, i]);
                  this._shortMonthsParse[i] = this.monthsShort(
                      mom,
                      ''
                  ).toLocaleLowerCase();
                  this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
              }
          }

          if (strict) {
              if (format === 'MMM') {
                  ii = indexOf.call(this._shortMonthsParse, llc);
                  return ii !== -1 ? ii : null;
              } else {
                  ii = indexOf.call(this._longMonthsParse, llc);
                  return ii !== -1 ? ii : null;
              }
          } else {
              if (format === 'MMM') {
                  ii = indexOf.call(this._shortMonthsParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._longMonthsParse, llc);
                  return ii !== -1 ? ii : null;
              } else {
                  ii = indexOf.call(this._longMonthsParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._shortMonthsParse, llc);
                  return ii !== -1 ? ii : null;
              }
          }
      }

      function localeMonthsParse(monthName, format, strict) {
          var i, mom, regex;

          if (this._monthsParseExact) {
              return handleStrictParse.call(this, monthName, format, strict);
          }

          if (!this._monthsParse) {
              this._monthsParse = [];
              this._longMonthsParse = [];
              this._shortMonthsParse = [];
          }

          // TODO: add sorting
          // Sorting makes sure if one month (or abbr) is a prefix of another
          // see sorting in computeMonthsParse
          for (i = 0; i < 12; i++) {
              // make the regex if we don't have it already
              mom = createUTC([2000, i]);
              if (strict && !this._longMonthsParse[i]) {
                  this._longMonthsParse[i] = new RegExp(
                      '^' + this.months(mom, '').replace('.', '') + '$',
                      'i'
                  );
                  this._shortMonthsParse[i] = new RegExp(
                      '^' + this.monthsShort(mom, '').replace('.', '') + '$',
                      'i'
                  );
              }
              if (!strict && !this._monthsParse[i]) {
                  regex =
                      '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                  this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
              }
              // test the regex
              if (
                  strict &&
                  format === 'MMMM' &&
                  this._longMonthsParse[i].test(monthName)
              ) {
                  return i;
              } else if (
                  strict &&
                  format === 'MMM' &&
                  this._shortMonthsParse[i].test(monthName)
              ) {
                  return i;
              } else if (!strict && this._monthsParse[i].test(monthName)) {
                  return i;
              }
          }
      }

      // MOMENTS

      function setMonth(mom, value) {
          var dayOfMonth;

          if (!mom.isValid()) {
              // No op
              return mom;
          }

          if (typeof value === 'string') {
              if (/^\d+$/.test(value)) {
                  value = toInt(value);
              } else {
                  value = mom.localeData().monthsParse(value);
                  // TODO: Another silent failure?
                  if (!isNumber(value)) {
                      return mom;
                  }
              }
          }

          dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
          mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
          return mom;
      }

      function getSetMonth(value) {
          if (value != null) {
              setMonth(this, value);
              hooks.updateOffset(this, true);
              return this;
          } else {
              return get(this, 'Month');
          }
      }

      function getDaysInMonth() {
          return daysInMonth(this.year(), this.month());
      }

      function monthsShortRegex(isStrict) {
          if (this._monthsParseExact) {
              if (!hasOwnProp(this, '_monthsRegex')) {
                  computeMonthsParse.call(this);
              }
              if (isStrict) {
                  return this._monthsShortStrictRegex;
              } else {
                  return this._monthsShortRegex;
              }
          } else {
              if (!hasOwnProp(this, '_monthsShortRegex')) {
                  this._monthsShortRegex = defaultMonthsShortRegex;
              }
              return this._monthsShortStrictRegex && isStrict
                  ? this._monthsShortStrictRegex
                  : this._monthsShortRegex;
          }
      }

      function monthsRegex(isStrict) {
          if (this._monthsParseExact) {
              if (!hasOwnProp(this, '_monthsRegex')) {
                  computeMonthsParse.call(this);
              }
              if (isStrict) {
                  return this._monthsStrictRegex;
              } else {
                  return this._monthsRegex;
              }
          } else {
              if (!hasOwnProp(this, '_monthsRegex')) {
                  this._monthsRegex = defaultMonthsRegex;
              }
              return this._monthsStrictRegex && isStrict
                  ? this._monthsStrictRegex
                  : this._monthsRegex;
          }
      }

      function computeMonthsParse() {
          function cmpLenRev(a, b) {
              return b.length - a.length;
          }

          var shortPieces = [],
              longPieces = [],
              mixedPieces = [],
              i,
              mom;
          for (i = 0; i < 12; i++) {
              // make the regex if we don't have it already
              mom = createUTC([2000, i]);
              shortPieces.push(this.monthsShort(mom, ''));
              longPieces.push(this.months(mom, ''));
              mixedPieces.push(this.months(mom, ''));
              mixedPieces.push(this.monthsShort(mom, ''));
          }
          // Sorting makes sure if one month (or abbr) is a prefix of another it
          // will match the longer piece.
          shortPieces.sort(cmpLenRev);
          longPieces.sort(cmpLenRev);
          mixedPieces.sort(cmpLenRev);
          for (i = 0; i < 12; i++) {
              shortPieces[i] = regexEscape(shortPieces[i]);
              longPieces[i] = regexEscape(longPieces[i]);
          }
          for (i = 0; i < 24; i++) {
              mixedPieces[i] = regexEscape(mixedPieces[i]);
          }

          this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
          this._monthsShortRegex = this._monthsRegex;
          this._monthsStrictRegex = new RegExp(
              '^(' + longPieces.join('|') + ')',
              'i'
          );
          this._monthsShortStrictRegex = new RegExp(
              '^(' + shortPieces.join('|') + ')',
              'i'
          );
      }

      // FORMATTING

      addFormatToken('Y', 0, 0, function () {
          var y = this.year();
          return y <= 9999 ? zeroFill(y, 4) : '+' + y;
      });

      addFormatToken(0, ['YY', 2], 0, function () {
          return this.year() % 100;
      });

      addFormatToken(0, ['YYYY', 4], 0, 'year');
      addFormatToken(0, ['YYYYY', 5], 0, 'year');
      addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

      // ALIASES

      addUnitAlias('year', 'y');

      // PRIORITIES

      addUnitPriority('year', 1);

      // PARSING

      addRegexToken('Y', matchSigned);
      addRegexToken('YY', match1to2, match2);
      addRegexToken('YYYY', match1to4, match4);
      addRegexToken('YYYYY', match1to6, match6);
      addRegexToken('YYYYYY', match1to6, match6);

      addParseToken(['YYYYY', 'YYYYYY'], YEAR);
      addParseToken('YYYY', function (input, array) {
          array[YEAR] =
              input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
      });
      addParseToken('YY', function (input, array) {
          array[YEAR] = hooks.parseTwoDigitYear(input);
      });
      addParseToken('Y', function (input, array) {
          array[YEAR] = parseInt(input, 10);
      });

      // HELPERS

      function daysInYear(year) {
          return isLeapYear(year) ? 366 : 365;
      }

      // HOOKS

      hooks.parseTwoDigitYear = function (input) {
          return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
      };

      // MOMENTS

      var getSetYear = makeGetSet('FullYear', true);

      function getIsLeapYear() {
          return isLeapYear(this.year());
      }

      function createDate(y, m, d, h, M, s, ms) {
          // can't just apply() to create a date:
          // https://stackoverflow.com/q/181348
          var date;
          // the date constructor remaps years 0-99 to 1900-1999
          if (y < 100 && y >= 0) {
              // preserve leap years using a full 400 year cycle, then reset
              date = new Date(y + 400, m, d, h, M, s, ms);
              if (isFinite(date.getFullYear())) {
                  date.setFullYear(y);
              }
          } else {
              date = new Date(y, m, d, h, M, s, ms);
          }

          return date;
      }

      function createUTCDate(y) {
          var date, args;
          // the Date.UTC function remaps years 0-99 to 1900-1999
          if (y < 100 && y >= 0) {
              args = Array.prototype.slice.call(arguments);
              // preserve leap years using a full 400 year cycle, then reset
              args[0] = y + 400;
              date = new Date(Date.UTC.apply(null, args));
              if (isFinite(date.getUTCFullYear())) {
                  date.setUTCFullYear(y);
              }
          } else {
              date = new Date(Date.UTC.apply(null, arguments));
          }

          return date;
      }

      // start-of-first-week - start-of-year
      function firstWeekOffset(year, dow, doy) {
          var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
              fwd = 7 + dow - doy,
              // first-week day local weekday -- which local weekday is fwd
              fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

          return -fwdlw + fwd - 1;
      }

      // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
      function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
          var localWeekday = (7 + weekday - dow) % 7,
              weekOffset = firstWeekOffset(year, dow, doy),
              dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
              resYear,
              resDayOfYear;

          if (dayOfYear <= 0) {
              resYear = year - 1;
              resDayOfYear = daysInYear(resYear) + dayOfYear;
          } else if (dayOfYear > daysInYear(year)) {
              resYear = year + 1;
              resDayOfYear = dayOfYear - daysInYear(year);
          } else {
              resYear = year;
              resDayOfYear = dayOfYear;
          }

          return {
              year: resYear,
              dayOfYear: resDayOfYear,
          };
      }

      function weekOfYear(mom, dow, doy) {
          var weekOffset = firstWeekOffset(mom.year(), dow, doy),
              week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
              resWeek,
              resYear;

          if (week < 1) {
              resYear = mom.year() - 1;
              resWeek = week + weeksInYear(resYear, dow, doy);
          } else if (week > weeksInYear(mom.year(), dow, doy)) {
              resWeek = week - weeksInYear(mom.year(), dow, doy);
              resYear = mom.year() + 1;
          } else {
              resYear = mom.year();
              resWeek = week;
          }

          return {
              week: resWeek,
              year: resYear,
          };
      }

      function weeksInYear(year, dow, doy) {
          var weekOffset = firstWeekOffset(year, dow, doy),
              weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
          return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
      }

      // FORMATTING

      addFormatToken('w', ['ww', 2], 'wo', 'week');
      addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

      // ALIASES

      addUnitAlias('week', 'w');
      addUnitAlias('isoWeek', 'W');

      // PRIORITIES

      addUnitPriority('week', 5);
      addUnitPriority('isoWeek', 5);

      // PARSING

      addRegexToken('w', match1to2);
      addRegexToken('ww', match1to2, match2);
      addRegexToken('W', match1to2);
      addRegexToken('WW', match1to2, match2);

      addWeekParseToken(
          ['w', 'ww', 'W', 'WW'],
          function (input, week, config, token) {
              week[token.substr(0, 1)] = toInt(input);
          }
      );

      // HELPERS

      // LOCALES

      function localeWeek(mom) {
          return weekOfYear(mom, this._week.dow, this._week.doy).week;
      }

      var defaultLocaleWeek = {
          dow: 0, // Sunday is the first day of the week.
          doy: 6, // The week that contains Jan 6th is the first week of the year.
      };

      function localeFirstDayOfWeek() {
          return this._week.dow;
      }

      function localeFirstDayOfYear() {
          return this._week.doy;
      }

      // MOMENTS

      function getSetWeek(input) {
          var week = this.localeData().week(this);
          return input == null ? week : this.add((input - week) * 7, 'd');
      }

      function getSetISOWeek(input) {
          var week = weekOfYear(this, 1, 4).week;
          return input == null ? week : this.add((input - week) * 7, 'd');
      }

      // FORMATTING

      addFormatToken('d', 0, 'do', 'day');

      addFormatToken('dd', 0, 0, function (format) {
          return this.localeData().weekdaysMin(this, format);
      });

      addFormatToken('ddd', 0, 0, function (format) {
          return this.localeData().weekdaysShort(this, format);
      });

      addFormatToken('dddd', 0, 0, function (format) {
          return this.localeData().weekdays(this, format);
      });

      addFormatToken('e', 0, 0, 'weekday');
      addFormatToken('E', 0, 0, 'isoWeekday');

      // ALIASES

      addUnitAlias('day', 'd');
      addUnitAlias('weekday', 'e');
      addUnitAlias('isoWeekday', 'E');

      // PRIORITY
      addUnitPriority('day', 11);
      addUnitPriority('weekday', 11);
      addUnitPriority('isoWeekday', 11);

      // PARSING

      addRegexToken('d', match1to2);
      addRegexToken('e', match1to2);
      addRegexToken('E', match1to2);
      addRegexToken('dd', function (isStrict, locale) {
          return locale.weekdaysMinRegex(isStrict);
      });
      addRegexToken('ddd', function (isStrict, locale) {
          return locale.weekdaysShortRegex(isStrict);
      });
      addRegexToken('dddd', function (isStrict, locale) {
          return locale.weekdaysRegex(isStrict);
      });

      addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
          var weekday = config._locale.weekdaysParse(input, token, config._strict);
          // if we didn't get a weekday name, mark the date as invalid
          if (weekday != null) {
              week.d = weekday;
          } else {
              getParsingFlags(config).invalidWeekday = input;
          }
      });

      addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
          week[token] = toInt(input);
      });

      // HELPERS

      function parseWeekday(input, locale) {
          if (typeof input !== 'string') {
              return input;
          }

          if (!isNaN(input)) {
              return parseInt(input, 10);
          }

          input = locale.weekdaysParse(input);
          if (typeof input === 'number') {
              return input;
          }

          return null;
      }

      function parseIsoWeekday(input, locale) {
          if (typeof input === 'string') {
              return locale.weekdaysParse(input) % 7 || 7;
          }
          return isNaN(input) ? null : input;
      }

      // LOCALES
      function shiftWeekdays(ws, n) {
          return ws.slice(n, 7).concat(ws.slice(0, n));
      }

      var defaultLocaleWeekdays =
              'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
          defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
          defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
          defaultWeekdaysRegex = matchWord,
          defaultWeekdaysShortRegex = matchWord,
          defaultWeekdaysMinRegex = matchWord;

      function localeWeekdays(m, format) {
          var weekdays = isArray(this._weekdays)
              ? this._weekdays
              : this._weekdays[
                    m && m !== true && this._weekdays.isFormat.test(format)
                        ? 'format'
                        : 'standalone'
                ];
          return m === true
              ? shiftWeekdays(weekdays, this._week.dow)
              : m
              ? weekdays[m.day()]
              : weekdays;
      }

      function localeWeekdaysShort(m) {
          return m === true
              ? shiftWeekdays(this._weekdaysShort, this._week.dow)
              : m
              ? this._weekdaysShort[m.day()]
              : this._weekdaysShort;
      }

      function localeWeekdaysMin(m) {
          return m === true
              ? shiftWeekdays(this._weekdaysMin, this._week.dow)
              : m
              ? this._weekdaysMin[m.day()]
              : this._weekdaysMin;
      }

      function handleStrictParse$1(weekdayName, format, strict) {
          var i,
              ii,
              mom,
              llc = weekdayName.toLocaleLowerCase();
          if (!this._weekdaysParse) {
              this._weekdaysParse = [];
              this._shortWeekdaysParse = [];
              this._minWeekdaysParse = [];

              for (i = 0; i < 7; ++i) {
                  mom = createUTC([2000, 1]).day(i);
                  this._minWeekdaysParse[i] = this.weekdaysMin(
                      mom,
                      ''
                  ).toLocaleLowerCase();
                  this._shortWeekdaysParse[i] = this.weekdaysShort(
                      mom,
                      ''
                  ).toLocaleLowerCase();
                  this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
              }
          }

          if (strict) {
              if (format === 'dddd') {
                  ii = indexOf.call(this._weekdaysParse, llc);
                  return ii !== -1 ? ii : null;
              } else if (format === 'ddd') {
                  ii = indexOf.call(this._shortWeekdaysParse, llc);
                  return ii !== -1 ? ii : null;
              } else {
                  ii = indexOf.call(this._minWeekdaysParse, llc);
                  return ii !== -1 ? ii : null;
              }
          } else {
              if (format === 'dddd') {
                  ii = indexOf.call(this._weekdaysParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._shortWeekdaysParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._minWeekdaysParse, llc);
                  return ii !== -1 ? ii : null;
              } else if (format === 'ddd') {
                  ii = indexOf.call(this._shortWeekdaysParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._weekdaysParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._minWeekdaysParse, llc);
                  return ii !== -1 ? ii : null;
              } else {
                  ii = indexOf.call(this._minWeekdaysParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._weekdaysParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._shortWeekdaysParse, llc);
                  return ii !== -1 ? ii : null;
              }
          }
      }

      function localeWeekdaysParse(weekdayName, format, strict) {
          var i, mom, regex;

          if (this._weekdaysParseExact) {
              return handleStrictParse$1.call(this, weekdayName, format, strict);
          }

          if (!this._weekdaysParse) {
              this._weekdaysParse = [];
              this._minWeekdaysParse = [];
              this._shortWeekdaysParse = [];
              this._fullWeekdaysParse = [];
          }

          for (i = 0; i < 7; i++) {
              // make the regex if we don't have it already

              mom = createUTC([2000, 1]).day(i);
              if (strict && !this._fullWeekdaysParse[i]) {
                  this._fullWeekdaysParse[i] = new RegExp(
                      '^' + this.weekdays(mom, '').replace('.', '\\.?') + '$',
                      'i'
                  );
                  this._shortWeekdaysParse[i] = new RegExp(
                      '^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$',
                      'i'
                  );
                  this._minWeekdaysParse[i] = new RegExp(
                      '^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$',
                      'i'
                  );
              }
              if (!this._weekdaysParse[i]) {
                  regex =
                      '^' +
                      this.weekdays(mom, '') +
                      '|^' +
                      this.weekdaysShort(mom, '') +
                      '|^' +
                      this.weekdaysMin(mom, '');
                  this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
              }
              // test the regex
              if (
                  strict &&
                  format === 'dddd' &&
                  this._fullWeekdaysParse[i].test(weekdayName)
              ) {
                  return i;
              } else if (
                  strict &&
                  format === 'ddd' &&
                  this._shortWeekdaysParse[i].test(weekdayName)
              ) {
                  return i;
              } else if (
                  strict &&
                  format === 'dd' &&
                  this._minWeekdaysParse[i].test(weekdayName)
              ) {
                  return i;
              } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                  return i;
              }
          }
      }

      // MOMENTS

      function getSetDayOfWeek(input) {
          if (!this.isValid()) {
              return input != null ? this : NaN;
          }
          var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
          if (input != null) {
              input = parseWeekday(input, this.localeData());
              return this.add(input - day, 'd');
          } else {
              return day;
          }
      }

      function getSetLocaleDayOfWeek(input) {
          if (!this.isValid()) {
              return input != null ? this : NaN;
          }
          var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
          return input == null ? weekday : this.add(input - weekday, 'd');
      }

      function getSetISODayOfWeek(input) {
          if (!this.isValid()) {
              return input != null ? this : NaN;
          }

          // behaves the same as moment#day except
          // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
          // as a setter, sunday should belong to the previous week.

          if (input != null) {
              var weekday = parseIsoWeekday(input, this.localeData());
              return this.day(this.day() % 7 ? weekday : weekday - 7);
          } else {
              return this.day() || 7;
          }
      }

      function weekdaysRegex(isStrict) {
          if (this._weekdaysParseExact) {
              if (!hasOwnProp(this, '_weekdaysRegex')) {
                  computeWeekdaysParse.call(this);
              }
              if (isStrict) {
                  return this._weekdaysStrictRegex;
              } else {
                  return this._weekdaysRegex;
              }
          } else {
              if (!hasOwnProp(this, '_weekdaysRegex')) {
                  this._weekdaysRegex = defaultWeekdaysRegex;
              }
              return this._weekdaysStrictRegex && isStrict
                  ? this._weekdaysStrictRegex
                  : this._weekdaysRegex;
          }
      }

      function weekdaysShortRegex(isStrict) {
          if (this._weekdaysParseExact) {
              if (!hasOwnProp(this, '_weekdaysRegex')) {
                  computeWeekdaysParse.call(this);
              }
              if (isStrict) {
                  return this._weekdaysShortStrictRegex;
              } else {
                  return this._weekdaysShortRegex;
              }
          } else {
              if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                  this._weekdaysShortRegex = defaultWeekdaysShortRegex;
              }
              return this._weekdaysShortStrictRegex && isStrict
                  ? this._weekdaysShortStrictRegex
                  : this._weekdaysShortRegex;
          }
      }

      function weekdaysMinRegex(isStrict) {
          if (this._weekdaysParseExact) {
              if (!hasOwnProp(this, '_weekdaysRegex')) {
                  computeWeekdaysParse.call(this);
              }
              if (isStrict) {
                  return this._weekdaysMinStrictRegex;
              } else {
                  return this._weekdaysMinRegex;
              }
          } else {
              if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                  this._weekdaysMinRegex = defaultWeekdaysMinRegex;
              }
              return this._weekdaysMinStrictRegex && isStrict
                  ? this._weekdaysMinStrictRegex
                  : this._weekdaysMinRegex;
          }
      }

      function computeWeekdaysParse() {
          function cmpLenRev(a, b) {
              return b.length - a.length;
          }

          var minPieces = [],
              shortPieces = [],
              longPieces = [],
              mixedPieces = [],
              i,
              mom,
              minp,
              shortp,
              longp;
          for (i = 0; i < 7; i++) {
              // make the regex if we don't have it already
              mom = createUTC([2000, 1]).day(i);
              minp = regexEscape(this.weekdaysMin(mom, ''));
              shortp = regexEscape(this.weekdaysShort(mom, ''));
              longp = regexEscape(this.weekdays(mom, ''));
              minPieces.push(minp);
              shortPieces.push(shortp);
              longPieces.push(longp);
              mixedPieces.push(minp);
              mixedPieces.push(shortp);
              mixedPieces.push(longp);
          }
          // Sorting makes sure if one weekday (or abbr) is a prefix of another it
          // will match the longer piece.
          minPieces.sort(cmpLenRev);
          shortPieces.sort(cmpLenRev);
          longPieces.sort(cmpLenRev);
          mixedPieces.sort(cmpLenRev);

          this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
          this._weekdaysShortRegex = this._weekdaysRegex;
          this._weekdaysMinRegex = this._weekdaysRegex;

          this._weekdaysStrictRegex = new RegExp(
              '^(' + longPieces.join('|') + ')',
              'i'
          );
          this._weekdaysShortStrictRegex = new RegExp(
              '^(' + shortPieces.join('|') + ')',
              'i'
          );
          this._weekdaysMinStrictRegex = new RegExp(
              '^(' + minPieces.join('|') + ')',
              'i'
          );
      }

      // FORMATTING

      function hFormat() {
          return this.hours() % 12 || 12;
      }

      function kFormat() {
          return this.hours() || 24;
      }

      addFormatToken('H', ['HH', 2], 0, 'hour');
      addFormatToken('h', ['hh', 2], 0, hFormat);
      addFormatToken('k', ['kk', 2], 0, kFormat);

      addFormatToken('hmm', 0, 0, function () {
          return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
      });

      addFormatToken('hmmss', 0, 0, function () {
          return (
              '' +
              hFormat.apply(this) +
              zeroFill(this.minutes(), 2) +
              zeroFill(this.seconds(), 2)
          );
      });

      addFormatToken('Hmm', 0, 0, function () {
          return '' + this.hours() + zeroFill(this.minutes(), 2);
      });

      addFormatToken('Hmmss', 0, 0, function () {
          return (
              '' +
              this.hours() +
              zeroFill(this.minutes(), 2) +
              zeroFill(this.seconds(), 2)
          );
      });

      function meridiem(token, lowercase) {
          addFormatToken(token, 0, 0, function () {
              return this.localeData().meridiem(
                  this.hours(),
                  this.minutes(),
                  lowercase
              );
          });
      }

      meridiem('a', true);
      meridiem('A', false);

      // ALIASES

      addUnitAlias('hour', 'h');

      // PRIORITY
      addUnitPriority('hour', 13);

      // PARSING

      function matchMeridiem(isStrict, locale) {
          return locale._meridiemParse;
      }

      addRegexToken('a', matchMeridiem);
      addRegexToken('A', matchMeridiem);
      addRegexToken('H', match1to2);
      addRegexToken('h', match1to2);
      addRegexToken('k', match1to2);
      addRegexToken('HH', match1to2, match2);
      addRegexToken('hh', match1to2, match2);
      addRegexToken('kk', match1to2, match2);

      addRegexToken('hmm', match3to4);
      addRegexToken('hmmss', match5to6);
      addRegexToken('Hmm', match3to4);
      addRegexToken('Hmmss', match5to6);

      addParseToken(['H', 'HH'], HOUR);
      addParseToken(['k', 'kk'], function (input, array, config) {
          var kInput = toInt(input);
          array[HOUR] = kInput === 24 ? 0 : kInput;
      });
      addParseToken(['a', 'A'], function (input, array, config) {
          config._isPm = config._locale.isPM(input);
          config._meridiem = input;
      });
      addParseToken(['h', 'hh'], function (input, array, config) {
          array[HOUR] = toInt(input);
          getParsingFlags(config).bigHour = true;
      });
      addParseToken('hmm', function (input, array, config) {
          var pos = input.length - 2;
          array[HOUR] = toInt(input.substr(0, pos));
          array[MINUTE] = toInt(input.substr(pos));
          getParsingFlags(config).bigHour = true;
      });
      addParseToken('hmmss', function (input, array, config) {
          var pos1 = input.length - 4,
              pos2 = input.length - 2;
          array[HOUR] = toInt(input.substr(0, pos1));
          array[MINUTE] = toInt(input.substr(pos1, 2));
          array[SECOND] = toInt(input.substr(pos2));
          getParsingFlags(config).bigHour = true;
      });
      addParseToken('Hmm', function (input, array, config) {
          var pos = input.length - 2;
          array[HOUR] = toInt(input.substr(0, pos));
          array[MINUTE] = toInt(input.substr(pos));
      });
      addParseToken('Hmmss', function (input, array, config) {
          var pos1 = input.length - 4,
              pos2 = input.length - 2;
          array[HOUR] = toInt(input.substr(0, pos1));
          array[MINUTE] = toInt(input.substr(pos1, 2));
          array[SECOND] = toInt(input.substr(pos2));
      });

      // LOCALES

      function localeIsPM(input) {
          // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
          // Using charAt should be more compatible.
          return (input + '').toLowerCase().charAt(0) === 'p';
      }

      var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i,
          // Setting the hour should keep the time, because the user explicitly
          // specified which hour they want. So trying to maintain the same hour (in
          // a new timezone) makes sense. Adding/subtracting hours does not follow
          // this rule.
          getSetHour = makeGetSet('Hours', true);

      function localeMeridiem(hours, minutes, isLower) {
          if (hours > 11) {
              return isLower ? 'pm' : 'PM';
          } else {
              return isLower ? 'am' : 'AM';
          }
      }

      var baseConfig = {
          calendar: defaultCalendar,
          longDateFormat: defaultLongDateFormat,
          invalidDate: defaultInvalidDate,
          ordinal: defaultOrdinal,
          dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
          relativeTime: defaultRelativeTime,

          months: defaultLocaleMonths,
          monthsShort: defaultLocaleMonthsShort,

          week: defaultLocaleWeek,

          weekdays: defaultLocaleWeekdays,
          weekdaysMin: defaultLocaleWeekdaysMin,
          weekdaysShort: defaultLocaleWeekdaysShort,

          meridiemParse: defaultLocaleMeridiemParse,
      };

      // internal storage for locale config files
      var locales = {},
          localeFamilies = {},
          globalLocale;

      function commonPrefix(arr1, arr2) {
          var i,
              minl = Math.min(arr1.length, arr2.length);
          for (i = 0; i < minl; i += 1) {
              if (arr1[i] !== arr2[i]) {
                  return i;
              }
          }
          return minl;
      }

      function normalizeLocale(key) {
          return key ? key.toLowerCase().replace('_', '-') : key;
      }

      // pick the locale from the array
      // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
      // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
      function chooseLocale(names) {
          var i = 0,
              j,
              next,
              locale,
              split;

          while (i < names.length) {
              split = normalizeLocale(names[i]).split('-');
              j = split.length;
              next = normalizeLocale(names[i + 1]);
              next = next ? next.split('-') : null;
              while (j > 0) {
                  locale = loadLocale(split.slice(0, j).join('-'));
                  if (locale) {
                      return locale;
                  }
                  if (
                      next &&
                      next.length >= j &&
                      commonPrefix(split, next) >= j - 1
                  ) {
                      //the next array item is better than a shallower substring of this one
                      break;
                  }
                  j--;
              }
              i++;
          }
          return globalLocale;
      }

      function isLocaleNameSane(name) {
          // Prevent names that look like filesystem paths, i.e contain '/' or '\'
          return name.match('^[^/\\\\]*$') != null;
      }

      function loadLocale(name) {
          var oldLocale = null,
              aliasedRequire;
          // TODO: Find a better way to register and load all the locales in Node
          if (
              locales[name] === undefined &&
              typeof module !== 'undefined' &&
              module &&
              module.exports &&
              isLocaleNameSane(name)
          ) {
              try {
                  oldLocale = globalLocale._abbr;
                  aliasedRequire = require;
                  aliasedRequire('./locale/' + name);
                  getSetGlobalLocale(oldLocale);
              } catch (e) {
                  // mark as not found to avoid repeating expensive file require call causing high CPU
                  // when trying to find en-US, en_US, en-us for every format call
                  locales[name] = null; // null means not found
              }
          }
          return locales[name];
      }

      // This function will load locale and then set the global locale.  If
      // no arguments are passed in, it will simply return the current global
      // locale key.
      function getSetGlobalLocale(key, values) {
          var data;
          if (key) {
              if (isUndefined(values)) {
                  data = getLocale(key);
              } else {
                  data = defineLocale(key, values);
              }

              if (data) {
                  // moment.duration._locale = moment._locale = data;
                  globalLocale = data;
              } else {
                  if (typeof console !== 'undefined' && console.warn) {
                      //warn user if arguments are passed but the locale could not be set
                      console.warn(
                          'Locale ' + key + ' not found. Did you forget to load it?'
                      );
                  }
              }
          }

          return globalLocale._abbr;
      }

      function defineLocale(name, config) {
          if (config !== null) {
              var locale,
                  parentConfig = baseConfig;
              config.abbr = name;
              if (locales[name] != null) {
                  deprecateSimple(
                      'defineLocaleOverride',
                      'use moment.updateLocale(localeName, config) to change ' +
                          'an existing locale. moment.defineLocale(localeName, ' +
                          'config) should only be used for creating a new locale ' +
                          'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.'
                  );
                  parentConfig = locales[name]._config;
              } else if (config.parentLocale != null) {
                  if (locales[config.parentLocale] != null) {
                      parentConfig = locales[config.parentLocale]._config;
                  } else {
                      locale = loadLocale(config.parentLocale);
                      if (locale != null) {
                          parentConfig = locale._config;
                      } else {
                          if (!localeFamilies[config.parentLocale]) {
                              localeFamilies[config.parentLocale] = [];
                          }
                          localeFamilies[config.parentLocale].push({
                              name: name,
                              config: config,
                          });
                          return null;
                      }
                  }
              }
              locales[name] = new Locale(mergeConfigs(parentConfig, config));

              if (localeFamilies[name]) {
                  localeFamilies[name].forEach(function (x) {
                      defineLocale(x.name, x.config);
                  });
              }

              // backwards compat for now: also set the locale
              // make sure we set the locale AFTER all child locales have been
              // created, so we won't end up with the child locale set.
              getSetGlobalLocale(name);

              return locales[name];
          } else {
              // useful for testing
              delete locales[name];
              return null;
          }
      }

      function updateLocale(name, config) {
          if (config != null) {
              var locale,
                  tmpLocale,
                  parentConfig = baseConfig;

              if (locales[name] != null && locales[name].parentLocale != null) {
                  // Update existing child locale in-place to avoid memory-leaks
                  locales[name].set(mergeConfigs(locales[name]._config, config));
              } else {
                  // MERGE
                  tmpLocale = loadLocale(name);
                  if (tmpLocale != null) {
                      parentConfig = tmpLocale._config;
                  }
                  config = mergeConfigs(parentConfig, config);
                  if (tmpLocale == null) {
                      // updateLocale is called for creating a new locale
                      // Set abbr so it will have a name (getters return
                      // undefined otherwise).
                      config.abbr = name;
                  }
                  locale = new Locale(config);
                  locale.parentLocale = locales[name];
                  locales[name] = locale;
              }

              // backwards compat for now: also set the locale
              getSetGlobalLocale(name);
          } else {
              // pass null for config to unupdate, useful for tests
              if (locales[name] != null) {
                  if (locales[name].parentLocale != null) {
                      locales[name] = locales[name].parentLocale;
                      if (name === getSetGlobalLocale()) {
                          getSetGlobalLocale(name);
                      }
                  } else if (locales[name] != null) {
                      delete locales[name];
                  }
              }
          }
          return locales[name];
      }

      // returns locale data
      function getLocale(key) {
          var locale;

          if (key && key._locale && key._locale._abbr) {
              key = key._locale._abbr;
          }

          if (!key) {
              return globalLocale;
          }

          if (!isArray(key)) {
              //short-circuit everything else
              locale = loadLocale(key);
              if (locale) {
                  return locale;
              }
              key = [key];
          }

          return chooseLocale(key);
      }

      function listLocales() {
          return keys(locales);
      }

      function checkOverflow(m) {
          var overflow,
              a = m._a;

          if (a && getParsingFlags(m).overflow === -2) {
              overflow =
                  a[MONTH] < 0 || a[MONTH] > 11
                      ? MONTH
                      : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH])
                      ? DATE
                      : a[HOUR] < 0 ||
                        a[HOUR] > 24 ||
                        (a[HOUR] === 24 &&
                            (a[MINUTE] !== 0 ||
                                a[SECOND] !== 0 ||
                                a[MILLISECOND] !== 0))
                      ? HOUR
                      : a[MINUTE] < 0 || a[MINUTE] > 59
                      ? MINUTE
                      : a[SECOND] < 0 || a[SECOND] > 59
                      ? SECOND
                      : a[MILLISECOND] < 0 || a[MILLISECOND] > 999
                      ? MILLISECOND
                      : -1;

              if (
                  getParsingFlags(m)._overflowDayOfYear &&
                  (overflow < YEAR || overflow > DATE)
              ) {
                  overflow = DATE;
              }
              if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                  overflow = WEEK;
              }
              if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                  overflow = WEEKDAY;
              }

              getParsingFlags(m).overflow = overflow;
          }

          return m;
      }

      // iso 8601 regex
      // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
      var extendedIsoRegex =
              /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
          basicIsoRegex =
              /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
          tzRegex = /Z|[+-]\d\d(?::?\d\d)?/,
          isoDates = [
              ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
              ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
              ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
              ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
              ['YYYY-DDD', /\d{4}-\d{3}/],
              ['YYYY-MM', /\d{4}-\d\d/, false],
              ['YYYYYYMMDD', /[+-]\d{10}/],
              ['YYYYMMDD', /\d{8}/],
              ['GGGG[W]WWE', /\d{4}W\d{3}/],
              ['GGGG[W]WW', /\d{4}W\d{2}/, false],
              ['YYYYDDD', /\d{7}/],
              ['YYYYMM', /\d{6}/, false],
              ['YYYY', /\d{4}/, false] ],
          // iso time formats and regexes
          isoTimes = [
              ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
              ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
              ['HH:mm:ss', /\d\d:\d\d:\d\d/],
              ['HH:mm', /\d\d:\d\d/],
              ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
              ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
              ['HHmmss', /\d\d\d\d\d\d/],
              ['HHmm', /\d\d\d\d/],
              ['HH', /\d\d/] ],
          aspNetJsonRegex = /^\/?Date\((-?\d+)/i,
          // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
          rfc2822 =
              /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
          obsOffsets = {
              UT: 0,
              GMT: 0,
              EDT: -4 * 60,
              EST: -5 * 60,
              CDT: -5 * 60,
              CST: -6 * 60,
              MDT: -6 * 60,
              MST: -7 * 60,
              PDT: -7 * 60,
              PST: -8 * 60,
          };

      // date from iso format
      function configFromISO(config) {
          var i,
              l,
              string = config._i,
              match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
              allowTime,
              dateFormat,
              timeFormat,
              tzFormat,
              isoDatesLen = isoDates.length,
              isoTimesLen = isoTimes.length;

          if (match) {
              getParsingFlags(config).iso = true;
              for (i = 0, l = isoDatesLen; i < l; i++) {
                  if (isoDates[i][1].exec(match[1])) {
                      dateFormat = isoDates[i][0];
                      allowTime = isoDates[i][2] !== false;
                      break;
                  }
              }
              if (dateFormat == null) {
                  config._isValid = false;
                  return;
              }
              if (match[3]) {
                  for (i = 0, l = isoTimesLen; i < l; i++) {
                      if (isoTimes[i][1].exec(match[3])) {
                          // match[2] should be 'T' or space
                          timeFormat = (match[2] || ' ') + isoTimes[i][0];
                          break;
                      }
                  }
                  if (timeFormat == null) {
                      config._isValid = false;
                      return;
                  }
              }
              if (!allowTime && timeFormat != null) {
                  config._isValid = false;
                  return;
              }
              if (match[4]) {
                  if (tzRegex.exec(match[4])) {
                      tzFormat = 'Z';
                  } else {
                      config._isValid = false;
                      return;
                  }
              }
              config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
              configFromStringAndFormat(config);
          } else {
              config._isValid = false;
          }
      }

      function extractFromRFC2822Strings(
          yearStr,
          monthStr,
          dayStr,
          hourStr,
          minuteStr,
          secondStr
      ) {
          var result = [
              untruncateYear(yearStr),
              defaultLocaleMonthsShort.indexOf(monthStr),
              parseInt(dayStr, 10),
              parseInt(hourStr, 10),
              parseInt(minuteStr, 10) ];

          if (secondStr) {
              result.push(parseInt(secondStr, 10));
          }

          return result;
      }

      function untruncateYear(yearStr) {
          var year = parseInt(yearStr, 10);
          if (year <= 49) {
              return 2000 + year;
          } else if (year <= 999) {
              return 1900 + year;
          }
          return year;
      }

      function preprocessRFC2822(s) {
          // Remove comments and folding whitespace and replace multiple-spaces with a single space
          return s
              .replace(/\([^)]*\)|[\n\t]/g, ' ')
              .replace(/(\s\s+)/g, ' ')
              .replace(/^\s\s*/, '')
              .replace(/\s\s*$/, '');
      }

      function checkWeekday(weekdayStr, parsedInput, config) {
          if (weekdayStr) {
              // TODO: Replace the vanilla JS Date object with an independent day-of-week check.
              var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                  weekdayActual = new Date(
                      parsedInput[0],
                      parsedInput[1],
                      parsedInput[2]
                  ).getDay();
              if (weekdayProvided !== weekdayActual) {
                  getParsingFlags(config).weekdayMismatch = true;
                  config._isValid = false;
                  return false;
              }
          }
          return true;
      }

      function calculateOffset(obsOffset, militaryOffset, numOffset) {
          if (obsOffset) {
              return obsOffsets[obsOffset];
          } else if (militaryOffset) {
              // the only allowed military tz is Z
              return 0;
          } else {
              var hm = parseInt(numOffset, 10),
                  m = hm % 100,
                  h = (hm - m) / 100;
              return h * 60 + m;
          }
      }

      // date and time from ref 2822 format
      function configFromRFC2822(config) {
          var match = rfc2822.exec(preprocessRFC2822(config._i)),
              parsedArray;
          if (match) {
              parsedArray = extractFromRFC2822Strings(
                  match[4],
                  match[3],
                  match[2],
                  match[5],
                  match[6],
                  match[7]
              );
              if (!checkWeekday(match[1], parsedArray, config)) {
                  return;
              }

              config._a = parsedArray;
              config._tzm = calculateOffset(match[8], match[9], match[10]);

              config._d = createUTCDate.apply(null, config._a);
              config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

              getParsingFlags(config).rfc2822 = true;
          } else {
              config._isValid = false;
          }
      }

      // date from 1) ASP.NET, 2) ISO, 3) RFC 2822 formats, or 4) optional fallback if parsing isn't strict
      function configFromString(config) {
          var matched = aspNetJsonRegex.exec(config._i);
          if (matched !== null) {
              config._d = new Date(+matched[1]);
              return;
          }

          configFromISO(config);
          if (config._isValid === false) {
              delete config._isValid;
          } else {
              return;
          }

          configFromRFC2822(config);
          if (config._isValid === false) {
              delete config._isValid;
          } else {
              return;
          }

          if (config._strict) {
              config._isValid = false;
          } else {
              // Final attempt, use Input Fallback
              hooks.createFromInputFallback(config);
          }
      }

      hooks.createFromInputFallback = deprecate(
          'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
              'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
              'discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.',
          function (config) {
              config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
          }
      );

      // Pick the first defined of two or three arguments.
      function defaults(a, b, c) {
          if (a != null) {
              return a;
          }
          if (b != null) {
              return b;
          }
          return c;
      }

      function currentDateArray(config) {
          // hooks is actually the exported moment object
          var nowValue = new Date(hooks.now());
          if (config._useUTC) {
              return [
                  nowValue.getUTCFullYear(),
                  nowValue.getUTCMonth(),
                  nowValue.getUTCDate() ];
          }
          return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
      }

      // convert an array to a date.
      // the array should mirror the parameters below
      // note: all values past the year are optional and will default to the lowest possible value.
      // [year, month, day , hour, minute, second, millisecond]
      function configFromArray(config) {
          var i,
              date,
              input = [],
              currentDate,
              expectedWeekday,
              yearToUse;

          if (config._d) {
              return;
          }

          currentDate = currentDateArray(config);

          //compute day of the year from weeks and weekdays
          if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
              dayOfYearFromWeekInfo(config);
          }

          //if the day of the year is set, figure out what it is
          if (config._dayOfYear != null) {
              yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

              if (
                  config._dayOfYear > daysInYear(yearToUse) ||
                  config._dayOfYear === 0
              ) {
                  getParsingFlags(config)._overflowDayOfYear = true;
              }

              date = createUTCDate(yearToUse, 0, config._dayOfYear);
              config._a[MONTH] = date.getUTCMonth();
              config._a[DATE] = date.getUTCDate();
          }

          // Default to current date.
          // * if no year, month, day of month are given, default to today
          // * if day of month is given, default month and year
          // * if month is given, default only year
          // * if year is given, don't default anything
          for (i = 0; i < 3 && config._a[i] == null; ++i) {
              config._a[i] = input[i] = currentDate[i];
          }

          // Zero out whatever was not defaulted, including time
          for (; i < 7; i++) {
              config._a[i] = input[i] =
                  config._a[i] == null ? (i === 2 ? 1 : 0) : config._a[i];
          }

          // Check for 24:00:00.000
          if (
              config._a[HOUR] === 24 &&
              config._a[MINUTE] === 0 &&
              config._a[SECOND] === 0 &&
              config._a[MILLISECOND] === 0
          ) {
              config._nextDay = true;
              config._a[HOUR] = 0;
          }

          config._d = (config._useUTC ? createUTCDate : createDate).apply(
              null,
              input
          );
          expectedWeekday = config._useUTC
              ? config._d.getUTCDay()
              : config._d.getDay();

          // Apply timezone offset from input. The actual utcOffset can be changed
          // with parseZone.
          if (config._tzm != null) {
              config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
          }

          if (config._nextDay) {
              config._a[HOUR] = 24;
          }

          // check for mismatching day of week
          if (
              config._w &&
              typeof config._w.d !== 'undefined' &&
              config._w.d !== expectedWeekday
          ) {
              getParsingFlags(config).weekdayMismatch = true;
          }
      }

      function dayOfYearFromWeekInfo(config) {
          var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;

          w = config._w;
          if (w.GG != null || w.W != null || w.E != null) {
              dow = 1;
              doy = 4;

              // TODO: We need to take the current isoWeekYear, but that depends on
              // how we interpret now (local, utc, fixed offset). So create
              // a now version of current config (take local/utc/offset flags, and
              // create now).
              weekYear = defaults(
                  w.GG,
                  config._a[YEAR],
                  weekOfYear(createLocal(), 1, 4).year
              );
              week = defaults(w.W, 1);
              weekday = defaults(w.E, 1);
              if (weekday < 1 || weekday > 7) {
                  weekdayOverflow = true;
              }
          } else {
              dow = config._locale._week.dow;
              doy = config._locale._week.doy;

              curWeek = weekOfYear(createLocal(), dow, doy);

              weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

              // Default to current week.
              week = defaults(w.w, curWeek.week);

              if (w.d != null) {
                  // weekday -- low day numbers are considered next week
                  weekday = w.d;
                  if (weekday < 0 || weekday > 6) {
                      weekdayOverflow = true;
                  }
              } else if (w.e != null) {
                  // local weekday -- counting starts from beginning of week
                  weekday = w.e + dow;
                  if (w.e < 0 || w.e > 6) {
                      weekdayOverflow = true;
                  }
              } else {
                  // default to beginning of week
                  weekday = dow;
              }
          }
          if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
              getParsingFlags(config)._overflowWeeks = true;
          } else if (weekdayOverflow != null) {
              getParsingFlags(config)._overflowWeekday = true;
          } else {
              temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
              config._a[YEAR] = temp.year;
              config._dayOfYear = temp.dayOfYear;
          }
      }

      // constant that refers to the ISO standard
      hooks.ISO_8601 = function () {};

      // constant that refers to the RFC 2822 form
      hooks.RFC_2822 = function () {};

      // date from string and format string
      function configFromStringAndFormat(config) {
          // TODO: Move this to another part of the creation flow to prevent circular deps
          if (config._f === hooks.ISO_8601) {
              configFromISO(config);
              return;
          }
          if (config._f === hooks.RFC_2822) {
              configFromRFC2822(config);
              return;
          }
          config._a = [];
          getParsingFlags(config).empty = true;

          // This array is used to make a Date, either with `new Date` or `Date.UTC`
          var string = '' + config._i,
              i,
              parsedInput,
              tokens,
              token,
              skipped,
              stringLength = string.length,
              totalParsedInputLength = 0,
              era,
              tokenLen;

          tokens =
              expandFormat(config._f, config._locale).match(formattingTokens) || [];
          tokenLen = tokens.length;
          for (i = 0; i < tokenLen; i++) {
              token = tokens[i];
              parsedInput = (string.match(getParseRegexForToken(token, config)) ||
                  [])[0];
              if (parsedInput) {
                  skipped = string.substr(0, string.indexOf(parsedInput));
                  if (skipped.length > 0) {
                      getParsingFlags(config).unusedInput.push(skipped);
                  }
                  string = string.slice(
                      string.indexOf(parsedInput) + parsedInput.length
                  );
                  totalParsedInputLength += parsedInput.length;
              }
              // don't parse if it's not a known token
              if (formatTokenFunctions[token]) {
                  if (parsedInput) {
                      getParsingFlags(config).empty = false;
                  } else {
                      getParsingFlags(config).unusedTokens.push(token);
                  }
                  addTimeToArrayFromToken(token, parsedInput, config);
              } else if (config._strict && !parsedInput) {
                  getParsingFlags(config).unusedTokens.push(token);
              }
          }

          // add remaining unparsed input length to the string
          getParsingFlags(config).charsLeftOver =
              stringLength - totalParsedInputLength;
          if (string.length > 0) {
              getParsingFlags(config).unusedInput.push(string);
          }

          // clear _12h flag if hour is <= 12
          if (
              config._a[HOUR] <= 12 &&
              getParsingFlags(config).bigHour === true &&
              config._a[HOUR] > 0
          ) {
              getParsingFlags(config).bigHour = undefined;
          }

          getParsingFlags(config).parsedDateParts = config._a.slice(0);
          getParsingFlags(config).meridiem = config._meridiem;
          // handle meridiem
          config._a[HOUR] = meridiemFixWrap(
              config._locale,
              config._a[HOUR],
              config._meridiem
          );

          // handle era
          era = getParsingFlags(config).era;
          if (era !== null) {
              config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
          }

          configFromArray(config);
          checkOverflow(config);
      }

      function meridiemFixWrap(locale, hour, meridiem) {
          var isPm;

          if (meridiem == null) {
              // nothing to do
              return hour;
          }
          if (locale.meridiemHour != null) {
              return locale.meridiemHour(hour, meridiem);
          } else if (locale.isPM != null) {
              // Fallback
              isPm = locale.isPM(meridiem);
              if (isPm && hour < 12) {
                  hour += 12;
              }
              if (!isPm && hour === 12) {
                  hour = 0;
              }
              return hour;
          } else {
              // this is not supposed to happen
              return hour;
          }
      }

      // date from string and array of format strings
      function configFromStringAndArray(config) {
          var tempConfig,
              bestMoment,
              scoreToBeat,
              i,
              currentScore,
              validFormatFound,
              bestFormatIsValid = false,
              configfLen = config._f.length;

          if (configfLen === 0) {
              getParsingFlags(config).invalidFormat = true;
              config._d = new Date(NaN);
              return;
          }

          for (i = 0; i < configfLen; i++) {
              currentScore = 0;
              validFormatFound = false;
              tempConfig = copyConfig({}, config);
              if (config._useUTC != null) {
                  tempConfig._useUTC = config._useUTC;
              }
              tempConfig._f = config._f[i];
              configFromStringAndFormat(tempConfig);

              if (isValid(tempConfig)) {
                  validFormatFound = true;
              }

              // if there is any input that was not parsed add a penalty for that format
              currentScore += getParsingFlags(tempConfig).charsLeftOver;

              //or tokens
              currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

              getParsingFlags(tempConfig).score = currentScore;

              if (!bestFormatIsValid) {
                  if (
                      scoreToBeat == null ||
                      currentScore < scoreToBeat ||
                      validFormatFound
                  ) {
                      scoreToBeat = currentScore;
                      bestMoment = tempConfig;
                      if (validFormatFound) {
                          bestFormatIsValid = true;
                      }
                  }
              } else {
                  if (currentScore < scoreToBeat) {
                      scoreToBeat = currentScore;
                      bestMoment = tempConfig;
                  }
              }
          }

          extend(config, bestMoment || tempConfig);
      }

      function configFromObject(config) {
          if (config._d) {
              return;
          }

          var i = normalizeObjectUnits(config._i),
              dayOrDate = i.day === undefined ? i.date : i.day;
          config._a = map(
              [i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond],
              function (obj) {
                  return obj && parseInt(obj, 10);
              }
          );

          configFromArray(config);
      }

      function createFromConfig(config) {
          var res = new Moment(checkOverflow(prepareConfig(config)));
          if (res._nextDay) {
              // Adding is smart enough around DST
              res.add(1, 'd');
              res._nextDay = undefined;
          }

          return res;
      }

      function prepareConfig(config) {
          var input = config._i,
              format = config._f;

          config._locale = config._locale || getLocale(config._l);

          if (input === null || (format === undefined && input === '')) {
              return createInvalid({ nullInput: true });
          }

          if (typeof input === 'string') {
              config._i = input = config._locale.preparse(input);
          }

          if (isMoment(input)) {
              return new Moment(checkOverflow(input));
          } else if (isDate(input)) {
              config._d = input;
          } else if (isArray(format)) {
              configFromStringAndArray(config);
          } else if (format) {
              configFromStringAndFormat(config);
          } else {
              configFromInput(config);
          }

          if (!isValid(config)) {
              config._d = null;
          }

          return config;
      }

      function configFromInput(config) {
          var input = config._i;
          if (isUndefined(input)) {
              config._d = new Date(hooks.now());
          } else if (isDate(input)) {
              config._d = new Date(input.valueOf());
          } else if (typeof input === 'string') {
              configFromString(config);
          } else if (isArray(input)) {
              config._a = map(input.slice(0), function (obj) {
                  return parseInt(obj, 10);
              });
              configFromArray(config);
          } else if (isObject(input)) {
              configFromObject(config);
          } else if (isNumber(input)) {
              // from milliseconds
              config._d = new Date(input);
          } else {
              hooks.createFromInputFallback(config);
          }
      }

      function createLocalOrUTC(input, format, locale, strict, isUTC) {
          var c = {};

          if (format === true || format === false) {
              strict = format;
              format = undefined;
          }

          if (locale === true || locale === false) {
              strict = locale;
              locale = undefined;
          }

          if (
              (isObject(input) && isObjectEmpty(input)) ||
              (isArray(input) && input.length === 0)
          ) {
              input = undefined;
          }
          // object construction must be done this way.
          // https://github.com/moment/moment/issues/1423
          c._isAMomentObject = true;
          c._useUTC = c._isUTC = isUTC;
          c._l = locale;
          c._i = input;
          c._f = format;
          c._strict = strict;

          return createFromConfig(c);
      }

      function createLocal(input, format, locale, strict) {
          return createLocalOrUTC(input, format, locale, strict, false);
      }

      var prototypeMin = deprecate(
              'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
              function () {
                  var other = createLocal.apply(null, arguments);
                  if (this.isValid() && other.isValid()) {
                      return other < this ? this : other;
                  } else {
                      return createInvalid();
                  }
              }
          ),
          prototypeMax = deprecate(
              'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
              function () {
                  var other = createLocal.apply(null, arguments);
                  if (this.isValid() && other.isValid()) {
                      return other > this ? this : other;
                  } else {
                      return createInvalid();
                  }
              }
          );

      // Pick a moment m from moments so that m[fn](other) is true for all
      // other. This relies on the function fn to be transitive.
      //
      // moments should either be an array of moment objects or an array, whose
      // first element is an array of moment objects.
      function pickBy(fn, moments) {
          var res, i;
          if (moments.length === 1 && isArray(moments[0])) {
              moments = moments[0];
          }
          if (!moments.length) {
              return createLocal();
          }
          res = moments[0];
          for (i = 1; i < moments.length; ++i) {
              if (!moments[i].isValid() || moments[i][fn](res)) {
                  res = moments[i];
              }
          }
          return res;
      }

      // TODO: Use [].sort instead?
      function min() {
          var args = [].slice.call(arguments, 0);

          return pickBy('isBefore', args);
      }

      function max() {
          var args = [].slice.call(arguments, 0);

          return pickBy('isAfter', args);
      }

      var now = function () {
          return Date.now ? Date.now() : +new Date();
      };

      var ordering = [
          'year',
          'quarter',
          'month',
          'week',
          'day',
          'hour',
          'minute',
          'second',
          'millisecond' ];

      function isDurationValid(m) {
          var key,
              unitHasDecimal = false,
              i,
              orderLen = ordering.length;
          for (key in m) {
              if (
                  hasOwnProp(m, key) &&
                  !(
                      indexOf.call(ordering, key) !== -1 &&
                      (m[key] == null || !isNaN(m[key]))
                  )
              ) {
                  return false;
              }
          }

          for (i = 0; i < orderLen; ++i) {
              if (m[ordering[i]]) {
                  if (unitHasDecimal) {
                      return false; // only allow non-integers for smallest unit
                  }
                  if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                      unitHasDecimal = true;
                  }
              }
          }

          return true;
      }

      function isValid$1() {
          return this._isValid;
      }

      function createInvalid$1() {
          return createDuration(NaN);
      }

      function Duration(duration) {
          var normalizedInput = normalizeObjectUnits(duration),
              years = normalizedInput.year || 0,
              quarters = normalizedInput.quarter || 0,
              months = normalizedInput.month || 0,
              weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
              days = normalizedInput.day || 0,
              hours = normalizedInput.hour || 0,
              minutes = normalizedInput.minute || 0,
              seconds = normalizedInput.second || 0,
              milliseconds = normalizedInput.millisecond || 0;

          this._isValid = isDurationValid(normalizedInput);

          // representation for dateAddRemove
          this._milliseconds =
              +milliseconds +
              seconds * 1e3 + // 1000
              minutes * 6e4 + // 1000 * 60
              hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
          // Because of dateAddRemove treats 24 hours as different from a
          // day when working around DST, we need to store them separately
          this._days = +days + weeks * 7;
          // It is impossible to translate months into days without knowing
          // which months you are are talking about, so we have to store
          // it separately.
          this._months = +months + quarters * 3 + years * 12;

          this._data = {};

          this._locale = getLocale();

          this._bubble();
      }

      function isDuration(obj) {
          return obj instanceof Duration;
      }

      function absRound(number) {
          if (number < 0) {
              return Math.round(-1 * number) * -1;
          } else {
              return Math.round(number);
          }
      }

      // compare two arrays, return the number of differences
      function compareArrays(array1, array2, dontConvert) {
          var len = Math.min(array1.length, array2.length),
              lengthDiff = Math.abs(array1.length - array2.length),
              diffs = 0,
              i;
          for (i = 0; i < len; i++) {
              if (
                  (dontConvert && array1[i] !== array2[i]) ||
                  (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))
              ) {
                  diffs++;
              }
          }
          return diffs + lengthDiff;
      }

      // FORMATTING

      function offset(token, separator) {
          addFormatToken(token, 0, 0, function () {
              var offset = this.utcOffset(),
                  sign = '+';
              if (offset < 0) {
                  offset = -offset;
                  sign = '-';
              }
              return (
                  sign +
                  zeroFill(~~(offset / 60), 2) +
                  separator +
                  zeroFill(~~offset % 60, 2)
              );
          });
      }

      offset('Z', ':');
      offset('ZZ', '');

      // PARSING

      addRegexToken('Z', matchShortOffset);
      addRegexToken('ZZ', matchShortOffset);
      addParseToken(['Z', 'ZZ'], function (input, array, config) {
          config._useUTC = true;
          config._tzm = offsetFromString(matchShortOffset, input);
      });

      // HELPERS

      // timezone chunker
      // '+10:00' > ['10',  '00']
      // '-1530'  > ['-15', '30']
      var chunkOffset = /([\+\-]|\d\d)/gi;

      function offsetFromString(matcher, string) {
          var matches = (string || '').match(matcher),
              chunk,
              parts,
              minutes;

          if (matches === null) {
              return null;
          }

          chunk = matches[matches.length - 1] || [];
          parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
          minutes = +(parts[1] * 60) + toInt(parts[2]);

          return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
      }

      // Return a moment from input, that is local/utc/zone equivalent to model.
      function cloneWithOffset(input, model) {
          var res, diff;
          if (model._isUTC) {
              res = model.clone();
              diff =
                  (isMoment(input) || isDate(input)
                      ? input.valueOf()
                      : createLocal(input).valueOf()) - res.valueOf();
              // Use low-level api, because this fn is low-level api.
              res._d.setTime(res._d.valueOf() + diff);
              hooks.updateOffset(res, false);
              return res;
          } else {
              return createLocal(input).local();
          }
      }

      function getDateOffset(m) {
          // On Firefox.24 Date#getTimezoneOffset returns a floating point.
          // https://github.com/moment/moment/pull/1871
          return -Math.round(m._d.getTimezoneOffset());
      }

      // HOOKS

      // This function will be called whenever a moment is mutated.
      // It is intended to keep the offset in sync with the timezone.
      hooks.updateOffset = function () {};

      // MOMENTS

      // keepLocalTime = true means only change the timezone, without
      // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
      // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
      // +0200, so we adjust the time as needed, to be valid.
      //
      // Keeping the time actually adds/subtracts (one hour)
      // from the actual represented time. That is why we call updateOffset
      // a second time. In case it wants us to change the offset again
      // _changeInProgress == true case, then we have to adjust, because
      // there is no such time in the given timezone.
      function getSetOffset(input, keepLocalTime, keepMinutes) {
          var offset = this._offset || 0,
              localAdjust;
          if (!this.isValid()) {
              return input != null ? this : NaN;
          }
          if (input != null) {
              if (typeof input === 'string') {
                  input = offsetFromString(matchShortOffset, input);
                  if (input === null) {
                      return this;
                  }
              } else if (Math.abs(input) < 16 && !keepMinutes) {
                  input = input * 60;
              }
              if (!this._isUTC && keepLocalTime) {
                  localAdjust = getDateOffset(this);
              }
              this._offset = input;
              this._isUTC = true;
              if (localAdjust != null) {
                  this.add(localAdjust, 'm');
              }
              if (offset !== input) {
                  if (!keepLocalTime || this._changeInProgress) {
                      addSubtract(
                          this,
                          createDuration(input - offset, 'm'),
                          1,
                          false
                      );
                  } else if (!this._changeInProgress) {
                      this._changeInProgress = true;
                      hooks.updateOffset(this, true);
                      this._changeInProgress = null;
                  }
              }
              return this;
          } else {
              return this._isUTC ? offset : getDateOffset(this);
          }
      }

      function getSetZone(input, keepLocalTime) {
          if (input != null) {
              if (typeof input !== 'string') {
                  input = -input;
              }

              this.utcOffset(input, keepLocalTime);

              return this;
          } else {
              return -this.utcOffset();
          }
      }

      function setOffsetToUTC(keepLocalTime) {
          return this.utcOffset(0, keepLocalTime);
      }

      function setOffsetToLocal(keepLocalTime) {
          if (this._isUTC) {
              this.utcOffset(0, keepLocalTime);
              this._isUTC = false;

              if (keepLocalTime) {
                  this.subtract(getDateOffset(this), 'm');
              }
          }
          return this;
      }

      function setOffsetToParsedOffset() {
          if (this._tzm != null) {
              this.utcOffset(this._tzm, false, true);
          } else if (typeof this._i === 'string') {
              var tZone = offsetFromString(matchOffset, this._i);
              if (tZone != null) {
                  this.utcOffset(tZone);
              } else {
                  this.utcOffset(0, true);
              }
          }
          return this;
      }

      function hasAlignedHourOffset(input) {
          if (!this.isValid()) {
              return false;
          }
          input = input ? createLocal(input).utcOffset() : 0;

          return (this.utcOffset() - input) % 60 === 0;
      }

      function isDaylightSavingTime() {
          return (
              this.utcOffset() > this.clone().month(0).utcOffset() ||
              this.utcOffset() > this.clone().month(5).utcOffset()
          );
      }

      function isDaylightSavingTimeShifted() {
          if (!isUndefined(this._isDSTShifted)) {
              return this._isDSTShifted;
          }

          var c = {},
              other;

          copyConfig(c, this);
          c = prepareConfig(c);

          if (c._a) {
              other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
              this._isDSTShifted =
                  this.isValid() && compareArrays(c._a, other.toArray()) > 0;
          } else {
              this._isDSTShifted = false;
          }

          return this._isDSTShifted;
      }

      function isLocal() {
          return this.isValid() ? !this._isUTC : false;
      }

      function isUtcOffset() {
          return this.isValid() ? this._isUTC : false;
      }

      function isUtc() {
          return this.isValid() ? this._isUTC && this._offset === 0 : false;
      }

      // ASP.NET json date format regex
      var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,
          // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
          // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
          // and further modified to allow for strings containing both week and day
          isoRegex =
              /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

      function createDuration(input, key) {
          var duration = input,
              // matching against regexp is expensive, do it on demand
              match = null,
              sign,
              ret,
              diffRes;

          if (isDuration(input)) {
              duration = {
                  ms: input._milliseconds,
                  d: input._days,
                  M: input._months,
              };
          } else if (isNumber(input) || !isNaN(+input)) {
              duration = {};
              if (key) {
                  duration[key] = +input;
              } else {
                  duration.milliseconds = +input;
              }
          } else if ((match = aspNetRegex.exec(input))) {
              sign = match[1] === '-' ? -1 : 1;
              duration = {
                  y: 0,
                  d: toInt(match[DATE]) * sign,
                  h: toInt(match[HOUR]) * sign,
                  m: toInt(match[MINUTE]) * sign,
                  s: toInt(match[SECOND]) * sign,
                  ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign, // the millisecond decimal point is included in the match
              };
          } else if ((match = isoRegex.exec(input))) {
              sign = match[1] === '-' ? -1 : 1;
              duration = {
                  y: parseIso(match[2], sign),
                  M: parseIso(match[3], sign),
                  w: parseIso(match[4], sign),
                  d: parseIso(match[5], sign),
                  h: parseIso(match[6], sign),
                  m: parseIso(match[7], sign),
                  s: parseIso(match[8], sign),
              };
          } else if (duration == null) {
              // checks for null or undefined
              duration = {};
          } else if (
              typeof duration === 'object' &&
              ('from' in duration || 'to' in duration)
          ) {
              diffRes = momentsDifference(
                  createLocal(duration.from),
                  createLocal(duration.to)
              );

              duration = {};
              duration.ms = diffRes.milliseconds;
              duration.M = diffRes.months;
          }

          ret = new Duration(duration);

          if (isDuration(input) && hasOwnProp(input, '_locale')) {
              ret._locale = input._locale;
          }

          if (isDuration(input) && hasOwnProp(input, '_isValid')) {
              ret._isValid = input._isValid;
          }

          return ret;
      }

      createDuration.fn = Duration.prototype;
      createDuration.invalid = createInvalid$1;

      function parseIso(inp, sign) {
          // We'd normally use ~~inp for this, but unfortunately it also
          // converts floats to ints.
          // inp may be undefined, so careful calling replace on it.
          var res = inp && parseFloat(inp.replace(',', '.'));
          // apply sign while we're at it
          return (isNaN(res) ? 0 : res) * sign;
      }

      function positiveMomentsDifference(base, other) {
          var res = {};

          res.months =
              other.month() - base.month() + (other.year() - base.year()) * 12;
          if (base.clone().add(res.months, 'M').isAfter(other)) {
              --res.months;
          }

          res.milliseconds = +other - +base.clone().add(res.months, 'M');

          return res;
      }

      function momentsDifference(base, other) {
          var res;
          if (!(base.isValid() && other.isValid())) {
              return { milliseconds: 0, months: 0 };
          }

          other = cloneWithOffset(other, base);
          if (base.isBefore(other)) {
              res = positiveMomentsDifference(base, other);
          } else {
              res = positiveMomentsDifference(other, base);
              res.milliseconds = -res.milliseconds;
              res.months = -res.months;
          }

          return res;
      }

      // TODO: remove 'name' arg after deprecation is removed
      function createAdder(direction, name) {
          return function (val, period) {
              var dur, tmp;
              //invert the arguments, but complain about it
              if (period !== null && !isNaN(+period)) {
                  deprecateSimple(
                      name,
                      'moment().' +
                          name +
                          '(period, number) is deprecated. Please use moment().' +
                          name +
                          '(number, period). ' +
                          'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.'
                  );
                  tmp = val;
                  val = period;
                  period = tmp;
              }

              dur = createDuration(val, period);
              addSubtract(this, dur, direction);
              return this;
          };
      }

      function addSubtract(mom, duration, isAdding, updateOffset) {
          var milliseconds = duration._milliseconds,
              days = absRound(duration._days),
              months = absRound(duration._months);

          if (!mom.isValid()) {
              // No op
              return;
          }

          updateOffset = updateOffset == null ? true : updateOffset;

          if (months) {
              setMonth(mom, get(mom, 'Month') + months * isAdding);
          }
          if (days) {
              set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
          }
          if (milliseconds) {
              mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
          }
          if (updateOffset) {
              hooks.updateOffset(mom, days || months);
          }
      }

      var add = createAdder(1, 'add'),
          subtract = createAdder(-1, 'subtract');

      function isString(input) {
          return typeof input === 'string' || input instanceof String;
      }

      // type MomentInput = Moment | Date | string | number | (number | string)[] | MomentInputObject | void; // null | undefined
      function isMomentInput(input) {
          return (
              isMoment(input) ||
              isDate(input) ||
              isString(input) ||
              isNumber(input) ||
              isNumberOrStringArray(input) ||
              isMomentInputObject(input) ||
              input === null ||
              input === undefined
          );
      }

      function isMomentInputObject(input) {
          var objectTest = isObject(input) && !isObjectEmpty(input),
              propertyTest = false,
              properties = [
                  'years',
                  'year',
                  'y',
                  'months',
                  'month',
                  'M',
                  'days',
                  'day',
                  'd',
                  'dates',
                  'date',
                  'D',
                  'hours',
                  'hour',
                  'h',
                  'minutes',
                  'minute',
                  'm',
                  'seconds',
                  'second',
                  's',
                  'milliseconds',
                  'millisecond',
                  'ms' ],
              i,
              property,
              propertyLen = properties.length;

          for (i = 0; i < propertyLen; i += 1) {
              property = properties[i];
              propertyTest = propertyTest || hasOwnProp(input, property);
          }

          return objectTest && propertyTest;
      }

      function isNumberOrStringArray(input) {
          var arrayTest = isArray(input),
              dataTypeTest = false;
          if (arrayTest) {
              dataTypeTest =
                  input.filter(function (item) {
                      return !isNumber(item) && isString(input);
                  }).length === 0;
          }
          return arrayTest && dataTypeTest;
      }

      function isCalendarSpec(input) {
          var objectTest = isObject(input) && !isObjectEmpty(input),
              propertyTest = false,
              properties = [
                  'sameDay',
                  'nextDay',
                  'lastDay',
                  'nextWeek',
                  'lastWeek',
                  'sameElse' ],
              i,
              property;

          for (i = 0; i < properties.length; i += 1) {
              property = properties[i];
              propertyTest = propertyTest || hasOwnProp(input, property);
          }

          return objectTest && propertyTest;
      }

      function getCalendarFormat(myMoment, now) {
          var diff = myMoment.diff(now, 'days', true);
          return diff < -6
              ? 'sameElse'
              : diff < -1
              ? 'lastWeek'
              : diff < 0
              ? 'lastDay'
              : diff < 1
              ? 'sameDay'
              : diff < 2
              ? 'nextDay'
              : diff < 7
              ? 'nextWeek'
              : 'sameElse';
      }

      function calendar$1(time, formats) {
          // Support for single parameter, formats only overload to the calendar function
          if (arguments.length === 1) {
              if (!arguments[0]) {
                  time = undefined;
                  formats = undefined;
              } else if (isMomentInput(arguments[0])) {
                  time = arguments[0];
                  formats = undefined;
              } else if (isCalendarSpec(arguments[0])) {
                  formats = arguments[0];
                  time = undefined;
              }
          }
          // We want to compare the start of today, vs this.
          // Getting start-of-today depends on whether we're local/utc/offset or not.
          var now = time || createLocal(),
              sod = cloneWithOffset(now, this).startOf('day'),
              format = hooks.calendarFormat(this, sod) || 'sameElse',
              output =
                  formats &&
                  (isFunction(formats[format])
                      ? formats[format].call(this, now)
                      : formats[format]);

          return this.format(
              output || this.localeData().calendar(format, this, createLocal(now))
          );
      }

      function clone() {
          return new Moment(this);
      }

      function isAfter(input, units) {
          var localInput = isMoment(input) ? input : createLocal(input);
          if (!(this.isValid() && localInput.isValid())) {
              return false;
          }
          units = normalizeUnits(units) || 'millisecond';
          if (units === 'millisecond') {
              return this.valueOf() > localInput.valueOf();
          } else {
              return localInput.valueOf() < this.clone().startOf(units).valueOf();
          }
      }

      function isBefore(input, units) {
          var localInput = isMoment(input) ? input : createLocal(input);
          if (!(this.isValid() && localInput.isValid())) {
              return false;
          }
          units = normalizeUnits(units) || 'millisecond';
          if (units === 'millisecond') {
              return this.valueOf() < localInput.valueOf();
          } else {
              return this.clone().endOf(units).valueOf() < localInput.valueOf();
          }
      }

      function isBetween(from, to, units, inclusivity) {
          var localFrom = isMoment(from) ? from : createLocal(from),
              localTo = isMoment(to) ? to : createLocal(to);
          if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
              return false;
          }
          inclusivity = inclusivity || '()';
          return (
              (inclusivity[0] === '('
                  ? this.isAfter(localFrom, units)
                  : !this.isBefore(localFrom, units)) &&
              (inclusivity[1] === ')'
                  ? this.isBefore(localTo, units)
                  : !this.isAfter(localTo, units))
          );
      }

      function isSame(input, units) {
          var localInput = isMoment(input) ? input : createLocal(input),
              inputMs;
          if (!(this.isValid() && localInput.isValid())) {
              return false;
          }
          units = normalizeUnits(units) || 'millisecond';
          if (units === 'millisecond') {
              return this.valueOf() === localInput.valueOf();
          } else {
              inputMs = localInput.valueOf();
              return (
                  this.clone().startOf(units).valueOf() <= inputMs &&
                  inputMs <= this.clone().endOf(units).valueOf()
              );
          }
      }

      function isSameOrAfter(input, units) {
          return this.isSame(input, units) || this.isAfter(input, units);
      }

      function isSameOrBefore(input, units) {
          return this.isSame(input, units) || this.isBefore(input, units);
      }

      function diff(input, units, asFloat) {
          var that, zoneDelta, output;

          if (!this.isValid()) {
              return NaN;
          }

          that = cloneWithOffset(input, this);

          if (!that.isValid()) {
              return NaN;
          }

          zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

          units = normalizeUnits(units);

          switch (units) {
              case 'year':
                  output = monthDiff(this, that) / 12;
                  break;
              case 'month':
                  output = monthDiff(this, that);
                  break;
              case 'quarter':
                  output = monthDiff(this, that) / 3;
                  break;
              case 'second':
                  output = (this - that) / 1e3;
                  break; // 1000
              case 'minute':
                  output = (this - that) / 6e4;
                  break; // 1000 * 60
              case 'hour':
                  output = (this - that) / 36e5;
                  break; // 1000 * 60 * 60
              case 'day':
                  output = (this - that - zoneDelta) / 864e5;
                  break; // 1000 * 60 * 60 * 24, negate dst
              case 'week':
                  output = (this - that - zoneDelta) / 6048e5;
                  break; // 1000 * 60 * 60 * 24 * 7, negate dst
              default:
                  output = this - that;
          }

          return asFloat ? output : absFloor(output);
      }

      function monthDiff(a, b) {
          if (a.date() < b.date()) {
              // end-of-month calculations work correct when the start month has more
              // days than the end month.
              return -monthDiff(b, a);
          }
          // difference in months
          var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),
              // b is in (anchor - 1 month, anchor + 1 month)
              anchor = a.clone().add(wholeMonthDiff, 'months'),
              anchor2,
              adjust;

          if (b - anchor < 0) {
              anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
              // linear across the month
              adjust = (b - anchor) / (anchor - anchor2);
          } else {
              anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
              // linear across the month
              adjust = (b - anchor) / (anchor2 - anchor);
          }

          //check for negative zero, return zero if negative zero
          return -(wholeMonthDiff + adjust) || 0;
      }

      hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
      hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

      function toString() {
          return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
      }

      function toISOString(keepOffset) {
          if (!this.isValid()) {
              return null;
          }
          var utc = keepOffset !== true,
              m = utc ? this.clone().utc() : this;
          if (m.year() < 0 || m.year() > 9999) {
              return formatMoment(
                  m,
                  utc
                      ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
                      : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ'
              );
          }
          if (isFunction(Date.prototype.toISOString)) {
              // native implementation is ~50x faster, use it when we can
              if (utc) {
                  return this.toDate().toISOString();
              } else {
                  return new Date(this.valueOf() + this.utcOffset() * 60 * 1000)
                      .toISOString()
                      .replace('Z', formatMoment(m, 'Z'));
              }
          }
          return formatMoment(
              m,
              utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
          );
      }

      /**
       * Return a human readable representation of a moment that can
       * also be evaluated to get a new moment which is the same
       *
       * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
       */
      function inspect() {
          if (!this.isValid()) {
              return 'moment.invalid(/* ' + this._i + ' */)';
          }
          var func = 'moment',
              zone = '',
              prefix,
              year,
              datetime,
              suffix;
          if (!this.isLocal()) {
              func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
              zone = 'Z';
          }
          prefix = '[' + func + '("]';
          year = 0 <= this.year() && this.year() <= 9999 ? 'YYYY' : 'YYYYYY';
          datetime = '-MM-DD[T]HH:mm:ss.SSS';
          suffix = zone + '[")]';

          return this.format(prefix + year + datetime + suffix);
      }

      function format(inputString) {
          if (!inputString) {
              inputString = this.isUtc()
                  ? hooks.defaultFormatUtc
                  : hooks.defaultFormat;
          }
          var output = formatMoment(this, inputString);
          return this.localeData().postformat(output);
      }

      function from(time, withoutSuffix) {
          if (
              this.isValid() &&
              ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
          ) {
              return createDuration({ to: this, from: time })
                  .locale(this.locale())
                  .humanize(!withoutSuffix);
          } else {
              return this.localeData().invalidDate();
          }
      }

      function fromNow(withoutSuffix) {
          return this.from(createLocal(), withoutSuffix);
      }

      function to(time, withoutSuffix) {
          if (
              this.isValid() &&
              ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
          ) {
              return createDuration({ from: this, to: time })
                  .locale(this.locale())
                  .humanize(!withoutSuffix);
          } else {
              return this.localeData().invalidDate();
          }
      }

      function toNow(withoutSuffix) {
          return this.to(createLocal(), withoutSuffix);
      }

      // If passed a locale key, it will set the locale for this
      // instance.  Otherwise, it will return the locale configuration
      // variables for this instance.
      function locale(key) {
          var newLocaleData;

          if (key === undefined) {
              return this._locale._abbr;
          } else {
              newLocaleData = getLocale(key);
              if (newLocaleData != null) {
                  this._locale = newLocaleData;
              }
              return this;
          }
      }

      var lang = deprecate(
          'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
          function (key) {
              if (key === undefined) {
                  return this.localeData();
              } else {
                  return this.locale(key);
              }
          }
      );

      function localeData() {
          return this._locale;
      }

      var MS_PER_SECOND = 1000,
          MS_PER_MINUTE = 60 * MS_PER_SECOND,
          MS_PER_HOUR = 60 * MS_PER_MINUTE,
          MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

      // actual modulo - handles negative numbers (for dates before 1970):
      function mod$1(dividend, divisor) {
          return ((dividend % divisor) + divisor) % divisor;
      }

      function localStartOfDate(y, m, d) {
          // the date constructor remaps years 0-99 to 1900-1999
          if (y < 100 && y >= 0) {
              // preserve leap years using a full 400 year cycle, then reset
              return new Date(y + 400, m, d) - MS_PER_400_YEARS;
          } else {
              return new Date(y, m, d).valueOf();
          }
      }

      function utcStartOfDate(y, m, d) {
          // Date.UTC remaps years 0-99 to 1900-1999
          if (y < 100 && y >= 0) {
              // preserve leap years using a full 400 year cycle, then reset
              return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
          } else {
              return Date.UTC(y, m, d);
          }
      }

      function startOf(units) {
          var time, startOfDate;
          units = normalizeUnits(units);
          if (units === undefined || units === 'millisecond' || !this.isValid()) {
              return this;
          }

          startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

          switch (units) {
              case 'year':
                  time = startOfDate(this.year(), 0, 1);
                  break;
              case 'quarter':
                  time = startOfDate(
                      this.year(),
                      this.month() - (this.month() % 3),
                      1
                  );
                  break;
              case 'month':
                  time = startOfDate(this.year(), this.month(), 1);
                  break;
              case 'week':
                  time = startOfDate(
                      this.year(),
                      this.month(),
                      this.date() - this.weekday()
                  );
                  break;
              case 'isoWeek':
                  time = startOfDate(
                      this.year(),
                      this.month(),
                      this.date() - (this.isoWeekday() - 1)
                  );
                  break;
              case 'day':
              case 'date':
                  time = startOfDate(this.year(), this.month(), this.date());
                  break;
              case 'hour':
                  time = this._d.valueOf();
                  time -= mod$1(
                      time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                      MS_PER_HOUR
                  );
                  break;
              case 'minute':
                  time = this._d.valueOf();
                  time -= mod$1(time, MS_PER_MINUTE);
                  break;
              case 'second':
                  time = this._d.valueOf();
                  time -= mod$1(time, MS_PER_SECOND);
                  break;
          }

          this._d.setTime(time);
          hooks.updateOffset(this, true);
          return this;
      }

      function endOf(units) {
          var time, startOfDate;
          units = normalizeUnits(units);
          if (units === undefined || units === 'millisecond' || !this.isValid()) {
              return this;
          }

          startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

          switch (units) {
              case 'year':
                  time = startOfDate(this.year() + 1, 0, 1) - 1;
                  break;
              case 'quarter':
                  time =
                      startOfDate(
                          this.year(),
                          this.month() - (this.month() % 3) + 3,
                          1
                      ) - 1;
                  break;
              case 'month':
                  time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                  break;
              case 'week':
                  time =
                      startOfDate(
                          this.year(),
                          this.month(),
                          this.date() - this.weekday() + 7
                      ) - 1;
                  break;
              case 'isoWeek':
                  time =
                      startOfDate(
                          this.year(),
                          this.month(),
                          this.date() - (this.isoWeekday() - 1) + 7
                      ) - 1;
                  break;
              case 'day':
              case 'date':
                  time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                  break;
              case 'hour':
                  time = this._d.valueOf();
                  time +=
                      MS_PER_HOUR -
                      mod$1(
                          time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                          MS_PER_HOUR
                      ) -
                      1;
                  break;
              case 'minute':
                  time = this._d.valueOf();
                  time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                  break;
              case 'second':
                  time = this._d.valueOf();
                  time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                  break;
          }

          this._d.setTime(time);
          hooks.updateOffset(this, true);
          return this;
      }

      function valueOf() {
          return this._d.valueOf() - (this._offset || 0) * 60000;
      }

      function unix() {
          return Math.floor(this.valueOf() / 1000);
      }

      function toDate() {
          return new Date(this.valueOf());
      }

      function toArray() {
          var m = this;
          return [
              m.year(),
              m.month(),
              m.date(),
              m.hour(),
              m.minute(),
              m.second(),
              m.millisecond() ];
      }

      function toObject() {
          var m = this;
          return {
              years: m.year(),
              months: m.month(),
              date: m.date(),
              hours: m.hours(),
              minutes: m.minutes(),
              seconds: m.seconds(),
              milliseconds: m.milliseconds(),
          };
      }

      function toJSON() {
          // new Date(NaN).toJSON() === null
          return this.isValid() ? this.toISOString() : null;
      }

      function isValid$2() {
          return isValid(this);
      }

      function parsingFlags() {
          return extend({}, getParsingFlags(this));
      }

      function invalidAt() {
          return getParsingFlags(this).overflow;
      }

      function creationData() {
          return {
              input: this._i,
              format: this._f,
              locale: this._locale,
              isUTC: this._isUTC,
              strict: this._strict,
          };
      }

      addFormatToken('N', 0, 0, 'eraAbbr');
      addFormatToken('NN', 0, 0, 'eraAbbr');
      addFormatToken('NNN', 0, 0, 'eraAbbr');
      addFormatToken('NNNN', 0, 0, 'eraName');
      addFormatToken('NNNNN', 0, 0, 'eraNarrow');

      addFormatToken('y', ['y', 1], 'yo', 'eraYear');
      addFormatToken('y', ['yy', 2], 0, 'eraYear');
      addFormatToken('y', ['yyy', 3], 0, 'eraYear');
      addFormatToken('y', ['yyyy', 4], 0, 'eraYear');

      addRegexToken('N', matchEraAbbr);
      addRegexToken('NN', matchEraAbbr);
      addRegexToken('NNN', matchEraAbbr);
      addRegexToken('NNNN', matchEraName);
      addRegexToken('NNNNN', matchEraNarrow);

      addParseToken(
          ['N', 'NN', 'NNN', 'NNNN', 'NNNNN'],
          function (input, array, config, token) {
              var era = config._locale.erasParse(input, token, config._strict);
              if (era) {
                  getParsingFlags(config).era = era;
              } else {
                  getParsingFlags(config).invalidEra = input;
              }
          }
      );

      addRegexToken('y', matchUnsigned);
      addRegexToken('yy', matchUnsigned);
      addRegexToken('yyy', matchUnsigned);
      addRegexToken('yyyy', matchUnsigned);
      addRegexToken('yo', matchEraYearOrdinal);

      addParseToken(['y', 'yy', 'yyy', 'yyyy'], YEAR);
      addParseToken(['yo'], function (input, array, config, token) {
          var match;
          if (config._locale._eraYearOrdinalRegex) {
              match = input.match(config._locale._eraYearOrdinalRegex);
          }

          if (config._locale.eraYearOrdinalParse) {
              array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
          } else {
              array[YEAR] = parseInt(input, 10);
          }
      });

      function localeEras(m, format) {
          var i,
              l,
              date,
              eras = this._eras || getLocale('en')._eras;
          for (i = 0, l = eras.length; i < l; ++i) {
              switch (typeof eras[i].since) {
                  case 'string':
                      // truncate time
                      date = hooks(eras[i].since).startOf('day');
                      eras[i].since = date.valueOf();
                      break;
              }

              switch (typeof eras[i].until) {
                  case 'undefined':
                      eras[i].until = +Infinity;
                      break;
                  case 'string':
                      // truncate time
                      date = hooks(eras[i].until).startOf('day').valueOf();
                      eras[i].until = date.valueOf();
                      break;
              }
          }
          return eras;
      }

      function localeErasParse(eraName, format, strict) {
          var i,
              l,
              eras = this.eras(),
              name,
              abbr,
              narrow;
          eraName = eraName.toUpperCase();

          for (i = 0, l = eras.length; i < l; ++i) {
              name = eras[i].name.toUpperCase();
              abbr = eras[i].abbr.toUpperCase();
              narrow = eras[i].narrow.toUpperCase();

              if (strict) {
                  switch (format) {
                      case 'N':
                      case 'NN':
                      case 'NNN':
                          if (abbr === eraName) {
                              return eras[i];
                          }
                          break;

                      case 'NNNN':
                          if (name === eraName) {
                              return eras[i];
                          }
                          break;

                      case 'NNNNN':
                          if (narrow === eraName) {
                              return eras[i];
                          }
                          break;
                  }
              } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
                  return eras[i];
              }
          }
      }

      function localeErasConvertYear(era, year) {
          var dir = era.since <= era.until ? +1 : -1;
          if (year === undefined) {
              return hooks(era.since).year();
          } else {
              return hooks(era.since).year() + (year - era.offset) * dir;
          }
      }

      function getEraName() {
          var i,
              l,
              val,
              eras = this.localeData().eras();
          for (i = 0, l = eras.length; i < l; ++i) {
              // truncate time
              val = this.clone().startOf('day').valueOf();

              if (eras[i].since <= val && val <= eras[i].until) {
                  return eras[i].name;
              }
              if (eras[i].until <= val && val <= eras[i].since) {
                  return eras[i].name;
              }
          }

          return '';
      }

      function getEraNarrow() {
          var i,
              l,
              val,
              eras = this.localeData().eras();
          for (i = 0, l = eras.length; i < l; ++i) {
              // truncate time
              val = this.clone().startOf('day').valueOf();

              if (eras[i].since <= val && val <= eras[i].until) {
                  return eras[i].narrow;
              }
              if (eras[i].until <= val && val <= eras[i].since) {
                  return eras[i].narrow;
              }
          }

          return '';
      }

      function getEraAbbr() {
          var i,
              l,
              val,
              eras = this.localeData().eras();
          for (i = 0, l = eras.length; i < l; ++i) {
              // truncate time
              val = this.clone().startOf('day').valueOf();

              if (eras[i].since <= val && val <= eras[i].until) {
                  return eras[i].abbr;
              }
              if (eras[i].until <= val && val <= eras[i].since) {
                  return eras[i].abbr;
              }
          }

          return '';
      }

      function getEraYear() {
          var i,
              l,
              dir,
              val,
              eras = this.localeData().eras();
          for (i = 0, l = eras.length; i < l; ++i) {
              dir = eras[i].since <= eras[i].until ? +1 : -1;

              // truncate time
              val = this.clone().startOf('day').valueOf();

              if (
                  (eras[i].since <= val && val <= eras[i].until) ||
                  (eras[i].until <= val && val <= eras[i].since)
              ) {
                  return (
                      (this.year() - hooks(eras[i].since).year()) * dir +
                      eras[i].offset
                  );
              }
          }

          return this.year();
      }

      function erasNameRegex(isStrict) {
          if (!hasOwnProp(this, '_erasNameRegex')) {
              computeErasParse.call(this);
          }
          return isStrict ? this._erasNameRegex : this._erasRegex;
      }

      function erasAbbrRegex(isStrict) {
          if (!hasOwnProp(this, '_erasAbbrRegex')) {
              computeErasParse.call(this);
          }
          return isStrict ? this._erasAbbrRegex : this._erasRegex;
      }

      function erasNarrowRegex(isStrict) {
          if (!hasOwnProp(this, '_erasNarrowRegex')) {
              computeErasParse.call(this);
          }
          return isStrict ? this._erasNarrowRegex : this._erasRegex;
      }

      function matchEraAbbr(isStrict, locale) {
          return locale.erasAbbrRegex(isStrict);
      }

      function matchEraName(isStrict, locale) {
          return locale.erasNameRegex(isStrict);
      }

      function matchEraNarrow(isStrict, locale) {
          return locale.erasNarrowRegex(isStrict);
      }

      function matchEraYearOrdinal(isStrict, locale) {
          return locale._eraYearOrdinalRegex || matchUnsigned;
      }

      function computeErasParse() {
          var abbrPieces = [],
              namePieces = [],
              narrowPieces = [],
              mixedPieces = [],
              i,
              l,
              eras = this.eras();

          for (i = 0, l = eras.length; i < l; ++i) {
              namePieces.push(regexEscape(eras[i].name));
              abbrPieces.push(regexEscape(eras[i].abbr));
              narrowPieces.push(regexEscape(eras[i].narrow));

              mixedPieces.push(regexEscape(eras[i].name));
              mixedPieces.push(regexEscape(eras[i].abbr));
              mixedPieces.push(regexEscape(eras[i].narrow));
          }

          this._erasRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
          this._erasNameRegex = new RegExp('^(' + namePieces.join('|') + ')', 'i');
          this._erasAbbrRegex = new RegExp('^(' + abbrPieces.join('|') + ')', 'i');
          this._erasNarrowRegex = new RegExp(
              '^(' + narrowPieces.join('|') + ')',
              'i'
          );
      }

      // FORMATTING

      addFormatToken(0, ['gg', 2], 0, function () {
          return this.weekYear() % 100;
      });

      addFormatToken(0, ['GG', 2], 0, function () {
          return this.isoWeekYear() % 100;
      });

      function addWeekYearFormatToken(token, getter) {
          addFormatToken(0, [token, token.length], 0, getter);
      }

      addWeekYearFormatToken('gggg', 'weekYear');
      addWeekYearFormatToken('ggggg', 'weekYear');
      addWeekYearFormatToken('GGGG', 'isoWeekYear');
      addWeekYearFormatToken('GGGGG', 'isoWeekYear');

      // ALIASES

      addUnitAlias('weekYear', 'gg');
      addUnitAlias('isoWeekYear', 'GG');

      // PRIORITY

      addUnitPriority('weekYear', 1);
      addUnitPriority('isoWeekYear', 1);

      // PARSING

      addRegexToken('G', matchSigned);
      addRegexToken('g', matchSigned);
      addRegexToken('GG', match1to2, match2);
      addRegexToken('gg', match1to2, match2);
      addRegexToken('GGGG', match1to4, match4);
      addRegexToken('gggg', match1to4, match4);
      addRegexToken('GGGGG', match1to6, match6);
      addRegexToken('ggggg', match1to6, match6);

      addWeekParseToken(
          ['gggg', 'ggggg', 'GGGG', 'GGGGG'],
          function (input, week, config, token) {
              week[token.substr(0, 2)] = toInt(input);
          }
      );

      addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
          week[token] = hooks.parseTwoDigitYear(input);
      });

      // MOMENTS

      function getSetWeekYear(input) {
          return getSetWeekYearHelper.call(
              this,
              input,
              this.week(),
              this.weekday(),
              this.localeData()._week.dow,
              this.localeData()._week.doy
          );
      }

      function getSetISOWeekYear(input) {
          return getSetWeekYearHelper.call(
              this,
              input,
              this.isoWeek(),
              this.isoWeekday(),
              1,
              4
          );
      }

      function getISOWeeksInYear() {
          return weeksInYear(this.year(), 1, 4);
      }

      function getISOWeeksInISOWeekYear() {
          return weeksInYear(this.isoWeekYear(), 1, 4);
      }

      function getWeeksInYear() {
          var weekInfo = this.localeData()._week;
          return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
      }

      function getWeeksInWeekYear() {
          var weekInfo = this.localeData()._week;
          return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
      }

      function getSetWeekYearHelper(input, week, weekday, dow, doy) {
          var weeksTarget;
          if (input == null) {
              return weekOfYear(this, dow, doy).year;
          } else {
              weeksTarget = weeksInYear(input, dow, doy);
              if (week > weeksTarget) {
                  week = weeksTarget;
              }
              return setWeekAll.call(this, input, week, weekday, dow, doy);
          }
      }

      function setWeekAll(weekYear, week, weekday, dow, doy) {
          var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
              date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

          this.year(date.getUTCFullYear());
          this.month(date.getUTCMonth());
          this.date(date.getUTCDate());
          return this;
      }

      // FORMATTING

      addFormatToken('Q', 0, 'Qo', 'quarter');

      // ALIASES

      addUnitAlias('quarter', 'Q');

      // PRIORITY

      addUnitPriority('quarter', 7);

      // PARSING

      addRegexToken('Q', match1);
      addParseToken('Q', function (input, array) {
          array[MONTH] = (toInt(input) - 1) * 3;
      });

      // MOMENTS

      function getSetQuarter(input) {
          return input == null
              ? Math.ceil((this.month() + 1) / 3)
              : this.month((input - 1) * 3 + (this.month() % 3));
      }

      // FORMATTING

      addFormatToken('D', ['DD', 2], 'Do', 'date');

      // ALIASES

      addUnitAlias('date', 'D');

      // PRIORITY
      addUnitPriority('date', 9);

      // PARSING

      addRegexToken('D', match1to2);
      addRegexToken('DD', match1to2, match2);
      addRegexToken('Do', function (isStrict, locale) {
          // TODO: Remove "ordinalParse" fallback in next major release.
          return isStrict
              ? locale._dayOfMonthOrdinalParse || locale._ordinalParse
              : locale._dayOfMonthOrdinalParseLenient;
      });

      addParseToken(['D', 'DD'], DATE);
      addParseToken('Do', function (input, array) {
          array[DATE] = toInt(input.match(match1to2)[0]);
      });

      // MOMENTS

      var getSetDayOfMonth = makeGetSet('Date', true);

      // FORMATTING

      addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

      // ALIASES

      addUnitAlias('dayOfYear', 'DDD');

      // PRIORITY
      addUnitPriority('dayOfYear', 4);

      // PARSING

      addRegexToken('DDD', match1to3);
      addRegexToken('DDDD', match3);
      addParseToken(['DDD', 'DDDD'], function (input, array, config) {
          config._dayOfYear = toInt(input);
      });

      // HELPERS

      // MOMENTS

      function getSetDayOfYear(input) {
          var dayOfYear =
              Math.round(
                  (this.clone().startOf('day') - this.clone().startOf('year')) / 864e5
              ) + 1;
          return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
      }

      // FORMATTING

      addFormatToken('m', ['mm', 2], 0, 'minute');

      // ALIASES

      addUnitAlias('minute', 'm');

      // PRIORITY

      addUnitPriority('minute', 14);

      // PARSING

      addRegexToken('m', match1to2);
      addRegexToken('mm', match1to2, match2);
      addParseToken(['m', 'mm'], MINUTE);

      // MOMENTS

      var getSetMinute = makeGetSet('Minutes', false);

      // FORMATTING

      addFormatToken('s', ['ss', 2], 0, 'second');

      // ALIASES

      addUnitAlias('second', 's');

      // PRIORITY

      addUnitPriority('second', 15);

      // PARSING

      addRegexToken('s', match1to2);
      addRegexToken('ss', match1to2, match2);
      addParseToken(['s', 'ss'], SECOND);

      // MOMENTS

      var getSetSecond = makeGetSet('Seconds', false);

      // FORMATTING

      addFormatToken('S', 0, 0, function () {
          return ~~(this.millisecond() / 100);
      });

      addFormatToken(0, ['SS', 2], 0, function () {
          return ~~(this.millisecond() / 10);
      });

      addFormatToken(0, ['SSS', 3], 0, 'millisecond');
      addFormatToken(0, ['SSSS', 4], 0, function () {
          return this.millisecond() * 10;
      });
      addFormatToken(0, ['SSSSS', 5], 0, function () {
          return this.millisecond() * 100;
      });
      addFormatToken(0, ['SSSSSS', 6], 0, function () {
          return this.millisecond() * 1000;
      });
      addFormatToken(0, ['SSSSSSS', 7], 0, function () {
          return this.millisecond() * 10000;
      });
      addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
          return this.millisecond() * 100000;
      });
      addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
          return this.millisecond() * 1000000;
      });

      // ALIASES

      addUnitAlias('millisecond', 'ms');

      // PRIORITY

      addUnitPriority('millisecond', 16);

      // PARSING

      addRegexToken('S', match1to3, match1);
      addRegexToken('SS', match1to3, match2);
      addRegexToken('SSS', match1to3, match3);

      var token, getSetMillisecond;
      for (token = 'SSSS'; token.length <= 9; token += 'S') {
          addRegexToken(token, matchUnsigned);
      }

      function parseMs(input, array) {
          array[MILLISECOND] = toInt(('0.' + input) * 1000);
      }

      for (token = 'S'; token.length <= 9; token += 'S') {
          addParseToken(token, parseMs);
      }

      getSetMillisecond = makeGetSet('Milliseconds', false);

      // FORMATTING

      addFormatToken('z', 0, 0, 'zoneAbbr');
      addFormatToken('zz', 0, 0, 'zoneName');

      // MOMENTS

      function getZoneAbbr() {
          return this._isUTC ? 'UTC' : '';
      }

      function getZoneName() {
          return this._isUTC ? 'Coordinated Universal Time' : '';
      }

      var proto = Moment.prototype;

      proto.add = add;
      proto.calendar = calendar$1;
      proto.clone = clone;
      proto.diff = diff;
      proto.endOf = endOf;
      proto.format = format;
      proto.from = from;
      proto.fromNow = fromNow;
      proto.to = to;
      proto.toNow = toNow;
      proto.get = stringGet;
      proto.invalidAt = invalidAt;
      proto.isAfter = isAfter;
      proto.isBefore = isBefore;
      proto.isBetween = isBetween;
      proto.isSame = isSame;
      proto.isSameOrAfter = isSameOrAfter;
      proto.isSameOrBefore = isSameOrBefore;
      proto.isValid = isValid$2;
      proto.lang = lang;
      proto.locale = locale;
      proto.localeData = localeData;
      proto.max = prototypeMax;
      proto.min = prototypeMin;
      proto.parsingFlags = parsingFlags;
      proto.set = stringSet;
      proto.startOf = startOf;
      proto.subtract = subtract;
      proto.toArray = toArray;
      proto.toObject = toObject;
      proto.toDate = toDate;
      proto.toISOString = toISOString;
      proto.inspect = inspect;
      if (typeof Symbol !== 'undefined' && Symbol.for != null) {
          proto[Symbol.for('nodejs.util.inspect.custom')] = function () {
              return 'Moment<' + this.format() + '>';
          };
      }
      proto.toJSON = toJSON;
      proto.toString = toString;
      proto.unix = unix;
      proto.valueOf = valueOf;
      proto.creationData = creationData;
      proto.eraName = getEraName;
      proto.eraNarrow = getEraNarrow;
      proto.eraAbbr = getEraAbbr;
      proto.eraYear = getEraYear;
      proto.year = getSetYear;
      proto.isLeapYear = getIsLeapYear;
      proto.weekYear = getSetWeekYear;
      proto.isoWeekYear = getSetISOWeekYear;
      proto.quarter = proto.quarters = getSetQuarter;
      proto.month = getSetMonth;
      proto.daysInMonth = getDaysInMonth;
      proto.week = proto.weeks = getSetWeek;
      proto.isoWeek = proto.isoWeeks = getSetISOWeek;
      proto.weeksInYear = getWeeksInYear;
      proto.weeksInWeekYear = getWeeksInWeekYear;
      proto.isoWeeksInYear = getISOWeeksInYear;
      proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
      proto.date = getSetDayOfMonth;
      proto.day = proto.days = getSetDayOfWeek;
      proto.weekday = getSetLocaleDayOfWeek;
      proto.isoWeekday = getSetISODayOfWeek;
      proto.dayOfYear = getSetDayOfYear;
      proto.hour = proto.hours = getSetHour;
      proto.minute = proto.minutes = getSetMinute;
      proto.second = proto.seconds = getSetSecond;
      proto.millisecond = proto.milliseconds = getSetMillisecond;
      proto.utcOffset = getSetOffset;
      proto.utc = setOffsetToUTC;
      proto.local = setOffsetToLocal;
      proto.parseZone = setOffsetToParsedOffset;
      proto.hasAlignedHourOffset = hasAlignedHourOffset;
      proto.isDST = isDaylightSavingTime;
      proto.isLocal = isLocal;
      proto.isUtcOffset = isUtcOffset;
      proto.isUtc = isUtc;
      proto.isUTC = isUtc;
      proto.zoneAbbr = getZoneAbbr;
      proto.zoneName = getZoneName;
      proto.dates = deprecate(
          'dates accessor is deprecated. Use date instead.',
          getSetDayOfMonth
      );
      proto.months = deprecate(
          'months accessor is deprecated. Use month instead',
          getSetMonth
      );
      proto.years = deprecate(
          'years accessor is deprecated. Use year instead',
          getSetYear
      );
      proto.zone = deprecate(
          'moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/',
          getSetZone
      );
      proto.isDSTShifted = deprecate(
          'isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information',
          isDaylightSavingTimeShifted
      );

      function createUnix(input) {
          return createLocal(input * 1000);
      }

      function createInZone() {
          return createLocal.apply(null, arguments).parseZone();
      }

      function preParsePostFormat(string) {
          return string;
      }

      var proto$1 = Locale.prototype;

      proto$1.calendar = calendar;
      proto$1.longDateFormat = longDateFormat;
      proto$1.invalidDate = invalidDate;
      proto$1.ordinal = ordinal;
      proto$1.preparse = preParsePostFormat;
      proto$1.postformat = preParsePostFormat;
      proto$1.relativeTime = relativeTime;
      proto$1.pastFuture = pastFuture;
      proto$1.set = set;
      proto$1.eras = localeEras;
      proto$1.erasParse = localeErasParse;
      proto$1.erasConvertYear = localeErasConvertYear;
      proto$1.erasAbbrRegex = erasAbbrRegex;
      proto$1.erasNameRegex = erasNameRegex;
      proto$1.erasNarrowRegex = erasNarrowRegex;

      proto$1.months = localeMonths;
      proto$1.monthsShort = localeMonthsShort;
      proto$1.monthsParse = localeMonthsParse;
      proto$1.monthsRegex = monthsRegex;
      proto$1.monthsShortRegex = monthsShortRegex;
      proto$1.week = localeWeek;
      proto$1.firstDayOfYear = localeFirstDayOfYear;
      proto$1.firstDayOfWeek = localeFirstDayOfWeek;

      proto$1.weekdays = localeWeekdays;
      proto$1.weekdaysMin = localeWeekdaysMin;
      proto$1.weekdaysShort = localeWeekdaysShort;
      proto$1.weekdaysParse = localeWeekdaysParse;

      proto$1.weekdaysRegex = weekdaysRegex;
      proto$1.weekdaysShortRegex = weekdaysShortRegex;
      proto$1.weekdaysMinRegex = weekdaysMinRegex;

      proto$1.isPM = localeIsPM;
      proto$1.meridiem = localeMeridiem;

      function get$1(format, index, field, setter) {
          var locale = getLocale(),
              utc = createUTC().set(setter, index);
          return locale[field](utc, format);
      }

      function listMonthsImpl(format, index, field) {
          if (isNumber(format)) {
              index = format;
              format = undefined;
          }

          format = format || '';

          if (index != null) {
              return get$1(format, index, field, 'month');
          }

          var i,
              out = [];
          for (i = 0; i < 12; i++) {
              out[i] = get$1(format, i, field, 'month');
          }
          return out;
      }

      // ()
      // (5)
      // (fmt, 5)
      // (fmt)
      // (true)
      // (true, 5)
      // (true, fmt, 5)
      // (true, fmt)
      function listWeekdaysImpl(localeSorted, format, index, field) {
          if (typeof localeSorted === 'boolean') {
              if (isNumber(format)) {
                  index = format;
                  format = undefined;
              }

              format = format || '';
          } else {
              format = localeSorted;
              index = format;
              localeSorted = false;

              if (isNumber(format)) {
                  index = format;
                  format = undefined;
              }

              format = format || '';
          }

          var locale = getLocale(),
              shift = localeSorted ? locale._week.dow : 0,
              i,
              out = [];

          if (index != null) {
              return get$1(format, (index + shift) % 7, field, 'day');
          }

          for (i = 0; i < 7; i++) {
              out[i] = get$1(format, (i + shift) % 7, field, 'day');
          }
          return out;
      }

      function listMonths(format, index) {
          return listMonthsImpl(format, index, 'months');
      }

      function listMonthsShort(format, index) {
          return listMonthsImpl(format, index, 'monthsShort');
      }

      function listWeekdays(localeSorted, format, index) {
          return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
      }

      function listWeekdaysShort(localeSorted, format, index) {
          return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
      }

      function listWeekdaysMin(localeSorted, format, index) {
          return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
      }

      getSetGlobalLocale('en', {
          eras: [
              {
                  since: '0001-01-01',
                  until: +Infinity,
                  offset: 1,
                  name: 'Anno Domini',
                  narrow: 'AD',
                  abbr: 'AD',
              },
              {
                  since: '0000-12-31',
                  until: -Infinity,
                  offset: 1,
                  name: 'Before Christ',
                  narrow: 'BC',
                  abbr: 'BC',
              } ],
          dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
          ordinal: function (number) {
              var b = number % 10,
                  output =
                      toInt((number % 100) / 10) === 1
                          ? 'th'
                          : b === 1
                          ? 'st'
                          : b === 2
                          ? 'nd'
                          : b === 3
                          ? 'rd'
                          : 'th';
              return number + output;
          },
      });

      // Side effect imports

      hooks.lang = deprecate(
          'moment.lang is deprecated. Use moment.locale instead.',
          getSetGlobalLocale
      );
      hooks.langData = deprecate(
          'moment.langData is deprecated. Use moment.localeData instead.',
          getLocale
      );

      var mathAbs = Math.abs;

      function abs() {
          var data = this._data;

          this._milliseconds = mathAbs(this._milliseconds);
          this._days = mathAbs(this._days);
          this._months = mathAbs(this._months);

          data.milliseconds = mathAbs(data.milliseconds);
          data.seconds = mathAbs(data.seconds);
          data.minutes = mathAbs(data.minutes);
          data.hours = mathAbs(data.hours);
          data.months = mathAbs(data.months);
          data.years = mathAbs(data.years);

          return this;
      }

      function addSubtract$1(duration, input, value, direction) {
          var other = createDuration(input, value);

          duration._milliseconds += direction * other._milliseconds;
          duration._days += direction * other._days;
          duration._months += direction * other._months;

          return duration._bubble();
      }

      // supports only 2.0-style add(1, 's') or add(duration)
      function add$1(input, value) {
          return addSubtract$1(this, input, value, 1);
      }

      // supports only 2.0-style subtract(1, 's') or subtract(duration)
      function subtract$1(input, value) {
          return addSubtract$1(this, input, value, -1);
      }

      function absCeil(number) {
          if (number < 0) {
              return Math.floor(number);
          } else {
              return Math.ceil(number);
          }
      }

      function bubble() {
          var milliseconds = this._milliseconds,
              days = this._days,
              months = this._months,
              data = this._data,
              seconds,
              minutes,
              hours,
              years,
              monthsFromDays;

          // if we have a mix of positive and negative values, bubble down first
          // check: https://github.com/moment/moment/issues/2166
          if (
              !(
                  (milliseconds >= 0 && days >= 0 && months >= 0) ||
                  (milliseconds <= 0 && days <= 0 && months <= 0)
              )
          ) {
              milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
              days = 0;
              months = 0;
          }

          // The following code bubbles up values, see the tests for
          // examples of what that means.
          data.milliseconds = milliseconds % 1000;

          seconds = absFloor(milliseconds / 1000);
          data.seconds = seconds % 60;

          minutes = absFloor(seconds / 60);
          data.minutes = minutes % 60;

          hours = absFloor(minutes / 60);
          data.hours = hours % 24;

          days += absFloor(hours / 24);

          // convert days to months
          monthsFromDays = absFloor(daysToMonths(days));
          months += monthsFromDays;
          days -= absCeil(monthsToDays(monthsFromDays));

          // 12 months -> 1 year
          years = absFloor(months / 12);
          months %= 12;

          data.days = days;
          data.months = months;
          data.years = years;

          return this;
      }

      function daysToMonths(days) {
          // 400 years have 146097 days (taking into account leap year rules)
          // 400 years have 12 months === 4800
          return (days * 4800) / 146097;
      }

      function monthsToDays(months) {
          // the reverse of daysToMonths
          return (months * 146097) / 4800;
      }

      function as(units) {
          if (!this.isValid()) {
              return NaN;
          }
          var days,
              months,
              milliseconds = this._milliseconds;

          units = normalizeUnits(units);

          if (units === 'month' || units === 'quarter' || units === 'year') {
              days = this._days + milliseconds / 864e5;
              months = this._months + daysToMonths(days);
              switch (units) {
                  case 'month':
                      return months;
                  case 'quarter':
                      return months / 3;
                  case 'year':
                      return months / 12;
              }
          } else {
              // handle milliseconds separately because of floating point math errors (issue #1867)
              days = this._days + Math.round(monthsToDays(this._months));
              switch (units) {
                  case 'week':
                      return days / 7 + milliseconds / 6048e5;
                  case 'day':
                      return days + milliseconds / 864e5;
                  case 'hour':
                      return days * 24 + milliseconds / 36e5;
                  case 'minute':
                      return days * 1440 + milliseconds / 6e4;
                  case 'second':
                      return days * 86400 + milliseconds / 1000;
                  // Math.floor prevents floating point math errors here
                  case 'millisecond':
                      return Math.floor(days * 864e5) + milliseconds;
                  default:
                      throw new Error('Unknown unit ' + units);
              }
          }
      }

      // TODO: Use this.as('ms')?
      function valueOf$1() {
          if (!this.isValid()) {
              return NaN;
          }
          return (
              this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              toInt(this._months / 12) * 31536e6
          );
      }

      function makeAs(alias) {
          return function () {
              return this.as(alias);
          };
      }

      var asMilliseconds = makeAs('ms'),
          asSeconds = makeAs('s'),
          asMinutes = makeAs('m'),
          asHours = makeAs('h'),
          asDays = makeAs('d'),
          asWeeks = makeAs('w'),
          asMonths = makeAs('M'),
          asQuarters = makeAs('Q'),
          asYears = makeAs('y');

      function clone$1() {
          return createDuration(this);
      }

      function get$2(units) {
          units = normalizeUnits(units);
          return this.isValid() ? this[units + 's']() : NaN;
      }

      function makeGetter(name) {
          return function () {
              return this.isValid() ? this._data[name] : NaN;
          };
      }

      var milliseconds = makeGetter('milliseconds'),
          seconds = makeGetter('seconds'),
          minutes = makeGetter('minutes'),
          hours = makeGetter('hours'),
          days = makeGetter('days'),
          months = makeGetter('months'),
          years = makeGetter('years');

      function weeks() {
          return absFloor(this.days() / 7);
      }

      var round = Math.round,
          thresholds = {
              ss: 44, // a few seconds to seconds
              s: 45, // seconds to minute
              m: 45, // minutes to hour
              h: 22, // hours to day
              d: 26, // days to month/week
              w: null, // weeks to month
              M: 11, // months to year
          };

      // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
      function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
          return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
      }

      function relativeTime$1(posNegDuration, withoutSuffix, thresholds, locale) {
          var duration = createDuration(posNegDuration).abs(),
              seconds = round(duration.as('s')),
              minutes = round(duration.as('m')),
              hours = round(duration.as('h')),
              days = round(duration.as('d')),
              months = round(duration.as('M')),
              weeks = round(duration.as('w')),
              years = round(duration.as('y')),
              a =
                  (seconds <= thresholds.ss && ['s', seconds]) ||
                  (seconds < thresholds.s && ['ss', seconds]) ||
                  (minutes <= 1 && ['m']) ||
                  (minutes < thresholds.m && ['mm', minutes]) ||
                  (hours <= 1 && ['h']) ||
                  (hours < thresholds.h && ['hh', hours]) ||
                  (days <= 1 && ['d']) ||
                  (days < thresholds.d && ['dd', days]);

          if (thresholds.w != null) {
              a =
                  a ||
                  (weeks <= 1 && ['w']) ||
                  (weeks < thresholds.w && ['ww', weeks]);
          }
          a = a ||
              (months <= 1 && ['M']) ||
              (months < thresholds.M && ['MM', months]) ||
              (years <= 1 && ['y']) || ['yy', years];

          a[2] = withoutSuffix;
          a[3] = +posNegDuration > 0;
          a[4] = locale;
          return substituteTimeAgo.apply(null, a);
      }

      // This function allows you to set the rounding function for relative time strings
      function getSetRelativeTimeRounding(roundingFunction) {
          if (roundingFunction === undefined) {
              return round;
          }
          if (typeof roundingFunction === 'function') {
              round = roundingFunction;
              return true;
          }
          return false;
      }

      // This function allows you to set a threshold for relative time strings
      function getSetRelativeTimeThreshold(threshold, limit) {
          if (thresholds[threshold] === undefined) {
              return false;
          }
          if (limit === undefined) {
              return thresholds[threshold];
          }
          thresholds[threshold] = limit;
          if (threshold === 's') {
              thresholds.ss = limit - 1;
          }
          return true;
      }

      function humanize(argWithSuffix, argThresholds) {
          if (!this.isValid()) {
              return this.localeData().invalidDate();
          }

          var withSuffix = false,
              th = thresholds,
              locale,
              output;

          if (typeof argWithSuffix === 'object') {
              argThresholds = argWithSuffix;
              argWithSuffix = false;
          }
          if (typeof argWithSuffix === 'boolean') {
              withSuffix = argWithSuffix;
          }
          if (typeof argThresholds === 'object') {
              th = Object.assign({}, thresholds, argThresholds);
              if (argThresholds.s != null && argThresholds.ss == null) {
                  th.ss = argThresholds.s - 1;
              }
          }

          locale = this.localeData();
          output = relativeTime$1(this, !withSuffix, th, locale);

          if (withSuffix) {
              output = locale.pastFuture(+this, output);
          }

          return locale.postformat(output);
      }

      var abs$1 = Math.abs;

      function sign(x) {
          return (x > 0) - (x < 0) || +x;
      }

      function toISOString$1() {
          // for ISO strings we do not use the normal bubbling rules:
          //  * milliseconds bubble up until they become hours
          //  * days do not bubble at all
          //  * months bubble up until they become years
          // This is because there is no context-free conversion between hours and days
          // (think of clock changes)
          // and also not between days and months (28-31 days per month)
          if (!this.isValid()) {
              return this.localeData().invalidDate();
          }

          var seconds = abs$1(this._milliseconds) / 1000,
              days = abs$1(this._days),
              months = abs$1(this._months),
              minutes,
              hours,
              years,
              s,
              total = this.asSeconds(),
              totalSign,
              ymSign,
              daysSign,
              hmsSign;

          if (!total) {
              // this is the same as C#'s (Noda) and python (isodate)...
              // but not other JS (goog.date)
              return 'P0D';
          }

          // 3600 seconds -> 60 minutes -> 1 hour
          minutes = absFloor(seconds / 60);
          hours = absFloor(minutes / 60);
          seconds %= 60;
          minutes %= 60;

          // 12 months -> 1 year
          years = absFloor(months / 12);
          months %= 12;

          // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
          s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';

          totalSign = total < 0 ? '-' : '';
          ymSign = sign(this._months) !== sign(total) ? '-' : '';
          daysSign = sign(this._days) !== sign(total) ? '-' : '';
          hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

          return (
              totalSign +
              'P' +
              (years ? ymSign + years + 'Y' : '') +
              (months ? ymSign + months + 'M' : '') +
              (days ? daysSign + days + 'D' : '') +
              (hours || minutes || seconds ? 'T' : '') +
              (hours ? hmsSign + hours + 'H' : '') +
              (minutes ? hmsSign + minutes + 'M' : '') +
              (seconds ? hmsSign + s + 'S' : '')
          );
      }

      var proto$2 = Duration.prototype;

      proto$2.isValid = isValid$1;
      proto$2.abs = abs;
      proto$2.add = add$1;
      proto$2.subtract = subtract$1;
      proto$2.as = as;
      proto$2.asMilliseconds = asMilliseconds;
      proto$2.asSeconds = asSeconds;
      proto$2.asMinutes = asMinutes;
      proto$2.asHours = asHours;
      proto$2.asDays = asDays;
      proto$2.asWeeks = asWeeks;
      proto$2.asMonths = asMonths;
      proto$2.asQuarters = asQuarters;
      proto$2.asYears = asYears;
      proto$2.valueOf = valueOf$1;
      proto$2._bubble = bubble;
      proto$2.clone = clone$1;
      proto$2.get = get$2;
      proto$2.milliseconds = milliseconds;
      proto$2.seconds = seconds;
      proto$2.minutes = minutes;
      proto$2.hours = hours;
      proto$2.days = days;
      proto$2.weeks = weeks;
      proto$2.months = months;
      proto$2.years = years;
      proto$2.humanize = humanize;
      proto$2.toISOString = toISOString$1;
      proto$2.toString = toISOString$1;
      proto$2.toJSON = toISOString$1;
      proto$2.locale = locale;
      proto$2.localeData = localeData;

      proto$2.toIsoString = deprecate(
          'toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)',
          toISOString$1
      );
      proto$2.lang = lang;

      // FORMATTING

      addFormatToken('X', 0, 0, 'unix');
      addFormatToken('x', 0, 0, 'valueOf');

      // PARSING

      addRegexToken('x', matchSigned);
      addRegexToken('X', matchTimestamp);
      addParseToken('X', function (input, array, config) {
          config._d = new Date(parseFloat(input) * 1000);
      });
      addParseToken('x', function (input, array, config) {
          config._d = new Date(toInt(input));
      });

      //! moment.js

      hooks.version = '2.29.2';

      setHookCallback(createLocal);

      hooks.fn = proto;
      hooks.min = min;
      hooks.max = max;
      hooks.now = now;
      hooks.utc = createUTC;
      hooks.unix = createUnix;
      hooks.months = listMonths;
      hooks.isDate = isDate;
      hooks.locale = getSetGlobalLocale;
      hooks.invalid = createInvalid;
      hooks.duration = createDuration;
      hooks.isMoment = isMoment;
      hooks.weekdays = listWeekdays;
      hooks.parseZone = createInZone;
      hooks.localeData = getLocale;
      hooks.isDuration = isDuration;
      hooks.monthsShort = listMonthsShort;
      hooks.weekdaysMin = listWeekdaysMin;
      hooks.defineLocale = defineLocale;
      hooks.updateLocale = updateLocale;
      hooks.locales = listLocales;
      hooks.weekdaysShort = listWeekdaysShort;
      hooks.normalizeUnits = normalizeUnits;
      hooks.relativeTimeRounding = getSetRelativeTimeRounding;
      hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
      hooks.calendarFormat = getCalendarFormat;
      hooks.prototype = proto;

      // currently HTML5 input type only supports 24-hour formats
      hooks.HTML5_FMT = {
          DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm', // <input type="datetime-local" />
          DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss', // <input type="datetime-local" step="1" />
          DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS', // <input type="datetime-local" step="0.001" />
          DATE: 'YYYY-MM-DD', // <input type="date" />
          TIME: 'HH:mm', // <input type="time" />
          TIME_SECONDS: 'HH:mm:ss', // <input type="time" step="1" />
          TIME_MS: 'HH:mm:ss.SSS', // <input type="time" step="0.001" />
          WEEK: 'GGGG-[W]WW', // <input type="week" />
          MONTH: 'YYYY-MM', // <input type="month" />
      };

      return hooks;

  })));

  var moment = /*#__PURE__*/Object.freeze({
    __proto__: null
  });

  function wrapCsvValue(val, formatFn) {
    var formatted = formatFn !== void 0
        ? formatFn(val)
        : val;
    formatted = formatted === void 0 || formatted === null
        ? ''
        : String(formatted);
    formatted = formatted.split('"').join('""');
    /**
     * Excel accepts \n and \r in strings, but some other CSV parsers do not
     * Uncomment the next two lines to escape new lines
     */
    // .split('\n').join('\\n')
    // .split('\r').join('\\r')
    return ("\"" + formatted + "\"")
  }

  var script = vue.defineComponent({
    name: "QGrid",
    props: ['data', 'columns', 'file_name', 'csv_download', 'excel_download', 'columns_filter', 'header_filter', 'draggable', 'draggable_columns', 'classes', 'separator', 'dense', 'dark', 'flat', 'bordered', 'square', 'selection', 'selected', 'fullscreen', 'global_search', 'groupby_filter', 'visible_columns', 'pagination', 'loading', 'row_key', 'global_filter','ssr_pagination'],
    setup: function setup(props) {

      // onMounted(()=>{
      //   this.Sorting();
      // })

      var pagination_this = vue.computed({
        get: function () { return props.pagination; },
        set: function () {
        },
      });

      return {
        filter_data: vue.ref({}),
        pagination_this: pagination_this,
        uuid: vue.ref(''),
        column_options: vue.ref({}),
        column_options_selected: vue.ref({}),
        filter_flags: vue.ref({}),
        selection_prop: vue.ref(''),
        name: vue.ref(''),
        selected_prop: vue.ref([]),
        filter: vue.ref(''),
        gorupby_option: vue.ref([]),
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
        sub_grouped_data: vue.ref({}),
        sub_grouped_columns: vue.ref([]),
        selected_group_by_filed: vue.ref({"label": 'Group By Field', "value": ''}),
        final_column: vue.ref([])
      }
    },
    mounted: function mounted() {
      this.Sorting();
    },
    computed: {
      getFilteredData: function getFilteredData() {
        var self = this;
        var table_columns = this.final_column.map(function (item) {
          return item.field
        });
        var table_Data = this.data.filter(function (item) {
          var i = '';
          for (i = 0; i < table_columns.length; i++) {
            if (self.filter_data[table_columns[i]] == '')
              { continue; }
            if (item[table_columns[i]] == null)
              { return true }

            if (!self.final_column[i].hasOwnProperty('filter_type') || self.final_column[i].filter_type == 'text') {
              if (table_columns[i] in self.filter_data && item[table_columns[i]].toString().toLowerCase().indexOf(self.filter_data[table_columns[i]].toLowerCase()) == -1) {
                return false;
              }
            }
            if (self.final_column[i].hasOwnProperty('filter_type') && self.final_column[i].filter_type == 'date') {
              var compareDate = moment(item[table_columns[i]], self.final_column[i].format);
              var startDate = moment(self.filter_data[table_columns[i]].from, 'YYYY/MM/DD');
              var endDate = moment(self.filter_data[table_columns[i]].to, 'YYYY/MM/DD');
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
      getFilteredValuesData: function getFilteredValuesData() {
        var self = this;
        this.column_options_selected = Object.assign({}, this.column_options_selected);
        var table_Data = this.getFilteredData.filter(function (item) {
          var i = '';
          for (i = 0; i < self.columns.length; i++) {
            if (self.column_options_selected[self.columns[i].field].length == 0)
              { continue; }
            if (self.column_options_selected[self.columns[i].field].indexOf(item[self.columns[i].field].toString().toLowerCase()) == -1) {
              return false;
            }
          }
          return true
        });
        if (this.groupby_filter && this.selected_group_by_filed.value != '') {
          var grouped_data = this.groupBy(table_Data, this.selected_group_by_filed.value);
          table_Data = [];
          Object.keys(grouped_data).filter(function (item) {
            table_Data.push({"name": item});
            return item
          });
          this.sub_grouped_data = grouped_data;
        }
        return table_Data;
      },
      hasDefaultSlot: function hasDefaultSlot() {
        return this.$slots.hasOwnProperty("body");
      },
      hasHeaderSlot: function hasHeaderSlot() {
        return this.$slots.hasOwnProperty("header");
      },
    },
    created: function created() {
      this.uuid = quasar.uid();
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
      this.setColumnsDefinition();
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
      onRequest: function onRequest(data) {
        this.$emit("OnRequest", data);
      },
      rowClick: function rowClick(row) {
        this.$emit('row-click', row);
      },
      setColumnsDefinition: function setColumnsDefinition() {
        var self = this;
        self.column_options = {};
        self.columns.filter(function (item) {
          self.column_options[item.field] = [];
          self.column_options_selected[item.field] = [];
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
              });
            }
          });
        });
        self.columns.filter(function (column) {
          if (column.hasOwnProperty('filter_type') && column.filter_type == 'date') {
            self.filter_data[column.field] = {'from': '', 'to': ''};
          }
          if (column.hasOwnProperty('filter_type') && column.filter_type == 'number_range') {
            self.filter_data[column.field] = {'from': '', 'to': ''};
          }
          self.column_options[column.field] = [].concat( new Map(self.column_options[column.field].map(function (item) { return [item['value'], item]; })).values() );
        });
        this.final_column = this.selected_group_by_filed.value != '' ? this.grouped_column : this.columns;
      },
      getColumnOptions: function getColumnOptions(column) {
        var column_option_simple = [].concat( new Set(this.data.map(function (item) { return item[column]; })) );
        var column_option = [];

        column_option_simple.filter(function (col) {
          column_option.push({'label': col.toString(), 'value': col.toString().toLowerCase().replace(/_/g, '_')});
          return col
        });
        return column_option
      },
      exportTable: function exportTable(type) {
        var this$1$1 = this;

        // naive encoding to csv format
        var content = [this.columns.map(function (col) { return wrapCsvValue(col.label); })].concat(
            this.data.map(function (row) { return this$1$1.columns.map(function (col) { return wrapCsvValue(
                typeof col.field === 'function'
                    ? col.field(row)
                    : row[col.field === void 0 ? col.name : col.field],
                col.format
            ); }).join(','); })
        ).join('\r\n');
        var status = quasar.exportFile(
            this.file_name + '.' + type,
            content,
            'text/' + type
        );
        if (status !== true) {
          this.$q.notify({
            message: 'Browser denied file download...',
            color: 'negative',
            icon: 'warning'
          });
        }
      },
      groupBy: function groupBy(array, key) {
        var result = {};
        array.forEach(function (item) {
          if (!result[item[key]]) {
            result[item[key]] = [];
          }
          result[item[key]].push(item);
        });
        return result
      },
      Sorting: function Sorting() {
        var dom = document.getElementById(this.uuid);
        var element = dom.querySelector("table tbody");
        var element2 = dom.querySelector("table thead tr:nth-of-type(1)");
        var self = this;
        Sortable.create(element, {
          // filter:'.ignore-elements',
          // preventOnFilter: true,
          disabled: !this.draggable,
          onEnd: function onEnd(event) {
            // if (event.newIndex != 0) {
            var tmp = self.data[(event.oldIndex)];
            self.data[(event.oldIndex)] = self.data[(event.newIndex)];
            self.data[(event.newIndex)] = tmp;
            self.$emit('dragged_row', {
              'dragged_row': self.data[(event.oldIndex)],
              'old_index': event.oldIndex,
              'new_index': event.newIndex
            });
            // }
          },
          onMove: function (/**Event*/evt, /**Event*/originalEvent) {
            if (evt.related.className == 'ignore-elements q-tr') {
              return false
            }
          },
        });
        Sortable.create(element2, {
          // filter:'.ignore-elements',
          // preventOnFilter: true,
          disabled: !this.draggable_columns,
          onEnd: function onEnd(event) {
            // if (event.newIndex != 0) {
            var old_index, new_index;
            if (self.selection) {
              old_index = event.oldIndex - 1;
              new_index = event.newIndex - 1;
            } else {
              old_index = event.oldIndex;
              new_index = event.newIndex;
            }
            var tmp = self.final_column[old_index];
            self.final_column[old_index] = self.final_column[new_index];
            self.final_column[new_index] = tmp;
            self.$emit('dragged_column', {
              'dragged_column': self.final_column[old_index],
              'old_index': old_index,
              'new_index': new_index
            });
          },
          onMove: function (/**Event*/evt, /**Event*/originalEvent) {
            if (evt.related.className == 'q-table--col-auto-width ignore-elements') {
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
        this.$emit('selected-val', this.selected_prop);
      },
      'columns': function () {
        this.setColumnsDefinition();
      },
      'selected': function () {
        if (this.selected === undefined) {
          this.selected_prop = [];
        } else {
          this.selected_prop = this.selected;
        }
      }
    },
    emits: ['selected-val', 'dragged_column', 'row-click', 'OnRequest']
  });

  var _hoisted_1 = { class: "row inline" };
  var _hoisted_2 = { class: "column" };
  var _hoisted_3 = { class: "column" };
  var _hoisted_4 = { class: "q-pa-sm q-mt-md" };
  var _hoisted_5 = { class: "row items-center justify-end" };
  var _hoisted_6 = {
    slot: "body",
    "slot-scope": "props"
  };
  var _hoisted_7 = { class: "row inline" };
  var _hoisted_8 = { class: "column" };
  var _hoisted_9 = { class: "column" };
  var _hoisted_10 = { class: "q-pa-sm q-mt-md" };
  var _hoisted_11 = { class: "row items-center justify-end" };
  var _hoisted_12 = {
    slot: "body",
    "slot-scope": "props"
  };

  function render(_ctx, _cache, $props, $setup, $data, $options) {
    var _component_q_checkbox = vue.resolveComponent("q-checkbox");
    var _component_q_th = vue.resolveComponent("q-th");
    var _component_q_icon = vue.resolveComponent("q-icon");
    var _component_q_space = vue.resolveComponent("q-space");
    var _component_q_btn = vue.resolveComponent("q-btn");
    var _component_q_item_section = vue.resolveComponent("q-item-section");
    var _component_q_item_label = vue.resolveComponent("q-item-label");
    var _component_q_item = vue.resolveComponent("q-item");
    var _component_q_select = vue.resolveComponent("q-select");
    var _component_q_menu = vue.resolveComponent("q-menu");
    var _component_q_tr = vue.resolveComponent("q-tr");
    var _component_q_input = vue.resolveComponent("q-input");
    var _component_q_date = vue.resolveComponent("q-date");
    var _component_q_popup_proxy = vue.resolveComponent("q-popup-proxy");
    var _component_q_tooltip = vue.resolveComponent("q-tooltip");
    var _component_q_td = vue.resolveComponent("q-td");
    var _component_q_table = vue.resolveComponent("q-table");
    var _directive_close_popup = vue.resolveDirective("close-popup");

    return (vue.openBlock(), vue.createElementBlock("span", null, [
      (_ctx.ssr_pagination)
        ? (vue.openBlock(), vue.createBlock(_component_q_table, {
            key: 0,
            id: _ctx.uuid,
            loading: _ctx.loading,
            rows: _ctx.getFilteredValuesData,
            columns: _ctx.final_column,
            "row-key": _ctx.row_key?_ctx.row_key:'name',
            class: vue.normalizeClass(_ctx.classes),
            "visible-columns": _ctx.visible_columns,
            separator: _ctx.separator,
            dense: _ctx.dense,
            dark: _ctx.dark,
            flat: _ctx.flat,
            bordered: _ctx.bordered,
            square: _ctx.square,
            selection: _ctx.selection_prop,
            selected: _ctx.selected_prop,
            "onUpdate:selected": _cache[6] || (_cache[6] = function ($event) { return ((_ctx.selected_prop) = $event); }),
            filter: _ctx.global_filter || _ctx.filter,
            pagination: _ctx.pagination_this,
            "onUpdate:pagination": _cache[7] || (_cache[7] = function ($event) { return ((_ctx.pagination_this) = $event); }),
            onRequest: _ctx.onRequest
          }, vue.createSlots({
            header: vue.withCtx(function (props) { return [
              vue.withDirectives(vue.createVNode(_component_q_tr, { props: props }, {
                default: vue.withCtx(function () { return [
                  (_ctx.selection_prop!='none')
                    ? (vue.openBlock(), vue.createBlock(_component_q_th, {
                        key: 0,
                        "auto-width": "",
                        class: "ignore-elements"
                      }, {
                        default: vue.withCtx(function () { return [
                          (_ctx.selection_prop=='multiple')
                            ? (vue.openBlock(), vue.createBlock(_component_q_checkbox, {
                                key: 0,
                                modelValue: props.selected,
                                "onUpdate:modelValue": function ($event) { return ((props.selected) = $event); },
                                "indeterminate-value": "some"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]))
                            : vue.createCommentVNode("", true)
                        ]; }),
                        _: 2
                      }, 1024))
                    : vue.createCommentVNode("", true),
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.cols, function (col) {
                    return (vue.openBlock(), vue.createBlock(_component_q_th, {
                      props: props,
                      onHover: _cache[1] || (_cache[1] = vue.withModifiers(function () {}, ["stop"])),
                      key: col.name
                    }, {
                      default: vue.withCtx(function () { return [
                        vue.createElementVNode("div", _hoisted_1, [
                          vue.createElementVNode("div", _hoisted_2, [
                            vue.createElementVNode("p", null, vue.toDisplayString(col.label), 1)
                          ]),
                          vue.createElementVNode("div", _hoisted_3, [
                            (_ctx.header_filter && col.hasOwnProperty('show_filter') && col['show_filter'])
                              ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                                  key: 0,
                                  flat: "",
                                  dense: "",
                                  size: "sm",
                                  icon: "fa fa-filter",
                                  class: "q-ml-xs",
                                  onClick: _cache[0] || (_cache[0] = vue.withModifiers(function () {}, ["stop"]))
                                }, {
                                  default: vue.withCtx(function () { return [
                                    (_ctx.column_options_selected[col.field].length>0)
                                      ? (vue.openBlock(), vue.createBlock(_component_q_icon, {
                                          key: 0,
                                          name: "fas fa-asterisk",
                                          color: "red",
                                          style: {"font-size":"7px"}
                                        }))
                                      : vue.createCommentVNode("", true),
                                    vue.createVNode(_component_q_menu, null, {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_space),
                                        vue.withDirectives(vue.createVNode(_component_q_btn, {
                                          dense: "",
                                          class: "float-right q-ma-sm bg-red text-white",
                                          round: "",
                                          size: "sm",
                                          flat: "",
                                          icon: "close"
                                        }, null, 512), [
                                          [_directive_close_popup]
                                        ]),
                                        vue.createElementVNode("div", _hoisted_4, [
                                          vue.createVNode(_component_q_select, {
                                            "map-options": "",
                                            multiple: "",
                                            "emit-value": "",
                                            filled: "",
                                            modelValue: _ctx.column_options_selected[col.field],
                                            "onUpdate:modelValue": function ($event) { return ((_ctx.column_options_selected[col.field]) = $event); },
                                            options: _ctx.getColumnOptions(col.field),
                                            style: {"width":"150px !important"}
                                          }, {
                                            "before-options": vue.withCtx(function () { return [
                                              vue.createVNode(_component_q_item, { class: "sticky-top" }, {
                                                default: vue.withCtx(function () { return [
                                                  vue.createVNode(_component_q_item_section, { avatar: "" }, {
                                                    default: vue.withCtx(function () { return [
                                                      vue.createVNode(_component_q_checkbox, {
                                                        "onUpdate:modelValue": function ($event) { return (_ctx.getColumnOptions(col.field).length == _ctx.column_options_selected[col.field].length?_ctx.column_options_selected[col.field]=[]:_ctx.column_options_selected[col.field] = _ctx.getColumnOptions(col.field).map(function (item){ return item.value; })); },
                                                        "model-value": _ctx.getColumnOptions(col.field).length == _ctx.column_options_selected[col.field].length?true:(_ctx.column_options_selected[col.field].length==0?false:null),
                                                        color: "teal"
                                                      }, null, 8, ["onUpdate:modelValue", "model-value"])
                                                    ]; }),
                                                    _: 2
                                                  }, 1024),
                                                  vue.createVNode(_component_q_item_section, null, {
                                                    default: vue.withCtx(function () { return [
                                                      vue.createVNode(_component_q_item_label, { innerHTML: 'Select All' })
                                                    ]; }),
                                                    _: 1
                                                  })
                                                ]; }),
                                                _: 2
                                              }, 1024)
                                            ]; }),
                                            option: vue.withCtx(function (scope) { return [
                                              vue.createVNode(_component_q_item, vue.mergeProps(scope.itemProps, vue.toHandlers(scope.itemEvents)), {
                                                default: vue.withCtx(function () { return [
                                                  vue.createVNode(_component_q_item_section, { avatar: "" }, {
                                                    default: vue.withCtx(function () { return [
                                                      vue.createVNode(_component_q_checkbox, {
                                                        modelValue: _ctx.column_options_selected[col.field],
                                                        "onUpdate:modelValue": function ($event) { return ((_ctx.column_options_selected[col.field]) = $event); },
                                                        val: scope.opt.value,
                                                        color: "teal"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "val"])
                                                    ]; }),
                                                    _: 2
                                                  }, 1024),
                                                  vue.createVNode(_component_q_item_section, null, {
                                                    default: vue.withCtx(function () { return [
                                                      vue.createVNode(_component_q_item_label, {
                                                        class: "text-black",
                                                        innerHTML: scope.opt.label
                                                      }, null, 8, ["innerHTML"])
                                                    ]; }),
                                                    _: 2
                                                  }, 1024)
                                                ]; }),
                                                _: 2
                                              }, 1040)
                                            ]; }),
                                            _: 2
                                          }, 1032, ["modelValue", "onUpdate:modelValue", "options"])
                                        ]),
                                        vue.withDirectives(vue.createVNode(_component_q_btn, {
                                          color: "primary",
                                          class: "float-right q-mr-sm q-mb-sm text-capitalize",
                                          size: "sm",
                                          onClick: function ($event) { return (_ctx.column_options_selected[col.field]=[]); },
                                          label: "Clear"
                                        }, null, 8, ["onClick"]), [
                                          [_directive_close_popup]
                                        ])
                                      ]; }),
                                      _: 2
                                    }, 1024)
                                  ]; }),
                                  _: 2
                                }, 1024))
                              : vue.createCommentVNode("", true)
                          ])
                        ])
                      ]; }),
                      _: 2
                    }, 1032, ["props"]))
                  }), 128))
                ]; }),
                _: 2
              }, 1032, ["props"]), [
                [vue.vShow, !_ctx.hasHeaderSlot]
              ]),
              (_ctx.hasHeaderSlot)
                ? vue.renderSlot(_ctx.$slots, "header", {
                    key: 0,
                    cols: props.cols
                  })
                : vue.createCommentVNode("", true),
              (_ctx.columns_filter)
                ? (vue.openBlock(), vue.createBlock(_component_q_tr, {
                    key: 1,
                    props: props,
                    class: "ignore-elements"
                  }, {
                    default: vue.withCtx(function () { return [
                      (_ctx.selection_prop!='none')
                        ? (vue.openBlock(), vue.createBlock(_component_q_th, {
                            key: 0,
                            "auto-width": ""
                          }))
                        : vue.createCommentVNode("", true),
                      (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.cols, function (col) {
                        return (vue.openBlock(), vue.createBlock(_component_q_th, {
                          key: col.name,
                          style: {"padding":"0px 0px 0px 0px"}
                        }, {
                          default: vue.withCtx(function () { return [
                            (!col.hasOwnProperty('filter_type') || col.filter_type=='text')
                              ? (vue.openBlock(), vue.createBlock(_component_q_input, {
                                  key: 0,
                                  dense: "",
                                  color: "teal",
                                  class: "q-pl-xs q-pr-xs",
                                  filled: "",
                                  modelValue: _ctx.filter_data[col.field],
                                  "onUpdate:modelValue": function ($event) { return ((_ctx.filter_data[col.field]) = $event); }
                                }, vue.createSlots({ _: 2 }, [
                                  (_ctx.filter_data[col.field])
                                    ? {
                                        name: "append",
                                        fn: vue.withCtx(function () { return [
                                          vue.createVNode(_component_q_icon, {
                                            name: "cancel",
                                            onClick: vue.withModifiers(function ($event) { return (_ctx.filter_data[col.field] = ''); }, ["stop"]),
                                            class: "cursor-pointer"
                                          }, null, 8, ["onClick"])
                                        ]; })
                                      }
                                    : undefined
                                ]), 1032, ["modelValue", "onUpdate:modelValue"]))
                              : vue.createCommentVNode("", true),
                            (col.hasOwnProperty('filter_type') && col.filter_type=='select')
                              ? (vue.openBlock(), vue.createBlock(_component_q_select, {
                                  key: 1,
                                  "map-options": "",
                                  multiple: "",
                                  "emit-value": "",
                                  filled: "",
                                  modelValue: _ctx.column_options_selected[col.field],
                                  "onUpdate:modelValue": function ($event) { return ((_ctx.column_options_selected[col.field]) = $event); },
                                  options: _ctx.getColumnOptions(col.field),
                                  dense: ""
                                }, {
                                  append: vue.withCtx(function () { return [
                                    (_ctx.column_options_selected[col.field].length>0)
                                      ? (vue.openBlock(), vue.createBlock(_component_q_icon, {
                                          key: 0,
                                          name: "close",
                                          onClick: vue.withModifiers(function ($event) { return (_ctx.column_options_selected[col.field]=[]); }, ["stop"]),
                                          class: "cursor-pointer"
                                        }, null, 8, ["onClick"]))
                                      : vue.createCommentVNode("", true)
                                  ]; }),
                                  "before-options": vue.withCtx(function () { return [
                                    vue.createVNode(_component_q_item, { class: "sticky-top" }, {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_item_section, { avatar: "" }, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_checkbox, {
                                              "onUpdate:modelValue": function ($event) { return (_ctx.getColumnOptions(col.field).length == _ctx.column_options_selected[col.field].length?_ctx.column_options_selected[col.field]=[]:_ctx.column_options_selected[col.field] = _ctx.getColumnOptions(col.field).map(function (item){ return item.value; })); },
                                              "model-value": _ctx.getColumnOptions(col.field).length == _ctx.column_options_selected[col.field].length?true:(_ctx.column_options_selected[col.field].length==0?false:null),
                                              color: "teal"
                                            }, null, 8, ["onUpdate:modelValue", "model-value"])
                                          ]; }),
                                          _: 2
                                        }, 1024),
                                        vue.createVNode(_component_q_item_section, null, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_item_label, { innerHTML: 'Select All' })
                                          ]; }),
                                          _: 1
                                        })
                                      ]; }),
                                      _: 2
                                    }, 1024)
                                  ]; }),
                                  option: vue.withCtx(function (scope) { return [
                                    vue.createVNode(_component_q_item, vue.mergeProps(scope.itemProps, vue.toHandlers(scope.itemEvents)), {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_item_section, { avatar: "" }, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_checkbox, {
                                              modelValue: _ctx.column_options_selected[col.field],
                                              "onUpdate:modelValue": function ($event) { return ((_ctx.column_options_selected[col.field]) = $event); },
                                              val: scope.opt.value,
                                              color: "teal"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue", "val"])
                                          ]; }),
                                          _: 2
                                        }, 1024),
                                        vue.createVNode(_component_q_item_section, null, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_item_label, {
                                              innerHTML: scope.opt.label
                                            }, null, 8, ["innerHTML"])
                                          ]; }),
                                          _: 2
                                        }, 1024)
                                      ]; }),
                                      _: 2
                                    }, 1040)
                                  ]; }),
                                  _: 2
                                }, 1032, ["modelValue", "onUpdate:modelValue", "options"]))
                              : vue.createCommentVNode("", true),
                            (col.hasOwnProperty('filter_type') && col.filter_type=='date')
                              ? (vue.openBlock(), vue.createBlock(_component_q_input, {
                                  key: 2,
                                  dense: "",
                                  color: "teal",
                                  class: "q-pl-xs q-pr-xs",
                                  filled: "",
                                  "model-value": _ctx.filter_data[col.field].from+(_ctx.filter_data[col.field].from?'-':'')+_ctx.filter_data[col.field].to
                                }, {
                                  append: vue.withCtx(function () { return [
                                    vue.createVNode(_component_q_icon, {
                                      name: "event",
                                      class: "cursor-pointer"
                                    }, {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_popup_proxy, {
                                          ref_for: true,
                                          ref: "qDateProxy",
                                          cover: "",
                                          "transition-show": "scale",
                                          "transition-hide": "scale"
                                        }, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_date, {
                                              modelValue: _ctx.filter_data[col.field],
                                              "onUpdate:modelValue": function ($event) { return ((_ctx.filter_data[col.field]) = $event); },
                                              range: ""
                                            }, {
                                              default: vue.withCtx(function () { return [
                                                vue.createElementVNode("div", _hoisted_5, [
                                                  vue.withDirectives(vue.createVNode(_component_q_btn, {
                                                    label: "Close",
                                                    class: "text-capitalize",
                                                    color: "primary",
                                                    flat: ""
                                                  }, null, 512), [
                                                    [_directive_close_popup]
                                                  ])
                                                ])
                                              ]; }),
                                              _: 2
                                            }, 1032, ["modelValue", "onUpdate:modelValue"])
                                          ]; }),
                                          _: 2
                                        }, 1536)
                                      ]; }),
                                      _: 2
                                    }, 1024),
                                    (_ctx.filter_data[col.field].from!='')
                                      ? (vue.openBlock(), vue.createBlock(_component_q_icon, {
                                          key: 0,
                                          name: "cancel",
                                          onClick: vue.withModifiers(function ($event) { return (_ctx.filter_data[col.field] = {'from': '', 'to': ''}); }, ["stop"]),
                                          class: "cursor-pointer"
                                        }, null, 8, ["onClick"]))
                                      : vue.createCommentVNode("", true)
                                  ]; }),
                                  _: 2
                                }, 1032, ["model-value"]))
                              : vue.createCommentVNode("", true),
                            (col.hasOwnProperty('filter_type') && col.filter_type=='number_range')
                              ? (vue.openBlock(), vue.createBlock(_component_q_input, {
                                  key: 3,
                                  dense: "",
                                  color: "teal",
                                  class: "q-pl-xs q-pr-xs",
                                  filled: "",
                                  "model-value": _ctx.filter_data[col.field].from+(typeof _ctx.filter_data[col.field].from!='string'?'-':'')+_ctx.filter_data[col.field].to
                                }, {
                                  append: vue.withCtx(function () { return [
                                    vue.createVNode(_component_q_icon, {
                                      name: "tag",
                                      class: "cursor-pointer"
                                    }, {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_popup_proxy, {
                                          ref_for: true,
                                          ref: "qDateProxy",
                                          cover: "",
                                          class: "row q-pa-sm",
                                          "transition-show": "scale",
                                          "transition-hide": "scale"
                                        }, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_input, {
                                              label: "From",
                                              type: "number",
                                              color: "teal",
                                              modelValue: _ctx.filter_data[col.field].from,
                                              "onUpdate:modelValue": function ($event) { return ((_ctx.filter_data[col.field].from) = $event); },
                                              modelModifiers: { number: true },
                                              class: "q-pl-xs q-pr-xs",
                                              filled: ""
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                            vue.createVNode(_component_q_input, {
                                              label: "To",
                                              type: "number",
                                              color: "teal",
                                              modelValue: _ctx.filter_data[col.field].to,
                                              "onUpdate:modelValue": function ($event) { return ((_ctx.filter_data[col.field].to) = $event); },
                                              modelModifiers: { number: true },
                                              class: "q-pl-xs q-pr-xs",
                                              filled: ""
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]; }),
                                          _: 2
                                        }, 1536)
                                      ]; }),
                                      _: 2
                                    }, 1024),
                                    (typeof _ctx.filter_data[col.field].from!='string')
                                      ? (vue.openBlock(), vue.createBlock(_component_q_icon, {
                                          key: 0,
                                          name: "cancel",
                                          onClick: vue.withModifiers(function ($event) { return (_ctx.filter_data[col.field] = {'from': '', 'to': ''}); }, ["stop"]),
                                          class: "cursor-pointer"
                                        }, null, 8, ["onClick"]))
                                      : vue.createCommentVNode("", true)
                                  ]; }),
                                  _: 2
                                }, 1032, ["model-value"]))
                              : vue.createCommentVNode("", true)
                          ]; }),
                          _: 2
                        }, 1024))
                      }), 128))
                    ]; }),
                    _: 2
                  }, 1032, ["props"]))
                : vue.createCommentVNode("", true)
            ]; }),
            body: vue.withCtx(function (props) { return [
              (!_ctx.hasDefaultSlot)
                ? (vue.openBlock(), vue.createBlock(_component_q_tr, {
                    key: 0,
                    props: props,
                    onClick: function ($event) { return (_ctx.rowClick(props.row)); }
                  }, {
                    default: vue.withCtx(function () { return [
                      (_ctx.selection_prop!='none')
                        ? (vue.openBlock(), vue.createBlock(_component_q_td, { key: 0 }, {
                            default: vue.withCtx(function () { return [
                              vue.createVNode(_component_q_checkbox, {
                                color: "primary",
                                modelValue: props.selected,
                                "onUpdate:modelValue": function ($event) { return ((props.selected) = $event); }
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]; }),
                            _: 2
                          }, 1024))
                        : vue.createCommentVNode("", true),
                      (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.cols, function (col, col_index) {
                        return (vue.openBlock(), vue.createBlock(_component_q_td, {
                          key: col.name,
                          props: props
                        }, {
                          default: vue.withCtx(function () { return [
                            (_ctx.groupby_filter && _ctx.selected_group_by_filed.value!='' && col_index==0)
                              ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                                  key: 0,
                                  size: "sm",
                                  color: "accent",
                                  round: "",
                                  dense: "",
                                  onClick: function ($event) { return (props.expand = !props.expand); },
                                  class: "q-mr-sm",
                                  icon: props.expand ? 'remove' : 'add'
                                }, null, 8, ["onClick", "icon"]))
                              : vue.createCommentVNode("", true),
                            vue.createTextVNode(" " + vue.toDisplayString(props.row[col.field]), 1)
                          ]; }),
                          _: 2
                        }, 1032, ["props"]))
                      }), 128))
                    ]; }),
                    _: 2
                  }, 1032, ["props", "onClick"]))
                : vue.createCommentVNode("", true),
              (_ctx.groupby_filter &&  _ctx.selected_group_by_filed.value!='')
                ? vue.withDirectives((vue.openBlock(), vue.createBlock(_component_q_tr, {
                    key: 1,
                    props: props
                  }, {
                    default: vue.withCtx(function () { return [
                      vue.createVNode(_component_q_td, { colspan: 2 }, {
                        default: vue.withCtx(function () { return [
                          vue.createVNode(_component_q_table, {
                            rows: _ctx.sub_grouped_data[props.row.name],
                            columns: _ctx.columns,
                            "row-key": _ctx.row_key?_ctx.row_key:'name',
                            pagination: _ctx.group_pagination,
                            "hide-bottom": ""
                          }, {
                            default: vue.withCtx(function () { return [
                              vue.createVNode(_component_q_tr, {
                                slot: "header",
                                "slot-scope": "props"
                              }, {
                                default: vue.withCtx(function () { return [
                                  (_ctx.col.field!=_ctx.selected_group_by_filed)
                                    ? (vue.openBlock(true), vue.createElementBlock(vue.Fragment, { key: 0 }, vue.renderList(props.cols, function (col) {
                                        return (vue.openBlock(), vue.createBlock(_component_q_th, {
                                          key: col.name,
                                          props: props
                                        }, {
                                          default: vue.withCtx(function () { return [
                                            vue.createTextVNode(vue.toDisplayString(col.label), 1)
                                          ]; }),
                                          _: 2
                                        }, 1032, ["props"]))
                                      }), 128))
                                    : vue.createCommentVNode("", true)
                                ]; }),
                                _: 2
                              }, 1024),
                              vue.createElementVNode("template", _hoisted_6, [
                                vue.createVNode(_component_q_tr, { props: props }, {
                                  default: vue.withCtx(function () { return [
                                    (_ctx.col.field!=_ctx.selected_group_by_filed)
                                      ? (vue.openBlock(true), vue.createElementBlock(vue.Fragment, { key: 0 }, vue.renderList(props.cols, function (col) {
                                          return (vue.openBlock(), vue.createBlock(_component_q_td, {
                                            key: col.name,
                                            props: props
                                          }, {
                                            default: vue.withCtx(function () { return [
                                              vue.createTextVNode(vue.toDisplayString(props.row[col.field]), 1)
                                            ]; }),
                                            _: 2
                                          }, 1032, ["props"]))
                                        }), 128))
                                      : vue.createCommentVNode("", true)
                                  ]; }),
                                  _: 2
                                }, 1032, ["props"])
                              ])
                            ]; }),
                            _: 2
                          }, 1032, ["rows", "columns", "row-key", "pagination"])
                        ]; }),
                        _: 2
                      }, 1024)
                    ]; }),
                    _: 2
                  }, 1032, ["props"])), [
                    [vue.vShow, props.expand]
                  ])
                : vue.createCommentVNode("", true),
              (_ctx.hasDefaultSlot)
                ? vue.renderSlot(_ctx.$slots, "body", {
                    key: 2,
                    row: props.row
                  })
                : vue.createCommentVNode("", true)
            ]; }),
            _: 2
          }, [
            (_ctx.excel_download || _ctx.csv_download || _ctx.fullscreen || _ctx.global_search)
              ? {
                  name: "top-right",
                  fn: vue.withCtx(function (props) { return [
                    (_ctx.global_search)
                      ? (vue.openBlock(), vue.createBlock(_component_q_input, {
                          key: 0,
                          filled: "",
                          borderless: "",
                          dense: "",
                          debounce: "300",
                          modelValue: _ctx.filter,
                          "onUpdate:modelValue": _cache[2] || (_cache[2] = function ($event) { return ((_ctx.filter) = $event); }),
                          class: "q-mr-md",
                          placeholder: "Search"
                        }, {
                          append: vue.withCtx(function () { return [
                            vue.createVNode(_component_q_icon, { name: "search" })
                          ]; }),
                          _: 1
                        }, 8, ["modelValue"]))
                      : vue.createCommentVNode("", true),
                    (_ctx.excel_download)
                      ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                          key: 1,
                          class: "bg-grey-2 q-mr-sm",
                          icon: "fas fa-file-excel",
                          "no-caps": "",
                          onClick: _cache[3] || (_cache[3] = function ($event) { return (_ctx.exportTable('xlsx')); })
                        }))
                      : vue.createCommentVNode("", true),
                    (_ctx.csv_download)
                      ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                          key: 2,
                          class: "bg-primary text-white",
                          icon: "fas fa-file-csv",
                          "no-caps": "",
                          onClick: _cache[4] || (_cache[4] = function ($event) { return (_ctx.exportTable('csv')); })
                        }))
                      : vue.createCommentVNode("", true),
                    (_ctx.groupby_filter)
                      ? (vue.openBlock(), vue.createBlock(_component_q_select, {
                          key: 3,
                          class: "q-mr-sm q-ml-sm",
                          outlined: "",
                          dense: "",
                          modelValue: _ctx.selected_group_by_filed,
                          "onUpdate:modelValue": _cache[5] || (_cache[5] = function ($event) { return ((_ctx.selected_group_by_filed) = $event); }),
                          options: _ctx.gorupby_option,
                          style: {"width":"150px"}
                        }, null, 8, ["modelValue", "options"]))
                      : vue.createCommentVNode("", true),
                    (_ctx.fullscreen)
                      ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                          key: 4,
                          flat: "",
                          round: "",
                          class: "q-ml-sm",
                          dense: "",
                          icon: props.inFullscreen ? 'fullscreen_exit' : 'fullscreen',
                          onClick: props.toggleFullscreen
                        }, {
                          default: vue.withCtx(function () { return [
                            vue.withDirectives((vue.openBlock(), vue.createBlock(_component_q_tooltip, {
                              disable: _ctx.$q.platform.is.mobile
                            }, {
                              default: vue.withCtx(function () { return [
                                vue.createTextVNode(vue.toDisplayString(props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'), 1)
                              ]; }),
                              _: 2
                            }, 1032, ["disable"])), [
                              [_directive_close_popup]
                            ])
                          ]; }),
                          _: 2
                        }, 1032, ["icon", "onClick"]))
                      : vue.createCommentVNode("", true)
                  ]; })
                }
              : undefined,
            (_ctx.$slots['loading'])
              ? {
                  name: "loading",
                  fn: vue.withCtx(function () { return [
                    vue.renderSlot(_ctx.$slots, "loading")
                  ]; })
                }
              : undefined
          ]), 1032, ["id", "loading", "rows", "columns", "row-key", "class", "visible-columns", "separator", "dense", "dark", "flat", "bordered", "square", "selection", "selected", "filter", "pagination", "onRequest"]))
        : (vue.openBlock(), vue.createBlock(_component_q_table, {
            key: 1,
            id: _ctx.uuid,
            loading: _ctx.loading,
            rows: _ctx.getFilteredValuesData,
            columns: _ctx.final_column,
            "row-key": _ctx.row_key?_ctx.row_key:'name',
            class: vue.normalizeClass(_ctx.classes),
            "visible-columns": _ctx.visible_columns,
            separator: _ctx.separator,
            dense: _ctx.dense,
            dark: _ctx.dark,
            flat: _ctx.flat,
            bordered: _ctx.bordered,
            square: _ctx.square,
            selection: _ctx.selection_prop,
            selected: _ctx.selected_prop,
            "onUpdate:selected": _cache[14] || (_cache[14] = function ($event) { return ((_ctx.selected_prop) = $event); }),
            filter: _ctx.global_filter || _ctx.filter,
            pagination: _ctx.pagination_this,
            onRequest: _ctx.onRequest
          }, vue.createSlots({
            header: vue.withCtx(function (props) { return [
              vue.withDirectives(vue.createVNode(_component_q_tr, { props: props }, {
                default: vue.withCtx(function () { return [
                  (_ctx.selection_prop!='none')
                    ? (vue.openBlock(), vue.createBlock(_component_q_th, {
                        key: 0,
                        "auto-width": "",
                        class: "ignore-elements"
                      }, {
                        default: vue.withCtx(function () { return [
                          (_ctx.selection_prop=='multiple')
                            ? (vue.openBlock(), vue.createBlock(_component_q_checkbox, {
                                key: 0,
                                modelValue: props.selected,
                                "onUpdate:modelValue": function ($event) { return ((props.selected) = $event); },
                                "indeterminate-value": "some"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]))
                            : vue.createCommentVNode("", true)
                        ]; }),
                        _: 2
                      }, 1024))
                    : vue.createCommentVNode("", true),
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.cols, function (col) {
                    return (vue.openBlock(), vue.createBlock(_component_q_th, {
                      props: props,
                      onHover: _cache[9] || (_cache[9] = vue.withModifiers(function () {}, ["stop"])),
                      key: col.name
                    }, {
                      default: vue.withCtx(function () { return [
                        vue.createElementVNode("div", _hoisted_7, [
                          vue.createElementVNode("div", _hoisted_8, [
                            vue.createElementVNode("p", null, vue.toDisplayString(col.label), 1)
                          ]),
                          vue.createElementVNode("div", _hoisted_9, [
                            (_ctx.header_filter && col.hasOwnProperty('show_filter') && col['show_filter'])
                              ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                                  key: 0,
                                  flat: "",
                                  dense: "",
                                  size: "sm",
                                  icon: "fa fa-filter",
                                  class: "q-ml-xs",
                                  onClick: _cache[8] || (_cache[8] = vue.withModifiers(function () {}, ["stop"]))
                                }, {
                                  default: vue.withCtx(function () { return [
                                    (_ctx.column_options_selected[col.field].length>0)
                                      ? (vue.openBlock(), vue.createBlock(_component_q_icon, {
                                          key: 0,
                                          name: "fas fa-asterisk",
                                          color: "red",
                                          style: {"font-size":"7px"}
                                        }))
                                      : vue.createCommentVNode("", true),
                                    vue.createVNode(_component_q_menu, null, {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_space),
                                        vue.withDirectives(vue.createVNode(_component_q_btn, {
                                          dense: "",
                                          class: "float-right q-ma-sm bg-red text-white",
                                          round: "",
                                          size: "sm",
                                          flat: "",
                                          icon: "close"
                                        }, null, 512), [
                                          [_directive_close_popup]
                                        ]),
                                        vue.createElementVNode("div", _hoisted_10, [
                                          vue.createVNode(_component_q_select, {
                                            "map-options": "",
                                            multiple: "",
                                            "emit-value": "",
                                            filled: "",
                                            modelValue: _ctx.column_options_selected[col.field],
                                            "onUpdate:modelValue": function ($event) { return ((_ctx.column_options_selected[col.field]) = $event); },
                                            options: _ctx.getColumnOptions(col.field),
                                            style: {"width":"150px !important"}
                                          }, {
                                            "before-options": vue.withCtx(function () { return [
                                              vue.createVNode(_component_q_item, { class: "sticky-top" }, {
                                                default: vue.withCtx(function () { return [
                                                  vue.createVNode(_component_q_item_section, { avatar: "" }, {
                                                    default: vue.withCtx(function () { return [
                                                      vue.createVNode(_component_q_checkbox, {
                                                        "onUpdate:modelValue": function ($event) { return (_ctx.getColumnOptions(col.field).length == _ctx.column_options_selected[col.field].length?_ctx.column_options_selected[col.field]=[]:_ctx.column_options_selected[col.field] = _ctx.getColumnOptions(col.field).map(function (item){ return item.value; })); },
                                                        "model-value": _ctx.getColumnOptions(col.field).length == _ctx.column_options_selected[col.field].length?true:(_ctx.column_options_selected[col.field].length==0?false:null),
                                                        color: "teal"
                                                      }, null, 8, ["onUpdate:modelValue", "model-value"])
                                                    ]; }),
                                                    _: 2
                                                  }, 1024),
                                                  vue.createVNode(_component_q_item_section, null, {
                                                    default: vue.withCtx(function () { return [
                                                      vue.createVNode(_component_q_item_label, { innerHTML: 'Select All' })
                                                    ]; }),
                                                    _: 1
                                                  })
                                                ]; }),
                                                _: 2
                                              }, 1024)
                                            ]; }),
                                            option: vue.withCtx(function (scope) { return [
                                              vue.createVNode(_component_q_item, vue.mergeProps(scope.itemProps, vue.toHandlers(scope.itemEvents)), {
                                                default: vue.withCtx(function () { return [
                                                  vue.createVNode(_component_q_item_section, { avatar: "" }, {
                                                    default: vue.withCtx(function () { return [
                                                      vue.createVNode(_component_q_checkbox, {
                                                        modelValue: _ctx.column_options_selected[col.field],
                                                        "onUpdate:modelValue": function ($event) { return ((_ctx.column_options_selected[col.field]) = $event); },
                                                        val: scope.opt.value,
                                                        color: "teal"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "val"])
                                                    ]; }),
                                                    _: 2
                                                  }, 1024),
                                                  vue.createVNode(_component_q_item_section, null, {
                                                    default: vue.withCtx(function () { return [
                                                      vue.createVNode(_component_q_item_label, {
                                                        class: "text-black",
                                                        innerHTML: scope.opt.label
                                                      }, null, 8, ["innerHTML"])
                                                    ]; }),
                                                    _: 2
                                                  }, 1024)
                                                ]; }),
                                                _: 2
                                              }, 1040)
                                            ]; }),
                                            _: 2
                                          }, 1032, ["modelValue", "onUpdate:modelValue", "options"])
                                        ]),
                                        vue.withDirectives(vue.createVNode(_component_q_btn, {
                                          color: "primary",
                                          class: "float-right q-mr-sm q-mb-sm text-capitalize",
                                          size: "sm",
                                          onClick: function ($event) { return (_ctx.column_options_selected[col.field]=[]); },
                                          label: "Clear"
                                        }, null, 8, ["onClick"]), [
                                          [_directive_close_popup]
                                        ])
                                      ]; }),
                                      _: 2
                                    }, 1024)
                                  ]; }),
                                  _: 2
                                }, 1024))
                              : vue.createCommentVNode("", true)
                          ])
                        ])
                      ]; }),
                      _: 2
                    }, 1032, ["props"]))
                  }), 128))
                ]; }),
                _: 2
              }, 1032, ["props"]), [
                [vue.vShow, !_ctx.hasHeaderSlot]
              ]),
              (_ctx.hasHeaderSlot)
                ? vue.renderSlot(_ctx.$slots, "header", {
                    key: 0,
                    cols: props.cols
                  })
                : vue.createCommentVNode("", true),
              (_ctx.columns_filter)
                ? (vue.openBlock(), vue.createBlock(_component_q_tr, {
                    key: 1,
                    props: props,
                    class: "ignore-elements"
                  }, {
                    default: vue.withCtx(function () { return [
                      (_ctx.selection_prop!='none')
                        ? (vue.openBlock(), vue.createBlock(_component_q_th, {
                            key: 0,
                            "auto-width": ""
                          }))
                        : vue.createCommentVNode("", true),
                      (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.cols, function (col) {
                        return (vue.openBlock(), vue.createBlock(_component_q_th, {
                          key: col.name,
                          style: {"padding":"0px 0px 0px 0px"}
                        }, {
                          default: vue.withCtx(function () { return [
                            (!col.hasOwnProperty('filter_type') || col.filter_type=='text')
                              ? (vue.openBlock(), vue.createBlock(_component_q_input, {
                                  key: 0,
                                  dense: "",
                                  color: "teal",
                                  class: "q-pl-xs q-pr-xs",
                                  filled: "",
                                  modelValue: _ctx.filter_data[col.field],
                                  "onUpdate:modelValue": function ($event) { return ((_ctx.filter_data[col.field]) = $event); }
                                }, vue.createSlots({ _: 2 }, [
                                  (_ctx.filter_data[col.field])
                                    ? {
                                        name: "append",
                                        fn: vue.withCtx(function () { return [
                                          vue.createVNode(_component_q_icon, {
                                            name: "cancel",
                                            onClick: vue.withModifiers(function ($event) { return (_ctx.filter_data[col.field] = ''); }, ["stop"]),
                                            class: "cursor-pointer"
                                          }, null, 8, ["onClick"])
                                        ]; })
                                      }
                                    : undefined
                                ]), 1032, ["modelValue", "onUpdate:modelValue"]))
                              : vue.createCommentVNode("", true),
                            (col.hasOwnProperty('filter_type') && col.filter_type=='select')
                              ? (vue.openBlock(), vue.createBlock(_component_q_select, {
                                  key: 1,
                                  "map-options": "",
                                  multiple: "",
                                  "emit-value": "",
                                  filled: "",
                                  modelValue: _ctx.column_options_selected[col.field],
                                  "onUpdate:modelValue": function ($event) { return ((_ctx.column_options_selected[col.field]) = $event); },
                                  options: _ctx.getColumnOptions(col.field),
                                  dense: ""
                                }, {
                                  append: vue.withCtx(function () { return [
                                    (_ctx.column_options_selected[col.field].length>0)
                                      ? (vue.openBlock(), vue.createBlock(_component_q_icon, {
                                          key: 0,
                                          name: "close",
                                          onClick: vue.withModifiers(function ($event) { return (_ctx.column_options_selected[col.field]=[]); }, ["stop"]),
                                          class: "cursor-pointer"
                                        }, null, 8, ["onClick"]))
                                      : vue.createCommentVNode("", true)
                                  ]; }),
                                  "before-options": vue.withCtx(function () { return [
                                    vue.createVNode(_component_q_item, { class: "sticky-top" }, {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_item_section, { avatar: "" }, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_checkbox, {
                                              "onUpdate:modelValue": function ($event) { return (_ctx.getColumnOptions(col.field).length == _ctx.column_options_selected[col.field].length?_ctx.column_options_selected[col.field]=[]:_ctx.column_options_selected[col.field] = _ctx.getColumnOptions(col.field).map(function (item){ return item.value; })); },
                                              "model-value": _ctx.getColumnOptions(col.field).length == _ctx.column_options_selected[col.field].length?true:(_ctx.column_options_selected[col.field].length==0?false:null),
                                              color: "teal"
                                            }, null, 8, ["onUpdate:modelValue", "model-value"])
                                          ]; }),
                                          _: 2
                                        }, 1024),
                                        vue.createVNode(_component_q_item_section, null, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_item_label, { innerHTML: 'Select All' })
                                          ]; }),
                                          _: 1
                                        })
                                      ]; }),
                                      _: 2
                                    }, 1024)
                                  ]; }),
                                  option: vue.withCtx(function (scope) { return [
                                    vue.createVNode(_component_q_item, vue.mergeProps(scope.itemProps, vue.toHandlers(scope.itemEvents)), {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_item_section, { avatar: "" }, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_checkbox, {
                                              modelValue: _ctx.column_options_selected[col.field],
                                              "onUpdate:modelValue": function ($event) { return ((_ctx.column_options_selected[col.field]) = $event); },
                                              val: scope.opt.value,
                                              color: "teal"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue", "val"])
                                          ]; }),
                                          _: 2
                                        }, 1024),
                                        vue.createVNode(_component_q_item_section, null, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_item_label, {
                                              innerHTML: scope.opt.label
                                            }, null, 8, ["innerHTML"])
                                          ]; }),
                                          _: 2
                                        }, 1024)
                                      ]; }),
                                      _: 2
                                    }, 1040)
                                  ]; }),
                                  _: 2
                                }, 1032, ["modelValue", "onUpdate:modelValue", "options"]))
                              : vue.createCommentVNode("", true),
                            (col.hasOwnProperty('filter_type') && col.filter_type=='date')
                              ? (vue.openBlock(), vue.createBlock(_component_q_input, {
                                  key: 2,
                                  dense: "",
                                  color: "teal",
                                  class: "q-pl-xs q-pr-xs",
                                  filled: "",
                                  "model-value": _ctx.filter_data[col.field].from+(_ctx.filter_data[col.field].from?'-':'')+_ctx.filter_data[col.field].to
                                }, {
                                  append: vue.withCtx(function () { return [
                                    vue.createVNode(_component_q_icon, {
                                      name: "event",
                                      class: "cursor-pointer"
                                    }, {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_popup_proxy, {
                                          ref_for: true,
                                          ref: "qDateProxy",
                                          cover: "",
                                          "transition-show": "scale",
                                          "transition-hide": "scale"
                                        }, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_date, {
                                              modelValue: _ctx.filter_data[col.field],
                                              "onUpdate:modelValue": function ($event) { return ((_ctx.filter_data[col.field]) = $event); },
                                              range: ""
                                            }, {
                                              default: vue.withCtx(function () { return [
                                                vue.createElementVNode("div", _hoisted_11, [
                                                  vue.withDirectives(vue.createVNode(_component_q_btn, {
                                                    label: "Close",
                                                    class: "text-capitalize",
                                                    color: "primary",
                                                    flat: ""
                                                  }, null, 512), [
                                                    [_directive_close_popup]
                                                  ])
                                                ])
                                              ]; }),
                                              _: 2
                                            }, 1032, ["modelValue", "onUpdate:modelValue"])
                                          ]; }),
                                          _: 2
                                        }, 1536)
                                      ]; }),
                                      _: 2
                                    }, 1024),
                                    (_ctx.filter_data[col.field].from!='')
                                      ? (vue.openBlock(), vue.createBlock(_component_q_icon, {
                                          key: 0,
                                          name: "cancel",
                                          onClick: vue.withModifiers(function ($event) { return (_ctx.filter_data[col.field] = {'from': '', 'to': ''}); }, ["stop"]),
                                          class: "cursor-pointer"
                                        }, null, 8, ["onClick"]))
                                      : vue.createCommentVNode("", true)
                                  ]; }),
                                  _: 2
                                }, 1032, ["model-value"]))
                              : vue.createCommentVNode("", true),
                            (col.hasOwnProperty('filter_type') && col.filter_type=='number_range')
                              ? (vue.openBlock(), vue.createBlock(_component_q_input, {
                                  key: 3,
                                  dense: "",
                                  color: "teal",
                                  class: "q-pl-xs q-pr-xs",
                                  filled: "",
                                  "model-value": _ctx.filter_data[col.field].from+(typeof _ctx.filter_data[col.field].from!='string'?'-':'')+_ctx.filter_data[col.field].to
                                }, {
                                  append: vue.withCtx(function () { return [
                                    vue.createVNode(_component_q_icon, {
                                      name: "tag",
                                      class: "cursor-pointer"
                                    }, {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_popup_proxy, {
                                          ref_for: true,
                                          ref: "qDateProxy",
                                          cover: "",
                                          class: "row q-pa-sm",
                                          "transition-show": "scale",
                                          "transition-hide": "scale"
                                        }, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_input, {
                                              label: "From",
                                              type: "number",
                                              color: "teal",
                                              modelValue: _ctx.filter_data[col.field].from,
                                              "onUpdate:modelValue": function ($event) { return ((_ctx.filter_data[col.field].from) = $event); },
                                              modelModifiers: { number: true },
                                              class: "q-pl-xs q-pr-xs",
                                              filled: ""
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                            vue.createVNode(_component_q_input, {
                                              label: "To",
                                              type: "number",
                                              color: "teal",
                                              modelValue: _ctx.filter_data[col.field].to,
                                              "onUpdate:modelValue": function ($event) { return ((_ctx.filter_data[col.field].to) = $event); },
                                              modelModifiers: { number: true },
                                              class: "q-pl-xs q-pr-xs",
                                              filled: ""
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]; }),
                                          _: 2
                                        }, 1536)
                                      ]; }),
                                      _: 2
                                    }, 1024),
                                    (typeof _ctx.filter_data[col.field].from!='string')
                                      ? (vue.openBlock(), vue.createBlock(_component_q_icon, {
                                          key: 0,
                                          name: "cancel",
                                          onClick: vue.withModifiers(function ($event) { return (_ctx.filter_data[col.field] = {'from': '', 'to': ''}); }, ["stop"]),
                                          class: "cursor-pointer"
                                        }, null, 8, ["onClick"]))
                                      : vue.createCommentVNode("", true)
                                  ]; }),
                                  _: 2
                                }, 1032, ["model-value"]))
                              : vue.createCommentVNode("", true)
                          ]; }),
                          _: 2
                        }, 1024))
                      }), 128))
                    ]; }),
                    _: 2
                  }, 1032, ["props"]))
                : vue.createCommentVNode("", true)
            ]; }),
            body: vue.withCtx(function (props) { return [
              (!_ctx.hasDefaultSlot)
                ? (vue.openBlock(), vue.createBlock(_component_q_tr, {
                    key: 0,
                    props: props,
                    onClick: function ($event) { return (_ctx.rowClick(props.row)); }
                  }, {
                    default: vue.withCtx(function () { return [
                      (_ctx.selection_prop!='none')
                        ? (vue.openBlock(), vue.createBlock(_component_q_td, { key: 0 }, {
                            default: vue.withCtx(function () { return [
                              vue.createVNode(_component_q_checkbox, {
                                color: "primary",
                                modelValue: props.selected,
                                "onUpdate:modelValue": function ($event) { return ((props.selected) = $event); }
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]; }),
                            _: 2
                          }, 1024))
                        : vue.createCommentVNode("", true),
                      (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.cols, function (col, col_index) {
                        return (vue.openBlock(), vue.createBlock(_component_q_td, {
                          key: col.name,
                          props: props
                        }, {
                          default: vue.withCtx(function () { return [
                            (_ctx.groupby_filter && _ctx.selected_group_by_filed.value!='' && col_index==0)
                              ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                                  key: 0,
                                  size: "sm",
                                  color: "accent",
                                  round: "",
                                  dense: "",
                                  onClick: function ($event) { return (props.expand = !props.expand); },
                                  class: "q-mr-sm",
                                  icon: props.expand ? 'remove' : 'add'
                                }, null, 8, ["onClick", "icon"]))
                              : vue.createCommentVNode("", true),
                            vue.createTextVNode(" " + vue.toDisplayString(props.row[col.field]), 1)
                          ]; }),
                          _: 2
                        }, 1032, ["props"]))
                      }), 128))
                    ]; }),
                    _: 2
                  }, 1032, ["props", "onClick"]))
                : vue.createCommentVNode("", true),
              (_ctx.groupby_filter &&  _ctx.selected_group_by_filed.value!='')
                ? vue.withDirectives((vue.openBlock(), vue.createBlock(_component_q_tr, {
                    key: 1,
                    props: props
                  }, {
                    default: vue.withCtx(function () { return [
                      vue.createVNode(_component_q_td, { colspan: 2 }, {
                        default: vue.withCtx(function () { return [
                          vue.createVNode(_component_q_table, {
                            rows: _ctx.sub_grouped_data[props.row.name],
                            columns: _ctx.columns,
                            "row-key": _ctx.row_key?_ctx.row_key:'name',
                            pagination: _ctx.group_pagination,
                            "hide-bottom": ""
                          }, {
                            default: vue.withCtx(function () { return [
                              vue.createVNode(_component_q_tr, {
                                slot: "header",
                                "slot-scope": "props"
                              }, {
                                default: vue.withCtx(function () { return [
                                  (_ctx.col.field!=_ctx.selected_group_by_filed)
                                    ? (vue.openBlock(true), vue.createElementBlock(vue.Fragment, { key: 0 }, vue.renderList(props.cols, function (col) {
                                        return (vue.openBlock(), vue.createBlock(_component_q_th, {
                                          key: col.name,
                                          props: props
                                        }, {
                                          default: vue.withCtx(function () { return [
                                            vue.createTextVNode(vue.toDisplayString(col.label), 1)
                                          ]; }),
                                          _: 2
                                        }, 1032, ["props"]))
                                      }), 128))
                                    : vue.createCommentVNode("", true)
                                ]; }),
                                _: 2
                              }, 1024),
                              vue.createElementVNode("template", _hoisted_12, [
                                vue.createVNode(_component_q_tr, { props: props }, {
                                  default: vue.withCtx(function () { return [
                                    (_ctx.col.field!=_ctx.selected_group_by_filed)
                                      ? (vue.openBlock(true), vue.createElementBlock(vue.Fragment, { key: 0 }, vue.renderList(props.cols, function (col) {
                                          return (vue.openBlock(), vue.createBlock(_component_q_td, {
                                            key: col.name,
                                            props: props
                                          }, {
                                            default: vue.withCtx(function () { return [
                                              vue.createTextVNode(vue.toDisplayString(props.row[col.field]), 1)
                                            ]; }),
                                            _: 2
                                          }, 1032, ["props"]))
                                        }), 128))
                                      : vue.createCommentVNode("", true)
                                  ]; }),
                                  _: 2
                                }, 1032, ["props"])
                              ])
                            ]; }),
                            _: 2
                          }, 1032, ["rows", "columns", "row-key", "pagination"])
                        ]; }),
                        _: 2
                      }, 1024)
                    ]; }),
                    _: 2
                  }, 1032, ["props"])), [
                    [vue.vShow, props.expand]
                  ])
                : vue.createCommentVNode("", true),
              (_ctx.hasDefaultSlot)
                ? vue.renderSlot(_ctx.$slots, "body", {
                    key: 2,
                    row: props.row
                  })
                : vue.createCommentVNode("", true)
            ]; }),
            _: 2
          }, [
            (_ctx.excel_download || _ctx.csv_download || _ctx.fullscreen || _ctx.global_search)
              ? {
                  name: "top-right",
                  fn: vue.withCtx(function (props) { return [
                    (_ctx.global_search)
                      ? (vue.openBlock(), vue.createBlock(_component_q_input, {
                          key: 0,
                          filled: "",
                          borderless: "",
                          dense: "",
                          debounce: "300",
                          modelValue: _ctx.filter,
                          "onUpdate:modelValue": _cache[10] || (_cache[10] = function ($event) { return ((_ctx.filter) = $event); }),
                          class: "q-mr-md",
                          placeholder: "Search"
                        }, {
                          append: vue.withCtx(function () { return [
                            vue.createVNode(_component_q_icon, { name: "search" })
                          ]; }),
                          _: 1
                        }, 8, ["modelValue"]))
                      : vue.createCommentVNode("", true),
                    (_ctx.excel_download)
                      ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                          key: 1,
                          class: "bg-grey-2 q-mr-sm",
                          icon: "fas fa-file-excel",
                          "no-caps": "",
                          onClick: _cache[11] || (_cache[11] = function ($event) { return (_ctx.exportTable('xlsx')); })
                        }))
                      : vue.createCommentVNode("", true),
                    (_ctx.csv_download)
                      ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                          key: 2,
                          class: "bg-primary text-white",
                          icon: "fas fa-file-csv",
                          "no-caps": "",
                          onClick: _cache[12] || (_cache[12] = function ($event) { return (_ctx.exportTable('csv')); })
                        }))
                      : vue.createCommentVNode("", true),
                    (_ctx.groupby_filter)
                      ? (vue.openBlock(), vue.createBlock(_component_q_select, {
                          key: 3,
                          class: "q-mr-sm q-ml-sm",
                          outlined: "",
                          dense: "",
                          modelValue: _ctx.selected_group_by_filed,
                          "onUpdate:modelValue": _cache[13] || (_cache[13] = function ($event) { return ((_ctx.selected_group_by_filed) = $event); }),
                          options: _ctx.gorupby_option,
                          style: {"width":"150px"}
                        }, null, 8, ["modelValue", "options"]))
                      : vue.createCommentVNode("", true),
                    (_ctx.fullscreen)
                      ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                          key: 4,
                          flat: "",
                          round: "",
                          class: "q-ml-sm",
                          dense: "",
                          icon: props.inFullscreen ? 'fullscreen_exit' : 'fullscreen',
                          onClick: props.toggleFullscreen
                        }, {
                          default: vue.withCtx(function () { return [
                            vue.withDirectives((vue.openBlock(), vue.createBlock(_component_q_tooltip, {
                              disable: _ctx.$q.platform.is.mobile
                            }, {
                              default: vue.withCtx(function () { return [
                                vue.createTextVNode(vue.toDisplayString(props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'), 1)
                              ]; }),
                              _: 2
                            }, 1032, ["disable"])), [
                              [_directive_close_popup]
                            ])
                          ]; }),
                          _: 2
                        }, 1032, ["icon", "onClick"]))
                      : vue.createCommentVNode("", true)
                  ]; })
                }
              : undefined,
            (_ctx.$slots['loading'])
              ? {
                  name: "loading",
                  fn: vue.withCtx(function () { return [
                    vue.renderSlot(_ctx.$slots, "loading")
                  ]; })
                }
              : undefined
          ]), 1032, ["id", "loading", "rows", "columns", "row-key", "class", "visible-columns", "separator", "dense", "dark", "flat", "bordered", "square", "selection", "selected", "filter", "pagination", "onRequest"]))
    ]))
  }

  script.render = render;

  var name = "quasar-ui-qgrid";
  var version$1 = "1.0.18";
  var author = "pratikpatelpp802@gmail.com";
  var description = "QGrid";
  var license = "MIT";
  var module$1 = "dist/index.esm.js";
  var main = "dist/index.common.js";
  var scripts = {
  	dev: "cd dev && yarn dev && cd ..",
  	"dev:umd": "yarn build && node build/script.open-umd.js",
  	"dev:ssr": "cd dev && yarn 'dev:ssr' && cd ..",
  	"dev:ios": "cd dev && yarn 'dev:ios' && cd ..",
  	"dev:android": "cd dev && yarn 'dev:android' && cd ..",
  	"dev:electron": "cd dev && yarn 'dev:electron' && cd ..",
  	build: "node build/index.js",
  	"build:js": "node build/script.javascript.js"
  };
  var repository = {
  	type: "git",
  	url: ""
  };
  var dependencies = {
  	"@vue/compiler-sfc": "^3.1.4",
  	moment: "^2.29.2",
  	"moment-range": "^4.0.2",
  	"rollup-plugin-vue": "^6.0.0",
  	sortablejs: "^1.10.2"
  };
  var bugs = "";
  var homepage = "";
  var devDependencies = {
  	"@rollup/plugin-buble": "^0.21.3",
  	"@rollup/plugin-json": "^4.0.0",
  	"@rollup/plugin-node-resolve": "^11.2.1",
  	"@rollup/plugin-replace": "^2.4.2",
  	chalk: "^4.1.0",
  	"fs-extra": "^8.1.0",
  	open: "^7.3.0",
  	quasar: "^2.6.6",
  	rimraf: "^3.0.0",
  	rollup: "^2.45.0",
  	"uglify-js": "^3.13.3",
  	zlib: "^1.0.5"
  };
  var browserslist = [
  	"last 4 Chrome versions",
  	"last 4 Firefox versions",
  	"last 2 Edge versions",
  	"last 4 Safari versions",
  	"last 4 Android versions",
  	"last 4 ChromeAndroid versions",
  	"last 4 FirefoxAndroid versions",
  	"last 4 iOS versions"
  ];
  var pkg = {
  	name: name,
  	version: version$1,
  	author: author,
  	description: description,
  	license: license,
  	module: module$1,
  	main: main,
  	scripts: scripts,
  	repository: repository,
  	dependencies: dependencies,
  	bugs: bugs,
  	homepage: homepage,
  	devDependencies: devDependencies,
  	browserslist: browserslist
  };

  var version = pkg.version;

  function install (app) {
    app.component(script.name, script);
  }

  var VuePlugin = /*#__PURE__*/Object.freeze({
    __proto__: null,
    version: version,
    QGrid: script,
    install: install
  });

  return VuePlugin;

})));
