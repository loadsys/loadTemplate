/**
 * loadTemplate plugin takes a plugin name and a url to
 * load a template via the $.ajax method, and caches it
 * with $.template. Requires the jQuery Template plugin.
 * https://github.com/jquery/jquery-tmpl
 */
(function($) {
var methods = {
	'update': function(name, url, callback) {
		if ($.template[name] == undefined) {
			$(document).trigger(name+'.loading', {name: name, url: url});
			$.ajax({
				url: url,
				type: 'get',
				dataType: 'html',
				async: false,
				success: function(data) {
					$.template(name, data);
					$(document).trigger(name+'.loaded', {name: name});
					$(document).trigger(name+'.complete');
					if (typeof callback == 'function') {
						callback();
					}
				},
				error: function(jqXHR, status, error) {
					$(document).trigger(name+'.error', [jqXHR, status, error]);
				}
			});
		} else {
			$(document).trigger(name+'.complete');
			if (typeof callback == 'function') {
				callback();
			}
		}
		return;
	},
	'delete': function(name, callback) {
		if ($.template[name]) {
			delete $.template[name];
			$(document).trigger(name+'.deleted', {name: name});
			if (typeof callback == 'function') {
				callback();
			}
		}
		return;
	},
	'list': function(callback) {
		ret = [];
		for (i in $.template) {
			ret.push(i);
		}
		if (typeof callback == 'function') {
			callback();
		}
		return ret;
	},
	'load': function(data, callback) {
		for (var i in data) {
			methods.update(i, data[i]);
		}
		$(document).trigger(name+'.loadComplete', {data: data});
		if (typeof callback == 'function') {
			callback();
		}
	}
}
$.extend({
	loadTemplate: function(method, name, url, callback) {
		var args = [];
		if (method == 'add') {
			method = 'update';
		}
		if (typeof method == 'object' && (typeof name == 'function' || !name)) {
			return methods.load(method, name);
		}
		if (typeof method == 'object' && typeof name == 'object' && (typeof url == 'function' || !url)) {
			var data = {};
			for (var i = 0; i < method.length; i++) {
				data[method[i]] = name[i];
			}
			return methods.load(data, url);
		}
		if (typeof method == 'string') {
			if (!methods[method]) {
				args = [method, name, url];
				method = 'update';
			} else if (method == 'delete') {
				args = [name, url];
			} else if (method == 'list') {
				args = [name];
			} else {
				args = Array.prototype.slice.call(arguments, 1);
			}
			return methods[method].apply(this, args);
		} else {
			$.error('Wrong parameter types. Check the docs');
		}
	}
});
})(jQuery);