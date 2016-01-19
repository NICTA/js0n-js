/**
 * Test cases.
 * 
 * @date: 23/08/2014
 * @author: Nahid Akbar
 * @copyrightYear: 2014-2015
 * @copyright: National ICT Australia
 */

"use strict";

import JS0N from "./index";

function randomInt(max)
{
    return Math.floor(Math.random() * max);
}

function randomSign()
{
    return Math.random() > 0.5? 1:-1;
}

function randomString()
{
    return Math.random() > 0.5? 1:-1;
}

function randomInteger()
{
  var v = randomInt(16); 
  switch(v)
  {
    case 15:
      return randomSign() * Math.pow(2, randomInt(33) - 1);
    default:
      return v;
  }
}

function randomObject(depth=0)
{
  if (depth > 4)
  {
    return {};
  }
  
  var count = randomInt(5);
  var o = {};
  while (count --> 0)
  {
    o[randomString()] = randomValue(depth + 1);
  }
  return o;
}

function randomArray(depth=0)
{
  if (depth > 4)
  {
    return [];
  }
  
  var count = randomInt(11);
  switch(randomInt(9))
  {
    case 0:
      return new Uint8Array(count);
    case 1:
      return new Int8Array(count);
    case 2:
      return new Uint16Array(count);
    case 3:
      return new Int16Array(count);
    case 4:
      return new Uint32Array(count);
    case 5:
      return new Int32Array(count);
    case 6:
      return new Float32Array(count);
    case 7:
      return new Float64Array(count);
    default:
      var o = [];
      while (count --> 0)
      {
        o.push(randomValue(depth+1));
      }
      return o;
  }
}

function randomFloat()
{
  var v = randomInt(16); 
  switch(v)
  {
    case 15:
      return Number.NaN;
    case 14:
      return randomSign() * Number.Infinity;
    default:
      return randomSign() * Math.random() / Math.random();
  }
}

function randomString()
{
  return new Array(randomInt(5) + 1).join( 'a' );
}

function randomSpecial()
{
  switch(randomInt(4))
  {
  case 0:
    return null;
  case 1:
    return true;
  case 2:
    return false;
  default:
    return undefined;
  };
}

function randomValue(depth=0)
{
  switch(randomInt(5))
  {
  case 0:
    return randomSpecial(depth + 1);
  case 1:
    return randomInteger(depth + 1);
  case 2:
    return randomFloat(depth + 1);
  case 3:
    return randomString(depth + 1);
  case 4:
    return randomArray(depth + 1);
  default:
    return randomObject(depth + 1);
  };
}

function arrayBufferToHexString(arraybuffer)
{
  var array = new Uint8Array(arraybuffer);
  var hex = '';
  for (var i = 0; i < array.length; i++)
  {
    if (i % 100 == 0)
    {
      hex += '\n';
    }
    hex += ' ';

    var hi = (array[i] & 0xf0) >> 4;
    var lo = array[i] & 0xf;
    hex += '0123456789ABCDEF'.substr(hi, 1);
    hex += '0123456789ABCDEF'.substr(lo, 1);
  }
  return hex;
}

var failures = 0;
var total = 100000;
var count = total;
while (count --> 0)
{
  try
  {
    var value = randomValue();
    var encoded = JS0N.dump(value);
    var decoded = JS0N.load(encoded);
    var reencoded = JS0N.dump(decoded);
    if (encoded === undefined ||
        arrayBufferToHexString(encoded) !== arrayBufferToHexString(reencoded))
    {
      throw new Error(`test case '${value}' failed`);
    }
    // console.log(`pass ${value}`);
  }
  catch (c)
  {
    failures++;
    console.log(`fail ${value} ${c.stack}`);
    console.log('toencode', typeof value, value && value.constructor && value.constructor.name, value && value.length, JSON.stringify(value, null, 2));
    console.log('encoded', arrayBufferToHexString(encoded));
    console.log('decoded', typeof decoded, decoded && decoded.constructor && decoded.constructor.name, decoded && decoded.length, JSON.stringify(decoded, null, 2));
        /*
    console.log('recoded', arrayBufferToHexString(reencoded));
    */
  }
}

if (failures)
{
  throw new Error(`${failures} (${failures/total*100}%) cases failed`);
}
