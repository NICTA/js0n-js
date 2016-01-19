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