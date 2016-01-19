"use strict";
/**
 * One JS implementation of js0n encoder/decoder.
 * 
 * @date: 23/08/2014
 * @author: Nahid Akbar
 * @copyrightYear: 2014-2015
 * @copyright: National ICT Australia
 */

"use stict";

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.load = load;
exports.dump = dump;

var _JS0NReader = require("./JS0NReader");

var _JS0NReader2 = _interopRequireDefault(_JS0NReader);

var _JS0NWriter = require("./JS0NWriter");

var _JS0NWriter2 = _interopRequireDefault(_JS0NWriter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function load(encoded) {
   var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

   return new _JS0NReader2.default(options).load(encoded);
}
function dump(item) {
   var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

   return new _JS0NWriter2.default(options).dump(item);
}