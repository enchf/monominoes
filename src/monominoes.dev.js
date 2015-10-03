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
