/**
 * Monominoes Init file.
 * Creates Monominoes object and "packages" properties.
 * All Monominoes packages should be created here.
 */

function Monominoes() {}
Monominoes.util = {};
Monominoes.tags = {};
Monominoes.renders = {};

/**
 * Monominoes Utils.
 * Defines common util functions used in renderers.
 */

/**
 * Placeholder replacer formatter, replica from jquery.validator.format.
 * @see http://jqueryvalidation.org/jQuery.validator.format/
 */
Monominoes.util.format = function() { 
  return $.validator.format.apply(null,arguments);
};

/**
 * Generates a new string object from concatenating 'app' (appended) string (if present)
 * to 'str' string (if present), being separated by 'sep' (separator) string (if present, otherwise ' ').
 * The result is trimmed.
 * @param str First place string, optional, default = ''.
 * @param app Second place string, optional, default = ''.
 * @param sep Above strings separator, optional, default = ' '.
 */
Monominoes.util.append = function(str,app,sep) { 
  return ((str||"") + (sep||" ") + (app||"")).trim();
};
