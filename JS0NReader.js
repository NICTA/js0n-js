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