/**
 * Constants go here.
 * 
 * @date: 23/08/2014
 * @author: Nahid Akbar
 * @copyrightYear: 2014-2015
 * @copyright: National ICT Australia
 */

"use strict";

// 4 bit type
export const MARKER_CUSTOM = 0x0;
export const MARKER_REFERENCE = 0x1;
export const MARKER_OBJECT = 0x9;
export const MARKER_ARRAY = 0xa;
export const MARKER_STRING = 0xb;
export const MARKER_FLOAT = 0xc;
export const MARKER_INT = 0xd;
export const MARKER_UINT = 0xe;
export const MARKER_SPECIAL = 0xf;

// 4 bit SUBMARKER for MARKER_SPECIAL
export const SPECIAL_SUBMARKER_NULL = 0x0;
export const SPECIAL_SUBMARKER_UNDEFINED = 0x1;
export const SPECIAL_SUBMARKER_FALSE = 0x2;
export const SPECIAL_SUBMARKER_TRUE = 0x3;
export const SPECIAL_SUBMARKER_PADDING = 0x4;
export const SPECIAL_SUBMARKER_PACKED = 0x5;
export const SPECIAL_SUBMARKER_BIG_ENDIAN = 0x6;
export const SPECIAL_SUBMARKER_LITTLE_ENDIAN = 0x7;

// 4 bit SUBMARKER for MARKER_SPECIAL
export const SIZE_SUBMARKER_VALUE_MIN = 0x0;
export const SIZE_SUBMARKER_VALUE_MAX = 0x9;
export const SIZE_SUBMARKER_256BITS = 0xa;
export const SIZE_SUBMARKER_128BITS = 0xb;
export const SIZE_SUBMARKER_64BITS = 0xc;
export const SIZE_SUBMARKER_32BITS = 0xd;
export const SIZE_SUBMARKER_16BITS = 0xe;
export const SIZE_SUBMARKER_8BITS = 0xf;
