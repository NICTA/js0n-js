(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.js0n = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Reader implementation.
 * 
 * @date: 23/08/2014
 * @author: Nahid Akbar
 * @copyrightYear: 2014-2015
 * @copyright: National ICT Australia
 */

"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _consts = require("./consts");

var consts = _interopRequireWildcard(_consts);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JS0NReader = (function () {
  function JS0NReader(options) {
    _classCallCheck(this, JS0NReader);

    this.littleEndian = true;
    this.references = {};
  }

  _createClass(JS0NReader, [{
    key: "load",
    value: function load(encoded) {
      this.buffer = encoded;
      this.view = new DataView(encoded, 0, encoded.byteLength);
      this.length = encoded.byteLength;
      this.offset = 0;
      return this.read();
    }
  }, {
    key: "read",
    value: function read() {
      var byte = this.view.getUint8(this.offset);
      var marker = (byte & 0xf0) >> 4;
      var subMarker = byte & 0xf;
      this.offset++;

      switch (marker) {
        case consts.MARKER_SPECIAL:
          return this.readSpecial(marker, subMarker, this.offset);
        case consts.MARKER_REFERENCE:
          return this.readReference(marker, subMarker, this.offset);
        case consts.MARKER_UINT:
          return this.readUInt(marker, subMarker, this.offset);
        case consts.MARKER_INT:
          return this.readInt(marker, subMarker, this.offset);
        case consts.MARKER_FLOAT:
          return this.readFloat(marker, subMarker, this.offset);
        case consts.MARKER_STRING:
          return this.readString(marker, subMarker, this.offset);
        case consts.MARKER_ARRAY:
          return this.readArray(marker, subMarker, this.offset);
        case consts.MARKER_OBJECT:
          return this.readObject(marker, subMarker, this.offset);
        case consts.MARKER_CUSTOM:
          return this.readCustom(marker, subMarker, this.offset);
        default:
      }
      throw new Error('TODO: Unsupported marker ' + marker + '; submarker ' + subMarker);
    }
  }, {
    key: "readSpecial",
    value: function readSpecial(marker, subMarker, offset) {
      switch (subMarker) {
        case consts.SPECIAL_SUBMARKER_NULL:
          return null;
        case consts.SPECIAL_SUBMARKER_UNDEFINED:
          return undefined;
        case consts.SPECIAL_SUBMARKER_FALSE:
          return false;
        case consts.SPECIAL_SUBMARKER_TRUE:
          return true;
        case consts.SPECIAL_SUBMARKER_BIG_ENDIAN:
          this.littleEndian = false;
          break;
        case consts.SPECIAL_SUBMARKER_LITTLE_ENDIAN:
          this.littleEndian = true;
          break;
        case consts.SPECIAL_SUBMARKER_PADDING:
          break;
        case consts.SPECIAL_SUBMARKER_PACKED:
          while (marker === consts.MARKER_SPECIAL && (subMarker === consts.SPECIAL_SUBMARKER_PACKED || subMarker === consts.SPECIAL_SUBMARKER_PADDING)) {
            marker = (this.view.getUint8(this.offset) & 0xF0) >> 4;
            subMarker = this.view.getUint8(this.offset) & 0xF;
            this.offset++;
          }
          return this.readPacked(marker, subMarker, this.offset.toString());
      }
      return this.read();
    }
  }, {
    key: "readReference",
    value: function readReference(marker, subMarker, offset) {
      var referenceOffset = this.readUInt(marker, subMarker);
      if (!(referenceOffset in this.references)) {
        var endOffset = this.offset;
        this.offset = referenceOffset;
        this.references[referenceOffset] = this.read();
        this.offset = endOffset;
      }
      return this.references[referenceOffset];
    }
  }, {
    key: "readUInt",
    value: function readUInt(marker, subMarker) {
      if (subMarker >= consts.SIZE_SUBMARKER_VALUE_MIN && subMarker <= consts.SIZE_SUBMARKER_VALUE_MAX) {
        return subMarker;
      }
      switch (subMarker) {
        case consts.SIZE_SUBMARKER_8BITS:
          this.offset += 1;
          return this.view.getUint8(this.offset - 1);
        case consts.SIZE_SUBMARKER_16BITS:
          this.offset += 2;
          return this.view.getUint16(this.offset - 2, this.littleEndian);
        case consts.SIZE_SUBMARKER_32BITS:
          this.offset += 4;
          return this.view.getUint32(this.offset - 4, this.littleEndian);
        case consts.SIZE_SUBMARKER_64BITS:
          this.offset += 8;
          return this.view.getUint64(this.offset - 8, this.littleEndian);
      }
      throw new Error("TODO: unsupported bit length for marker " + marker + " and submarker " + subMarker);
    }
  }, {
    key: "readInt",
    value: function readInt(marker, subMarker) {
      if (subMarker >= consts.SIZE_SUBMARKER_VALUE_MIN && subMarker <= consts.SIZE_SUBMARKER_VALUE_MAX) {
        return subMarker;
      }
      switch (subMarker) {
        case consts.SIZE_SUBMARKER_8BITS:
          this.offset += 1;
          return this.view.getInt8(this.offset - 1);
        case consts.SIZE_SUBMARKER_16BITS:
          this.offset += 2;
          return this.view.getInt16(this.offset - 2, this.littleEndian);
        case consts.SIZE_SUBMARKER_32BITS:
          this.offset += 4;
          return this.view.getInt32(this.offset - 4, this.littleEndian);
        case consts.SIZE_SUBMARKER_64BITS:
          this.offset += 8;
          return this.view.getInt64(this.offset - 8, this.littleEndian);
      }
      throw new Error("TODO: unsupported bit length for marker " + marker + " and submarker " + subMarker);
    }
  }, {
    key: "readFloat",
    value: function readFloat(marker, subMarker) {
      switch (subMarker) {
        case consts.SIZE_SUBMARKER_32BITS:
          this.offset += 4;
          return this.view.getFloat32(this.offset - 4, this.littleEndian);
        case consts.SIZE_SUBMARKER_64BITS:
          this.offset += 8;
          return this.view.getFloat64(this.offset - 8, this.littleEndian);
      }
      throw new Error("TODO: unsupported bit length for marker " + marker + " and submarker " + subMarker);
    }
  }, {
    key: "readString",
    value: function readString(marker, subMarker, offset) {
      var length = this.readUInt(marker, subMarker);
      var encoded = '';
      for (var i = 0; i < length; i++) {
        encoded += String.fromCharCode(this.view.getUint8(this.offset + i));
      }
      this.offset += length;
      return this.references[offset - 1] = decodeURIComponent(escape(encoded));
    }
  }, {
    key: "readArray",
    value: function readArray(marker, subMarker, offset) {
      var length = this.readUInt(marker, subMarker);
      var endOffset = this.offset + length;

      var dimentions = this.read();
      var elements = 1;
      for (var dimention = 0; dimention < dimentions; dimention++) {
        elements *= this.read();
      }
      var item = [];
      while (elements-- > 0) {
        item.push(this.read());
      }
      this.offset = endOffset;
      return item;
    }
  }, {
    key: "readObject",
    value: function readObject(marker, subMarker, offset) {
      var length = this.readUInt(marker, subMarker);
      var endOffset = this.offset + length;
      var item = {};
      while (this.offset < endOffset) {
        var key = this.read();
        var value = this.read();
        item[key] = value;
        if (endOffset <= this.offset) {
          this.offset = endOffset;
          break;
        }
      }
      return item;
    }
  }, {
    key: "readPacked",
    value: function readPacked(marker, subMarker, offset) {
      //throw Error(`TODO: packed ${marker}, ${subMarker}, ${offset}`);

      var childMarker = (this.view.getUint8(this.offset) & 0xF0) >> 4;
      var childSubMarker = this.view.getUint8(this.offset) & 0xF;
      this.offset++;

      var length = this.readUInt(childMarker, childSubMarker);
      var endOffset = this.offset + length;

      var dimentions = this.read();
      var elements = 1;
      for (var dimention = 0; dimention < dimentions; dimention++) {
        elements *= this.read();
      }

      switch (childMarker) {
        case consts.MARKER_ARRAY:
          switch (marker) {
            case consts.MARKER_UINT:
              switch (subMarker) {
                case consts.SIZE_SUBMARKER_8BITS:
                  return this.readPackedArray(1, elements, Uint8Array, endOffset);
                case consts.SIZE_SUBMARKER_16BITS:
                  return this.readPackedArray(2, elements, Uint16Array, endOffset);
                case consts.SIZE_SUBMARKER_32BITS:
                  return this.readPackedArray(4, elements, Uint32Array, endOffset);
              }
            case consts.MARKER_INT:
              switch (subMarker) {
                case consts.SIZE_SUBMARKER_8BITS:
                  return this.readPackedArray(1, elements, Int8Array, endOffset);
                case consts.SIZE_SUBMARKER_16BITS:
                  return this.readPackedArray(2, elements, Int16Array, endOffset);
                case consts.SIZE_SUBMARKER_32BITS:
                  return this.readPackedArray(4, elements, Int32Array, endOffset);
              }
            case consts.MARKER_FLOAT:
              switch (subMarker) {
                case consts.SIZE_SUBMARKER_32BITS:
                  return this.readPackedArray(4, elements, Float32Array, endOffset);
                case consts.SIZE_SUBMARKER_64BITS:
                  return this.readPackedArray(8, elements, Float64Array, endOffset);
              }
          }
      }
      throw new Error("Unsupported " + childMarker + ":" + childSubMarker);
    }
  }, {
    key: "readPackedArray",
    value: function readPackedArray(elementSize, elements, Type, endOffset) {
      var item;
      if (this.offset % elementSize === 0) {
        item = new Type(this.buffer, this.offset, elements);
      } else {
        console.log("WARNING: " + elementSize * 8 + " bit array is not byte aligned");
        item = new Type(this.buffer.slice(this.offset, this.offset + elements * elementSize), 0, elements);
      }
      this.offset = endOffset;
      return item;
    }
  }, {
    key: "readCustom",
    value: function readCustom(marker, subMarker, offset) {
      throw Error('custom');
    }
  }]);

  return JS0NReader;
})();

exports.default = JS0NReader;
},{"./consts":3}],2:[function(require,module,exports){
/**
 * Writer implementation.
 * 
 * @date: 23/08/2014
 * @author: Nahid Akbar
 * @copyrightYear: 2014-2015
 * @copyright: National ICT Australia
 */

"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _consts = require("./consts");

var consts = _interopRequireWildcard(_consts);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var JS0NWriter = (function () {
  function JS0NWriter(options) {
    _classCallCheck(this, JS0NWriter);

    this.littleEndian = true;
    this.buffers = [];
    this.latest = null;
    this.references = {};
  }

  _createClass(JS0NWriter, [{
    key: "write",
    value: function write(item) {
      var type = typeof item === "undefined" ? "undefined" : _typeof(item);
      switch (type) {
        case 'undefined':
          return this.writeUndefined(item);
        case 'boolean':
          return this.writeBoolean(item);
        case 'number':
          return this.writeNumber(item);
        case 'string':
          return this.writeString(item);
        case 'object':
          return this.writeObject(item);
        default:
          throw new Error("Error write type " + type);
      }
    }
  }, {
    key: "writeUndefined",
    value: function writeUndefined(item) {
      this.ensureHasSpace(1);
      this.latest.setUint8(this.latest.offset, consts.MARKER_SPECIAL << 4 | consts.SPECIAL_SUBMARKER_UNDEFINED);
      this.latest.offset += 1;
    }
  }, {
    key: "writeBoolean",
    value: function writeBoolean(item) {
      this.ensureHasSpace(1);
      if (item === false) {
        this.latest.setUint8(this.latest.offset, consts.MARKER_SPECIAL << 4 | consts.SPECIAL_SUBMARKER_FALSE);
      } else {
        this.latest.setUint8(this.latest.offset, consts.MARKER_SPECIAL << 4 | consts.SPECIAL_SUBMARKER_TRUE);
      }
      this.latest.offset += 1;
    }
  }, {
    key: "writeNumber",
    value: function writeNumber(item) {
      if (item % 1 === 0) {
        return this.writeInteger(item);
      } else {
        return this.writeFloat(item);
      }
    }
  }, {
    key: "writeInteger",
    value: function writeInteger(item) {
      if (item >= 0) {
        return this.writeUint(item);
      } else {
        if (item > -128) {
          return this.writeInt8(item);
        } else if (item > -32768) {
          return this.writeInt16(item);
        } else if (item > -2147483647) {
          return this.writeInt32(item);
        } else {
          return this.writeFloat(item);
        }
      }
      throw Error(item);
    }
  }, {
    key: "writeUint",
    value: function writeUint(item) {
      var marker = arguments.length <= 1 || arguments[1] === undefined ? consts.MARKER_UINT : arguments[1];

      if (item < 256) {
        return this.writeUint8(item, marker);
      } else if (item < 65536) {
        return this.writeUint16(item, marker);
      } else if (item < 65536) {
        return this.writeUint32(item, marker);
      } else {
        return this.writeFloat(item, marker);
      }
    }
  }, {
    key: "writeUint8",
    value: function writeUint8(item) {
      var marker = arguments.length <= 1 || arguments[1] === undefined ? consts.MARKER_UINT : arguments[1];

      if (item <= 9) {
        this.ensureHasSpace(1);
        this.latest.setUint8(this.latest.offset, marker << 4 | item);
        this.latest.offset += 1;
      } else {
        this.ensureHasSpace(2);
        this.latest.setUint8(this.latest.offset, marker << 4 | consts.SIZE_SUBMARKER_8BITS);
        this.latest.setUint8(this.latest.offset + 1, item);
        this.latest.offset += 2;
      }
    }
  }, {
    key: "writeInt8",
    value: function writeInt8(item) {
      this.ensureHasSpace(2);
      this.latest.setUint8(this.latest.offset, consts.MARKER_INT << 4 | consts.SIZE_SUBMARKER_8BITS);
      this.latest.setInt8(this.latest.offset + 1, item);
      this.latest.offset += 2;
    }
  }, {
    key: "writeUint16",
    value: function writeUint16(item) {
      var marker = arguments.length <= 1 || arguments[1] === undefined ? consts.MARKER_UINT : arguments[1];

      this.ensureHasSpace(3);
      this.latest.setUint8(this.latest.offset, marker << 4 | consts.SIZE_SUBMARKER_16BITS);
      this.latest.setUint16(this.latest.offset + 1, item, this.littleEndian);
      this.latest.offset += 3;
    }
  }, {
    key: "writeUint32",
    value: function writeUint32(item) {
      var marker = arguments.length <= 1 || arguments[1] === undefined ? consts.MARKER_UINT : arguments[1];

      this.ensureHasSpace(5);
      this.latest.setUint8(this.latest.offset, marker << 4 | consts.SIZE_SUBMARKER_32BITS);
      this.latest.setUint32(this.latest.offset + 1, item, this.littleEndian);
      this.latest.offset += 5;
    }
  }, {
    key: "writeInt16",
    value: function writeInt16(item) {
      this.ensureHasSpace(3);
      this.latest.setUint8(this.latest.offset, consts.MARKER_INT << 4 | consts.SIZE_SUBMARKER_16BITS);
      this.latest.setInt16(this.latest.offset + 1, item, this.littleEndian);
      this.latest.offset += 3;
    }
  }, {
    key: "writeInt32",
    value: function writeInt32(item) {
      this.ensureHasSpace(5);
      this.latest.setUint8(this.latest.offset, consts.MARKER_INT << 4 | consts.SIZE_SUBMARKER_32BITS);
      this.latest.setInt32(this.latest.offset + 1, item, this.littleEndian);
      this.latest.offset += 5;
    }
  }, {
    key: "writeFloat",
    value: function writeFloat(item) {
      try {
        return this.writeFloat32(item);
      } catch (c) {
        return this.writeFloat64(item);
      }
    }
  }, {
    key: "writeFloat32",
    value: function writeFloat32(item) {
      this.ensureHasSpace(5);
      this.latest.setUint8(this.latest.offset, consts.MARKER_FLOAT << 4 | consts.SIZE_SUBMARKER_32BITS);
      this.latest.setFloat32(this.latest.offset + 1, item, this.littleEndian);
      this.latest.offset += 5;
    }
  }, {
    key: "writeFloat64",
    value: function writeFloat64(item) {
      this.ensureHasSpace(9);
      this.latest.setUint8(this.latest.offset, consts.MARKER_FLOAT << 4 | consts.SIZE_SUBMARKER_64BITS);
      this.latest.setFloat64(this.latest.offset + 1, item, this.littleEndian);
      this.latest.offset += 9;
    }
    /*
    writeString(item)
    {
      this.ensureHasSpace(9);
      this.latest.setUint8(this.latest.offset, (consts.MARKER_FLOAT << 4) | consts.SIZE_SUBMARKER_64BITS);
      this.latest.setFloat64(this.latest.offset + 1, item, this.littleEndian);
      this.latest.offset += 9;
    }
    * */

  }, {
    key: "writeString",
    value: function writeString(item) {
      if (item in this.references) {
        return this.writeUint(this.references[item], consts.MARKER_REFERENCE);
      } else {
        var referenceOffset = this.latest != null ? this.latest.offset : 0;
        var encoded = unescape(encodeURIComponent(item));
        this.writeUint(encoded.length, consts.MARKER_STRING);
        this.ensureHasSpace(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          this.latest.setUint8(this.latest.offset + i, encoded.charCodeAt(i));
        }
        this.references[item] = referenceOffset;
        this.latest.offset += encoded.length;
      }
    }
  }, {
    key: "writeObject",
    value: function writeObject(item) {
      if (item instanceof Int8Array) {
        return this.writePackedArray(item, consts.MARKER_INT, consts.SIZE_SUBMARKER_8BITS, 1, DataView.prototype.setInt8);
      } else if (item instanceof Int16Array) {
        return this.writePackedArray(item, consts.MARKER_INT, consts.SIZE_SUBMARKER_16BITS, 2, DataView.prototype.setInt16);
      } else if (item instanceof Int32Array) {
        return this.writePackedArray(item, consts.MARKER_INT, consts.SIZE_SUBMARKER_32BITS, 4, DataView.prototype.setInt32);
      } else if (item instanceof Uint8Array) {
        return this.writePackedArray(item, consts.MARKER_UINT, consts.SIZE_SUBMARKER_8BITS, 1, DataView.prototype.setUint8);
      } else if (item instanceof Uint16Array) {
        return this.writePackedArray(item, consts.MARKER_UINT, consts.SIZE_SUBMARKER_16BITS, 2, DataView.prototype.setUint16);
      } else if (item instanceof Uint32Array) {
        return this.writePackedArray(item, consts.MARKER_UINT, consts.SIZE_SUBMARKER_32BITS, 4, DataView.prototype.setUint32);
      } else if (item instanceof Float32Array) {
        return this.writePackedArray(item, consts.MARKER_FLOAT, consts.SIZE_SUBMARKER_32BITS, 4, DataView.prototype.setFloat32);
      } else if (item instanceof Float64Array) {
        return this.writePackedArray(item, consts.MARKER_FLOAT, consts.SIZE_SUBMARKER_64BITS, 8, DataView.prototype.setFloat64);
      } else if (item instanceof Array) {
        return this.writeArray(item, consts.MARKER_FLOAT, consts.SIZE_SUBMARKER_64BITS);
      } else if (item === null) {
        return this.writeNull();
      } else {
        return this.writeMap(item);
      }
    }
  }, {
    key: "writePackedArray",
    value: function writePackedArray(item, marker, subMarker, itemSize, writer) {
      var _this = this;

      this.ensureHasSpace(2);
      this.latest.setUint8(this.latest.offset, consts.MARKER_SPECIAL << 4 | consts.SPECIAL_SUBMARKER_PACKED);
      this.latest.offset += 1;
      this.latest.setUint8(this.latest.offset, marker << 4 | subMarker);
      this.latest.offset += 1;

      return this.writeComplexWithLength(consts.MARKER_ARRAY, function () {
        _this.writeUint8(1);
        _this.writeUint8(item.length);

        _this.ensureHasSpace(itemSize * item.length);
        for (var i = 0; i < item.length; i++) {
          writer.call(_this.latest, _this.latest.offset, item[i], _this.littleEndian);
          _this.latest.offset += itemSize;
        }
      });
    }
  }, {
    key: "writeArray",
    value: function writeArray(item) {
      var _this2 = this;

      return this.writeComplexWithLength(consts.MARKER_ARRAY, function () {
        _this2.writeUint8(1);
        _this2.writeUint8(item.length);

        for (var i = 0; i < item.length; i++) {
          _this2.write(item[i]);
        }
      });
    }
  }, {
    key: "writeNull",
    value: function writeNull(item) {
      this.ensureHasSpace(1);
      this.latest.setUint8(this.latest.offset, consts.MARKER_SPECIAL << 4 | consts.SPECIAL_SUBMARKER_NULL);
      this.latest.offset += 1;
    }
  }, {
    key: "writeMap",
    value: function writeMap(item) {
      var _this3 = this;

      return this.writeComplexWithLength(consts.MARKER_OBJECT, function () {
        var keys = Object.keys(item);
        for (var i = 0; i < keys.length; i++) {
          _this3.write(keys[i]);
          _this3.write(item[keys[i]]);
        }
      });
    }
  }, {
    key: "writeComplexWithLength",
    value: function writeComplexWithLength(marker, callback) {
      this.writeUint32(0, marker);
      var startOffset = this.calculateTotalSize();
      var lengthBuffer = this.latest;
      var lengthBufferOffset = lengthBuffer.offset;

      callback();

      var endOffset = this.calculateTotalSize();
      lengthBuffer.setUint32(lengthBufferOffset - 4, endOffset - startOffset, this.littleEndian);
    }
  }, {
    key: "ensureHasSpace",
    value: function ensureHasSpace() {
      var size = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      if (this.buffers.length == 0 || this.latest.size - this.latest.offset < size) {
        var newSize = this.latest == null ? Math.max(size, 1024) : 2;
        while (newSize < size) {
          newSize *= 2;
        }
        this.latest = new DataView(new ArrayBuffer(newSize));
        this.latest.size = newSize;
        this.latest.offset = 0;
        this.buffers.push(this.latest);
      }
    }
  }, {
    key: "calculateTotalSize",
    value: function calculateTotalSize() {
      var totalSize = 0;
      this.buffers.forEach(function (buffer) {
        totalSize += buffer.offset;
      });
      return totalSize;
    }
  }, {
    key: "flush",
    value: function flush() {
      var totalSize = 0;
      this.buffers.forEach(function (buffer) {
        totalSize += buffer.offset;
      });
      var offset = 0;
      var result = new ArrayBuffer(totalSize);
      var target = new Uint8Array(result);
      this.buffers.forEach(function (buffer) {
        target.set(new Uint8Array(buffer.buffer, 0, buffer.offset), offset);
        offset += buffer.offset;
      });
      return result;
    }
  }, {
    key: "dump",
    value: function dump(item) {
      this.write(item);
      return this.flush();
    }
  }]);

  return JS0NWriter;
})();

exports.default = JS0NWriter;
},{"./consts":3}],3:[function(require,module,exports){
/**
 * Constants go here.
 * 
 * @date: 23/08/2014
 * @author: Nahid Akbar
 * @copyrightYear: 2014-2015
 * @copyright: National ICT Australia
 */

"use strict"

// 4 bit type
;
Object.defineProperty(exports, "__esModule", {
  value: true
});
var MARKER_CUSTOM = exports.MARKER_CUSTOM = 0x0;
var MARKER_REFERENCE = exports.MARKER_REFERENCE = 0x1;
var MARKER_OBJECT = exports.MARKER_OBJECT = 0x9;
var MARKER_ARRAY = exports.MARKER_ARRAY = 0xa;
var MARKER_STRING = exports.MARKER_STRING = 0xb;
var MARKER_FLOAT = exports.MARKER_FLOAT = 0xc;
var MARKER_INT = exports.MARKER_INT = 0xd;
var MARKER_UINT = exports.MARKER_UINT = 0xe;
var MARKER_SPECIAL = exports.MARKER_SPECIAL = 0xf;

// 4 bit SUBMARKER for MARKER_SPECIAL
var SPECIAL_SUBMARKER_NULL = exports.SPECIAL_SUBMARKER_NULL = 0x0;
var SPECIAL_SUBMARKER_UNDEFINED = exports.SPECIAL_SUBMARKER_UNDEFINED = 0x1;
var SPECIAL_SUBMARKER_FALSE = exports.SPECIAL_SUBMARKER_FALSE = 0x2;
var SPECIAL_SUBMARKER_TRUE = exports.SPECIAL_SUBMARKER_TRUE = 0x3;
var SPECIAL_SUBMARKER_PADDING = exports.SPECIAL_SUBMARKER_PADDING = 0x4;
var SPECIAL_SUBMARKER_PACKED = exports.SPECIAL_SUBMARKER_PACKED = 0x5;
var SPECIAL_SUBMARKER_BIG_ENDIAN = exports.SPECIAL_SUBMARKER_BIG_ENDIAN = 0x6;
var SPECIAL_SUBMARKER_LITTLE_ENDIAN = exports.SPECIAL_SUBMARKER_LITTLE_ENDIAN = 0x7;

// 4 bit SUBMARKER for MARKER_SPECIAL
var SIZE_SUBMARKER_VALUE_MIN = exports.SIZE_SUBMARKER_VALUE_MIN = 0x0;
var SIZE_SUBMARKER_VALUE_MAX = exports.SIZE_SUBMARKER_VALUE_MAX = 0x9;
var SIZE_SUBMARKER_256BITS = exports.SIZE_SUBMARKER_256BITS = 0xa;
var SIZE_SUBMARKER_128BITS = exports.SIZE_SUBMARKER_128BITS = 0xb;
var SIZE_SUBMARKER_64BITS = exports.SIZE_SUBMARKER_64BITS = 0xc;
var SIZE_SUBMARKER_32BITS = exports.SIZE_SUBMARKER_32BITS = 0xd;
var SIZE_SUBMARKER_16BITS = exports.SIZE_SUBMARKER_16BITS = 0xe;
var SIZE_SUBMARKER_8BITS = exports.SIZE_SUBMARKER_8BITS = 0xf;
},{}],4:[function(require,module,exports){
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
},{"./JS0NReader":1,"./JS0NWriter":2}]},{},[4])(4)
});