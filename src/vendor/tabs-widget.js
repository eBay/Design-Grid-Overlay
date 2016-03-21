(function ($, window, document, undefined) {

    var pluginName = 'jquery-common-keydown';

    var normalizeEvent = function(type, e) {
        return $.Event(type, { originalEvent: e });
    };

    $.fn.commonKeyDown = function keyDown() {

        return this.each(function onEach() {

            // check element does not already have this plugin
            if (!$.data(this, pluginName)) {

                jQuery.data(this, pluginName, 'true');

                var $this = $(this),
                    keyCodes = $.fn.commonKeyDown.keyCodes;

                var onKeyDown = function(e) {
                    switch(e.keyCode) {
                        case keyCodes.ENTER:
                            $this.trigger(normalizeEvent('enterKeyDown', e));
                            /* istanbul ignore next */
                            break;
                        case keyCodes.ESCAPE:
                            $this.trigger(normalizeEvent('escapeKeyDown', e));
                            /* istanbul ignore next */
                            break;
                        case keyCodes.SPACE:
                            $this.trigger(normalizeEvent('spaceKeyDown', e));
                            /* istanbul ignore next */
                            break;
                        case keyCodes.PAGEUP:
                            $this.trigger(normalizeEvent('pageUpKeyDown', e));
                            /* istanbul ignore next */
                            break;
                        case keyCodes.PAGEDOWN:
                            $this.trigger(normalizeEvent('pageDownKeyDown', e));
                            /* istanbul ignore next */
                            break;
                        case keyCodes.END:
                            $this.trigger(normalizeEvent('endKeyDown', e));
                            /* istanbul ignore next */
                            break;
                        case keyCodes.HOME:
                            $this.trigger(normalizeEvent('homeKeyDown', e));
                            /* istanbul ignore next */
                            break;
                        case keyCodes.LEFTARROW:
                            $this.trigger(normalizeEvent('leftArrowKeyDown', e));
                            /* istanbul ignore next */
                            break;
                        case keyCodes.UPARROW:
                            $this.trigger(normalizeEvent('upArrowKeyDown', e));
                            /* istanbul ignore next */
                            break;
                        case keyCodes.RIGHTARROW:
                            $this.trigger(normalizeEvent('rightArrowKeyDown', e));
                            /* istanbul ignore next */
                            break;
                        case keyCodes.DOWNARROW:
                            $this.trigger(normalizeEvent('downArrowKeyDown', e));
                            /* istanbul ignore next */
                            break;
                        /* istanbul ignore next */
                        default:
                            break;
                    }
                };

                $this.on('keydown', onKeyDown);
            }
        });
    };

    $.fn.commonKeyDown.keyCodes = {
        ENTER: 13,
        ESCAPE: 27,
        SPACE: 32,
        PAGEUP: 33,
        PAGEDOWN: 34,
        END: 35,
        HOME: 36,
        LEFTARROW: 37,
        UPARROW: 38,
        RIGHTARROW: 39,
        DOWNARROW: 40
    };

}(jQuery, window, document));

(function ($, window, document, undefined) {

    $.fn.rovingTabindex = function rovingTabindex(id, options) {

        options = options || {};

        var wrap = options.wrap,
            axis = options.axis,
            activeIndex = options.activeIndex || 0,
            $collection = this;

        $(this).eq(activeIndex).attr('tabindex', '0');

        return this.each(function onEach(i) {

            var $this = $(this);

            $this.commonKeyDown();

            // store collection index pos in element dataset
            $this.eq(0).data(id, {"rovingtabindex": i++});

            if (axis === 'x') {
                $this.on('leftArrowKeyDown', function onLeftArrowKey() {
                    $this.trigger('prevRovingTabindex');
                });

                $this.on('rightArrowKeyDown', function onRightArrowKey() {
                    $this.trigger('nextRovingTabindex');
                });
            }
            else if (axis === 'y') {
                $this.on('downArrowKeyDown', function onDownArrowKey() {
                    $this.trigger('nextRovingTabindex');
                });

                $this.on('upArrowKeyDown', function onUpArrowKey() {
                    $this.trigger('prevRovingTabindex');
                });
            }
            else {
                $this.on('leftArrowKeyDown upArrowKeyDown', function onLeftOrUpArrowKey() {
                    $this.trigger('prevRovingTabindex');
                });

                $this.on('rightArrowKeyDown downArrowKeyDown', function onRightOrDownArrowKey() {
                    $this.trigger('nextRovingTabindex');
                });
            }

            $this.on('prevRovingTabindex', function onPrev(e) {
                var itemIdx = $this.data(id).rovingtabindex,
                    $prevEl = $collection.eq(itemIdx - 1),
                    hasPrevEl = $prevEl.length === 1,
                    $lastEl = $collection.eq($collection.length-1),
                    $roveToEl = (hasPrevEl && itemIdx !== 0) ? $prevEl : (options.wrap !== false) ? $lastEl : $this;

                $this.attr('tabindex', '-1');
                $roveToEl.attr('tabindex', '0');
                $this.trigger('rovingTabindexChange', $roveToEl);
            });

            $this.on('nextRovingTabindex', function onNext(e) {
                var itemIdx = $this.data(id).rovingtabindex,
                    $nextEl = $collection.eq(itemIdx + 1),
                    hasNextEl = $nextEl.length === 1,
                    $firstEl = $collection.eq(0),
                    $roveToEl = (hasNextEl) ? $nextEl : (options.wrap !== false) ? $firstEl: $this;

                $this.attr('tabindex', '-1');
                $roveToEl.attr('tabindex', '0');
                $this.trigger('rovingTabindexChange', $roveToEl);
            });

        });
    };

}(jQuery, window, document));

