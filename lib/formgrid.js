'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function noop() {}

function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
	return tar;
}

function assignTrue(tar, src) {
	for (var k in src) tar[k] = 1;
	return tar;
}

function appendNode(node, target) {
	target.appendChild(node);
}

function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function destroyEach(iterations, detach) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detach);
	}
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function createComment() {
	return document.createComment('');
}

function addListener(node, event, handler) {
	node.addEventListener(event, handler, false);
}

function removeListener(node, event, handler) {
	node.removeEventListener(event, handler, false);
}

function setAttribute(node, attribute, value) {
	node.setAttribute(attribute, value);
}

function toNumber(value) {
	return value === '' ? undefined : +value;
}

function setStyle(node, key, value) {
	node.style.setProperty(key, value);
}

function selectOption(select, value) {
	for (var i = 0; i < select.options.length; i += 1) {
		var option = select.options[i];

		if (option.__value === value) {
			option.selected = true;
			return;
		}
	}
}

function selectValue(select) {
	var selectedOption = select.querySelector(':checked') || select.options[0];
	return selectedOption && selectedOption.__value;
}

function getSpreadUpdate(levels, updates) {
	var update = {};

	var to_null_out = {};
	var accounted_for = {};

	var i = levels.length;
	while (i--) {
		var o = levels[i];
		var n = updates[i];

		if (n) {
			for (var key in o) {
				if (!(key in n)) to_null_out[key] = 1;
			}

			for (var key in n) {
				if (!accounted_for[key]) {
					update[key] = n[key];
					accounted_for[key] = 1;
				}
			}

			levels[i] = n;
		} else {
			for (var key in o) {
				accounted_for[key] = 1;
			}
		}
	}

	for (var key in to_null_out) {
		if (!(key in update)) update[key] = undefined;
	}

	return update;
}

function blankObject() {
	return Object.create(null);
}

function destroy(detach) {
	this.destroy = noop;
	this.fire('destroy');
	this.set = noop;

	this._fragment.d(detach !== false);
	this._fragment = null;
	this._state = {};
}

function _differs(a, b) {
	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		var handler = handlers[i];

		if (!handler.__calling) {
			handler.__calling = true;
			handler.call(this, data);
			handler.__calling = false;
		}
	}
}

function get() {
	return this._state;
}

function init(component, options) {
	component._handlers = blankObject();
	component._bind = options._bind;

	component.options = options;
	component.root = options.root || component;
	component.store = component.root.store || options.store;
}

function on(eventName, handler) {
	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set(newState) {
	this._set(assign({}, newState));
	if (this.root._lock) return;
	this.root._lock = true;
	callAll(this.root._beforecreate);
	callAll(this.root._oncreate);
	callAll(this.root._aftercreate);
	this.root._lock = false;
}

function _set(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

	for (var key in newState) {
		if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign(assign({}, oldState), newState);
	this._recompute(changed, this._state);
	if (this._bind) this._bind(changed, this._state);

	if (this._fragment) {
		this.fire("state", { changed: changed, current: this._state, previous: oldState });
		this._fragment.p(changed, this._state);
		this.fire("update", { changed: changed, current: this._state, previous: oldState });
	}
}

function callAll(fns) {
	while (fns && fns.length) fns.shift()();
}

function _mount(target, anchor) {
	this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
}

var proto = {
	destroy,
	get,
	fire,
	on,
	set,
	_recompute: noop,
	_set,
	_mount,
	_differs
};

var intialData = { 
    type: 'text',
    placeholder: '',
    label: '',
    inputClass: '',
    value: '',
    text: '',
    class: '',
    readOnly: false,
    required: false,
    pattern: '',
    validate: null,
    uniqueId: false,
    submit: false,
    error: '',
};

var fieldBase = {
    data: function data() {
        return Object.assign({}, intialData);
    },
    fieldData: function fieldData(data) {
        // console.log('field-base', data);
        return Object.assign({}, { settings: null }, intialData, data);
    },
    oncreate: function oncreate(p) {
        var ref = p.get();
        var uuid = ref.uuid;
        var settings = ref.settings;
        var type = ref.type;
        var element = p.refs.input;
        element.onkeyup = function (e) {
            if (p.get().submit) {
                var error = element.checkValidity() ? '' : element.validationMessage;
                p.set({error: error});
            }
        };
        element.setError = function (error) {
            p.set({error: error, submit: true});
        };
        if (uuid) {
            element.setAttribute('id', uuid);
        }
        p.set({ element: element });        
    },
    validate: function validate(p) { 
        var ref = p.get();
        var element = ref.element;       
        if (element.checkValidity) {
            element.setError(element.validationMessage);
        }
        return element.checkValidity();
    },
    mergeProps: function mergeProps(p, s) {
        var t = p.get(), n = {};   
        for (var k in s) {
            if (t[k] !== undefined) {
                n[k] = s[k];
            }
        }                            
        p.set(n);
    },
    makeUniqueId: function makeUniqueId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
}

/* src\Field.html generated by Svelte v2.5.0 */

function settings(all) { 
				return all.settings;
			}

function message(ref) {
    var submit = ref.submit;
    var error = ref.error;

    return submit ? error : '';
}

function label(ref) {
    var settings = ref.settings;
 
    return settings ? settings.label : null;
}

function data() {
    var initialData = { 
        uuid: fieldBase.makeUniqueId(),
        submit: false,
        error: '',
        settings: null,
        fieldtype: null,
        value: '',
    };
    return Object.assign({}, initialData, fieldBase.fieldData());
}
function add_css() {
	var style = createElement("style");
	style.id = 'svelte-u293zm-style';
	style.textContent = ".invalid-feedback.svelte-u293zm{display:block}";
	appendNode(style, document.head);
}

function create_main_fragment(component, ctx) {
	var div, label_1, text, text_1, div_1, div_2, switch_instance_updating = {}, text_2;

	var switch_instance_spread_levels = [
		ctx.settings,
		{ uuid: ctx.uuid }
	];

	var switch_value = ctx.fieldtype;

	function switch_props(ctx) {
		var switch_instance_initial_data = {};
		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_initial_data = assign(switch_instance_initial_data, switch_instance_spread_levels[i]);
		}
		if ('value' in ctx) {
			switch_instance_initial_data.value = ctx.value ;
			switch_instance_updating.value = true;
		}
		if ('submit' in ctx) {
			switch_instance_initial_data.submit = ctx.submit ;
			switch_instance_updating.submit = true;
		}
		if ('error' in ctx) {
			switch_instance_initial_data.error = ctx.error ;
			switch_instance_updating.error = true;
		}
		return {
			root: component.root,
			data: switch_instance_initial_data,
			_bind: function(changed, childState) {
				var newState = {};
				if (!switch_instance_updating.value && changed.value) {
					newState.value = childState.value;
				}

				if (!switch_instance_updating.submit && changed.submit) {
					newState.submit = childState.submit;
				}

				if (!switch_instance_updating.error && changed.error) {
					newState.error = childState.error;
				}
				component._set(newState);
				switch_instance_updating = {};
			}
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));

		component.root._beforecreate.push(function() {
			switch_instance._bind({ value: 1, submit: 1, error: 1 }, switch_instance.get());
		});
	}

	var if_block = (ctx.submit && ctx.error) && create_if_block(component, ctx);

	return {
		c: function c() {
			div = createElement("div");
			label_1 = createElement("label");
			text = createText(ctx.label);
			text_1 = createText("\r\n    ");
			div_1 = createElement("div");
			div_2 = createElement("div");
			if (switch_instance) { switch_instance._fragment.c(); }
			text_2 = createText("\r\n            ");
			if (if_block) { if_block.c(); }
			label_1.className = "col-4 col-form-label";
			label_1.htmlFor = ctx.uuid;
			div_2.className = "form-group";
			div_1.className = "col-8";
			div.className = "form-group row";
		},

		m: function m(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label_1, div);
			appendNode(text, label_1);
			appendNode(text_1, div);
			appendNode(div_1, div);
			appendNode(div_2, div_1);

			if (switch_instance) {
				switch_instance._mount(div_2, null);
			}

			appendNode(text_2, div_2);
			if (if_block) { if_block.m(div_2, null); }
		},

		p: function p(changed, _ctx) {
			ctx = _ctx;
			if (changed.label) {
				text.data = ctx.label;
			}

			if (changed.uuid) {
				label_1.htmlFor = ctx.uuid;
			}

			var switch_instance_changes = {};
			var switch_instance_changes = (changed.settings || changed.uuid) && getSpreadUpdate(switch_instance_spread_levels, [
				changed.settings && ctx.settings,
				changed.uuid && { uuid: ctx.uuid }
			]);
			if (!switch_instance_updating.value && changed.value) {
				switch_instance_changes.value = ctx.value ;
				switch_instance_updating.value = true;
			}
			if (!switch_instance_updating.submit && changed.submit) {
				switch_instance_changes.submit = ctx.submit ;
				switch_instance_updating.submit = true;
			}
			if (!switch_instance_updating.error && changed.error) {
				switch_instance_changes.error = ctx.error ;
				switch_instance_updating.error = true;
			}

			if (switch_value !== (switch_value = ctx.fieldtype)) {
				if (switch_instance) { switch_instance.destroy(); }

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					switch_instance._fragment.c();
					switch_instance._mount(div_2, text_2);
				}
			}

			else if (switch_value) {
				switch_instance._set(switch_instance_changes);
				switch_instance_updating = {};
			}

			if (ctx.submit && ctx.error) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block(component, ctx);
					if_block.c();
					if_block.m(div_2, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(div);
			}

			if (switch_instance) { switch_instance.destroy(); }
			if (if_block) { if_block.d(); }
		}
	};
}

