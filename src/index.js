/**
 * One JS implementation of js0n encoder/decoder.
 * 
 * @date: 23/08/2014
 * @author: Nahid Akbar
 * @copyrightYear: 2014-2015
 * @copyright: National ICT Australia
 */

"use stict";

import JS0NReader from "./JS0NReader";
import JS0NWriter from "./JS0NWriter";

export function load(encoded, options={})
{
   return (new JS0NReader(options)).load(encoded);
}
export function dump(item, options={})
{
   return (new JS0NWriter(options)).dump(item);
}
