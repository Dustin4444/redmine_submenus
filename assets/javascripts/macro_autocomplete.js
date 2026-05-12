(function () {
  'use strict';

  var MACROS = [];

  // ── Dropdown element (shared, one per page) ─────────────────────────────────

  var dropdown = null;
  var activeTextarea = null;
  var selectedIndex = -1;

  function createDropdown() {
    var el = document.createElement('div');
    el.id = 'macro-autocomplete';
    el.setAttribute('role', 'listbox');
    el.style.display = 'none';
    document.body.appendChild(el);

    el.addEventListener('mousedown', function (e) {
      // prevent textarea blur on click
      e.preventDefault();
    });

    return el;
  }

  // ── Attach to a textarea ────────────────────────────────────────────────────

  function attach(textarea) {
    textarea.addEventListener('input', onInput);
    textarea.addEventListener('keydown', onKeydown);
    textarea.addEventListener('blur', function () {
      // small delay so click on dropdown item fires first
      setTimeout(hide, 150);
    });
    textarea.addEventListener('click', onInput);
  }

  function onInput() {
    activeTextarea = this;
    var query = getQuery(this);
    if (query === null) { hide(); return; }
    render(query);
  }

  // ── Query extraction ────────────────────────────────────────────────────────

  function getQuery(textarea) {
    var before = textarea.value.substring(0, textarea.selectionStart);
    var m = before.match(/\{\{(\w*)$/);
    return m ? m[1].toLowerCase() : null;
  }

  // ── Rendering ───────────────────────────────────────────────────────────────

  function render(query) {
    var filtered = MACROS.filter(function (m) {
      return m.name.indexOf(query) === 0;
    });

    if (filtered.length === 0) { hide(); return; }

    dropdown.innerHTML = filtered.map(function (m, i) {
      return '<div class="mac-item" role="option" data-macro="' + esc(m.name) + '">' +
               '<span class="mac-name">{{' + esc(m.name) + '}}</span>' +
               (m.desc ? '<span class="mac-desc">' + esc(truncate(m.desc, 72)) + '</span>' : '') +
             '</div>';
    }).join('');

    dropdown.querySelectorAll('.mac-item').forEach(function (item) {
      item.addEventListener('mousedown', function (e) {
        e.preventDefault();
        insertMacro(activeTextarea, this.dataset.macro);
        hide();
        activeTextarea.focus();
      });
    });

    selectedIndex = -1;
    position(activeTextarea);
    dropdown.style.display = 'block';
  }

  // ── Keyboard handling ───────────────────────────────────────────────────────

  function onKeydown(e) {
    if (dropdown.style.display === 'none') return;

    var items = dropdown.querySelectorAll('.mac-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateHighlight(items);

    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateHighlight(items);

    } else if (e.key === 'Tab' || e.key === 'Enter') {
      var target = selectedIndex >= 0 ? items[selectedIndex]
                 : items.length === 1  ? items[0]
                 : null;
      if (target) {
        e.preventDefault();
        insertMacro(this, target.dataset.macro);
        hide();
      }

    } else if (e.key === 'Escape') {
      e.preventDefault();
      hide();
    }
  }

  function updateHighlight(items) {
    items.forEach(function (item, i) {
      item.classList.toggle('mac-selected', i === selectedIndex);
      item.setAttribute('aria-selected', i === selectedIndex ? 'true' : 'false');
    });
    if (items[selectedIndex]) {
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  // ── Macro insertion ─────────────────────────────────────────────────────────

  function insertMacro(textarea, name) {
    var val   = textarea.value;
    var pos   = textarea.selectionStart;
    var before = val.substring(0, pos);
    var after  = val.substring(pos);

    var m = before.match(/\{\{(\w*)$/);
    if (!m) return;

    var start   = pos - m[0].length;
    var snippet = '{{' + name + '}}';
    textarea.value = before.substring(0, start) + snippet + after;

    var newPos = start + snippet.length;
    textarea.selectionStart = textarea.selectionEnd = newPos;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ── Positioning (mirror-div technique) ──────────────────────────────────────

  function position(textarea) {
    var cursorPos = measureCursorOffset(textarea);
    var taRect    = textarea.getBoundingClientRect();
    var scrollX   = window.pageXOffset;
    var scrollY   = window.pageYOffset;

    var left = taRect.left + scrollX + cursorPos.left;
    var top  = taRect.top  + scrollY + cursorPos.top + cursorPos.lineHeight + 2;

    // keep within viewport horizontally
    var maxLeft = scrollX + window.innerWidth - 360;
    left = Math.min(left, maxLeft);

    dropdown.style.left = left + 'px';
    dropdown.style.top  = top  + 'px';
  }

  function measureCursorOffset(textarea) {
    var style = window.getComputedStyle(textarea);

    var mirror = document.createElement('div');
    var props  = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
                  'letterSpacing', 'lineHeight', 'textTransform',
                  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
                  'boxSizing', 'wordWrap', 'overflowWrap', 'whiteSpace'];
    props.forEach(function (p) { mirror.style[p] = style[p]; });

    mirror.style.position   = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.top        = '-9999px';
    mirror.style.left       = '-9999px';
    mirror.style.width      = textarea.clientWidth + 'px';
    mirror.style.height     = 'auto';
    mirror.style.overflow   = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';

    var textBefore = textarea.value.substring(0, textarea.selectionStart);
    // replace plain text node
    mirror.textContent = textBefore;

    var cursor = document.createElement('span');
    cursor.textContent = '​'; // zero-width space
    mirror.appendChild(cursor);

    document.body.appendChild(mirror);

    var lineHeight = parseInt(style.lineHeight) || parseInt(style.fontSize) + 4;
    var result = {
      left:       cursor.offsetLeft - textarea.scrollLeft,
      top:        cursor.offsetTop  - textarea.scrollTop,
      lineHeight: lineHeight
    };

    document.body.removeChild(mirror);
    return result;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function hide() {
    dropdown.style.display = 'none';
    selectedIndex = -1;
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function truncate(str, len) {
    return str.length > len ? str.substring(0, len) + '…' : str;
  }

  // ── Init ────────────────────────────────────────────────────────────────────

  function init() {
    MACROS = (window.REDMINE_MACROS || []);
    console.log('[SubMenus] macro autocomplete loaded, macros:', MACROS.length, ', textareas:', document.querySelectorAll('textarea.wiki-edit').length);
    if (MACROS.length === 0) return;

    dropdown = createDropdown();

    document.querySelectorAll('textarea.wiki-edit').forEach(attach);

    // Also watch for dynamically added textareas (e.g. inline edit)
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches('textarea.wiki-edit')) {
            attach(node);
          }
          node.querySelectorAll && node.querySelectorAll('textarea.wiki-edit').forEach(attach);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