// (6:12) {#if submit && error}
function create_if_block(component, ctx) {
	var div, text;

	return {
		c: function c() {
			div = createElement("div");
			text = createText(ctx.message);
			div.className = "invalid-feedback svelte-u293zm";
		},

		m: function m(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(text, div);
		},

		p: function p(changed, ctx) {
			if (changed.message) {
				text.data = ctx.message;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

function Field(options) {
	init(this, options);
	this._state = assign(data(), options.data);
	this._recompute({ submit: 1, error: 1, settings: 1 }, this._state);

	if (!document.getElementById("svelte-u293zm-style")) { add_css(); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(Field.prototype, proto);

Field.prototype._recompute = function _recompute(changed, state) {
	if (changed.submit || changed.error) {
		if (this._differs(state.message, (state.message = message(state)))) { changed.message = true; }
	}

	if (changed.settings) {
		if (this._differs(state.label, (state.label = label(state)))) { changed.label = true; }
	}

	if (this._differs(state.settings, (state.settings = settings(state)))) { changed.settings = true; }
};

/* src\inputs\MaskedInput.html generated by Svelte v2.5.0 */

var data$1 = fieldBase.data;

var methods = {
    handleChange: function handleChange(e) {
        var ref = this.get();
        var maxlength = ref.maxlength;
        var pattern = ref.pattern;
        var placeholder = ref.placeholder;
        var text = ref.text;
        e.target.value = this.handleCurrentValue(e);
        // document.getElementById(uuid + 'Mask').innerHTML = this.setValueOfMask(e);
        this.set({ value: e.target.value });
    },

    handleCurrentValue: function handleCurrentValue(e) {
        var ref = this.get();
        var charset = ref.charset;
        var validExample = ref.validExample;
        var isCharsetPresent = charset,
            maskedNumber = 'XMDY',
            maskedLetter = '_',
            placeholder = isCharsetPresent || this.get().placeholder,
            value = e.target.value, l = placeholder.length;
        var i, j, isInt, isLetter, strippedValue, matchesNumber, matchesLetter, newValue = '';

        // strip special characters
        strippedValue = isCharsetPresent ? value.replace(/\W/g, "") : value.replace(/\D/g, "");

        for (i = 0, j = 0; i < l; i++) {
            isInt = !isNaN(parseInt(strippedValue[j]));
            isLetter = strippedValue[j] ? strippedValue[j].match(/[A-Z]/i) : false;
            matchesNumber = (maskedNumber.indexOf(placeholder[i]) >= 0);
            matchesLetter = (maskedLetter.indexOf(placeholder[i]) >= 0);
            if ((matchesNumber && isInt) || (isCharsetPresent && matchesLetter && isLetter)) {
                newValue += strippedValue[j++];
            } else if ((!isCharsetPresent && !isInt && matchesNumber) || (isCharsetPresent && ((matchesLetter && !isLetter) || (matchesNumber && !isInt)))) {
                return newValue;
            } else {
                newValue += placeholder[i];
            }
            // break if no characters left and the pattern is non-special character
            if (strippedValue[j] == undefined) {
                break;
            }
        }

        if (validExample) {
            return this.validateProgress(e, newValue);
        }                
        return newValue;
    },

    validateProgress: function validateProgress(e, value) {
        var ref = this.get();
        var pattern = ref.pattern;
        var placeholder = ref.placeholder;
        var validExample = ref.validExample;
        var l = value.length, testValue = '', i;
        var regex = new RegExp(this.props.pattern);

        //convert to months
        if ((l == 1) && (placeholder.toUpperCase().substr(0, 2) == 'MM')) {
            if(value > 1 && value < 10) {
                value = '0' + value;
            }
            return value;
        }

        for ( i = l; i >= 0; i--) {
            testValue = value + validExample.substr(value.length);
            if (regex.test(testValue)) {
                return value;
            } else {
                value = value.substr(0, value.length-1);
            }
        }

        return value;
    },
};

function oncreate() {
    fieldBase.oncreate(this);
}
function onstate(ref) {
    var changed = ref.changed;
    var current = ref.current;

    if (changed.value) {
        this.set({ text: current.value });
    }
}
function create_main_fragment$1(component, ctx) {
	var input, input_updating = false, input_class_value;

	function input_input_handler() {
		input_updating = true;
		component.set({ text: input.value });
		input_updating = false;
	}

	function input_handler(event) {
		component.handleChange(event);
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function c() {
			input = createElement("input");
			addListener(input, "input", input_input_handler);
			addListener(input, "input", input_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "text");
			input.className = input_class_value = "form-control masked " + ctx.inputClass;
			input.readOnly = ctx.readOnly;
			input.required = ctx.required;
			input.pattern = ctx.pattern;
			input.placeholder = ctx.placeholder;
		},

		m: function m(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = ctx.text;
		},

		p: function p(changed, ctx) {
			if (!input_updating) { input.value = ctx.text; }
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control masked " + ctx.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.readOnly) {
				input.readOnly = ctx.readOnly;
			}

			if (changed.required) {
				input.required = ctx.required;
			}

			if (changed.pattern) {
				input.pattern = ctx.pattern;
			}

			if (changed.placeholder) {
				input.placeholder = ctx.placeholder;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(input);
			}

			removeListener(input, "input", input_input_handler);
			removeListener(input, "input", input_handler);
			removeListener(input, "change", change_handler);
			if (component.refs.input === input) { component.refs.input = null; }
		}
	};
}

function MaskedInput(options) {
	var this$1 = this;

	init(this, options);
	this.refs = {};
	this._state = assign(data$1(), options.data);

	this._handlers.state = [onstate];

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$1(this, this._state);

	this.root._oncreate.push(function () {
		onstate.call(this$1, { changed: assignTrue({}, this$1._state), current: this$1._state });
		oncreate.call(this$1);
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(MaskedInput.prototype, proto);
assign(MaskedInput.prototype, methods);

function formatCurrency(data, alwaysShowCents) {
    if ( alwaysShowCents === void 0 ) alwaysShowCents = true;

    var options = {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    };
  
    if (!alwaysShowCents) {
        options.minimumFractionDigits = 0;
        options.maximumFractionDigits = 0;
    }
  
    return Number(data).toLocaleString('en-US', options);
}

/* src\inputs\CurrencyInput.html generated by Svelte v2.5.0 */

var toNumber$1 = function (v) { return Number(v.replace(/[^0-9\.]+/g,"")); };

var data$2 = fieldBase.data;

var methods$1 = {
    blur: function blur(text) {
        var value = text ? toNumber$1(text) : 0;
        if (!isNaN(value)) {
            this.set({ text: formatCurrency(value) });
        }
        if (fieldBase.validate(this)) {                    
            this.set({ value: value });
        }              
    },
};

function oncreate$1() {
    fieldBase.oncreate(this, true);
}
function onstate$1(ref) {
    var changed = ref.changed;
    var current = ref.current;
    var previous = ref.previous;

    if (changed.value) {
        this.set({ text: formatCurrency(current.value) });
    }
}
function create_main_fragment$2(component, ctx) {
	var input, input_updating = false, input_class_value;

	function input_input_handler() {
		input_updating = true;
		component.set({ text: input.value });
		input_updating = false;
	}

	function blur_handler(event) {
		component.blur(ctx.text);
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function c() {
			input = createElement("input");
			addListener(input, "input", input_input_handler);
			addListener(input, "blur", blur_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "text");
			input.className = input_class_value = "form-control " + ctx.inputClass;
			input.id = ctx.uuid;
			input.placeholder = ctx.placeholder;
			input.pattern = "^(?!\\(.*[^)]$|[^(].*\\)$)\\(?\\$?(0|[1-9]\\d{0,2}(,?\\d{3})?)(\\.\\d\\d?)?\\)?$";
			input.readOnly = ctx.readOnly;
			input.required = ctx.required;
		},

		m: function m(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = ctx.text;
		},

		p: function p(changed, _ctx) {
			ctx = _ctx;
			if (!input_updating) { input.value = ctx.text; }
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control " + ctx.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.uuid) {
				input.id = ctx.uuid;
			}

			if (changed.placeholder) {
				input.placeholder = ctx.placeholder;
			}

			if (changed.readOnly) {
				input.readOnly = ctx.readOnly;
			}

			if (changed.required) {
				input.required = ctx.required;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(input);
			}

			removeListener(input, "input", input_input_handler);
			removeListener(input, "blur", blur_handler);
			removeListener(input, "change", change_handler);
			if (component.refs.input === input) { component.refs.input = null; }
		}
	};
}

function CurrencyInput(options) {
	var this$1 = this;

	init(this, options);
	this.refs = {};
	this._state = assign(data$2(), options.data);

	this._handlers.state = [onstate$1];

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$2(this, this._state);

	this.root._oncreate.push(function () {
		onstate$1.call(this$1, { changed: assignTrue({}, this$1._state), current: this$1._state });
		oncreate$1.call(this$1);
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(CurrencyInput.prototype, proto);
assign(CurrencyInput.prototype, methods$1);

/* src\inputs\SelectInput.html generated by Svelte v2.5.0 */

function isObjectOptions(ref) {
    var optionList = ref.optionList;

    var listType = typeof optionList[0];
    return optionList ? listType === 'object' : false;
}

function data$3() {
    return { 
        uuid: '',
        label: '',
        inputClass: '',
        value: '',
        optionList: [],
        getOptionName: function (x) { return x.name; },
        optionValue: 'id'
    }
}
function oncreate$2() {
    fieldBase.oncreate(this);
}
function create_main_fragment$3(component, ctx) {
	var select, select_updating = false, select_class_value;

	function select_block_type(ctx) {
		if (ctx.isObjectOptions) { return create_if_block$1; }
		return create_if_block_1;
	}

	var current_block_type = select_block_type(ctx);
	var if_block = current_block_type(component, ctx);

	function select_change_handler() {
		select_updating = true;
		component.set({ value: selectValue(select) });
		select_updating = false;
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function c() {
			select = createElement("select");
			if_block.c();
			addListener(select, "change", select_change_handler);
			if (!('value' in ctx)) { component.root._beforecreate.push(select_change_handler); }
			addListener(select, "change", change_handler);
			select.className = select_class_value = "form-control " + ctx.inputClass;
		},

		m: function m(target, anchor) {
			insertNode(select, target, anchor);
			if_block.m(select, null);
			component.refs.input = select;

			selectOption(select, ctx.value);
		},

		p: function p(changed, ctx) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(changed, ctx);
			} else {
				if_block.d(1);
				if_block = current_block_type(component, ctx);
				if_block.c();
				if_block.m(select, null);
			}

			if (!select_updating) { selectOption(select, ctx.value); }
			if ((changed.inputClass) && select_class_value !== (select_class_value = "form-control " + ctx.inputClass)) {
				select.className = select_class_value;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(select);
			}

			if_block.d();
			removeListener(select, "change", select_change_handler);
			removeListener(select, "change", change_handler);
			if (component.refs.input === select) { component.refs.input = null; }
		}
	};
}

// (3:8) {#each optionList as opt}
function create_each_block(component, ctx) {
	var option, text_value = ctx.getOptionName(ctx.opt), text, option_value_value;

	return {
		c: function c() {
			option = createElement("option");
			text = createText(text_value);
			option.__value = option_value_value = ctx.opt[ctx.optionValue];
			option.value = option.__value;
		},

		m: function m(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function p(changed, ctx) {
			if ((changed.getOptionName || changed.optionList) && text_value !== (text_value = ctx.getOptionName(ctx.opt))) {
				text.data = text_value;
			}

			if ((changed.optionList || changed.optionValue) && option_value_value !== (option_value_value = ctx.opt[ctx.optionValue])) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		d: function d(detach) {
			if (detach) {
				detachNode(option);
			}
		}
	};
}

// (7:8) {#each optionList as opt}
function create_each_block_1(component, ctx) {
	var option, text_value = ctx.opt, text, option_value_value;

	return {
		c: function c() {
			option = createElement("option");
			text = createText(text_value);
			option.__value = option_value_value = ctx.opt;
			option.value = option.__value;
		},

		m: function m(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function p(changed, ctx) {
			if ((changed.optionList) && text_value !== (text_value = ctx.opt)) {
				text.data = text_value;
			}

			if ((changed.optionList) && option_value_value !== (option_value_value = ctx.opt)) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		d: function d(detach) {
			if (detach) {
				detachNode(option);
			}
		}
	};
}

// (2:4) {#if isObjectOptions }
function create_if_block$1(component, ctx) {
	var each_anchor;

	var each_value = ctx.optionList;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
	}

	return {
		c: function c() {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_anchor = createComment();
		},

		m: function m(target, anchor) {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insertNode(each_anchor, target, anchor);
		},

		p: function p(changed, ctx) {
			if (changed.optionList || changed.optionValue || changed.getOptionName) {
				each_value = ctx.optionList;

				for (var i = 0; i < each_value.length; i += 1) {
					var child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_anchor.parentNode, each_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}
		},

		d: function d(detach) {
			destroyEach(each_blocks, detach);

			if (detach) {
				detachNode(each_anchor);
			}
		}
	};
}

// (6:4) {:else}
function create_if_block_1(component, ctx) {
	var each_anchor;

	var each_value_1 = ctx.optionList;

	var each_blocks = [];

	for (var i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(component, get_each_context_1(ctx, each_value_1, i));
	}

	return {
		c: function c() {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_anchor = createComment();
		},

		m: function m(target, anchor) {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insertNode(each_anchor, target, anchor);
		},

		p: function p(changed, ctx) {
			if (changed.optionList) {
				each_value_1 = ctx.optionList;

				for (var i = 0; i < each_value_1.length; i += 1) {
					var child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block_1(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_anchor.parentNode, each_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value_1.length;
			}
		},

		d: function d(detach) {
			destroyEach(each_blocks, detach);

			if (detach) {
				detachNode(each_anchor);
			}
		}
	};
}

function get_each_context(ctx, list, i) {
	var child_ctx = Object.create(ctx);
	child_ctx.opt = list[i];
	child_ctx.each_value = list;
	child_ctx.opt_index = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	var child_ctx = Object.create(ctx);
	child_ctx.opt = list[i];
	child_ctx.each_value_1 = list;
	child_ctx.opt_index_1 = i;
	return child_ctx;
}

function SelectInput(options) {
	var this$1 = this;

	init(this, options);
	this.refs = {};
	this._state = assign(data$3(), options.data);
	this._recompute({ optionList: 1 }, this._state);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
	}

	this._fragment = create_main_fragment$3(this, this._state);

	this.root._oncreate.push(function () {
		oncreate$2.call(this$1);
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._beforecreate);
		callAll(this._oncreate);
	}
}

assign(SelectInput.prototype, proto);

SelectInput.prototype._recompute = function _recompute(changed, state) {
	if (changed.optionList) {
		if (this._differs(state.isObjectOptions, (state.isObjectOptions = isObjectOptions(state)))) { changed.isObjectOptions = true; }
	}
};

/* src\inputs\TextInput.html generated by Svelte v2.5.0 */

var data$4 = fieldBase.data;

function oncreate$3() {
    fieldBase.oncreate(this);
}
function create_main_fragment$4(component, ctx) {
	var input, input_updating = false, input_class_value;

	function input_input_handler() {
		input_updating = true;
		component.set({ value: input.value });
		input_updating = false;
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function c() {
			input = createElement("input");
			addListener(input, "input", input_input_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "text");
			input.className = input_class_value = "form-control " + ctx.inputClass;
			input.placeholder = ctx.placeholder;
			input.readOnly = ctx.readOnly;
			input.required = ctx.required;
		},

		m: function m(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = ctx.value
    ;
		},

		p: function p(changed, ctx) {
			if (!input_updating) { input.value = ctx.value
    ; }
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control " + ctx.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.placeholder) {
				input.placeholder = ctx.placeholder;
			}

			if (changed.readOnly) {
				input.readOnly = ctx.readOnly;
			}

			if (changed.required) {
				input.required = ctx.required;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(input);
			}

			removeListener(input, "input", input_input_handler);
			removeListener(input, "change", change_handler);
			if (component.refs.input === input) { component.refs.input = null; }
		}
	};
}

function TextInput(options) {
	var this$1 = this;

	init(this, options);
	this.refs = {};
	this._state = assign(data$4(), options.data);

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$4(this, this._state);

	this.root._oncreate.push(function () {
		oncreate$3.call(this$1);
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(TextInput.prototype, proto);

/* src\inputs\NumberInput.html generated by Svelte v2.5.0 */

var data$5 = fieldBase.data;

function oncreate$4() {
    fieldBase.oncreate(this);
}
function create_main_fragment$5(component, ctx) {
	var input, input_updating = false, input_class_value;

	function input_input_handler() {
		input_updating = true;
		component.set({ value: toNumber(input.value) });
		input_updating = false;
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function c() {
			input = createElement("input");
			addListener(input, "input", input_input_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "number");
			input.className = input_class_value = "form-control " + ctx.inputClass;
			input.placeholder = ctx.placeholder;
			input.readOnly = ctx.readOnly;
			input.required = ctx.required;
		},

		m: function m(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = ctx.value
    ;
		},

		p: function p(changed, ctx) {
			if (!input_updating) { input.value = ctx.value
    ; }
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control " + ctx.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.placeholder) {
				input.placeholder = ctx.placeholder;
			}

			if (changed.readOnly) {
				input.readOnly = ctx.readOnly;
			}

			if (changed.required) {
				input.required = ctx.required;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(input);
			}

			removeListener(input, "input", input_input_handler);
			removeListener(input, "change", change_handler);
			if (component.refs.input === input) { component.refs.input = null; }
		}
	};
}

function NumberInput(options) {
	var this$1 = this;

	init(this, options);
	this.refs = {};
	this._state = assign(data$5(), options.data);

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$5(this, this._state);

	this.root._oncreate.push(function () {
		oncreate$4.call(this$1);
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(NumberInput.prototype, proto);

/* src\inputs\CheckboxInput.html generated by Svelte v2.5.0 */

function data$6() {
    return {
        label: '',
        class: '',
        value: false,
    }
}
function add_css$1() {
	var style = createElement("style");
	style.id = 'svelte-m11ft5-style';
	style.textContent = "input.svelte-m11ft5{margin:0 0 0 0.5rem}";
	appendNode(style, document.head);
}

function create_main_fragment$6(component, ctx) {
	var input;

	function input_change_handler() {
		component.set({ value: input.checked });
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function c() {
			input = createElement("input");
			addListener(input, "change", input_change_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "checkbox");
			input.className = "" + ctx.class + " svelte-m11ft5";
		},

		m: function m(target, anchor) {
			insertNode(input, target, anchor);

			input.checked = ctx.value;
		},

		p: function p(changed, ctx) {
			input.checked = ctx.value;
			if (changed.class) {
				input.className = "" + ctx.class + " svelte-m11ft5";
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(input);
			}

			removeListener(input, "change", input_change_handler);
			removeListener(input, "change", change_handler);
		}
	};
}

function CheckboxInput(options) {
	init(this, options);
	this._state = assign(data$6(), options.data);

	if (!document.getElementById("svelte-m11ft5-style")) { add_css$1(); }

	this._fragment = create_main_fragment$6(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(CheckboxInput.prototype, proto);

/* src\inputs\ActionButton.html generated by Svelte v2.5.0 */

function data$7() {
    return {
        label: '',
        class: '',
        value: false,
    }
}
function create_main_fragment$7(component, ctx) {
	var button, text, button_class_value;

	function click_handler(event) {
		component.fire('click', event);
	}

	return {
		c: function c() {
			button = createElement("button");
			text = createText(ctx.label);
			addListener(button, "click", click_handler);
			button.className = button_class_value = "btn btn-" + ctx.class;
		},

		m: function m(target, anchor) {
			insertNode(button, target, anchor);
			appendNode(text, button);
		},

		p: function p(changed, ctx) {
			if (changed.label) {
				text.data = ctx.label;
			}

			if ((changed.class) && button_class_value !== (button_class_value = "btn btn-" + ctx.class)) {
				button.className = button_class_value;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(button);
			}

			removeListener(button, "click", click_handler);
		}
	};
}

function ActionButton(options) {
	init(this, options);
	this._state = assign(data$7(), options.data);

	this._fragment = create_main_fragment$7(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(ActionButton.prototype, proto);

function mergeState(data, fieldtype) {
	return Object.assign({}, data, { settings: data }, { fieldtype: fieldtype });
}

var TextField = (function (Field$$1) {
	function TextField(options) {
		options.data = mergeState(options.data, TextInput);
		Field$$1.call(this, options);
	}

	if ( Field$$1 ) TextField.__proto__ = Field$$1;
	TextField.prototype = Object.create( Field$$1 && Field$$1.prototype );
	TextField.prototype.constructor = TextField;

	return TextField;
}(Field));

var NumberField = (function (Field$$1) {
	function NumberField(options) {
		options.data = mergeState(options.data, NumberInput);
		Field$$1.call(this, options);
	}

	if ( Field$$1 ) NumberField.__proto__ = Field$$1;
	NumberField.prototype = Object.create( Field$$1 && Field$$1.prototype );
	NumberField.prototype.constructor = NumberField;

	return NumberField;
}(Field));

var MaskedField = (function (Field$$1) {
	function MaskedField(options) {
		options.data = mergeState(options.data, MaskedInput);
		Field$$1.call(this, options);
	}

	if ( Field$$1 ) MaskedField.__proto__ = Field$$1;
	MaskedField.prototype = Object.create( Field$$1 && Field$$1.prototype );
	MaskedField.prototype.constructor = MaskedField;

	return MaskedField;
}(Field));

var CurrencyField = (function (Field$$1) {
	function CurrencyField(options) {
		options.data = mergeState(options.data, CurrencyInput);
		Field$$1.call(this, options);
	}

	if ( Field$$1 ) CurrencyField.__proto__ = Field$$1;
	CurrencyField.prototype = Object.create( Field$$1 && Field$$1.prototype );
	CurrencyField.prototype.constructor = CurrencyField;

	return CurrencyField;
}(Field));

var SelectField = (function (Field$$1) {
	function SelectField(options) {
		options.data = mergeState(options.data, SelectInput);
		Field$$1.call(this, options);
	}

	if ( Field$$1 ) SelectField.__proto__ = Field$$1;
	SelectField.prototype = Object.create( Field$$1 && Field$$1.prototype );
	SelectField.prototype.constructor = SelectField;

	return SelectField;
}(Field));

/* src\FormField.html generated by Svelte v2.5.0 */

function fieldlabel(ref) {
    var settings = ref.settings;

    return settings ? settings.label : '';
}

function fieldtype(ref) {
    var settings = ref.settings;

    var ft = TextInput;
    if (settings.component) {
        switch (settings.component.toLowerCase()) {
            case 'currency':
                ft = CurrencyInput;
                break;
            case 'masked':
                ft = MaskedInput;
                break;
            case 'number':
                ft = NumberInput;
                break;
            case 'select':
                ft = SelectInput;
                break;
        }
    }
    return ft;
}

function data$8() {
    return { 
        uuid: fieldBase.makeUniqueId(),
        // submit: false,
        // error: '',
        value: '',
        settings: null
    }
}
function oncreate$5() {
    fieldBase.mergeProps(this, this.get().settings);
}
function create_main_fragment$8(component, ctx) {
	var field_updating = {};

	var field_initial_data = {
	 	settings: ctx.settings,
	 	fieldtype: ctx.fieldtype
	 };
	if ('value' in ctx) {
		field_initial_data.value = ctx.value ;
		field_updating.value = true;
	}
	var field = new Field({
		root: component.root,
		data: field_initial_data,
		_bind: function(changed, childState) {
			var newState = {};
			if (!field_updating.value && changed.value) {
				newState.value = childState.value;
			}
			component._set(newState);
			field_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		field._bind({ value: 1 }, field.get());
	});

	return {
		c: function c() {
			field._fragment.c();
		},

		m: function m(target, anchor) {
			field._mount(target, anchor);
		},

		p: function p(changed, _ctx) {
			ctx = _ctx;
			var field_changes = {};
			if (changed.settings) { field_changes.settings = ctx.settings; }
			if (changed.fieldtype) { field_changes.fieldtype = ctx.fieldtype; }
			if (!field_updating.value && changed.value) {
				field_changes.value = ctx.value ;
				field_updating.value = true;
			}
			field._set(field_changes);
			field_updating = {};
		},

		d: function d(detach) {
			field.destroy(detach);
		}
	};
}

function FormField(options) {
	var this$1 = this;

	init(this, options);
	this._state = assign(data$8(), options.data);
	this._recompute({ settings: 1 }, this._state);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$8(this, this._state);

	this.root._oncreate.push(function () {
		oncreate$5.call(this$1);
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(FormField.prototype, proto);

FormField.prototype._recompute = function _recompute(changed, state) {
	if (changed.settings) {
		if (this._differs(state.fieldlabel, (state.fieldlabel = fieldlabel(state)))) { changed.fieldlabel = true; }
		if (this._differs(state.fieldtype, (state.fieldtype = fieldtype(state)))) { changed.fieldtype = true; }
	}
};

/* src\FormCol.html generated by Svelte v2.5.0 */

function classes(ref) {
    var settings = ref.settings;
                
    if (settings.col) {
        var cols = settings.col.split(' ');
        cols = cols.filter(function (x) { return x && x.trim(); }).map(function (x){ return 'col-' + x; });
        return cols.join(' ').trim();
    }
    return '';
}

function displayable(ref) {
    var source = ref.source;
    var settings = ref.settings;

    return source && (source.hasOwnProperty(settings.field) && source[settings.field] != null);
}

function field(ref) {
    var settings = ref.settings;
              
    return settings.field;
}

function data$9(){
    return {
        source: {},
        settings: {}
    }
}
function create_main_fragment$9(component, ctx) {
	var div;

	function select_block_type(ctx) {
		if (ctx.edit) { return create_if_block$2; }
		if (ctx.displayable) { return create_if_block_1$1; }
		return null;
	}

	var current_block_type = select_block_type(ctx);
	var if_block = current_block_type && current_block_type(component, ctx);

	return {
		c: function c() {
			div = createElement("div");
			if (if_block) { if_block.c(); }
			div.className = ctx.classes;
		},

		m: function m(target, anchor) {
			insertNode(div, target, anchor);
			if (if_block) { if_block.m(div, null); }
		},

		p: function p(changed, ctx) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(changed, ctx);
			} else {
				if (if_block) {
					if_block.d(1);
				}
				if_block = current_block_type && current_block_type(component, ctx);
				if (if_block) { if_block.c(); }
				if (if_block) { if_block.m(div, null); }
			}

			if (changed.classes) {
				div.className = ctx.classes;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(div);
			}

			if (if_block) { if_block.d(); }
		}
	};
}

// (2:4) {#if edit}
function create_if_block$2(component, ctx) {
	var formfield_updating = {};

	var formfield_initial_data = { settings: ctx.settings };
	if (ctx.field in ctx.source) {
		formfield_initial_data.value = ctx.source[ctx.field];
		formfield_updating.value = true;
	}
	var formfield = new FormField({
		root: component.root,
		data: formfield_initial_data,
		_bind: function(changed, childState) {
			var newState = {};
			if (!formfield_updating.value && changed.value) {
				ctx.source[ctx.field] = childState.value;
				newState.source = ctx.source;
			}
			component._set(newState);
			formfield_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		formfield._bind({ value: 1 }, formfield.get());
	});

	return {
		c: function c() {
			formfield._fragment.c();
		},

		m: function m(target, anchor) {
			formfield._mount(target, anchor);
		},

		p: function p(changed, _ctx) {
			ctx = _ctx;
			var formfield_changes = {};
			if (changed.settings) { formfield_changes.settings = ctx.settings; }
			if (!formfield_updating.value && changed.source || changed.field) {
				formfield_changes.value = ctx.source[ctx.field];
				formfield_updating.value = true;
			}
			formfield._set(formfield_changes);
			formfield_updating = {};
		},

		d: function d(detach) {
			formfield.destroy(detach);
		}
	};
}

// (4:25) 
function create_if_block_1$1(component, ctx) {
	var text_value = ctx.source[ctx.field], text;

	return {
		c: function c() {
			text = createText(text_value);
		},

		m: function m(target, anchor) {
			insertNode(text, target, anchor);
		},

		p: function p(changed, ctx) {
			if ((changed.source || changed.field) && text_value !== (text_value = ctx.source[ctx.field])) {
				text.data = text_value;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(text);
			}
		}
	};
}

function FormCol(options) {
	init(this, options);
	this._state = assign(data$9(), options.data);
	this._recompute({ settings: 1, source: 1 }, this._state);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$9(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(FormCol.prototype, proto);

FormCol.prototype._recompute = function _recompute(changed, state) {
	if (changed.settings) {
		if (this._differs(state.classes, (state.classes = classes(state)))) { changed.classes = true; }
	}

	if (changed.source || changed.settings) {
		if (this._differs(state.displayable, (state.displayable = displayable(state)))) { changed.displayable = true; }
	}

	if (changed.settings) {
		if (this._differs(state.field, (state.field = field(state)))) { changed.field = true; }
	}
};

/* src\FormGrid.html generated by Svelte v2.5.0 */

function source(ref) {
    var item = ref.item;

    return item;
}

function rows(ref) {
    var columns = ref.columns;
                
    var maxRowNum = Math.max.apply(Math, columns.map(function (o) { return o.row; }));
    var rows = [];
    for (var i = 0; i <= maxRowNum; i++) {
        rows.push({ columns: [] });
    }
    columns.forEach(function (col) {
        var row = rows[col.row];
        if (row && row.columns) {
            row.columns.push(col);
            if (col.subtitle) {
                row.subtitle = col.subtitle;
            }
        }                
    });
    // console.log('computed - rows', rows);
    return rows;
}

function data$10() {
    return {
        class: '',
        edit: true,
        item: {},
        columns: [],
    }
}
function add_css$2() {
	var style = createElement("style");
	style.id = 'svelte-z3e38j-style';
	style.textContent = ".subtitle.svelte-z3e38j{margin:0.5rem;font-size:1rem;font-weight:600;text-decoration:underline;text-transform:uppercase}";
	appendNode(style, document.head);
}

function create_main_fragment$10(component, ctx) {
	var form;

	var each_value = ctx.rows;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
	}

	return {
		c: function c() {
			form = createElement("form");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			form.className = "form-horizontal";
		},

		m: function m(target, anchor) {
			insertNode(form, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(form, null);
			}

			component.refs.form = form;
		},

		p: function p(changed, ctx) {
			if (changed.rows || changed.class || changed.edit || changed.source) {
				each_value = ctx.rows;

				for (var i = 0; i < each_value.length; i += 1) {
					var child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$1(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(form, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(form);
			}

			destroyEach(each_blocks, detach);

			if (component.refs.form === form) { component.refs.form = null; }
		}
	};
}

// (2:0) {#each rows as row}
function create_each_block$1(component, ctx) {
	var text, div, div_class_value;

	var if_block = (ctx.row.subtitle) && create_if_block$3(component, ctx);

	var each_value_1 = ctx.row.columns;

	var each_blocks = [];

	for (var i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1$1(component, get_each_context_1$1(ctx, each_value_1, i));
	}

	return {
		c: function c() {
			if (if_block) { if_block.c(); }
			text = createText("\r\n    ");
			div = createElement("div");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			div.className = div_class_value = "row " + ctx.class + " svelte-z3e38j";
		},

		m: function m(target, anchor) {
			if (if_block) { if_block.m(target, anchor); }
			insertNode(text, target, anchor);
			insertNode(div, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}
		},

		p: function p(changed, ctx) {
			if (ctx.row.subtitle) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block$3(component, ctx);
					if_block.c();
					if_block.m(text.parentNode, text);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (changed.rows || changed.edit || changed.source) {
				each_value_1 = ctx.row.columns;

				for (var i = 0; i < each_value_1.length; i += 1) {
					var child_ctx = get_each_context_1$1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block_1$1(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value_1.length;
			}

			if ((changed.class) && div_class_value !== (div_class_value = "row " + ctx.class + " svelte-z3e38j")) {
				div.className = div_class_value;
			}
		},

		d: function d(detach) {
			if (if_block) { if_block.d(detach); }
			if (detach) {
				detachNode(text);
				detachNode(div);
			}

			destroyEach(each_blocks, detach);
		}
	};
}

// (3:4) {#if row.subtitle}
function create_if_block$3(component, ctx) {
	var div, text_value = ctx.row.subtitle, text;

	return {
		c: function c() {
			div = createElement("div");
			text = createText(text_value);
			div.className = "row subtitle svelte-z3e38j";
		},

		m: function m(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(text, div);
		},

		p: function p(changed, ctx) {
			if ((changed.rows) && text_value !== (text_value = ctx.row.subtitle)) {
				text.data = text_value;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

// (7:8) {#each row.columns as col}
function create_each_block_1$1(component, ctx) {
	var formcol_updating = {};

	var formcol_initial_data = { settings: ctx.col, edit: ctx.edit };
	if ('source' in ctx) {
		formcol_initial_data.source = ctx.source ;
		formcol_updating.source = true;
	}
	var formcol = new FormCol({
		root: component.root,
		data: formcol_initial_data,
		_bind: function(changed, childState) {
			var newState = {};
			if (!formcol_updating.source && changed.source) {
				newState.source = childState.source;
			}
			component._set(newState);
			formcol_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		formcol._bind({ source: 1 }, formcol.get());
	});

	return {
		c: function c() {
			formcol._fragment.c();
		},

		m: function m(target, anchor) {
			formcol._mount(target, anchor);
		},

		p: function p(changed, _ctx) {
			ctx = _ctx;
			var formcol_changes = {};
			if (changed.rows) { formcol_changes.settings = ctx.col; }
			if (changed.edit) { formcol_changes.edit = ctx.edit; }
			if (!formcol_updating.source && changed.source) {
				formcol_changes.source = ctx.source ;
				formcol_updating.source = true;
			}
			formcol._set(formcol_changes);
			formcol_updating = {};
		},

		d: function d(detach) {
			formcol.destroy(detach);
		}
	};
}

function get_each_context$1(ctx, list, i) {
	var child_ctx = Object.create(ctx);
	child_ctx.row = list[i];
	child_ctx.each_value = list;
	child_ctx.row_index = i;
	return child_ctx;
}

function get_each_context_1$1(ctx, list, i) {
	var child_ctx = Object.create(ctx);
	child_ctx.col = list[i];
	child_ctx.each_value_1 = list;
	child_ctx.col_index = i;
	return child_ctx;
}

function FormGrid(options) {
	init(this, options);
	this.refs = {};
	this._state = assign(data$10(), options.data);
	this._recompute({ item: 1, columns: 1 }, this._state);

	if (!document.getElementById("svelte-z3e38j-style")) { add_css$2(); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$10(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(FormGrid.prototype, proto);

FormGrid.prototype._recompute = function _recompute(changed, state) {
	if (changed.item) {
		if (this._differs(state.source, (state.source = source(state)))) { changed.source = true; }
	}

	if (changed.columns) {
		if (this._differs(state.rows, (state.rows = rows(state)))) { changed.rows = true; }
	}
};

/* src\DataCol.html generated by Svelte v2.5.0 */

function collect(obj, field) {
    if (typeof(field) === 'function')
        { return field(obj); }
    else if (typeof(field) === 'string')
        { return obj[field]; }
    else
        { return undefined; }
}

function settings$1(all) { 
				return all.settings;
			}

function fieldtype$1(ref) {
    var settings = ref.settings;

    var ft = TextInput;
    if (settings.component) {
        switch (settings.component.toLowerCase()) {
            case 'text':
                ft = TextInput;
                break;
            case 'number':
                ft = NumberInput;
                break;    
            case 'masked':
                ft = MaskedInput;
                break;
            case 'currency':
                ft = CurrencyInput;
                break;
            case 'select':
                ft = SelectInput;
                break;
            case 'checkbox':
                ft = CheckboxInput;
                break;
            case 'action':
                ft = ActionButton;
                break;
        }
    }
    return ft;
}

function data$11(){
    return {
        source: {},
    }
}
function create_main_fragment$11(component, ctx) {
	var if_block_anchor;

	function select_block_type(ctx) {
		if (ctx.edit || ctx.settings.action) { return create_if_block$4; }
		return create_if_block_1$2;
	}

	var current_block_type = select_block_type(ctx);
	var if_block = current_block_type(component, ctx);

	return {
		c: function c() {
			if_block.c();
			if_block_anchor = createComment();
		},

		m: function m(target, anchor) {
			if_block.m(target, anchor);
			insertNode(if_block_anchor, target, anchor);
		},

		p: function p(changed, ctx) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(changed, ctx);
			} else {
				if_block.d(1);
				if_block = current_block_type(component, ctx);
				if_block.c();
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},

		d: function d(detach) {
			if_block.d(detach);
			if (detach) {
				detachNode(if_block_anchor);
			}
		}
	};
}

// (1:0) {#if edit || settings.action}
function create_if_block$4(component, ctx) {
	var switch_instance_updating = {}, switch_instance_anchor;

	var switch_instance_spread_levels = [
		ctx.settings
	];

	var switch_value = ctx.fieldtype;

	function switch_props(ctx) {
		var switch_instance_initial_data = {};
		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_initial_data = assign(switch_instance_initial_data, switch_instance_spread_levels[i]);
		}
		if (ctx.settings.field in ctx.source) {
			switch_instance_initial_data.value = ctx.source[ctx.settings.field];
			switch_instance_updating.value = true;
		}
		return {
			root: component.root,
			data: switch_instance_initial_data,
			_bind: function(changed, childState) {
				var newState = {};
				if (!switch_instance_updating.value && changed.value) {
					ctx.source[ctx.settings.field] = childState.value;
					newState.source = ctx.source;
				}
				component._set(newState);
				switch_instance_updating = {};
			}
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));

		component.root._beforecreate.push(function() {
			switch_instance._bind({ value: 1 }, switch_instance.get());
		});
	}

	function switch_instance_change(event) {
		component.fire("change", event);
	}

	if (switch_instance) { switch_instance.on("change", switch_instance_change); }
	function switch_instance_click(event) {
		component.fire("click", event);
	}

	if (switch_instance) { switch_instance.on("click", switch_instance_click); }

	return {
		c: function c() {
			switch_instance_anchor = createComment();
			if (switch_instance) { switch_instance._fragment.c(); }
		},

		m: function m(target, anchor) {
			insertNode(switch_instance_anchor, target, anchor);

			if (switch_instance) {
				switch_instance._mount(target, anchor);
			}
		},

		p: function p(changed, _ctx) {
			ctx = _ctx;
			var switch_instance_changes = {};
			var switch_instance_changes = changed.settings && getSpreadUpdate(switch_instance_spread_levels, [
				ctx.settings
			]);
			if (!switch_instance_updating.value && changed.source || changed.settings) {
				switch_instance_changes.value = ctx.source[ctx.settings.field];
				switch_instance_updating.value = true;
			}

			if (switch_value !== (switch_value = ctx.fieldtype)) {
				if (switch_instance) { switch_instance.destroy(); }

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					switch_instance._fragment.c();
					switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);

					switch_instance.on("change", switch_instance_change);
					switch_instance.on("click", switch_instance_click);
				}
			}

			else if (switch_value) {
				switch_instance._set(switch_instance_changes);
				switch_instance_updating = {};
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(switch_instance_anchor);
			}

			if (switch_instance) { switch_instance.destroy(detach); }
		}
	};
}

// (3:0) {:else}
function create_if_block_1$2(component, ctx) {
	var text_value = collect(ctx.source, ctx.settings.field), text;

	return {
		c: function c() {
			text = createText(text_value);
		},

		m: function m(target, anchor) {
			insertNode(text, target, anchor);
		},

		p: function p(changed, ctx) {
			if ((changed.source || changed.settings) && text_value !== (text_value = collect(ctx.source, ctx.settings.field))) {
				text.data = text_value;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(text);
			}
		}
	};
}

function DataCol(options) {
	init(this, options);
	this._state = assign(data$11(), options.data);
	this._recompute({ settings: 1 }, this._state);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$11(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(DataCol.prototype, proto);

DataCol.prototype._recompute = function _recompute(changed, state) {
	if (changed.settings) {
		if (this._differs(state.fieldtype, (state.fieldtype = fieldtype$1(state)))) { changed.fieldtype = true; }
	}

	if (this._differs(state.settings, (state.settings = settings$1(state)))) { changed.settings = true; }
};

/* src\DataGrid.html generated by Svelte v2.5.0 */

function colCount(ref) {
	var columns = ref.columns;

	return (columns) ? columns.length : 0;
}

function data$12() {
    return {
        class: '',
        columns: [],
        edit: true,
        rows: []
    }
}
var methods$2 = {
    actionClick: function actionClick(event, row, action) {
        event && event.preventDefault();
        action && action(row);
    },
};

function add_css$3() {
	var style = createElement("style");
	style.id = 'svelte-bmd9at-style';
	style.textContent = "td.nopadding.svelte-bmd9at{padding:0 0}td.nopadding.svelte-bmd9at input{padding:0.35rem 0.5rem;border-width:0}";
	appendNode(style, document.head);
}

function create_main_fragment$12(component, ctx) {
	var div, table, thead, tr, text_2, tbody, table_class_value;

	var each_value = ctx.columns;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(component, get_each_context$2(ctx, each_value, i));
	}

	var each_value_1 = ctx.rows;

	var each_1_blocks = [];

	for (var i = 0; i < each_value_1.length; i += 1) {
		each_1_blocks[i] = create_each_block_1$2(component, get_each_1_context(ctx, each_value_1, i));
	}

	return {
		c: function c() {
			div = createElement("div");
			table = createElement("table");
			thead = createElement("thead");
			tr = createElement("tr");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_2 = createText("\r\n\r\n        ");
			tbody = createElement("tbody");

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].c();
			}
			setAttribute(table, "ref", "table");
			table.className = table_class_value = "table table-striped table-sm " + (ctx.edit ? 'table-bordered' : '');
			setStyle(div, "position", "relative");
		},

		m: function m(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(table, div);
			appendNode(thead, table);
			appendNode(tr, thead);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}

			appendNode(text_2, table);
			appendNode(tbody, table);

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].m(tbody, null);
			}
		},

		p: function p(changed, ctx) {
			if (changed.columns) {
				each_value = ctx.columns;

				for (var i = 0; i < each_value.length; i += 1) {
					var child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$2(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tr, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}

			if (changed.columns || changed.edit || changed.rows) {
				each_value_1 = ctx.rows;

				for (var i = 0; i < each_value_1.length; i += 1) {
					var child_ctx$1 = get_each_1_context(ctx, each_value_1, i);

					if (each_1_blocks[i]) {
						each_1_blocks[i].p(changed, child_ctx$1);
					} else {
						each_1_blocks[i] = create_each_block_1$2(component, child_ctx$1);
						each_1_blocks[i].c();
						each_1_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_1_blocks.length; i += 1) {
					each_1_blocks[i].d(1);
				}
				each_1_blocks.length = each_value_1.length;
			}

			if ((changed.edit) && table_class_value !== (table_class_value = "table table-striped table-sm " + (ctx.edit ? 'table-bordered' : ''))) {
				table.className = table_class_value;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(div);
			}

			destroyEach(each_blocks, detach);

			destroyEach(each_1_blocks, detach);
		}
	};
}

// (5:16) {#each columns as column, x}
function create_each_block$2(component, ctx) {
	var th, text_value = ctx.column.label, text;

	return {
		c: function c() {
			th = createElement("th");
			text = createText(text_value);
			setStyle(th, "width", (ctx.column.width ? ctx.column.width : 'auto'));
		},

		m: function m(target, anchor) {
			insertNode(th, target, anchor);
			appendNode(text, th);
		},

		p: function p(changed, ctx) {
			if ((changed.columns) && text_value !== (text_value = ctx.column.label)) {
				text.data = text_value;
			}

			if (changed.columns) {
				setStyle(th, "width", (ctx.column.width ? ctx.column.width : 'auto'));
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(th);
			}
		}
	};
}

// (14:8) {#each rows as row}
function create_each_block_1$2(component, ctx) {
	var tr;

	var each_value_2 = ctx.columns;

	var each_blocks = [];

	for (var i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(component, get_each_context_1$2(ctx, each_value_2, i));
	}

	return {
		c: function c() {
			tr = createElement("tr");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
		},

		m: function m(target, anchor) {
			insertNode(tr, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}
		},

		p: function p(changed, ctx) {
			if (changed.edit || changed.columns || changed.rows) {
				each_value_2 = ctx.columns;

				for (var i = 0; i < each_value_2.length; i += 1) {
					var child_ctx = get_each_context_1$2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block_2(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tr, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value_2.length;
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(tr);
			}

			destroyEach(each_blocks, detach);
		}
	};
}

// (16:16) {#each columns as column}
function create_each_block_2(component, ctx) {
	var td, datacol_updating = {}, td_class_value;

	var datacol_initial_data = { settings: ctx.column, edit: ctx.edit };
	if ('row' in ctx) {
		datacol_initial_data.source = ctx.row;
		datacol_updating.source = true;
	}
	var datacol = new DataCol({
		root: component.root,
		data: datacol_initial_data,
		_bind: function(changed, childState) {
			var newState = {};
			if (!datacol_updating.source && changed.source) {
				ctx.each_value_1[ctx.row_index] = childState.source = childState.source;

				newState.rows = ctx.rows;
			}
			component._set(newState);
			datacol_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		datacol._bind({ source: 1 }, datacol.get());
	});

	datacol.on("change", function(event) {
		component.fire('update', { event: event });
	});
	datacol.on("click", function(event) {
		component.actionClick(event, ctx.row, ctx.column.action);
	});

	return {
		c: function c() {
			td = createElement("td");
			datacol._fragment.c();
			td.className = td_class_value = "" + (((!ctx.edit && ctx.column.action) || ctx.edit) ? 'nopadding' : '') + " " + (ctx.column.numeric ? 'numeric' : '') + " " + (ctx.column.truncate ? ' truncate' : '') + " svelte-bmd9at";
			setStyle(td, "width", (ctx.column.width ? ctx.column.width : 'auto'));
		},

		m: function m(target, anchor) {
			insertNode(td, target, anchor);
			datacol._mount(td, null);
		},

		p: function p(changed, _ctx) {
			ctx = _ctx;
			var datacol_changes = {};
			if (changed.columns) { datacol_changes.settings = ctx.column; }
			if (changed.edit) { datacol_changes.edit = ctx.edit; }
			if (!datacol_updating.source && changed.rows) {
				datacol_changes.source = ctx.row;
				datacol_updating.source = true;
			}
			datacol._set(datacol_changes);
			datacol_updating = {};

			if ((changed.edit || changed.columns) && td_class_value !== (td_class_value = "" + (((!ctx.edit && ctx.column.action) || ctx.edit) ? 'nopadding' : '') + " " + (ctx.column.numeric ? 'numeric' : '') + " " + (ctx.column.truncate ? ' truncate' : '') + " svelte-bmd9at")) {
				td.className = td_class_value;
			}

			if (changed.columns) {
				setStyle(td, "width", (ctx.column.width ? ctx.column.width : 'auto'));
			}
		},

		d: function d(detach) {
			if (detach) {
				detachNode(td);
			}

			datacol.destroy();
		}
	};
}

function get_each_context$2(ctx, list, i) {
	var child_ctx = Object.create(ctx);
	child_ctx.column = list[i];
	child_ctx.each_value = list;
	child_ctx.x = i;
	return child_ctx;
}

function get_each_1_context(ctx, list, i) {
	var child_ctx = Object.create(ctx);
	child_ctx.row = list[i];
	child_ctx.each_value_1 = list;
	child_ctx.row_index = i;
	return child_ctx;
}

function get_each_context_1$2(ctx, list, i) {
	var child_ctx = Object.create(ctx);
	child_ctx.column = list[i];
	child_ctx.each_value_2 = list;
	child_ctx.column_index = i;
	return child_ctx;
}

function DataGrid(options) {
	init(this, options);
	this._state = assign(data$12(), options.data);
	this._recompute({ columns: 1 }, this._state);

	if (!document.getElementById("svelte-bmd9at-style")) { add_css$3(); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$12(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(DataGrid.prototype, proto);
assign(DataGrid.prototype, methods$2);

DataGrid.prototype._recompute = function _recompute(changed, state) {
	if (changed.columns) {
		if (this._differs(state.colCount, (state.colCount = colCount(state)))) { changed.colCount = true; }
	}
};

exports.FormGrid = FormGrid;
exports.DataGrid = DataGrid;
exports.ActionButton = ActionButton;
exports.TextField = TextField;
exports.NumberField = NumberField;
exports.MaskedField = MaskedField;
exports.CurrencyField = CurrencyField;
exports.SelectField = SelectField;
//# sourceMappingURL=formgrid.js.map
