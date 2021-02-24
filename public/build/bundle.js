
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.32.3 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 32) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$base,
    		$location,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.32.3 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 532) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.32.3 */
    const file = "node_modules\\svelte-routing\\src\\Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(13, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(14, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("to" in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ("replace" in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ("state" in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ("getProps" in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ("$$scope" in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("to" in $$props) $$invalidate(7, to = $$new_props.to);
    		if ("replace" in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ("state" in $$props) $$invalidate(9, state = $$new_props.state);
    		if ("getProps" in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$new_props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(11, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(12, isCurrent = $$new_props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$new_props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 8320) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 16385) {
    			$$invalidate(11, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 16385) {
    			$$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 23553) {
    			$$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$base,
    		$location,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const BASE_URL = "https://coding-challenge-api.aerolab.co/";
    const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDM0NTQ5YzdlNzE4NzAwMjBlMzhmMTIiLCJpYXQiOjE2MTQwNDIyNjh9.l1973GUNztJ4EEjyWIgFjqKfOmmQforpiQ9kBtBI4BA";
    const HEADER = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + TOKEN
    };
    var api = {
        getUser: () => fetch(BASE_URL + "user/me", {
            method: 'get',
            headers: HEADER
        }).then(res => res.json()),
        getProducts: () => fetch(BASE_URL + "products", {
            method: 'get',
            headers: HEADER
        }).then(res => res.json()),
        redeemProduct: (productId) => fetch(BASE_URL + "redeem", {
            body: JSON.stringify({ productId: productId }),
            method: 'post',
            headers: HEADER
        }).then(res => res.json()),
        getHistory: () => fetch(BASE_URL + 'user/history', {
            method: 'get',
            headers: HEADER
        }).then(res => res.json())
    };

    /* src\Pages\History.svelte generated by Svelte v3.32.3 */
    const file$1 = "src\\Pages\\History.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (28:2) <Link to="/">
    function create_default_slot_1(ctx) {
    	let svg;
    	let title;
    	let t0;
    	let desc;
    	let t1;
    	let defs;
    	let linearGradient;
    	let stop0;
    	let stop1;
    	let g2;
    	let g1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text("logo");
    			desc = svg_element("desc");
    			t1 = text("Created with Sketch.");
    			defs = svg_element("defs");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			add_location(title, file$1, 30, 4, 1456);
    			add_location(desc, file$1, 31, 4, 1481);
    			attr_dev(stop0, "stop-color", "#FF8800");
    			attr_dev(stop0, "offset", "0%");
    			add_location(stop0, file$1, 34, 6, 1615);
    			attr_dev(stop1, "stop-color", "#FF6600");
    			attr_dev(stop1, "offset", "100%");
    			add_location(stop1, file$1, 35, 6, 1669);
    			attr_dev(linearGradient, "x1", "50%");
    			attr_dev(linearGradient, "y1", "0%");
    			attr_dev(linearGradient, "x2", "50%");
    			attr_dev(linearGradient, "y2", "100%");
    			attr_dev(linearGradient, "id", "linearGradient-1");
    			add_location(linearGradient, file$1, 33, 5, 1533);
    			add_location(defs, file$1, 32, 4, 1520);
    			attr_dev(path, "d", "M46.868244,16.404544 C46.6405958,16.0177278 46.1363003,15.8851051 45.7421767,16.1085325 L32.2482382,23.7546496 C31.9411566,23.9287916 31.7816812,24.2764781 31.8528973,24.6175933 L36.3942582,46.3988127 C36.4161301,46.5037148 36.370779,46.6585782 36.3020649,46.734636 L35.7503076,47.3453612 C34.6032406,48.615134 33.631475,49.3030396 31.7844202,49.3030396 C29.7133694,49.3030396 28.7409951,48.2316035 27.2013263,46.3378469 C25.3624888,44.0763908 23.0744418,41.2620414 17.5113649,41.2620414 L17.3738021,41.2620414 C16.6150762,41.2620414 16,41.8657137 16,42.6103723 C16,43.3550308 16.6150762,43.9587031 17.3738021,43.9587031 L17.5113649,43.9587031 C21.7514649,43.9587031 23.3553499,45.9313165 25.0535812,48.0198254 C26.5704243,49.8855042 28.2896551,52 31.7844202,52 C34.8013676,52 36.461556,50.6226953 37.8061413,49.134573 L42.7657069,43.6456657 C42.7657069,43.645367 54.5617185,30.5894981 54.5617185,30.5894981 C54.7969752,30.3290319 54.8362354,29.9499819 54.6588037,29.6482951 L46.868244,16.404544 Z");
    			attr_dev(path, "id", "logo");
    			add_location(path, file$1, 41, 7, 1966);
    			attr_dev(g0, "id", "top");
    			add_location(g0, file$1, 40, 6, 1945);
    			attr_dev(g1, "id", "Catalog");
    			attr_dev(g1, "transform", "translate(-16.000000, -16.000000)");
    			attr_dev(g1, "fill", "url(#linearGradient-1)");
    			add_location(g1, file$1, 39, 5, 1845);
    			attr_dev(g2, "id", "Page-1");
    			attr_dev(g2, "stroke", "none");
    			attr_dev(g2, "stroke-width", "1");
    			attr_dev(g2, "fill", "none");
    			attr_dev(g2, "fill-rule", "evenodd");
    			add_location(g2, file$1, 38, 4, 1760);
    			attr_dev(svg, "width", "39px");
    			attr_dev(svg, "height", "36px");
    			attr_dev(svg, "viewBox", "0 0 39 36");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg, file$1, 28, 3, 1222);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(svg, desc);
    			append_dev(desc, t1);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    			append_dev(svg, g2);
    			append_dev(g2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(28:2) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (89:2) {#if _user}
    function create_if_block_2(ctx) {
    	let p;
    	let t_value = /*_user*/ ctx[0].points + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$1, 89, 3, 6121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*_user*/ 1 && t_value !== (t_value = /*_user*/ ctx[0].points + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(89:2) {#if _user}",
    		ctx
    	});

    	return block;
    }

    // (94:2) {#if _user}
    function create_if_block_1$1(ctx) {
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: "history",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};

    			if (dirty & /*$$scope, _user*/ 65) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(94:2) {#if _user}",
    		ctx
    	});

    	return block;
    }

    // (95:2) <Link to="history">
    function create_default_slot(ctx) {
    	let t_value = /*_user*/ ctx[0].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*_user*/ 1 && t_value !== (t_value = /*_user*/ ctx[0].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(95:2) <Link to=\\\"history\\\">",
    		ctx
    	});

    	return block;
    }

    // (112:1) {#if historyProducts}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*historyProducts*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*historyProducts*/ 2) {
    				each_value = /*historyProducts*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(112:1) {#if historyProducts}",
    		ctx
    	});

    	return block;
    }

    // (113:8) {#each historyProducts as product}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let span0;
    	let t1_value = /*product*/ ctx[3].name + "";
    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*product*/ ctx[3].category + "";
    	let t3;
    	let t4;
    	let span2;
    	let t5_value = /*product*/ ctx[3].cost + "";
    	let t5;
    	let t6;
    	let span3;
    	let t7_value = /*product*/ ctx[3].createDate + "";
    	let t7;
    	let t8;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			span2 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			span3 = element("span");
    			t7 = text(t7_value);
    			t8 = space();
    			if (img.src !== (img_src_value = /*product*/ ctx[3].img.url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*product*/ ctx[3].name);
    			attr_dev(img, "class", "svelte-124dikt");
    			add_location(img, file$1, 115, 5, 6762);
    			attr_dev(div0, "class", "product-info svelte-124dikt");
    			add_location(div0, file$1, 114, 4, 6727);
    			attr_dev(span0, "class", "product-info svelte-124dikt");
    			add_location(span0, file$1, 117, 4, 6826);
    			attr_dev(span1, "class", "product-info svelte-124dikt");
    			add_location(span1, file$1, 118, 4, 6880);
    			attr_dev(span2, "class", "product-info svelte-124dikt");
    			add_location(span2, file$1, 119, 4, 6938);
    			attr_dev(span3, "class", "product-info svelte-124dikt");
    			add_location(span3, file$1, 120, 4, 6992);
    			attr_dev(div1, "class", "product svelte-124dikt");
    			add_location(div1, file$1, 113, 12, 6700);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div1, t0);
    			append_dev(div1, span0);
    			append_dev(span0, t1);
    			append_dev(div1, t2);
    			append_dev(div1, span1);
    			append_dev(span1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, span2);
    			append_dev(span2, t5);
    			append_dev(div1, t6);
    			append_dev(div1, span3);
    			append_dev(span3, t7);
    			append_dev(div1, t8);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*historyProducts*/ 2 && img.src !== (img_src_value = /*product*/ ctx[3].img.url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*historyProducts*/ 2 && img_alt_value !== (img_alt_value = /*product*/ ctx[3].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*historyProducts*/ 2 && t1_value !== (t1_value = /*product*/ ctx[3].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*historyProducts*/ 2 && t3_value !== (t3_value = /*product*/ ctx[3].category + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*historyProducts*/ 2 && t5_value !== (t5_value = /*product*/ ctx[3].cost + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*historyProducts*/ 2 && t7_value !== (t7_value = /*product*/ ctx[3].createDate + "")) set_data_dev(t7, t7_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(113:8) {#each historyProducts as product}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let header;
    	let h1;
    	let link;
    	let t0;
    	let div0;
    	let svg;
    	let title;
    	let t1;
    	let desc;
    	let t2;
    	let defs;
    	let filter;
    	let feOffset;
    	let feGaussianBlur;
    	let feColorMatrix;
    	let feMerge;
    	let feMergeNode0;
    	let feMergeNode1;
    	let radialGradient;
    	let stop0;
    	let stop1;
    	let g7;
    	let g6;
    	let g5;
    	let g4;
    	let g3;
    	let g2;
    	let g1;
    	let g0;
    	let circle;
    	let path0;
    	let path1;
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let main;
    	let div2;
    	let p;
    	let t7;
    	let div4;
    	let div3;
    	let t9;
    	let span0;
    	let t11;
    	let span1;
    	let t13;
    	let span2;
    	let t15;
    	let span3;
    	let t17;
    	let current;

    	link = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*_user*/ ctx[0] && create_if_block_2(ctx);
    	let if_block1 = /*_user*/ ctx[0] && create_if_block_1$1(ctx);
    	let if_block2 = /*historyProducts*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			create_component(link.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t1 = text("money");
    			desc = svg_element("desc");
    			t2 = text("Created with Sketch.");
    			defs = svg_element("defs");
    			filter = svg_element("filter");
    			feOffset = svg_element("feOffset");
    			feGaussianBlur = svg_element("feGaussianBlur");
    			feColorMatrix = svg_element("feColorMatrix");
    			feMerge = svg_element("feMerge");
    			feMergeNode0 = svg_element("feMergeNode");
    			feMergeNode1 = svg_element("feMergeNode");
    			radialGradient = svg_element("radialGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			g7 = svg_element("g");
    			g6 = svg_element("g");
    			g5 = svg_element("g");
    			g4 = svg_element("g");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			circle = svg_element("circle");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t5 = space();
    			main = element("main");
    			div2 = element("div");
    			p = element("p");
    			p.textContent = "History";
    			t7 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div3.textContent = "Photo";
    			t9 = space();
    			span0 = element("span");
    			span0.textContent = "Name";
    			t11 = space();
    			span1 = element("span");
    			span1.textContent = "Category";
    			t13 = space();
    			span2 = element("span");
    			span2.textContent = "Cost";
    			t15 = space();
    			span3 = element("span");
    			span3.textContent = "Redeem Date";
    			t17 = space();
    			if (if_block2) if_block2.c();
    			add_location(h1, file$1, 26, 1, 1196);
    			add_location(title, file$1, 51, 3, 3312);
    			add_location(desc, file$1, 52, 3, 3337);
    			attr_dev(feOffset, "dx", "2");
    			attr_dev(feOffset, "dy", "2");
    			attr_dev(feOffset, "in", "SourceAlpha");
    			attr_dev(feOffset, "result", "shadowOffsetOuter1");
    			add_location(feOffset, file$1, 55, 5, 3499);
    			attr_dev(feGaussianBlur, "stdDeviation", "2");
    			attr_dev(feGaussianBlur, "in", "shadowOffsetOuter1");
    			attr_dev(feGaussianBlur, "result", "shadowBlurOuter1");
    			add_location(feGaussianBlur, file$1, 56, 5, 3586);
    			attr_dev(feColorMatrix, "values", "0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0");
    			attr_dev(feColorMatrix, "type", "matrix");
    			attr_dev(feColorMatrix, "in", "shadowBlurOuter1");
    			attr_dev(feColorMatrix, "result", "shadowMatrixOuter1");
    			add_location(feColorMatrix, file$1, 57, 5, 3693);
    			attr_dev(feMergeNode0, "in", "shadowMatrixOuter1");
    			add_location(feMergeNode0, file$1, 59, 6, 3868);
    			attr_dev(feMergeNode1, "in", "SourceGraphic");
    			add_location(feMergeNode1, file$1, 60, 6, 3927);
    			add_location(feMerge, file$1, 58, 5, 3851);
    			attr_dev(filter, "x", "-9.1%");
    			attr_dev(filter, "y", "-9.1%");
    			attr_dev(filter, "width", "128.3%");
    			attr_dev(filter, "height", "128.3%");
    			attr_dev(filter, "filterUnits", "objectBoundingBox");
    			attr_dev(filter, "id", "filter-1");
    			add_location(filter, file$1, 54, 4, 3387);
    			attr_dev(stop0, "stop-color", "#FFCF00");
    			attr_dev(stop0, "offset", "0%");
    			add_location(stop0, file$1, 64, 5, 4108);
    			attr_dev(stop1, "stop-color", "#F7AE15");
    			attr_dev(stop1, "offset", "100%");
    			add_location(stop1, file$1, 65, 5, 4161);
    			attr_dev(radialGradient, "cx", "50%");
    			attr_dev(radialGradient, "cy", "50%");
    			attr_dev(radialGradient, "fx", "50%");
    			attr_dev(radialGradient, "fy", "50%");
    			attr_dev(radialGradient, "r", "68.6284858%");
    			attr_dev(radialGradient, "id", "radialGradient-2");
    			add_location(radialGradient, file$1, 63, 4, 4011);
    			add_location(defs, file$1, 53, 3, 3375);
    			attr_dev(circle, "id", "Oval-Copy-3");
    			attr_dev(circle, "fill", "url(#radialGradient-2)");
    			attr_dev(circle, "cx", "13");
    			attr_dev(circle, "cy", "13");
    			attr_dev(circle, "r", "13");
    			add_location(circle, file$1, 76, 11, 4754);
    			attr_dev(path0, "d", "M13,3.0952381 C7.54580357,3.0952381 3.0952381,7.54657738 3.0952381,13 C3.0952381,18.4541964 7.54657738,22.9047619 13,22.9047619 C18.4541964,22.9047619 22.9047619,18.4534226 22.9047619,13 C22.9047619,7.54580357 18.4534226,3.0952381 13,3.0952381 Z M13,21.7440476 C8.17850893,21.7440476 4.25595238,17.8214911 4.25595238,13 C4.25595238,8.17850893 8.17850893,4.25595238 13,4.25595238 C17.8214911,4.25595238 21.7440476,8.17850893 21.7440476,13 C21.7440476,17.8214911 17.8214911,21.7440476 13,21.7440476 Z");
    			attr_dev(path0, "id", "Shape");
    			attr_dev(path0, "fill", "#F8B013");
    			attr_dev(path0, "fill-rule", "nonzero");
    			add_location(path0, file$1, 77, 11, 4854);
    			attr_dev(path1, "d", "M13,5.2962963 C8.76834769,5.2962963 5.2962963,8.76956614 5.2962963,13 C5.2962963,17.2316523 8.76956614,20.7037037 13,20.7037037 C17.2316523,20.7037037 20.7037037,17.2304339 20.7037037,13 C20.7037037,8.76834769 17.2304339,5.2962963 13,5.2962963 Z M13,19.5245654 C9.40233107,19.5245654 6.47543462,16.5976689 6.47543462,13 C6.47543462,9.40233107 9.40233107,6.47543462 13,6.47543462 C16.5976689,6.47543462 19.5245654,9.40233107 19.5245654,13 C19.5245654,16.5976689 16.5976689,19.5245654 13,19.5245654 Z");
    			attr_dev(path1, "id", "Shape");
    			attr_dev(path1, "fill", "#F8B013");
    			attr_dev(path1, "fill-rule", "nonzero");
    			add_location(path1, file$1, 78, 11, 5429);
    			add_location(g0, file$1, 75, 10, 4738);
    			attr_dev(g1, "transform", "translate(108.000000, 11.000000)");
    			add_location(g1, file$1, 74, 9, 4678);
    			attr_dev(g2, "id", "money");
    			attr_dev(g2, "transform", "translate(71.000000, 100.000000)");
    			add_location(g2, file$1, 73, 8, 4608);
    			attr_dev(g3, "id", "product-card-hover");
    			attr_dev(g3, "filter", "url(#filter-1)");
    			attr_dev(g3, "transform", "translate(300.000000, 0.000000)");
    			add_location(g3, file$1, 72, 7, 4503);
    			attr_dev(g4, "id", "line-1");
    			add_location(g4, file$1, 71, 6, 4479);
    			attr_dev(g5, "id", "products");
    			attr_dev(g5, "transform", "translate(132.000000, 622.000000)");
    			add_location(g5, file$1, 70, 5, 4408);
    			attr_dev(g6, "id", "Catalog-pg1");
    			attr_dev(g6, "transform", "translate(-609.000000, -731.000000)");
    			add_location(g6, file$1, 69, 4, 4333);
    			attr_dev(g7, "id", "Page-1");
    			attr_dev(g7, "stroke", "none");
    			attr_dev(g7, "stroke-width", "1");
    			attr_dev(g7, "fill", "none");
    			attr_dev(g7, "fill-rule", "evenodd");
    			add_location(g7, file$1, 68, 3, 4249);
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 34 34");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg, file$1, 49, 2, 3080);
    			attr_dev(div0, "class", "coins svelte-124dikt");
    			add_location(div0, file$1, 48, 1, 3057);
    			attr_dev(div1, "class", "user-info");
    			attr_dev(div1, "href", "/history");
    			add_location(div1, file$1, 92, 1, 6163);
    			attr_dev(header, "class", "svelte-124dikt");
    			add_location(header, file$1, 25, 0, 1185);
    			attr_dev(p, "class", "svelte-124dikt");
    			add_location(p, file$1, 102, 2, 6333);
    			attr_dev(div2, "class", "section svelte-124dikt");
    			add_location(div2, file$1, 101, 1, 6308);
    			attr_dev(div3, "class", "product-info svelte-124dikt");
    			add_location(div3, file$1, 105, 2, 6391);
    			attr_dev(span0, "class", "product-info svelte-124dikt");
    			add_location(span0, file$1, 106, 2, 6434);
    			attr_dev(span1, "class", "product-info svelte-124dikt");
    			add_location(span1, file$1, 107, 2, 6476);
    			attr_dev(span2, "class", "product-info svelte-124dikt");
    			add_location(span2, file$1, 108, 2, 6522);
    			attr_dev(span3, "class", "product-info svelte-124dikt");
    			add_location(span3, file$1, 109, 2, 6564);
    			attr_dev(div4, "class", "product titles svelte-124dikt");
    			add_location(div4, file$1, 104, 1, 6359);
    			attr_dev(main, "class", "svelte-124dikt");
    			add_location(main, file$1, 100, 0, 6299);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			mount_component(link, h1, null);
    			append_dev(header, t0);
    			append_dev(header, div0);
    			append_dev(div0, svg);
    			append_dev(svg, title);
    			append_dev(title, t1);
    			append_dev(svg, desc);
    			append_dev(desc, t2);
    			append_dev(svg, defs);
    			append_dev(defs, filter);
    			append_dev(filter, feOffset);
    			append_dev(filter, feGaussianBlur);
    			append_dev(filter, feColorMatrix);
    			append_dev(filter, feMerge);
    			append_dev(feMerge, feMergeNode0);
    			append_dev(feMerge, feMergeNode1);
    			append_dev(defs, radialGradient);
    			append_dev(radialGradient, stop0);
    			append_dev(radialGradient, stop1);
    			append_dev(svg, g7);
    			append_dev(g7, g6);
    			append_dev(g6, g5);
    			append_dev(g5, g4);
    			append_dev(g4, g3);
    			append_dev(g3, g2);
    			append_dev(g2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, circle);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(div0, t3);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(header, t4);
    			append_dev(header, div1);
    			if (if_block1) if_block1.m(div1, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, p);
    			append_dev(main, t7);
    			append_dev(main, div4);
    			append_dev(div4, div3);
    			append_dev(div4, t9);
    			append_dev(div4, span0);
    			append_dev(div4, t11);
    			append_dev(div4, span1);
    			append_dev(div4, t13);
    			append_dev(div4, span2);
    			append_dev(div4, t15);
    			append_dev(div4, span3);
    			append_dev(main, t17);
    			if (if_block2) if_block2.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);

    			if (/*_user*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*_user*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*_user*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*historyProducts*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(main, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(link);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(main);
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("History", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	let _user;
    	let historyProducts;

    	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    		yield api.getUser().then(u => {
    			$$invalidate(0, _user = u);
    		});

    		yield api.getHistory().then(h => $$invalidate(1, historyProducts = h));

    		$$invalidate(1, historyProducts = historyProducts.map(p => {
    			p.createDate = new Date(p.createDate).toLocaleString();
    			return p;
    		}));
    	}));

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<History> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		Link,
    		api,
    		_user,
    		historyProducts
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("_user" in $$props) $$invalidate(0, _user = $$props._user);
    		if ("historyProducts" in $$props) $$invalidate(1, historyProducts = $$props.historyProducts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [_user, historyProducts];
    }

    class History extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "History",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    function flip(node, animation, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /* 
      @package NOTY - Dependency-free notification library 
      @version version: 3.2.0-beta 
      @contributors https://github.com/needim/noty/graphs/contributors 
      @documentation Examples and Documentation - https://ned.im/noty 
      @license Licensed under the MIT licenses: http://www.opensource.org/licenses/mit-license.php 
    */

    var noty = createCommonjsModule(function (module, exports) {
    (function webpackUniversalModuleDefinition(root, factory) {
    	module.exports = factory();
    })(commonjsGlobal, function() {
    return /******/ (function(modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {};
    /******/
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
    /******/
    /******/ 		// Check if module is in cache
    /******/ 		if(installedModules[moduleId]) {
    /******/ 			return installedModules[moduleId].exports;
    /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = installedModules[moduleId] = {
    /******/ 			i: moduleId,
    /******/ 			l: false,
    /******/ 			exports: {}
    /******/ 		};
    /******/
    /******/ 		// Execute the module function
    /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ 		// Flag the module as loaded
    /******/ 		module.l = true;
    /******/
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
    /******/
    /******/
    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules;
    /******/
    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules;
    /******/
    /******/ 	// identity function for calling harmony imports with the correct context
    /******/ 	__webpack_require__.i = function(value) { return value; };
    /******/
    /******/ 	// define getter function for harmony exports
    /******/ 	__webpack_require__.d = function(exports, name, getter) {
    /******/ 		if(!__webpack_require__.o(exports, name)) {
    /******/ 			Object.defineProperty(exports, name, {
    /******/ 				configurable: false,
    /******/ 				enumerable: true,
    /******/ 				get: getter
    /******/ 			});
    /******/ 		}
    /******/ 	};
    /******/
    /******/ 	// getDefaultExport function for compatibility with non-harmony modules
    /******/ 	__webpack_require__.n = function(module) {
    /******/ 		var getter = module && module.__esModule ?
    /******/ 			function getDefault() { return module['default']; } :
    /******/ 			function getModuleExports() { return module; };
    /******/ 		__webpack_require__.d(getter, 'a', getter);
    /******/ 		return getter;
    /******/ 	};
    /******/
    /******/ 	// Object.prototype.hasOwnProperty.call
    /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    /******/
    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = "";
    /******/
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(__webpack_require__.s = 6);
    /******/ })
    /************************************************************************/
    /******/ ([
    /* 0 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.css = exports.deepExtend = exports.animationEndEvents = undefined;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    exports.inArray = inArray;
    exports.stopPropagation = stopPropagation;
    exports.generateID = generateID;
    exports.outerHeight = outerHeight;
    exports.addListener = addListener;
    exports.hasClass = hasClass;
    exports.addClass = addClass;
    exports.removeClass = removeClass;
    exports.remove = remove;
    exports.classList = classList;
    exports.visibilityChangeFlow = visibilityChangeFlow;
    exports.createAudioElements = createAudioElements;

    var _api = __webpack_require__(1);

    var API = _interopRequireWildcard(_api);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

    exports.animationEndEvents = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

    function inArray(needle, haystack, argStrict) {
      var key = void 0;
      var strict = !!argStrict;

      if (strict) {
        for (key in haystack) {
          if (haystack.hasOwnProperty(key) && haystack[key] === needle) {
            return true;
          }
        }
      } else {
        for (key in haystack) {
          if (haystack.hasOwnProperty(key) && haystack[key] === needle) {
            return true;
          }
        }
      }
      return false;
    }

    function stopPropagation(evt) {
      evt = evt || window.event;

      if (typeof evt.stopPropagation !== 'undefined') {
        evt.stopPropagation();
      } else {
        evt.cancelBubble = true;
      }
    }

    exports.deepExtend = function deepExtend(out) {
      out = out || {};

      for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];

        if (!obj) continue;

        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (Array.isArray(obj[key])) {
              out[key] = obj[key];
            } else if (_typeof(obj[key]) === 'object' && obj[key] !== null) {
              out[key] = deepExtend(out[key], obj[key]);
            } else {
              out[key] = obj[key];
            }
          }
        }
      }

      return out;
    };

    function generateID() {
      var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var id = 'noty_' + prefix + '_';

      id += 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });

      return id;
    }

    function outerHeight(el) {
      var height = el.offsetHeight;
      var style = window.getComputedStyle(el);

      height += parseInt(style.marginTop) + parseInt(style.marginBottom);
      return height;
    }

    exports.css = function () {
      var cssPrefixes = ['Webkit', 'O', 'Moz', 'ms'];
      var cssProps = {};

      function camelCase(string) {
        return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function (match, letter) {
          return letter.toUpperCase();
        });
      }

      function getVendorProp(name) {
        var style = document.body.style;
        if (name in style) return name;

        var i = cssPrefixes.length;
        var capName = name.charAt(0).toUpperCase() + name.slice(1);
        var vendorName = void 0;

        while (i--) {
          vendorName = cssPrefixes[i] + capName;
          if (vendorName in style) return vendorName;
        }

        return name;
      }

      function getStyleProp(name) {
        name = camelCase(name);
        return cssProps[name] || (cssProps[name] = getVendorProp(name));
      }

      function applyCss(element, prop, value) {
        prop = getStyleProp(prop);
        element.style[prop] = value;
      }

      return function (element, properties) {
        var args = arguments;
        var prop = void 0;
        var value = void 0;

        if (args.length === 2) {
          for (prop in properties) {
            if (properties.hasOwnProperty(prop)) {
              value = properties[prop];
              if (value !== undefined && properties.hasOwnProperty(prop)) {
                applyCss(element, prop, value);
              }
            }
          }
        } else {
          applyCss(element, args[1], args[2]);
        }
      };
    }();

    function addListener(el, events, cb) {
      var useCapture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      events = events.split(' ');
      for (var i = 0; i < events.length; i++) {
        if (document.addEventListener) {
          el.addEventListener(events[i], cb, useCapture);
        } else if (document.attachEvent) {
          el.attachEvent('on' + events[i], cb);
        }
      }
    }

    function hasClass(element, name) {
      var list = typeof element === 'string' ? element : classList(element);
      return list.indexOf(' ' + name + ' ') >= 0;
    }

    function addClass(element, name) {
      var oldList = classList(element);
      var newList = oldList + name;

      if (hasClass(oldList, name)) return;

      // Trim the opening space.
      element.className = newList.substring(1);
    }

    function removeClass(element, name) {
      var oldList = classList(element);
      var newList = void 0;

      if (!hasClass(element, name)) return;

      // Replace the class name.
      newList = oldList.replace(' ' + name + ' ', ' ');

      // Trim the opening and closing spaces.
      element.className = newList.substring(1, newList.length - 1);
    }

    function remove(element) {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }

    function classList(element) {
      return (' ' + (element && element.className || '') + ' ').replace(/\s+/gi, ' ');
    }

    function visibilityChangeFlow() {
      var hidden = void 0;
      var visibilityChange = void 0;
      if (typeof document.hidden !== 'undefined') {
        // Opera 12.10 and Firefox 18 and later support
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
      } else if (typeof document.msHidden !== 'undefined') {
        hidden = 'msHidden';
        visibilityChange = 'msvisibilitychange';
      } else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
      }

      function onVisibilityChange() {
        API.PageHidden = document[hidden];
        handleVisibilityChange();
      }

      function onBlur() {
        API.PageHidden = true;
        handleVisibilityChange();
      }

      function onFocus() {
        API.PageHidden = false;
        handleVisibilityChange();
      }

      function handleVisibilityChange() {
        if (API.PageHidden) stopAll();else resumeAll();
      }

      function stopAll() {
        setTimeout(function () {
          Object.keys(API.Store).forEach(function (id) {
            if (API.Store.hasOwnProperty(id)) {
              if (API.Store[id].options.visibilityControl) {
                API.Store[id].stop();
              }
            }
          });
        }, 100);
      }

      function resumeAll() {
        setTimeout(function () {
          Object.keys(API.Store).forEach(function (id) {
            if (API.Store.hasOwnProperty(id)) {
              if (API.Store[id].options.visibilityControl) {
                API.Store[id].resume();
              }
            }
          });
          API.queueRenderAll();
        }, 100);
      }

      if (visibilityChange) {
        addListener(document, visibilityChange, onVisibilityChange);
      }

      addListener(window, 'blur', onBlur);
      addListener(window, 'focus', onFocus);
    }

    function createAudioElements(ref) {
      if (ref.hasSound) {
        var audioElement = document.createElement('audio');

        ref.options.sounds.sources.forEach(function (s) {
          var source = document.createElement('source');
          source.src = s;
          source.type = 'audio/' + getExtension(s);
          audioElement.appendChild(source);
        });

        if (ref.barDom) {
          ref.barDom.appendChild(audioElement);
        } else {
          document.querySelector('body').appendChild(audioElement);
        }

        audioElement.volume = ref.options.sounds.volume;

        if (!ref.soundPlayed) {
          audioElement.play();
          ref.soundPlayed = true;
        }

        audioElement.onended = function () {
          remove(audioElement);
        };
      }
    }

    function getExtension(fileName) {
      return fileName.match(/\.([^.]+)$/)[1];
    }

    /***/ }),
    /* 1 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Defaults = exports.Store = exports.Queues = exports.DefaultMaxVisible = exports.docTitle = exports.DocModalCount = exports.PageHidden = undefined;
    exports.getQueueCounts = getQueueCounts;
    exports.addToQueue = addToQueue;
    exports.removeFromQueue = removeFromQueue;
    exports.queueRender = queueRender;
    exports.queueRenderAll = queueRenderAll;
    exports.ghostFix = ghostFix;
    exports.build = build;
    exports.hasButtons = hasButtons;
    exports.handleModal = handleModal;
    exports.handleModalClose = handleModalClose;
    exports.queueClose = queueClose;
    exports.dequeueClose = dequeueClose;
    exports.fire = fire;
    exports.openFlow = openFlow;
    exports.closeFlow = closeFlow;

    var _utils = __webpack_require__(0);

    var Utils = _interopRequireWildcard(_utils);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

    exports.PageHidden = false;
    var DocModalCount = exports.DocModalCount = 0;

    var DocTitleProps = {
      originalTitle: null,
      count: 0,
      changed: false,
      timer: -1
    };

    var docTitle = exports.docTitle = {
      increment: function increment() {
        DocTitleProps.count++;

        docTitle._update();
      },

      decrement: function decrement() {
        DocTitleProps.count--;

        if (DocTitleProps.count <= 0) {
          docTitle._clear();
          return;
        }

        docTitle._update();
      },

      _update: function _update() {
        var title = document.title;

        if (!DocTitleProps.changed) {
          DocTitleProps.originalTitle = title;
          document.title = '(' + DocTitleProps.count + ') ' + title;
          DocTitleProps.changed = true;
        } else {
          document.title = '(' + DocTitleProps.count + ') ' + DocTitleProps.originalTitle;
        }
      },

      _clear: function _clear() {
        if (DocTitleProps.changed) {
          DocTitleProps.count = 0;
          document.title = DocTitleProps.originalTitle;
          DocTitleProps.changed = false;
        }
      }
    };

    var DefaultMaxVisible = exports.DefaultMaxVisible = 5;

    var Queues = exports.Queues = {
      global: {
        maxVisible: DefaultMaxVisible,
        queue: []
      }
    };

    var Store = exports.Store = {};

    exports.Defaults = {
      type: 'alert',
      layout: 'topRight',
      theme: 'mint',
      text: '',
      timeout: false,
      progressBar: true,
      closeWith: ['click'],
      animation: {
        open: 'noty_effects_open',
        close: 'noty_effects_close'
      },
      id: false,
      force: false,
      killer: false,
      queue: 'global',
      container: false,
      buttons: [],
      callbacks: {
        beforeShow: null,
        onShow: null,
        afterShow: null,
        onClose: null,
        afterClose: null,
        onClick: null,
        onHover: null,
        onTemplate: null
      },
      sounds: {
        sources: [],
        volume: 1,
        conditions: []
      },
      titleCount: {
        conditions: []
      },
      modal: false,
      visibilityControl: false

      /**
       * @param {string} queueName
       * @return {object}
       */
    };function getQueueCounts() {
      var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'global';

      var count = 0;
      var max = DefaultMaxVisible;

      if (Queues.hasOwnProperty(queueName)) {
        max = Queues[queueName].maxVisible;
        Object.keys(Store).forEach(function (i) {
          if (Store[i].options.queue === queueName && !Store[i].closed) count++;
        });
      }

      return {
        current: count,
        maxVisible: max
      };
    }

    /**
     * @param {Noty} ref
     * @return {void}
     */
    function addToQueue(ref) {
      if (!Queues.hasOwnProperty(ref.options.queue)) {
        Queues[ref.options.queue] = { maxVisible: DefaultMaxVisible, queue: [] };
      }

      Queues[ref.options.queue].queue.push(ref);
    }

    /**
     * @param {Noty} ref
     * @return {void}
     */
    function removeFromQueue(ref) {
      if (Queues.hasOwnProperty(ref.options.queue)) {
        var queue = [];
        Object.keys(Queues[ref.options.queue].queue).forEach(function (i) {
          if (Queues[ref.options.queue].queue[i].id !== ref.id) {
            queue.push(Queues[ref.options.queue].queue[i]);
          }
        });
        Queues[ref.options.queue].queue = queue;
      }
    }

    /**
     * @param {string} queueName
     * @return {void}
     */
    function queueRender() {
      var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'global';

      if (Queues.hasOwnProperty(queueName)) {
        var noty = Queues[queueName].queue.shift();

        if (noty) noty.show();
      }
    }

    /**
     * @return {void}
     */
    function queueRenderAll() {
      Object.keys(Queues).forEach(function (queueName) {
        queueRender(queueName);
      });
    }

    /**
     * @param {Noty} ref
     * @return {void}
     */
    function ghostFix(ref) {
      var ghostID = Utils.generateID('ghost');
      var ghost = document.createElement('div');
      ghost.setAttribute('id', ghostID);
      Utils.css(ghost, {
        height: Utils.outerHeight(ref.barDom) + 'px'
      });

      ref.barDom.insertAdjacentHTML('afterend', ghost.outerHTML);

      Utils.remove(ref.barDom);
      ghost = document.getElementById(ghostID);
      Utils.addClass(ghost, 'noty_fix_effects_height');
      Utils.addListener(ghost, Utils.animationEndEvents, function () {
        Utils.remove(ghost);
      });
    }

    /**
     * @param {Noty} ref
     * @return {void}
     */
    function build(ref) {
      findOrCreateContainer(ref);

      var markup = '<div class="noty_body">' + ref.options.text + '</div>' + buildButtons(ref) + '<div class="noty_progressbar"></div>';

      ref.barDom = document.createElement('div');
      ref.barDom.setAttribute('id', ref.id);
      Utils.addClass(ref.barDom, 'noty_bar noty_type__' + ref.options.type + ' noty_theme__' + ref.options.theme);

      ref.barDom.innerHTML = markup;

      fire(ref, 'onTemplate');
    }

    /**
     * @param {Noty} ref
     * @return {boolean}
     */
    function hasButtons(ref) {
      return !!(ref.options.buttons && Object.keys(ref.options.buttons).length);
    }

    /**
     * @param {Noty} ref
     * @return {string}
     */
    function buildButtons(ref) {
      if (hasButtons(ref)) {
        var buttons = document.createElement('div');
        Utils.addClass(buttons, 'noty_buttons');

        Object.keys(ref.options.buttons).forEach(function (key) {
          buttons.appendChild(ref.options.buttons[key].dom);
        });

        ref.options.buttons.forEach(function (btn) {
          buttons.appendChild(btn.dom);
        });
        return buttons.outerHTML;
      }
      return '';
    }

    /**
     * @param {Noty} ref
     * @return {void}
     */
    function handleModal(ref) {
      if (ref.options.modal) {
        if (DocModalCount === 0) {
          createModal();
        }

        exports.DocModalCount = DocModalCount += 1;
      }
    }

    /**
     * @param {Noty} ref
     * @return {void}
     */
    function handleModalClose(ref) {
      if (ref.options.modal && DocModalCount > 0) {
        exports.DocModalCount = DocModalCount -= 1;

        if (DocModalCount <= 0) {
          var modal = document.querySelector('.noty_modal');

          if (modal) {
            Utils.removeClass(modal, 'noty_modal_open');
            Utils.addClass(modal, 'noty_modal_close');
            Utils.addListener(modal, Utils.animationEndEvents, function () {
              Utils.remove(modal);
            });
          }
        }
      }
    }

    /**
     * @return {void}
     */
    function createModal() {
      var body = document.querySelector('body');
      var modal = document.createElement('div');
      Utils.addClass(modal, 'noty_modal');
      body.insertBefore(modal, body.firstChild);
      Utils.addClass(modal, 'noty_modal_open');

      Utils.addListener(modal, Utils.animationEndEvents, function () {
        Utils.removeClass(modal, 'noty_modal_open');
      });
    }

    /**
     * @param {Noty} ref
     * @return {void}
     */
    function findOrCreateContainer(ref) {
      if (ref.options.container) {
        ref.layoutDom = document.querySelector(ref.options.container);
        return;
      }

      var layoutID = 'noty_layout__' + ref.options.layout;
      ref.layoutDom = document.querySelector('div#' + layoutID);

      if (!ref.layoutDom) {
        ref.layoutDom = document.createElement('div');
        ref.layoutDom.setAttribute('id', layoutID);
        ref.layoutDom.setAttribute('role', 'alert');
        ref.layoutDom.setAttribute('aria-live', 'polite');
        Utils.addClass(ref.layoutDom, 'noty_layout');
        document.querySelector('body').appendChild(ref.layoutDom);
      }
    }

    /**
     * @param {Noty} ref
     * @return {void}
     */
    function queueClose(ref) {
      if (ref.options.timeout) {
        if (ref.options.progressBar && ref.progressDom) {
          Utils.css(ref.progressDom, {
            transition: 'width ' + ref.options.timeout + 'ms linear',
            width: '0%'
          });
        }

        clearTimeout(ref.closeTimer);

        ref.closeTimer = setTimeout(function () {
          ref.close();
        }, ref.options.timeout);
      }
    }

    /**
     * @param {Noty} ref
     * @return {void}
     */
    function dequeueClose(ref) {
      if (ref.options.timeout && ref.closeTimer) {
        clearTimeout(ref.closeTimer);
        ref.closeTimer = -1;

        if (ref.options.progressBar && ref.progressDom) {
          Utils.css(ref.progressDom, {
            transition: 'width 0ms linear',
            width: '100%'
          });
        }
      }
    }

    /**
     * @param {Noty} ref
     * @param {string} eventName
     * @return {void}
     */
    function fire(ref, eventName) {
      if (ref.listeners.hasOwnProperty(eventName)) {
        ref.listeners[eventName].forEach(function (cb) {
          if (typeof cb === 'function') {
            cb.apply(ref);
          }
        });
      }
    }

    /**
     * @param {Noty} ref
     * @return {void}
     */
    function openFlow(ref) {
      fire(ref, 'afterShow');
      queueClose(ref);

      Utils.addListener(ref.barDom, 'mouseenter', function () {
        dequeueClose(ref);
      });

      Utils.addListener(ref.barDom, 'mouseleave', function () {
        queueClose(ref);
      });
    }

    /**
     * @param {Noty} ref
     * @return {void}
     */
    function closeFlow(ref) {
      delete Store[ref.id];
      ref.closing = false;
      fire(ref, 'afterClose');

      Utils.remove(ref.barDom);

      if (ref.layoutDom.querySelectorAll('.noty_bar').length === 0 && !ref.options.container) {
        Utils.remove(ref.layoutDom);
      }

      if (Utils.inArray('docVisible', ref.options.titleCount.conditions) || Utils.inArray('docHidden', ref.options.titleCount.conditions)) {
        docTitle.decrement();
      }

      queueRender(ref.options.queue);
    }

    /***/ }),
    /* 2 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.NotyButton = undefined;

    var _utils = __webpack_require__(0);

    var Utils = _interopRequireWildcard(_utils);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    exports.NotyButton = function NotyButton(html, classes, cb) {
      var _this = this;

      var attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      _classCallCheck(this, NotyButton);

      this.dom = document.createElement('button');
      this.dom.innerHTML = html;
      this.id = attributes.id = attributes.id || Utils.generateID('button');
      this.cb = cb;
      Object.keys(attributes).forEach(function (propertyName) {
        _this.dom.setAttribute(propertyName, attributes[propertyName]);
      });
      Utils.addClass(this.dom, classes || 'noty_btn');

      return this;
    };

    /***/ }),
    /* 3 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    exports.Push = function () {
      function Push() {
        var workerPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/service-worker.js';

        _classCallCheck(this, Push);

        this.subData = {};
        this.workerPath = workerPath;
        this.listeners = {
          onPermissionGranted: [],
          onPermissionDenied: [],
          onSubscriptionSuccess: [],
          onSubscriptionCancel: [],
          onWorkerError: [],
          onWorkerSuccess: [],
          onWorkerNotSupported: []
        };
        return this;
      }

      /**
       * @param {string} eventName
       * @param {function} cb
       * @return {Push}
       */


      _createClass(Push, [{
        key: 'on',
        value: function on(eventName) {
          var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

          if (typeof cb === 'function' && this.listeners.hasOwnProperty(eventName)) {
            this.listeners[eventName].push(cb);
          }

          return this;
        }
      }, {
        key: 'fire',
        value: function fire(eventName) {
          var _this = this;

          var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

          if (this.listeners.hasOwnProperty(eventName)) {
            this.listeners[eventName].forEach(function (cb) {
              if (typeof cb === 'function') {
                cb.apply(_this, params);
              }
            });
          }
        }
      }, {
        key: 'create',
        value: function create() {
          console.log('NOT IMPLEMENTED YET');
        }

        /**
         * @return {boolean}
         */

      }, {
        key: 'isSupported',
        value: function isSupported() {
          var result = false;

          try {
            result = window.Notification || window.webkitNotifications || navigator.mozNotification || window.external && window.external.msIsSiteMode() !== undefined;
          } catch (e) {}

          return result;
        }

        /**
         * @return {string}
         */

      }, {
        key: 'getPermissionStatus',
        value: function getPermissionStatus() {
          var perm = 'default';

          if (window.Notification && window.Notification.permissionLevel) {
            perm = window.Notification.permissionLevel;
          } else if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
            switch (window.webkitNotifications.checkPermission()) {
              case 1:
                perm = 'default';
                break;
              case 0:
                perm = 'granted';
                break;
              default:
                perm = 'denied';
            }
          } else if (window.Notification && window.Notification.permission) {
            perm = window.Notification.permission;
          } else if (navigator.mozNotification) {
            perm = 'granted';
          } else if (window.external && window.external.msIsSiteMode() !== undefined) {
            perm = window.external.msIsSiteMode() ? 'granted' : 'default';
          }

          return perm.toString().toLowerCase();
        }

        /**
         * @return {string}
         */

      }, {
        key: 'getEndpoint',
        value: function getEndpoint(subscription) {
          var endpoint = subscription.endpoint;
          var subscriptionId = subscription.subscriptionId;

          // fix for Chrome < 45
          if (subscriptionId && endpoint.indexOf(subscriptionId) === -1) {
            endpoint += '/' + subscriptionId;
          }

          return endpoint;
        }

        /**
         * @return {boolean}
         */

      }, {
        key: 'isSWRegistered',
        value: function isSWRegistered() {
          try {
            return navigator.serviceWorker.controller.state === 'activated';
          } catch (e) {
            return false;
          }
        }

        /**
         * @return {void}
         */

      }, {
        key: 'unregisterWorker',
        value: function unregisterWorker() {
          var self = this;
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                for (var _iterator = registrations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var registration = _step.value;

                  registration.unregister();
                  self.fire('onSubscriptionCancel');
                }
              } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                  }
                } finally {
                  if (_didIteratorError) {
                    throw _iteratorError;
                  }
                }
              }
            });
          }
        }

        /**
         * @return {void}
         */

      }, {
        key: 'requestSubscription',
        value: function requestSubscription() {
          var _this2 = this;

          var userVisibleOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

          var self = this;
          var current = this.getPermissionStatus();
          var cb = function cb(result) {
            if (result === 'granted') {
              _this2.fire('onPermissionGranted');

              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register(_this2.workerPath).then(function () {
                  navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                    self.fire('onWorkerSuccess');
                    serviceWorkerRegistration.pushManager.subscribe({
                      userVisibleOnly: userVisibleOnly
                    }).then(function (subscription) {
                      var key = subscription.getKey('p256dh');
                      var token = subscription.getKey('auth');

                      self.subData = {
                        endpoint: self.getEndpoint(subscription),
                        p256dh: key ? window.btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
                        auth: token ? window.btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null
                      };

                      self.fire('onSubscriptionSuccess', [self.subData]);
                    }).catch(function (err) {
                      self.fire('onWorkerError', [err]);
                    });
                  });
                });
              } else {
                self.fire('onWorkerNotSupported');
              }
            } else if (result === 'denied') {
              _this2.fire('onPermissionDenied');
              _this2.unregisterWorker();
            }
          };

          if (current === 'default') {
            if (window.Notification && window.Notification.requestPermission) {
              window.Notification.requestPermission(cb);
            } else if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
              window.webkitNotifications.requestPermission(cb);
            }
          } else {
            cb(current);
          }
        }
      }]);

      return Push;
    }();

    /***/ }),
    /* 4 */
    /***/ (function(module, exports, __webpack_require__) {

    /* WEBPACK VAR INJECTION */(function(process, global) {var require;/*!
     * @overview es6-promise - a tiny implementation of Promises/A+.
     * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
     * @license   Licensed under MIT license
     *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
     * @version   4.1.1
     */

    (function (global, factory) {
    	 module.exports = factory() ;
    }(this, (function () {
    function objectOrFunction(x) {
      var type = typeof x;
      return x !== null && (type === 'object' || type === 'function');
    }

    function isFunction(x) {
      return typeof x === 'function';
    }

    var _isArray = undefined;
    if (Array.isArray) {
      _isArray = Array.isArray;
    } else {
      _isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    }

    var isArray = _isArray;

    var len = 0;
    var vertxNext = undefined;
    var customSchedulerFn = undefined;

    var asap = function asap(callback, arg) {
      queue[len] = callback;
      queue[len + 1] = arg;
      len += 2;
      if (len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (customSchedulerFn) {
          customSchedulerFn(flush);
        } else {
          scheduleFlush();
        }
      }
    };

    function setScheduler(scheduleFn) {
      customSchedulerFn = scheduleFn;
    }

    function setAsap(asapFn) {
      asap = asapFn;
    }

    var browserWindow = typeof window !== 'undefined' ? window : undefined;
    var browserGlobal = browserWindow || {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

    // node
    function useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function () {
        return process.nextTick(flush);
      };
    }

    // vertx
    function useVertxTimer() {
      if (typeof vertxNext !== 'undefined') {
        return function () {
          vertxNext(flush);
        };
      }

      return useSetTimeout();
    }

    function useMutationObserver() {
      var iterations = 0;
      var observer = new BrowserMutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function () {
        node.data = iterations = ++iterations % 2;
      };
    }

    // web worker
    function useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = flush;
      return function () {
        return channel.port2.postMessage(0);
      };
    }

    function useSetTimeout() {
      // Store setTimeout reference so es6-promise will be unaffected by
      // other code modifying setTimeout (like sinon.useFakeTimers())
      var globalSetTimeout = setTimeout;
      return function () {
        return globalSetTimeout(flush, 1);
      };
    }

    var queue = new Array(1000);
    function flush() {
      for (var i = 0; i < len; i += 2) {
        var callback = queue[i];
        var arg = queue[i + 1];

        callback(arg);

        queue[i] = undefined;
        queue[i + 1] = undefined;
      }

      len = 0;
    }

    function attemptVertx() {
      try {
        var r = require;
        var vertx = __webpack_require__(9);
        vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return useVertxTimer();
      } catch (e) {
        return useSetTimeout();
      }
    }

    var scheduleFlush = undefined;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (isNode) {
      scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
      scheduleFlush = useMutationObserver();
    } else if (isWorker) {
      scheduleFlush = useMessageChannel();
    } else if (browserWindow === undefined && "function" === 'function') {
      scheduleFlush = attemptVertx();
    } else {
      scheduleFlush = useSetTimeout();
    }

    function then(onFulfillment, onRejection) {
      var _arguments = arguments;

      var parent = this;

      var child = new this.constructor(noop);

      if (child[PROMISE_ID] === undefined) {
        makePromise(child);
      }

      var _state = parent._state;

      if (_state) {
        (function () {
          var callback = _arguments[_state - 1];
          asap(function () {
            return invokeCallback(_state, child, callback, parent._result);
          });
        })();
      } else {
        subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    }

    /**
      `Promise.resolve` returns a promise that will become resolved with the
      passed `value`. It is shorthand for the following:

      ```javascript
      let promise = new Promise(function(resolve, reject){
        resolve(1);
      });

      promise.then(function(value){
        // value === 1
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      let promise = Promise.resolve(1);

      promise.then(function(value){
        // value === 1
      });
      ```

      @method resolve
      @static
      @param {Any} value value that the returned promise will be resolved with
      Useful for tooling.
      @return {Promise} a promise that will become fulfilled with the given
      `value`
    */
    function resolve$1(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(noop);
      resolve(promise, object);
      return promise;
    }

    var PROMISE_ID = Math.random().toString(36).substring(16);

    function noop() {}

    var PENDING = void 0;
    var FULFILLED = 1;
    var REJECTED = 2;

    var GET_THEN_ERROR = new ErrorObject();

    function selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function getThen(promise) {
      try {
        return promise.then;
      } catch (error) {
        GET_THEN_ERROR.error = error;
        return GET_THEN_ERROR;
      }
    }

    function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
      try {
        then$$1.call(value, fulfillmentHandler, rejectionHandler);
      } catch (e) {
        return e;
      }
    }

    function handleForeignThenable(promise, thenable, then$$1) {
      asap(function (promise) {
        var sealed = false;
        var error = tryThen(then$$1, thenable, function (value) {
          if (sealed) {
            return;
          }
          sealed = true;
          if (thenable !== value) {
            resolve(promise, value);
          } else {
            fulfill(promise, value);
          }
        }, function (reason) {
          if (sealed) {
            return;
          }
          sealed = true;

          reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          reject(promise, error);
        }
      }, promise);
    }

    function handleOwnThenable(promise, thenable) {
      if (thenable._state === FULFILLED) {
        fulfill(promise, thenable._result);
      } else if (thenable._state === REJECTED) {
        reject(promise, thenable._result);
      } else {
        subscribe(thenable, undefined, function (value) {
          return resolve(promise, value);
        }, function (reason) {
          return reject(promise, reason);
        });
      }
    }

    function handleMaybeThenable(promise, maybeThenable, then$$1) {
      if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
        handleOwnThenable(promise, maybeThenable);
      } else {
        if (then$$1 === GET_THEN_ERROR) {
          reject(promise, GET_THEN_ERROR.error);
          GET_THEN_ERROR.error = null;
        } else if (then$$1 === undefined) {
          fulfill(promise, maybeThenable);
        } else if (isFunction(then$$1)) {
          handleForeignThenable(promise, maybeThenable, then$$1);
        } else {
          fulfill(promise, maybeThenable);
        }
      }
    }

    function resolve(promise, value) {
      if (promise === value) {
        reject(promise, selfFulfillment());
      } else if (objectOrFunction(value)) {
        handleMaybeThenable(promise, value, getThen(value));
      } else {
        fulfill(promise, value);
      }
    }

    function publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      publish(promise);
    }

    function fulfill(promise, value) {
      if (promise._state !== PENDING) {
        return;
      }

      promise._result = value;
      promise._state = FULFILLED;

      if (promise._subscribers.length !== 0) {
        asap(publish, promise);
      }
    }

    function reject(promise, reason) {
      if (promise._state !== PENDING) {
        return;
      }
      promise._state = REJECTED;
      promise._result = reason;

      asap(publishRejection, promise);
    }

    function subscribe(parent, child, onFulfillment, onRejection) {
      var _subscribers = parent._subscribers;
      var length = _subscribers.length;

      parent._onerror = null;

      _subscribers[length] = child;
      _subscribers[length + FULFILLED] = onFulfillment;
      _subscribers[length + REJECTED] = onRejection;

      if (length === 0 && parent._state) {
        asap(publish, parent);
      }
    }

    function publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) {
        return;
      }

      var child = undefined,
          callback = undefined,
          detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function ErrorObject() {
      this.error = null;
    }

    var TRY_CATCH_ERROR = new ErrorObject();

    function tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch (e) {
        TRY_CATCH_ERROR.error = e;
        return TRY_CATCH_ERROR;
      }
    }

    function invokeCallback(settled, promise, callback, detail) {
      var hasCallback = isFunction(callback),
          value = undefined,
          error = undefined,
          succeeded = undefined,
          failed = undefined;

      if (hasCallback) {
        value = tryCatch(callback, detail);

        if (value === TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value.error = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          reject(promise, cannotReturnOwn());
          return;
        }
      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== PENDING) ; else if (hasCallback && succeeded) {
          resolve(promise, value);
        } else if (failed) {
          reject(promise, error);
        } else if (settled === FULFILLED) {
          fulfill(promise, value);
        } else if (settled === REJECTED) {
          reject(promise, value);
        }
    }

    function initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value) {
          resolve(promise, value);
        }, function rejectPromise(reason) {
          reject(promise, reason);
        });
      } catch (e) {
        reject(promise, e);
      }
    }

    var id = 0;
    function nextId() {
      return id++;
    }

    function makePromise(promise) {
      promise[PROMISE_ID] = id++;
      promise._state = undefined;
      promise._result = undefined;
      promise._subscribers = [];
    }

    function Enumerator$1(Constructor, input) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor(noop);

      if (!this.promise[PROMISE_ID]) {
        makePromise(this.promise);
      }

      if (isArray(input)) {
        this.length = input.length;
        this._remaining = input.length;

        this._result = new Array(this.length);

        if (this.length === 0) {
          fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate(input);
          if (this._remaining === 0) {
            fulfill(this.promise, this._result);
          }
        }
      } else {
        reject(this.promise, validationError());
      }
    }

    function validationError() {
      return new Error('Array Methods must be provided an Array');
    }

    Enumerator$1.prototype._enumerate = function (input) {
      for (var i = 0; this._state === PENDING && i < input.length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    Enumerator$1.prototype._eachEntry = function (entry, i) {
      var c = this._instanceConstructor;
      var resolve$$1 = c.resolve;

      if (resolve$$1 === resolve$1) {
        var _then = getThen(entry);

        if (_then === then && entry._state !== PENDING) {
          this._settledAt(entry._state, i, entry._result);
        } else if (typeof _then !== 'function') {
          this._remaining--;
          this._result[i] = entry;
        } else if (c === Promise$2) {
          var promise = new c(noop);
          handleMaybeThenable(promise, entry, _then);
          this._willSettleAt(promise, i);
        } else {
          this._willSettleAt(new c(function (resolve$$1) {
            return resolve$$1(entry);
          }), i);
        }
      } else {
        this._willSettleAt(resolve$$1(entry), i);
      }
    };

    Enumerator$1.prototype._settledAt = function (state, i, value) {
      var promise = this.promise;

      if (promise._state === PENDING) {
        this._remaining--;

        if (state === REJECTED) {
          reject(promise, value);
        } else {
          this._result[i] = value;
        }
      }

      if (this._remaining === 0) {
        fulfill(promise, this._result);
      }
    };

    Enumerator$1.prototype._willSettleAt = function (promise, i) {
      var enumerator = this;

      subscribe(promise, undefined, function (value) {
        return enumerator._settledAt(FULFILLED, i, value);
      }, function (reason) {
        return enumerator._settledAt(REJECTED, i, reason);
      });
    };

    /**
      `Promise.all` accepts an array of promises, and returns a new promise which
      is fulfilled with an array of fulfillment values for the passed promises, or
      rejected with the reason of the first passed promise to be rejected. It casts all
      elements of the passed iterable to promises as it runs this algorithm.

      Example:

      ```javascript
      let promise1 = resolve(1);
      let promise2 = resolve(2);
      let promise3 = resolve(3);
      let promises = [ promise1, promise2, promise3 ];

      Promise.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```

      If any of the `promises` given to `all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:

      Example:

      ```javascript
      let promise1 = resolve(1);
      let promise2 = reject(new Error("2"));
      let promise3 = reject(new Error("3"));
      let promises = [ promise1, promise2, promise3 ];

      Promise.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```

      @method all
      @static
      @param {Array} entries array of promises
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
      @static
    */
    function all$1(entries) {
      return new Enumerator$1(this, entries).promise;
    }

    /**
      `Promise.race` returns a new promise which is settled in the same way as the
      first passed promise to settle.

      Example:

      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });

      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 2');
        }, 100);
      });

      Promise.race([promise1, promise2]).then(function(result){
        // result === 'promise 2' because it was resolved before promise1
        // was resolved.
      });
      ```

      `Promise.race` is deterministic in that only the state of the first
      settled promise matters. For example, even if other promises given to the
      `promises` array argument are resolved, but the first settled promise has
      become rejected before the other promises became fulfilled, the returned
      promise will become rejected:

      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });

      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error('promise 2'));
        }, 100);
      });

      Promise.race([promise1, promise2]).then(function(result){
        // Code here never runs
      }, function(reason){
        // reason.message === 'promise 2' because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```

      An example real-world use case is implementing timeouts:

      ```javascript
      Promise.race([ajax('foo.json'), timeout(5000)])
      ```

      @method race
      @static
      @param {Array} promises array of promises to observe
      Useful for tooling.
      @return {Promise} a promise which settles in the same way as the first passed
      promise to settle.
    */
    function race$1(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      if (!isArray(entries)) {
        return new Constructor(function (_, reject) {
          return reject(new TypeError('You must pass an array to race.'));
        });
      } else {
        return new Constructor(function (resolve, reject) {
          var length = entries.length;
          for (var i = 0; i < length; i++) {
            Constructor.resolve(entries[i]).then(resolve, reject);
          }
        });
      }
    }

    /**
      `Promise.reject` returns a promise rejected with the passed `reason`.
      It is shorthand for the following:

      ```javascript
      let promise = new Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      let promise = Promise.reject(new Error('WHOOPS'));

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      @method reject
      @static
      @param {Any} reason value that the returned promise will be rejected with.
      Useful for tooling.
      @return {Promise} a promise rejected with the given `reason`.
    */
    function reject$1(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(noop);
      reject(promise, reason);
      return promise;
    }

    function needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      let promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          let xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function Promise$2(resolver) {
      this[PROMISE_ID] = nextId();
      this._result = this._state = undefined;
      this._subscribers = [];

      if (noop !== resolver) {
        typeof resolver !== 'function' && needsResolver();
        this instanceof Promise$2 ? initializePromise(this, resolver) : needsNew();
      }
    }

    Promise$2.all = all$1;
    Promise$2.race = race$1;
    Promise$2.resolve = resolve$1;
    Promise$2.reject = reject$1;
    Promise$2._setScheduler = setScheduler;
    Promise$2._setAsap = setAsap;
    Promise$2._asap = asap;

    Promise$2.prototype = {
      constructor: Promise$2,

      /**
        The primary way of interacting with a promise is through its `then` method,
        which registers callbacks to receive either a promise's eventual value or the
        reason why the promise cannot be fulfilled.
      
        ```js
        findUser().then(function(user){
          // user is available
        }, function(reason){
          // user is unavailable, and you are given the reason why
        });
        ```
      
        Chaining
        --------
      
        The return value of `then` is itself a promise.  This second, 'downstream'
        promise is resolved with the return value of the first promise's fulfillment
        or rejection handler, or rejected if the handler throws an exception.
      
        ```js
        findUser().then(function (user) {
          return user.name;
        }, function (reason) {
          return 'default name';
        }).then(function (userName) {
          // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
          // will be `'default name'`
        });
      
        findUser().then(function (user) {
          throw new Error('Found user, but still unhappy');
        }, function (reason) {
          throw new Error('`findUser` rejected and we're unhappy');
        }).then(function (value) {
          // never reached
        }, function (reason) {
          // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
          // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
        });
        ```
        If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
      
        ```js
        findUser().then(function (user) {
          throw new PedagogicalException('Upstream error');
        }).then(function (value) {
          // never reached
        }).then(function (value) {
          // never reached
        }, function (reason) {
          // The `PedgagocialException` is propagated all the way down to here
        });
        ```
      
        Assimilation
        ------------
      
        Sometimes the value you want to propagate to a downstream promise can only be
        retrieved asynchronously. This can be achieved by returning a promise in the
        fulfillment or rejection handler. The downstream promise will then be pending
        until the returned promise is settled. This is called *assimilation*.
      
        ```js
        findUser().then(function (user) {
          return findCommentsByAuthor(user);
        }).then(function (comments) {
          // The user's comments are now available
        });
        ```
      
        If the assimliated promise rejects, then the downstream promise will also reject.
      
        ```js
        findUser().then(function (user) {
          return findCommentsByAuthor(user);
        }).then(function (comments) {
          // If `findCommentsByAuthor` fulfills, we'll have the value here
        }, function (reason) {
          // If `findCommentsByAuthor` rejects, we'll have the reason here
        });
        ```
      
        Simple Example
        --------------
      
        Synchronous Example
      
        ```javascript
        let result;
      
        try {
          result = findResult();
          // success
        } catch(reason) {
          // failure
        }
        ```
      
        Errback Example
      
        ```js
        findResult(function(result, err){
          if (err) {
            // failure
          } else {
            // success
          }
        });
        ```
      
        Promise Example;
      
        ```javascript
        findResult().then(function(result){
          // success
        }, function(reason){
          // failure
        });
        ```
      
        Advanced Example
        --------------
      
        Synchronous Example
      
        ```javascript
        let author, books;
      
        try {
          author = findAuthor();
          books  = findBooksByAuthor(author);
          // success
        } catch(reason) {
          // failure
        }
        ```
      
        Errback Example
      
        ```js
      
        function foundBooks(books) {
      
        }
      
        function failure(reason) {
      
        }
      
        findAuthor(function(author, err){
          if (err) {
            failure(err);
            // failure
          } else {
            try {
              findBoooksByAuthor(author, function(books, err) {
                if (err) {
                  failure(err);
                } else {
                  try {
                    foundBooks(books);
                  } catch(reason) {
                    failure(reason);
                  }
                }
              });
            } catch(error) {
              failure(err);
            }
            // success
          }
        });
        ```
      
        Promise Example;
      
        ```javascript
        findAuthor().
          then(findBooksByAuthor).
          then(function(books){
            // found books
        }).catch(function(reason){
          // something went wrong
        });
        ```
      
        @method then
        @param {Function} onFulfilled
        @param {Function} onRejected
        Useful for tooling.
        @return {Promise}
      */
      then: then,

      /**
        `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
        as the catch block of a try/catch statement.
      
        ```js
        function findAuthor(){
          throw new Error('couldn't find that author');
        }
      
        // synchronous
        try {
          findAuthor();
        } catch(reason) {
          // something went wrong
        }
      
        // async with promises
        findAuthor().catch(function(reason){
          // something went wrong
        });
        ```
      
        @method catch
        @param {Function} onRejection
        Useful for tooling.
        @return {Promise}
      */
      'catch': function _catch(onRejection) {
        return this.then(null, onRejection);
      }
    };

    /*global self*/
    function polyfill$1() {
        var local = undefined;

        if (typeof global !== 'undefined') {
            local = global;
        } else if (typeof self !== 'undefined') {
            local = self;
        } else {
            try {
                local = Function('return this')();
            } catch (e) {
                throw new Error('polyfill failed because global object is unavailable in this environment');
            }
        }

        var P = local.Promise;

        if (P) {
            var promiseToString = null;
            try {
                promiseToString = Object.prototype.toString.call(P.resolve());
            } catch (e) {
                // silently ignored
            }

            if (promiseToString === '[object Promise]' && !P.cast) {
                return;
            }
        }

        local.Promise = Promise$2;
    }

    // Strange compat..
    Promise$2.polyfill = polyfill$1;
    Promise$2.Promise = Promise$2;

    return Promise$2;

    })));



    /* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7), __webpack_require__(8)));

    /***/ }),
    /* 5 */
    /***/ (function(module, exports) {

    // removed by extract-text-webpack-plugin

    /***/ }),
    /* 6 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global VERSION */

    __webpack_require__(5);

    var _es6Promise = __webpack_require__(4);

    var _es6Promise2 = _interopRequireDefault(_es6Promise);

    var _utils = __webpack_require__(0);

    var Utils = _interopRequireWildcard(_utils);

    var _api = __webpack_require__(1);

    var API = _interopRequireWildcard(_api);

    var _button = __webpack_require__(2);

    var _push = __webpack_require__(3);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Noty = function () {
      /**
       * @param {object} options
       * @return {Noty}
       */
      function Noty() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Noty);

        this.options = Utils.deepExtend({}, API.Defaults, options);

        if (API.Store[this.options.id]) {
          return API.Store[this.options.id];
        }

        this.id = this.options.id || Utils.generateID('bar');
        this.closeTimer = -1;
        this.barDom = null;
        this.layoutDom = null;
        this.progressDom = null;
        this.showing = false;
        this.shown = false;
        this.closed = false;
        this.closing = false;
        this.killable = this.options.timeout || this.options.closeWith.length > 0;
        this.hasSound = this.options.sounds.sources.length > 0;
        this.soundPlayed = false;
        this.listeners = {
          beforeShow: [],
          onShow: [],
          afterShow: [],
          onClose: [],
          afterClose: [],
          onClick: [],
          onHover: [],
          onTemplate: []
        };
        this.promises = {
          show: null,
          close: null
        };
        this.on('beforeShow', this.options.callbacks.beforeShow);
        this.on('onShow', this.options.callbacks.onShow);
        this.on('afterShow', this.options.callbacks.afterShow);
        this.on('onClose', this.options.callbacks.onClose);
        this.on('afterClose', this.options.callbacks.afterClose);
        this.on('onClick', this.options.callbacks.onClick);
        this.on('onHover', this.options.callbacks.onHover);
        this.on('onTemplate', this.options.callbacks.onTemplate);

        return this;
      }

      /**
       * @param {string} eventName
       * @param {function} cb
       * @return {Noty}
       */


      _createClass(Noty, [{
        key: 'on',
        value: function on(eventName) {
          var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

          if (typeof cb === 'function' && this.listeners.hasOwnProperty(eventName)) {
            this.listeners[eventName].push(cb);
          }

          return this;
        }

        /**
         * @return {Noty}
         */

      }, {
        key: 'show',
        value: function show() {
          var _this = this;

          if (this.showing || this.shown) {
            return this; // preventing multiple show
          }

          if (this.options.killer === true) {
            Noty.closeAll();
          } else if (typeof this.options.killer === 'string') {
            Noty.closeAll(this.options.killer);
          }

          var queueCounts = API.getQueueCounts(this.options.queue);

          if (queueCounts.current >= queueCounts.maxVisible || API.PageHidden && this.options.visibilityControl) {
            API.addToQueue(this);

            if (API.PageHidden && this.hasSound && Utils.inArray('docHidden', this.options.sounds.conditions)) {
              Utils.createAudioElements(this);
            }

            if (API.PageHidden && Utils.inArray('docHidden', this.options.titleCount.conditions)) {
              API.docTitle.increment();
            }

            return this;
          }

          API.Store[this.id] = this;

          API.fire(this, 'beforeShow');

          this.showing = true;

          if (this.closing) {
            this.showing = false;
            return this;
          }

          API.build(this);
          API.handleModal(this);

          if (this.options.force) {
            this.layoutDom.insertBefore(this.barDom, this.layoutDom.firstChild);
          } else {
            this.layoutDom.appendChild(this.barDom);
          }

          if (this.hasSound && !this.soundPlayed && Utils.inArray('docVisible', this.options.sounds.conditions)) {
            Utils.createAudioElements(this);
          }

          if (Utils.inArray('docVisible', this.options.titleCount.conditions)) {
            API.docTitle.increment();
          }

          this.shown = true;
          this.closed = false;

          // bind button events if any
          if (API.hasButtons(this)) {
            Object.keys(this.options.buttons).forEach(function (key) {
              var btn = _this.barDom.querySelector('#' + _this.options.buttons[key].id);
              Utils.addListener(btn, 'click', function (e) {
                Utils.stopPropagation(e);
                _this.options.buttons[key].cb(_this);
              });
            });
          }

          this.progressDom = this.barDom.querySelector('.noty_progressbar');

          if (Utils.inArray('click', this.options.closeWith)) {
            Utils.addClass(this.barDom, 'noty_close_with_click');
            Utils.addListener(this.barDom, 'click', function (e) {
              Utils.stopPropagation(e);
              API.fire(_this, 'onClick');
              _this.close();
            }, false);
          }

          Utils.addListener(this.barDom, 'mouseenter', function () {
            API.fire(_this, 'onHover');
          }, false);

          if (this.options.timeout) Utils.addClass(this.barDom, 'noty_has_timeout');
          if (this.options.progressBar) {
            Utils.addClass(this.barDom, 'noty_has_progressbar');
          }

          if (Utils.inArray('button', this.options.closeWith)) {
            Utils.addClass(this.barDom, 'noty_close_with_button');

            var closeButton = document.createElement('div');
            Utils.addClass(closeButton, 'noty_close_button');
            closeButton.innerHTML = '×';
            this.barDom.appendChild(closeButton);

            Utils.addListener(closeButton, 'click', function (e) {
              Utils.stopPropagation(e);
              _this.close();
            }, false);
          }

          API.fire(this, 'onShow');

          if (this.options.animation.open === null) {
            this.promises.show = new _es6Promise2.default(function (resolve) {
              resolve();
            });
          } else if (typeof this.options.animation.open === 'function') {
            this.promises.show = new _es6Promise2.default(this.options.animation.open.bind(this));
          } else {
            Utils.addClass(this.barDom, this.options.animation.open);
            this.promises.show = new _es6Promise2.default(function (resolve) {
              Utils.addListener(_this.barDom, Utils.animationEndEvents, function () {
                Utils.removeClass(_this.barDom, _this.options.animation.open);
                resolve();
              });
            });
          }

          this.promises.show.then(function () {
            var _t = _this;
            setTimeout(function () {
              API.openFlow(_t);
            }, 100);
          });

          return this;
        }

        /**
         * @return {Noty}
         */

      }, {
        key: 'stop',
        value: function stop() {
          API.dequeueClose(this);
          return this;
        }

        /**
         * @return {Noty}
         */

      }, {
        key: 'resume',
        value: function resume() {
          API.queueClose(this);
          return this;
        }

        /**
         * @param {int|boolean} ms
         * @return {Noty}
         */

      }, {
        key: 'setTimeout',
        value: function (_setTimeout) {
          function setTimeout(_x) {
            return _setTimeout.apply(this, arguments);
          }

          setTimeout.toString = function () {
            return _setTimeout.toString();
          };

          return setTimeout;
        }(function (ms) {
          this.stop();
          this.options.timeout = ms;

          if (this.barDom) {
            if (this.options.timeout) {
              Utils.addClass(this.barDom, 'noty_has_timeout');
            } else {
              Utils.removeClass(this.barDom, 'noty_has_timeout');
            }

            var _t = this;
            setTimeout(function () {
              // ugly fix for progressbar display bug
              _t.resume();
            }, 100);
          }

          return this;
        })

        /**
         * @param {string} html
         * @param {boolean} optionsOverride
         * @return {Noty}
         */

      }, {
        key: 'setText',
        value: function setText(html) {
          var optionsOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

          if (this.barDom) {
            this.barDom.querySelector('.noty_body').innerHTML = html;
          }

          if (optionsOverride) this.options.text = html;

          return this;
        }

        /**
         * @param {string} type
         * @param {boolean} optionsOverride
         * @return {Noty}
         */

      }, {
        key: 'setType',
        value: function setType(type) {
          var _this2 = this;

          var optionsOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

          if (this.barDom) {
            var classList = Utils.classList(this.barDom).split(' ');

            classList.forEach(function (c) {
              if (c.substring(0, 11) === 'noty_type__') {
                Utils.removeClass(_this2.barDom, c);
              }
            });

            Utils.addClass(this.barDom, 'noty_type__' + type);
          }

          if (optionsOverride) this.options.type = type;

          return this;
        }

        /**
         * @param {string} theme
         * @param {boolean} optionsOverride
         * @return {Noty}
         */

      }, {
        key: 'setTheme',
        value: function setTheme(theme) {
          var _this3 = this;

          var optionsOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

          if (this.barDom) {
            var classList = Utils.classList(this.barDom).split(' ');

            classList.forEach(function (c) {
              if (c.substring(0, 12) === 'noty_theme__') {
                Utils.removeClass(_this3.barDom, c);
              }
            });

            Utils.addClass(this.barDom, 'noty_theme__' + theme);
          }

          if (optionsOverride) this.options.theme = theme;

          return this;
        }

        /**
         * @return {Noty}
         */

      }, {
        key: 'close',
        value: function close() {
          var _this4 = this;

          if (this.closed) return this;

          if (!this.shown) {
            // it's in the queue
            API.removeFromQueue(this);
            return this;
          }

          API.fire(this, 'onClose');

          this.closing = true;

          if (this.options.animation.close === null || this.options.animation.close === false) {
            this.promises.close = new _es6Promise2.default(function (resolve) {
              resolve();
            });
          } else if (typeof this.options.animation.close === 'function') {
            this.promises.close = new _es6Promise2.default(this.options.animation.close.bind(this));
          } else {
            Utils.addClass(this.barDom, this.options.animation.close);
            this.promises.close = new _es6Promise2.default(function (resolve) {
              Utils.addListener(_this4.barDom, Utils.animationEndEvents, function () {
                if (_this4.options.force) {
                  Utils.remove(_this4.barDom);
                } else {
                  API.ghostFix(_this4);
                }
                resolve();
              });
            });
          }

          this.promises.close.then(function () {
            API.closeFlow(_this4);
            API.handleModalClose(_this4);
          });

          this.closed = true;

          return this;
        }

        // API functions

        /**
         * @param {boolean|string} queueName
         * @return {Noty}
         */

      }], [{
        key: 'closeAll',
        value: function closeAll() {
          var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

          Object.keys(API.Store).forEach(function (id) {
            if (queueName) {
              if (API.Store[id].options.queue === queueName && API.Store[id].killable) {
                API.Store[id].close();
              }
            } else if (API.Store[id].killable) {
              API.Store[id].close();
            }
          });
          return this;
        }

        /**
         * @param {string} queueName
         * @return {Noty}
         */

      }, {
        key: 'clearQueue',
        value: function clearQueue() {
          var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'global';

          if (API.Queues.hasOwnProperty(queueName)) {
            API.Queues[queueName].queue = [];
          }
          return this;
        }

        /**
         * @return {API.Queues}
         */

      }, {
        key: 'overrideDefaults',


        /**
         * @param {Object} obj
         * @return {Noty}
         */
        value: function overrideDefaults(obj) {
          API.Defaults = Utils.deepExtend({}, API.Defaults, obj);
          return this;
        }

        /**
         * @param {int} amount
         * @param {string} queueName
         * @return {Noty}
         */

      }, {
        key: 'setMaxVisible',
        value: function setMaxVisible() {
          var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : API.DefaultMaxVisible;
          var queueName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'global';

          if (!API.Queues.hasOwnProperty(queueName)) {
            API.Queues[queueName] = { maxVisible: amount, queue: [] };
          }

          API.Queues[queueName].maxVisible = amount;
          return this;
        }

        /**
         * @param {string} innerHtml
         * @param {String} classes
         * @param {Function} cb
         * @param {Object} attributes
         * @return {NotyButton}
         */

      }, {
        key: 'button',
        value: function button(innerHtml) {
          var classes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
          var cb = arguments[2];
          var attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

          return new _button.NotyButton(innerHtml, classes, cb, attributes);
        }

        /**
         * @return {string}
         */

      }, {
        key: 'version',
        value: function version() {
          return "3.2.0-beta";
        }

        /**
         * @param {String} workerPath
         * @return {Push}
         */

      }, {
        key: 'Push',
        value: function Push(workerPath) {
          return new _push.Push(workerPath);
        }
      }, {
        key: 'Queues',
        get: function get() {
          return API.Queues;
        }

        /**
         * @return {API.PageHidden}
         */

      }, {
        key: 'PageHidden',
        get: function get() {
          return API.PageHidden;
        }
      }]);

      return Noty;
    }();

    // Document visibility change controller


    exports.default = Noty;
    if (typeof window !== 'undefined') {
      Utils.visibilityChangeFlow();
    }
    module.exports = exports['default'];

    /***/ }),
    /* 7 */
    /***/ (function(module, exports) {

    // shim for using process in browser
    var process = module.exports = {};

    // cached from whatever global is present so that test runners that stub it
    // don't break things.  But we need to wrap it in a try catch in case it is
    // wrapped in strict mode code which doesn't define any globals.  It's inside a
    // function because try/catches deoptimize in certain engines.

    var cachedSetTimeout;
    var cachedClearTimeout;

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    (function () {
        try {
            if (typeof setTimeout === 'function') {
                cachedSetTimeout = setTimeout;
            } else {
                cachedSetTimeout = defaultSetTimout;
            }
        } catch (e) {
            cachedSetTimeout = defaultSetTimout;
        }
        try {
            if (typeof clearTimeout === 'function') {
                cachedClearTimeout = clearTimeout;
            } else {
                cachedClearTimeout = defaultClearTimeout;
            }
        } catch (e) {
            cachedClearTimeout = defaultClearTimeout;
        }
    } ());
    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }


    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }



    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }

    process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    };

    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};

    function noop() {}

    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;

    process.listeners = function (name) { return [] };

    process.binding = function (name) {
        throw new Error('process.binding is not supported');
    };

    process.cwd = function () { return '/' };
    process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
    };
    process.umask = function() { return 0; };


    /***/ }),
    /* 8 */
    /***/ (function(module, exports) {

    var g;

    // This works in non-strict mode
    g = (function() {
    	return this;
    })();

    try {
    	// This works if eval is allowed (see CSP)
    	g = g || Function("return this")() || (1,eval)("this");
    } catch(e) {
    	// This works if the window reference is available
    	if(typeof window === "object")
    		g = window;
    }

    // g can still be undefined, but nothing to do about it...
    // We return undefined, instead of nothing here, so it's
    // easier to handle this case. if(!global) { ...}

    module.exports = g;


    /***/ }),
    /* 9 */
    /***/ (function(module, exports) {

    /* (ignored) */

    /***/ })
    /******/ ]);
    });

    });

    var Noty = /*@__PURE__*/getDefaultExportFromCjs(noty);

    /* src\Components\Product.svelte generated by Svelte v3.32.3 */
    const file$2 = "src\\Components\\Product.svelte";

    // (98:4) {:else}
    function create_else_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading";
    			add_location(p, file$2, 98, 4, 5535);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(98:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (29:0) {#if product}
    function create_if_block$2(ctx) {
    	let div5;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div0;
    	let t1_value = /*product*/ ctx[0].cost + "";
    	let t1;
    	let t2;
    	let svg;
    	let title;
    	let t3;
    	let desc;
    	let t4;
    	let defs;
    	let filter;
    	let feOffset;
    	let feGaussianBlur;
    	let feColorMatrix;
    	let feMerge;
    	let feMergeNode0;
    	let feMergeNode1;
    	let radialGradient;
    	let stop0;
    	let stop1;
    	let g7;
    	let g6;
    	let g5;
    	let g4;
    	let g3;
    	let g2;
    	let g1;
    	let g0;
    	let circle;
    	let path0;
    	let path1;
    	let t5;
    	let div4;
    	let div1;
    	let t6_value = /*product*/ ctx[0].category + "";
    	let t6;
    	let t7;
    	let div3;
    	let div2;
    	let t8_value = /*product*/ ctx[0].name + "";
    	let t8;
    	let t9;

    	function select_block_type_1(ctx, dirty) {
    		if (/*avaiablePoints*/ ctx[1] < /*product*/ ctx[0].cost) return create_if_block_1$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = text(" points\r\n            ");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t3 = text("money");
    			desc = svg_element("desc");
    			t4 = text("Created with Sketch.");
    			defs = svg_element("defs");
    			filter = svg_element("filter");
    			feOffset = svg_element("feOffset");
    			feGaussianBlur = svg_element("feGaussianBlur");
    			feColorMatrix = svg_element("feColorMatrix");
    			feMerge = svg_element("feMerge");
    			feMergeNode0 = svg_element("feMergeNode");
    			feMergeNode1 = svg_element("feMergeNode");
    			radialGradient = svg_element("radialGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			g7 = svg_element("g");
    			g6 = svg_element("g");
    			g5 = svg_element("g");
    			g4 = svg_element("g");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			circle = svg_element("circle");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t5 = space();
    			div4 = element("div");
    			div1 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			if_block.c();
    			if (img.src !== (img_src_value = /*product*/ ctx[0].img.url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*product*/ ctx[0].name);
    			attr_dev(img, "class", "svelte-5uonqq");
    			add_location(img, file$2, 30, 8, 1300);
    			add_location(title, file$2, 34, 3, 1647);
    			add_location(desc, file$2, 35, 3, 1672);
    			attr_dev(feOffset, "dx", "2");
    			attr_dev(feOffset, "dy", "2");
    			attr_dev(feOffset, "in", "SourceAlpha");
    			attr_dev(feOffset, "result", "shadowOffsetOuter1");
    			add_location(feOffset, file$2, 38, 5, 1834);
    			attr_dev(feGaussianBlur, "stdDeviation", "2");
    			attr_dev(feGaussianBlur, "in", "shadowOffsetOuter1");
    			attr_dev(feGaussianBlur, "result", "shadowBlurOuter1");
    			add_location(feGaussianBlur, file$2, 39, 5, 1921);
    			attr_dev(feColorMatrix, "values", "0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0");
    			attr_dev(feColorMatrix, "type", "matrix");
    			attr_dev(feColorMatrix, "in", "shadowBlurOuter1");
    			attr_dev(feColorMatrix, "result", "shadowMatrixOuter1");
    			add_location(feColorMatrix, file$2, 40, 5, 2028);
    			attr_dev(feMergeNode0, "in", "shadowMatrixOuter1");
    			add_location(feMergeNode0, file$2, 42, 6, 2203);
    			attr_dev(feMergeNode1, "in", "SourceGraphic");
    			add_location(feMergeNode1, file$2, 43, 6, 2262);
    			add_location(feMerge, file$2, 41, 5, 2186);
    			attr_dev(filter, "x", "-9.1%");
    			attr_dev(filter, "y", "-9.1%");
    			attr_dev(filter, "width", "128.3%");
    			attr_dev(filter, "height", "128.3%");
    			attr_dev(filter, "filterUnits", "objectBoundingBox");
    			attr_dev(filter, "id", "filter-1");
    			add_location(filter, file$2, 37, 4, 1722);
    			attr_dev(stop0, "stop-color", "#FFCF00");
    			attr_dev(stop0, "offset", "0%");
    			add_location(stop0, file$2, 47, 5, 2443);
    			attr_dev(stop1, "stop-color", "#F7AE15");
    			attr_dev(stop1, "offset", "100%");
    			add_location(stop1, file$2, 48, 5, 2496);
    			attr_dev(radialGradient, "cx", "50%");
    			attr_dev(radialGradient, "cy", "50%");
    			attr_dev(radialGradient, "fx", "50%");
    			attr_dev(radialGradient, "fy", "50%");
    			attr_dev(radialGradient, "r", "68.6284858%");
    			attr_dev(radialGradient, "id", "radialGradient-2");
    			add_location(radialGradient, file$2, 46, 4, 2346);
    			add_location(defs, file$2, 36, 3, 1710);
    			attr_dev(circle, "id", "Oval-Copy-3");
    			attr_dev(circle, "fill", "url(#radialGradient-2)");
    			attr_dev(circle, "cx", "13");
    			attr_dev(circle, "cy", "13");
    			attr_dev(circle, "r", "13");
    			add_location(circle, file$2, 59, 11, 3089);
    			attr_dev(path0, "d", "M13,3.0952381 C7.54580357,3.0952381 3.0952381,7.54657738 3.0952381,13 C3.0952381,18.4541964 7.54657738,22.9047619 13,22.9047619 C18.4541964,22.9047619 22.9047619,18.4534226 22.9047619,13 C22.9047619,7.54580357 18.4534226,3.0952381 13,3.0952381 Z M13,21.7440476 C8.17850893,21.7440476 4.25595238,17.8214911 4.25595238,13 C4.25595238,8.17850893 8.17850893,4.25595238 13,4.25595238 C17.8214911,4.25595238 21.7440476,8.17850893 21.7440476,13 C21.7440476,17.8214911 17.8214911,21.7440476 13,21.7440476 Z");
    			attr_dev(path0, "id", "Shape");
    			attr_dev(path0, "fill", "#F8B013");
    			attr_dev(path0, "fill-rule", "nonzero");
    			add_location(path0, file$2, 60, 11, 3189);
    			attr_dev(path1, "d", "M13,5.2962963 C8.76834769,5.2962963 5.2962963,8.76956614 5.2962963,13 C5.2962963,17.2316523 8.76956614,20.7037037 13,20.7037037 C17.2316523,20.7037037 20.7037037,17.2304339 20.7037037,13 C20.7037037,8.76834769 17.2304339,5.2962963 13,5.2962963 Z M13,19.5245654 C9.40233107,19.5245654 6.47543462,16.5976689 6.47543462,13 C6.47543462,9.40233107 9.40233107,6.47543462 13,6.47543462 C16.5976689,6.47543462 19.5245654,9.40233107 19.5245654,13 C19.5245654,16.5976689 16.5976689,19.5245654 13,19.5245654 Z");
    			attr_dev(path1, "id", "Shape");
    			attr_dev(path1, "fill", "#F8B013");
    			attr_dev(path1, "fill-rule", "nonzero");
    			add_location(path1, file$2, 61, 11, 3764);
    			add_location(g0, file$2, 58, 10, 3073);
    			attr_dev(g1, "transform", "translate(108.000000, 11.000000)");
    			add_location(g1, file$2, 57, 9, 3013);
    			attr_dev(g2, "id", "money");
    			attr_dev(g2, "transform", "translate(71.000000, 100.000000)");
    			add_location(g2, file$2, 56, 8, 2943);
    			attr_dev(g3, "id", "product-card-hover");
    			attr_dev(g3, "filter", "url(#filter-1)");
    			attr_dev(g3, "transform", "translate(300.000000, 0.000000)");
    			add_location(g3, file$2, 55, 7, 2838);
    			attr_dev(g4, "id", "line-1");
    			add_location(g4, file$2, 54, 6, 2814);
    			attr_dev(g5, "id", "products");
    			attr_dev(g5, "transform", "translate(132.000000, 622.000000)");
    			add_location(g5, file$2, 53, 5, 2743);
    			attr_dev(g6, "id", "Catalog-pg1");
    			attr_dev(g6, "transform", "translate(-609.000000, -731.000000)");
    			add_location(g6, file$2, 52, 4, 2668);
    			attr_dev(g7, "id", "Page-1");
    			attr_dev(g7, "stroke", "none");
    			attr_dev(g7, "stroke-width", "1");
    			attr_dev(g7, "fill", "none");
    			attr_dev(g7, "fill-rule", "evenodd");
    			add_location(g7, file$2, 51, 3, 2584);
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 34 34");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg, file$2, 32, 12, 1415);
    			attr_dev(div0, "class", "cost-badge svelte-5uonqq");
    			add_location(div0, file$2, 31, 8, 1356);
    			attr_dev(div1, "class", "category svelte-5uonqq");
    			add_location(div1, file$2, 73, 12, 4513);
    			add_location(div2, file$2, 75, 16, 4611);
    			attr_dev(div3, "class", "redeem svelte-5uonqq");
    			add_location(div3, file$2, 74, 12, 4573);
    			attr_dev(div4, "class", "product-information svelte-5uonqq");
    			add_location(div4, file$2, 72, 8, 4466);
    			attr_dev(div5, "class", "card svelte-5uonqq");
    			add_location(div5, file$2, 29, 4, 1272);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, img);
    			append_dev(div5, t0);
    			append_dev(div5, div0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, svg);
    			append_dev(svg, title);
    			append_dev(title, t3);
    			append_dev(svg, desc);
    			append_dev(desc, t4);
    			append_dev(svg, defs);
    			append_dev(defs, filter);
    			append_dev(filter, feOffset);
    			append_dev(filter, feGaussianBlur);
    			append_dev(filter, feColorMatrix);
    			append_dev(filter, feMerge);
    			append_dev(feMerge, feMergeNode0);
    			append_dev(feMerge, feMergeNode1);
    			append_dev(defs, radialGradient);
    			append_dev(radialGradient, stop0);
    			append_dev(radialGradient, stop1);
    			append_dev(svg, g7);
    			append_dev(g7, g6);
    			append_dev(g6, g5);
    			append_dev(g5, g4);
    			append_dev(g4, g3);
    			append_dev(g3, g2);
    			append_dev(g2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, circle);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, t6);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, t8);
    			append_dev(div3, t9);
    			if_block.m(div3, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*product*/ 1 && img.src !== (img_src_value = /*product*/ ctx[0].img.url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*product*/ 1 && img_alt_value !== (img_alt_value = /*product*/ ctx[0].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*product*/ 1 && t1_value !== (t1_value = /*product*/ ctx[0].cost + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*product*/ 1 && t6_value !== (t6_value = /*product*/ ctx[0].category + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*product*/ 1 && t8_value !== (t8_value = /*product*/ ctx[0].name + "")) set_data_dev(t8, t8_value);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div3, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(29:0) {#if product}",
    		ctx
    	});

    	return block;
    }

    // (86:20) {:else}
    function create_else_block$1(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Redeem";
    			attr_dev(span, "class", "button enabled svelte-5uonqq");
    			add_location(span, file$2, 88, 28, 5242);
    			attr_dev(div0, "class", "redeem-button svelte-5uonqq");
    			add_location(div0, file$2, 87, 24, 5185);
    			attr_dev(div1, "class", "button-container svelte-5uonqq");
    			add_location(div1, file$2, 86, 20, 5129);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(86:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (77:16) {#if avaiablePoints < product.cost}
    function create_if_block_1$2(ctx) {
    	let div1;
    	let span0;
    	let t0;
    	let t1_value = /*product*/ ctx[0].cost - /*avaiablePoints*/ ctx[1] + "";
    	let t1;
    	let t2;
    	let t3;
    	let div0;
    	let span1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span0 = element("span");
    			t0 = text("You need ");
    			t1 = text(t1_value);
    			t2 = text(" points.");
    			t3 = space();
    			div0 = element("div");
    			span1 = element("span");
    			span1.textContent = "Redeem";
    			attr_dev(span0, "class", "danger svelte-5uonqq");
    			add_location(span0, file$2, 78, 24, 4767);
    			attr_dev(span1, "class", "button svelte-5uonqq");
    			add_location(span1, file$2, 80, 27, 4925);
    			attr_dev(div0, "class", "redeem-button svelte-5uonqq");
    			add_location(div0, file$2, 79, 24, 4869);
    			attr_dev(div1, "class", "button-container svelte-5uonqq");
    			add_location(div1, file$2, 77, 20, 4711);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(span0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, span1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*product, avaiablePoints*/ 3 && t1_value !== (t1_value = /*product*/ ctx[0].cost - /*avaiablePoints*/ ctx[1] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(77:16) {#if avaiablePoints < product.cost}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*product*/ ctx[0]) return create_if_block$2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Product", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	let { product } = $$props;
    	let { avaiablePoints } = $$props;
    	const dispatch = createEventDispatcher();

    	const redeem = productId => __awaiter(void 0, void 0, void 0, function* () {
    		yield api.redeemProduct(productId).then(m => {
    			new Noty({
    					theme: "sunset",
    					type: "success",
    					text: m.message,
    					timeout: 3000
    				}).show();
    		}).catch();

    		dispatch("message");
    	});

    	const writable_props = ["product", "avaiablePoints"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Product> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => redeem(product._id);

    	$$self.$$set = $$props => {
    		if ("product" in $$props) $$invalidate(0, product = $$props.product);
    		if ("avaiablePoints" in $$props) $$invalidate(1, avaiablePoints = $$props.avaiablePoints);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		createEventDispatcher,
    		Noty,
    		api,
    		product,
    		avaiablePoints,
    		dispatch,
    		redeem
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("product" in $$props) $$invalidate(0, product = $$props.product);
    		if ("avaiablePoints" in $$props) $$invalidate(1, avaiablePoints = $$props.avaiablePoints);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [product, avaiablePoints, redeem, click_handler];
    }

    class Product extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { product: 0, avaiablePoints: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Product",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*product*/ ctx[0] === undefined && !("product" in props)) {
    			console.warn("<Product> was created without expected prop 'product'");
    		}

    		if (/*avaiablePoints*/ ctx[1] === undefined && !("avaiablePoints" in props)) {
    			console.warn("<Product> was created without expected prop 'avaiablePoints'");
    		}
    	}

    	get product() {
    		throw new Error("<Product>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set product(value) {
    		throw new Error("<Product>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get avaiablePoints() {
    		throw new Error("<Product>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set avaiablePoints(value) {
    		throw new Error("<Product>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Products.svelte generated by Svelte v3.32.3 */
    const file$3 = "src\\Components\\Products.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (72:8) {:else}
    function create_else_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading . . .";
    			add_location(p, file$3, 72, 12, 2758);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(72:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (66:8) {#if sortedProducts}
    function create_if_block$3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*sortedProducts*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*product*/ ctx[12]._id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sortedProducts, avaiablePoints*/ 3) {
    				each_value = /*sortedProducts*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, fix_and_outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(66:8) {#if sortedProducts}",
    		ctx
    	});

    	return block;
    }

    // (67:12) {#each sortedProducts as product(product._id) }
    function create_each_block$1(key_1, ctx) {
    	let div;
    	let product;
    	let t;
    	let div_intro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	product = new Product({
    			props: {
    				product: /*product*/ ctx[12],
    				avaiablePoints: /*avaiablePoints*/ ctx[0]
    			},
    			$$inline: true
    		});

    	product.$on("message", /*message_handler*/ ctx[8]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(product.$$.fragment);
    			t = space();
    			add_location(div, file$3, 67, 16, 2507);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(product, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const product_changes = {};
    			if (dirty & /*sortedProducts*/ 2) product_changes.product = /*product*/ ctx[12];
    			if (dirty & /*avaiablePoints*/ 1) product_changes.avaiablePoints = /*avaiablePoints*/ ctx[0];
    			product.$set(product_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 1000 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(product.$$.fragment, local);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fly, { y: 50, duration: 500 });
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(product.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(product);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(67:12) {#each sortedProducts as product(product._id) }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div5;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div4;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*sortedProducts*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "All Products";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Points: Higher";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Points: Lower";
    			t5 = space();
    			div4 = element("div");
    			if_block.c();
    			attr_dev(div0, "class", "order-selector selected svelte-1kay7q8");
    			add_location(div0, file$3, 60, 8, 2042);
    			attr_dev(div1, "class", "order-selector svelte-1kay7q8");
    			add_location(div1, file$3, 61, 8, 2153);
    			attr_dev(div2, "class", "order-selector svelte-1kay7q8");
    			add_location(div2, file$3, 62, 8, 2256);
    			attr_dev(div3, "class", "order-by svelte-1kay7q8");
    			add_location(div3, file$3, 59, 4, 2010);
    			attr_dev(div4, "class", "products-container svelte-1kay7q8");
    			add_location(div4, file$3, 64, 4, 2365);
    			add_location(div5, file$3, 58, 0, 1999);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			if_blocks[current_block_type_index].m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[6], false, false, false),
    					listen_dev(div2, "click", /*click_handler_2*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div4, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Products", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	let { avaiablePoints } = $$props;
    	let products;
    	let sortedProducts;

    	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    		yield api.getProducts().then(p => products = p);
    		$$invalidate(1, sortedProducts = [...products]);
    	}));

    	const toggleSelect = e => {
    		let actual = document.getElementsByClassName("selected")[0];

    		if (!e.classList.contains("selected")) {
    			actual.classList.toggle("selected");
    			e.classList.toggle("selected");
    		}
    	};

    	const orderNormal = e => {
    		toggleSelect(e);
    		$$invalidate(1, sortedProducts = [...products]);
    	};

    	const orderHigher = e => {
    		toggleSelect(e);

    		$$invalidate(1, sortedProducts = sortedProducts.sort((a, b) => {
    			if (a.cost < b.cost) {
    				return 1;
    			}

    			if (a.cost > b.cost) {
    				return -1;
    			}

    			return 0;
    		}));
    	};

    	const orderLower = e => {
    		toggleSelect(e);

    		$$invalidate(1, sortedProducts = sortedProducts.sort((a, b) => {
    			if (a.cost < b.cost) {
    				return -1;
    			}

    			if (a.cost > b.cost) {
    				return 1;
    			}

    			return 0;
    		}));
    	};

    	const writable_props = ["avaiablePoints"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Products> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => orderNormal(e.currentTarget);
    	const click_handler_1 = e => orderHigher(e.currentTarget);
    	const click_handler_2 = e => orderLower(e.currentTarget);

    	function message_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("avaiablePoints" in $$props) $$invalidate(0, avaiablePoints = $$props.avaiablePoints);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		fly,
    		flip,
    		api,
    		Product,
    		avaiablePoints,
    		products,
    		sortedProducts,
    		toggleSelect,
    		orderNormal,
    		orderHigher,
    		orderLower
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("avaiablePoints" in $$props) $$invalidate(0, avaiablePoints = $$props.avaiablePoints);
    		if ("products" in $$props) products = $$props.products;
    		if ("sortedProducts" in $$props) $$invalidate(1, sortedProducts = $$props.sortedProducts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		avaiablePoints,
    		sortedProducts,
    		orderNormal,
    		orderHigher,
    		orderLower,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		message_handler
    	];
    }

    class Products extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { avaiablePoints: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Products",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*avaiablePoints*/ ctx[0] === undefined && !("avaiablePoints" in props)) {
    			console.warn("<Products> was created without expected prop 'avaiablePoints'");
    		}
    	}

    	get avaiablePoints() {
    		throw new Error("<Products>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set avaiablePoints(value) {
    		throw new Error("<Products>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Pages\Index.svelte generated by Svelte v3.32.3 */
    const file$4 = "src\\Pages\\Index.svelte";

    // (25:8) <Link to="/">
    function create_default_slot_1$1(ctx) {
    	let svg;
    	let title;
    	let t0;
    	let desc;
    	let t1;
    	let defs;
    	let linearGradient;
    	let stop0;
    	let stop1;
    	let g2;
    	let g1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text("logo");
    			desc = svg_element("desc");
    			t1 = text("Created with Sketch.");
    			defs = svg_element("defs");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			add_location(title, file$4, 27, 4, 1426);
    			add_location(desc, file$4, 28, 4, 1451);
    			attr_dev(stop0, "stop-color", "#FF8800");
    			attr_dev(stop0, "offset", "0%");
    			add_location(stop0, file$4, 31, 6, 1585);
    			attr_dev(stop1, "stop-color", "#FF6600");
    			attr_dev(stop1, "offset", "100%");
    			add_location(stop1, file$4, 32, 6, 1639);
    			attr_dev(linearGradient, "x1", "50%");
    			attr_dev(linearGradient, "y1", "0%");
    			attr_dev(linearGradient, "x2", "50%");
    			attr_dev(linearGradient, "y2", "100%");
    			attr_dev(linearGradient, "id", "linearGradient-1");
    			add_location(linearGradient, file$4, 30, 5, 1503);
    			add_location(defs, file$4, 29, 4, 1490);
    			attr_dev(path, "d", "M46.868244,16.404544 C46.6405958,16.0177278 46.1363003,15.8851051 45.7421767,16.1085325 L32.2482382,23.7546496 C31.9411566,23.9287916 31.7816812,24.2764781 31.8528973,24.6175933 L36.3942582,46.3988127 C36.4161301,46.5037148 36.370779,46.6585782 36.3020649,46.734636 L35.7503076,47.3453612 C34.6032406,48.615134 33.631475,49.3030396 31.7844202,49.3030396 C29.7133694,49.3030396 28.7409951,48.2316035 27.2013263,46.3378469 C25.3624888,44.0763908 23.0744418,41.2620414 17.5113649,41.2620414 L17.3738021,41.2620414 C16.6150762,41.2620414 16,41.8657137 16,42.6103723 C16,43.3550308 16.6150762,43.9587031 17.3738021,43.9587031 L17.5113649,43.9587031 C21.7514649,43.9587031 23.3553499,45.9313165 25.0535812,48.0198254 C26.5704243,49.8855042 28.2896551,52 31.7844202,52 C34.8013676,52 36.461556,50.6226953 37.8061413,49.134573 L42.7657069,43.6456657 C42.7657069,43.645367 54.5617185,30.5894981 54.5617185,30.5894981 C54.7969752,30.3290319 54.8362354,29.9499819 54.6588037,29.6482951 L46.868244,16.404544 Z");
    			attr_dev(path, "id", "logo");
    			add_location(path, file$4, 38, 7, 1936);
    			attr_dev(g0, "id", "top");
    			add_location(g0, file$4, 37, 6, 1915);
    			attr_dev(g1, "id", "Catalog");
    			attr_dev(g1, "transform", "translate(-16.000000, -16.000000)");
    			attr_dev(g1, "fill", "url(#linearGradient-1)");
    			add_location(g1, file$4, 36, 5, 1815);
    			attr_dev(g2, "id", "Page-1");
    			attr_dev(g2, "stroke", "none");
    			attr_dev(g2, "stroke-width", "1");
    			attr_dev(g2, "fill", "none");
    			attr_dev(g2, "fill-rule", "evenodd");
    			add_location(g2, file$4, 35, 4, 1730);
    			attr_dev(svg, "width", "39px");
    			attr_dev(svg, "height", "36px");
    			attr_dev(svg, "viewBox", "0 0 39 36");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg, file$4, 25, 3, 1192);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(svg, desc);
    			append_dev(desc, t1);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    			append_dev(svg, g2);
    			append_dev(g2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(25:8) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (86:2) {#if _user}
    function create_if_block_2$1(ctx) {
    	let p;
    	let t_value = /*_user*/ ctx[0].points + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$4, 86, 2, 6096);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*_user*/ 1 && t_value !== (t_value = /*_user*/ ctx[0].points + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(86:2) {#if _user}",
    		ctx
    	});

    	return block;
    }

    // (91:2) {#if _user}
    function create_if_block_1$3(ctx) {
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: "history",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};

    			if (dirty & /*$$scope, _user*/ 9) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(91:2) {#if _user}",
    		ctx
    	});

    	return block;
    }

    // (92:8) <Link to="history">
    function create_default_slot$1(ctx) {
    	let t_value = /*_user*/ ctx[0].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*_user*/ 1 && t_value !== (t_value = /*_user*/ ctx[0].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(92:8) <Link to=\\\"history\\\">",
    		ctx
    	});

    	return block;
    }

    // (102:1) {#if _user}
    function create_if_block$4(ctx) {
    	let products;
    	let current;

    	products = new Products({
    			props: { avaiablePoints: /*_user*/ ctx[0].points },
    			$$inline: true
    		});

    	products.$on("message", /*subtractPoints*/ ctx[1]);

    	const block = {
    		c: function create() {
    			create_component(products.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(products, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const products_changes = {};
    			if (dirty & /*_user*/ 1) products_changes.avaiablePoints = /*_user*/ ctx[0].points;
    			products.$set(products_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(products.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(products.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(products, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(102:1) {#if _user}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let header;
    	let h1;
    	let link;
    	let t0;
    	let div0;
    	let svg;
    	let title;
    	let t1;
    	let desc;
    	let t2;
    	let defs;
    	let filter;
    	let feOffset;
    	let feGaussianBlur;
    	let feColorMatrix;
    	let feMerge;
    	let feMergeNode0;
    	let feMergeNode1;
    	let radialGradient;
    	let stop0;
    	let stop1;
    	let g7;
    	let g6;
    	let g5;
    	let g4;
    	let g3;
    	let g2;
    	let g1;
    	let g0;
    	let circle;
    	let path0;
    	let path1;
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let main;
    	let div2;
    	let p;
    	let t7;
    	let current;

    	link = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*_user*/ ctx[0] && create_if_block_2$1(ctx);
    	let if_block1 = /*_user*/ ctx[0] && create_if_block_1$3(ctx);
    	let if_block2 = /*_user*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			create_component(link.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t1 = text("money");
    			desc = svg_element("desc");
    			t2 = text("Created with Sketch.");
    			defs = svg_element("defs");
    			filter = svg_element("filter");
    			feOffset = svg_element("feOffset");
    			feGaussianBlur = svg_element("feGaussianBlur");
    			feColorMatrix = svg_element("feColorMatrix");
    			feMerge = svg_element("feMerge");
    			feMergeNode0 = svg_element("feMergeNode");
    			feMergeNode1 = svg_element("feMergeNode");
    			radialGradient = svg_element("radialGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			g7 = svg_element("g");
    			g6 = svg_element("g");
    			g5 = svg_element("g");
    			g4 = svg_element("g");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			circle = svg_element("circle");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t5 = space();
    			main = element("main");
    			div2 = element("div");
    			p = element("p");
    			p.textContent = "Electronics";
    			t7 = space();
    			if (if_block2) if_block2.c();
    			add_location(h1, file$4, 23, 1, 1160);
    			add_location(title, file$4, 48, 3, 3288);
    			add_location(desc, file$4, 49, 3, 3313);
    			attr_dev(feOffset, "dx", "2");
    			attr_dev(feOffset, "dy", "2");
    			attr_dev(feOffset, "in", "SourceAlpha");
    			attr_dev(feOffset, "result", "shadowOffsetOuter1");
    			add_location(feOffset, file$4, 52, 5, 3475);
    			attr_dev(feGaussianBlur, "stdDeviation", "2");
    			attr_dev(feGaussianBlur, "in", "shadowOffsetOuter1");
    			attr_dev(feGaussianBlur, "result", "shadowBlurOuter1");
    			add_location(feGaussianBlur, file$4, 53, 5, 3562);
    			attr_dev(feColorMatrix, "values", "0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0");
    			attr_dev(feColorMatrix, "type", "matrix");
    			attr_dev(feColorMatrix, "in", "shadowBlurOuter1");
    			attr_dev(feColorMatrix, "result", "shadowMatrixOuter1");
    			add_location(feColorMatrix, file$4, 54, 5, 3669);
    			attr_dev(feMergeNode0, "in", "shadowMatrixOuter1");
    			add_location(feMergeNode0, file$4, 56, 6, 3844);
    			attr_dev(feMergeNode1, "in", "SourceGraphic");
    			add_location(feMergeNode1, file$4, 57, 6, 3903);
    			add_location(feMerge, file$4, 55, 5, 3827);
    			attr_dev(filter, "x", "-9.1%");
    			attr_dev(filter, "y", "-9.1%");
    			attr_dev(filter, "width", "128.3%");
    			attr_dev(filter, "height", "128.3%");
    			attr_dev(filter, "filterUnits", "objectBoundingBox");
    			attr_dev(filter, "id", "filter-1");
    			add_location(filter, file$4, 51, 4, 3363);
    			attr_dev(stop0, "stop-color", "#FFCF00");
    			attr_dev(stop0, "offset", "0%");
    			add_location(stop0, file$4, 61, 5, 4084);
    			attr_dev(stop1, "stop-color", "#F7AE15");
    			attr_dev(stop1, "offset", "100%");
    			add_location(stop1, file$4, 62, 5, 4137);
    			attr_dev(radialGradient, "cx", "50%");
    			attr_dev(radialGradient, "cy", "50%");
    			attr_dev(radialGradient, "fx", "50%");
    			attr_dev(radialGradient, "fy", "50%");
    			attr_dev(radialGradient, "r", "68.6284858%");
    			attr_dev(radialGradient, "id", "radialGradient-2");
    			add_location(radialGradient, file$4, 60, 4, 3987);
    			add_location(defs, file$4, 50, 3, 3351);
    			attr_dev(circle, "id", "Oval-Copy-3");
    			attr_dev(circle, "fill", "url(#radialGradient-2)");
    			attr_dev(circle, "cx", "13");
    			attr_dev(circle, "cy", "13");
    			attr_dev(circle, "r", "13");
    			add_location(circle, file$4, 73, 11, 4730);
    			attr_dev(path0, "d", "M13,3.0952381 C7.54580357,3.0952381 3.0952381,7.54657738 3.0952381,13 C3.0952381,18.4541964 7.54657738,22.9047619 13,22.9047619 C18.4541964,22.9047619 22.9047619,18.4534226 22.9047619,13 C22.9047619,7.54580357 18.4534226,3.0952381 13,3.0952381 Z M13,21.7440476 C8.17850893,21.7440476 4.25595238,17.8214911 4.25595238,13 C4.25595238,8.17850893 8.17850893,4.25595238 13,4.25595238 C17.8214911,4.25595238 21.7440476,8.17850893 21.7440476,13 C21.7440476,17.8214911 17.8214911,21.7440476 13,21.7440476 Z");
    			attr_dev(path0, "id", "Shape");
    			attr_dev(path0, "fill", "#F8B013");
    			attr_dev(path0, "fill-rule", "nonzero");
    			add_location(path0, file$4, 74, 11, 4830);
    			attr_dev(path1, "d", "M13,5.2962963 C8.76834769,5.2962963 5.2962963,8.76956614 5.2962963,13 C5.2962963,17.2316523 8.76956614,20.7037037 13,20.7037037 C17.2316523,20.7037037 20.7037037,17.2304339 20.7037037,13 C20.7037037,8.76834769 17.2304339,5.2962963 13,5.2962963 Z M13,19.5245654 C9.40233107,19.5245654 6.47543462,16.5976689 6.47543462,13 C6.47543462,9.40233107 9.40233107,6.47543462 13,6.47543462 C16.5976689,6.47543462 19.5245654,9.40233107 19.5245654,13 C19.5245654,16.5976689 16.5976689,19.5245654 13,19.5245654 Z");
    			attr_dev(path1, "id", "Shape");
    			attr_dev(path1, "fill", "#F8B013");
    			attr_dev(path1, "fill-rule", "nonzero");
    			add_location(path1, file$4, 75, 11, 5405);
    			add_location(g0, file$4, 72, 10, 4714);
    			attr_dev(g1, "transform", "translate(108.000000, 11.000000)");
    			add_location(g1, file$4, 71, 9, 4654);
    			attr_dev(g2, "id", "money");
    			attr_dev(g2, "transform", "translate(71.000000, 100.000000)");
    			add_location(g2, file$4, 70, 8, 4584);
    			attr_dev(g3, "id", "product-card-hover");
    			attr_dev(g3, "filter", "url(#filter-1)");
    			attr_dev(g3, "transform", "translate(300.000000, 0.000000)");
    			add_location(g3, file$4, 69, 7, 4479);
    			attr_dev(g4, "id", "line-1");
    			add_location(g4, file$4, 68, 6, 4455);
    			attr_dev(g5, "id", "products");
    			attr_dev(g5, "transform", "translate(132.000000, 622.000000)");
    			add_location(g5, file$4, 67, 5, 4384);
    			attr_dev(g6, "id", "Catalog-pg1");
    			attr_dev(g6, "transform", "translate(-609.000000, -731.000000)");
    			add_location(g6, file$4, 66, 4, 4309);
    			attr_dev(g7, "id", "Page-1");
    			attr_dev(g7, "stroke", "none");
    			attr_dev(g7, "stroke-width", "1");
    			attr_dev(g7, "fill", "none");
    			attr_dev(g7, "fill-rule", "evenodd");
    			add_location(g7, file$4, 65, 3, 4225);
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 34 34");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg, file$4, 46, 2, 3056);
    			attr_dev(div0, "class", "coins svelte-72hnn1");
    			add_location(div0, file$4, 45, 1, 3033);
    			attr_dev(div1, "class", "link user-info");
    			add_location(div1, file$4, 89, 1, 6138);
    			attr_dev(header, "class", "svelte-72hnn1");
    			add_location(header, file$4, 22, 0, 1149);
    			attr_dev(p, "class", "svelte-72hnn1");
    			add_location(p, file$4, 99, 2, 6318);
    			attr_dev(div2, "class", "section svelte-72hnn1");
    			add_location(div2, file$4, 98, 1, 6293);
    			attr_dev(main, "class", "svelte-72hnn1");
    			add_location(main, file$4, 97, 0, 6284);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			mount_component(link, h1, null);
    			append_dev(header, t0);
    			append_dev(header, div0);
    			append_dev(div0, svg);
    			append_dev(svg, title);
    			append_dev(title, t1);
    			append_dev(svg, desc);
    			append_dev(desc, t2);
    			append_dev(svg, defs);
    			append_dev(defs, filter);
    			append_dev(filter, feOffset);
    			append_dev(filter, feGaussianBlur);
    			append_dev(filter, feColorMatrix);
    			append_dev(filter, feMerge);
    			append_dev(feMerge, feMergeNode0);
    			append_dev(feMerge, feMergeNode1);
    			append_dev(defs, radialGradient);
    			append_dev(radialGradient, stop0);
    			append_dev(radialGradient, stop1);
    			append_dev(svg, g7);
    			append_dev(g7, g6);
    			append_dev(g6, g5);
    			append_dev(g5, g4);
    			append_dev(g4, g3);
    			append_dev(g3, g2);
    			append_dev(g2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, circle);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(div0, t3);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(header, t4);
    			append_dev(header, div1);
    			if (if_block1) if_block1.m(div1, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, p);
    			append_dev(main, t7);
    			if (if_block2) if_block2.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);

    			if (/*_user*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*_user*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*_user*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*_user*/ ctx[0]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*_user*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(main, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(link);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(main);
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Index", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	let _user;

    	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    		yield api.getUser().then(u => {
    			$$invalidate(0, _user = u);
    		});
    	}));

    	const subtractPoints = () => __awaiter(void 0, void 0, void 0, function* () {
    		yield api.getUser().then(u => {
    			$$invalidate(0, _user = u);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		Link,
    		Products,
    		api,
    		_user,
    		subtractPoints
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("_user" in $$props) $$invalidate(0, _user = $$props._user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [_user, subtractPoints];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.32.3 */

    // (6:0) <Router>
    function create_default_slot$2(ctx) {
    	let route0;
    	let t;
    	let route1;
    	let current;

    	route0 = new Route({
    			props: { path: "/", component: Index },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: { path: "/history", component: History },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t = space();
    			create_component(route1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(route1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(route1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(6:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, Route, History, Index });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
