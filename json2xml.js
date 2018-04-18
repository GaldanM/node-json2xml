/**
 * Converts JSON object to XML string.
 *
 *
 * Copyright(c) 2011 Etienne Lachance <et@etiennelachance.com>
 * MIT Licensed
 */

/*
 * Modifications (Ivo Georgiev <ivo@linvo.org>):
 *  Escape XML entities to avoid breaking the XML if any string in the JSON contains a special char
 *  Ignore special objects - objects that inherit other objects (in practice, when working with a third-party library, most of those are circular structures)
 */

/*
 *  Modifications (Alan Clarke <hi@alz.so>):
 *  added unit tests, ability to add xml node attributes, xml header option and simplified syntax
 *  removed root node, this is already covered by the module's default functionality
 */

const util = require('util');

module.exports = function xml(json, opts, field) {
	const options = {
		attributes_key: false,
		header: false,
		...opts,
	};

	let result = options.header ? '<?xml version="1.0" encoding="UTF-8"?>' : '';
	options.header = false;

	if (Boolean(json.length) && typeof json !== 'string') { // Array
		result += `<${field}>`;
		json.forEach(node => {
			result += xml(node, options);
		});
		result += `</${field}>`;
	} else if (typeof json === 'object') {
		Object.keys(json).forEach(key => {
			if (key !== options.attributes_key) {
				let node = json[key];
				let attributes = '';

				if (node === undefined || node === null) {
					node = '';
				}

				if (options.attributes_key && json[options.attributes_key]) {
					Object.keys(json[options.attributes_key]).forEach(k => {
						attributes += util.format(' %s="%s"', k, json[options.attributes_key][k]);
					});
				}
				const inner = xml(node, options, key);

				if (inner) {
					if (Boolean(node.length) && typeof node !== 'string' && attributes === '') {
						result += xml(node, options, key);
					} else {
						result += util.format('<%s%s>%s</%s>', key, attributes, xml(node, options, key), key);
					}
				} else {
					result += util.format('<%s%s/>', key, attributes);
				}
			}
		});
	} else {
		return json.toString();
		// return json.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	return result;
};