(function ($, window, document, undefined) {
    var _nextInSequenceMap = {};

    $.fn.nextId = function nextId(prefix) {
        prefix = prefix || $.fn.nextId.defaults.prefix;

        // initialise prefix in sequence map if necessary
        _nextInSequenceMap[prefix] = _nextInSequenceMap[prefix] || 0;

        return this.filter(function onFilter() {
            return !this.id;
        })
        .each(function onEach() {
            $(this).prop('id', prefix + $.fn.nextId.defaults.separator + _nextInSequenceMap[prefix]++);
        });
    };

}(jQuery, window, document));

$.fn.nextId.defaults = {
    prefix: 'nid',
    separator: '-'
};

(function ( $ ) {

    $.fn.tabs = function tabs (options) {

        var options = options || {};

        return this.each(function onEach() {

            var $tabsWidget = $(this),
                $tablist = $tabsWidget.find('> ul:first-child, > ol:first-child, > div:first-child'),
                $tabs = $tablist.find('> li, > div'),
                $links = $tablist.find('a'),
                $panelcontainer = $tabsWidget.find('> div:last-child'),
                $panels = $panelcontainer.find('> div'),
                $panelHeadings = $panels.find('> h2:first-child, > h3:first-child');

            // set a unique widget id
            $tabsWidget.nextId('tabs');

            // add required ARIA roles, states and properties
            // first tabpanel is selected by default
            $tablist
                .attr('role', 'tablist');

            $tabs
                .attr('role', 'tab')
                .attr('aria-selected', 'false')
                .first()
                    .attr('aria-selected', 'true');

            $panels
                .attr('role', 'tabpanel')
                .attr('aria-hidden', 'true')
                .first()
                    .attr('aria-hidden', 'false');

            $panelHeadings.attr('aria-hidden', 'true');

            // remove hyperlink behaviour from links
            $links
                .attr('role', 'presentation')
                .removeAttr('href');

            if (options.livePanels === true) {
                $panelcontainer.attr('aria-live', 'polite');
            }

            // all panels are labelled and controlled by their respective tab
            $tabs.each(function onEachTab(idx, el) {
                var $tab = $(el),
                    tabId = $tabsWidget.attr('id') + '-tab-' + idx,
                    panelId = $tabsWidget.attr('id') + '-panel-' + idx;

                $tab
                    .attr('id', tabId)
                    .attr('aria-controls', panelId);

                $panels.eq(idx)
                    .attr('id', panelId)
                    .attr('aria-labelledby', tabId);
            });

            $tabs.on('click', function(e) {
                $tabsWidget.trigger('select', $(this));
            });

            // Create a roving tab index on tabs
            $tabs.rovingTabindex($tabsWidget.prop('id'));

            $tabsWidget.on('select rovingTabindexChange', function(e, selectedTab) {
                var $selectedTab = $(selectedTab),
                    $activeTab = $tablist.find('[aria-selected=true]'),
                    $activePanel = $panelcontainer.find('[aria-labelledby={0}]'.replace('{0}', $activeTab.attr('id'))),
                    $selectedPanel = $panelcontainer.find('[aria-labelledby={0}]'.replace('{0}', $selectedTab.attr('id')));

                if ($selectedTab[0] !== $activeTab[0]) {
                    $activePanel.attr('aria-hidden', 'true');
                    $selectedPanel.attr('aria-hidden', 'false');

                    $selectedTab.attr('aria-selected', 'true');

                    // update keyboard focus on next tick
                    setTimeout(function onTimeout() {
                        $selectedTab.focus();
                        // deselect activeTab last to prevent focus issues
                        $activeTab.attr('aria-selected', 'false');
                    }, 0);
                }
            });

            // call plugin to prevent page scroll
            $('.tabs [role=tab]').preventDocumentScrollKeys();

            // mark widget as initialised
            $tabsWidget.addClass('tabs--js');
        });
    };
}( jQuery ));


$('.tabs').tabs();