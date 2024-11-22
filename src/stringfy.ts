/**
 * Converts an object to a string representation while handling circular references
 * Uses a special format that preserves object structure and references
 * 
 * @param obj Any JavaScript object to stringify
 * @returns A string representation of the object
 */
export function stringifyObject(obj: any) {
    const exists = [obj]; // Track processed objects to avoid circular references
    const used: any[] = []; // Track reference markers that are actually used
    
    /**
     * Recursively stringifies an object by processing its keys in sorted order
     * Handles arrays and nested objects, marking circular references with #n
     * 
     * @param obj Object to stringify
     * @returns String representation with reference markers
     */
    const stringifyObjectByKeys = (obj: any) => {
        if (Array.isArray(obj)) {
            const items: string[] = obj.map((item: any) => {
                if (item && typeof item === 'object') {
                    return stringifyObjectByKeys(item)
                } else {
                    return JSON.stringify(item)
                }
            })
            return '[' + items.join(',') + ']'
        }

        let str = '{'
        let keys = Object.keys(obj)
        let total = keys.length
        keys.sort() // Sort keys for consistent output
        keys.forEach((key, i) => {
            let value = obj[key]
            str += key + ':'

            if (value && typeof value === 'object') {
                let index = exists.indexOf(value)
                if (index > -1) {
                    // Object already processed, use reference marker
                    str += '#' + index
                    used.push(index)
                } else {
                    // New object, add to tracking and process
                    exists.push(value)
                    let num = exists.length - 1
                    str += '#' + num + stringifyObjectByKeys(value)
                }
            } else {
                str += JSON.stringify(value)
            }

            if (i < total - 1) {
                str += ','
            }
        })
        str += '}'
        return str
    }
    let str = stringifyObjectByKeys(obj)

    // Clean up unused reference markers
    exists.forEach((item, i) => {
        if (!used.includes(i)) {
            str = str.replace(new RegExp(`:#${i}`, 'g'), ':')
        }
    })

    // Add root reference marker if needed
    if (used.includes(0)) {
        str = '#0' + str
    }

    return str
}

/**
 * Converts any JavaScript value to its string representation
 * Handles all primitive types and objects
 * 
 * Conversion rules:
 * - null/undefined: empty string
 * - string: as is
 * - number: converted to string
 * - boolean: 'true' or 'false'
 * - object: uses stringifyObject for complex structure
 * - function/symbol/bigint: toString() representation
 * 
 * @param obj Any JavaScript value to convert to string
 * @returns String representation of the value
 */
export const stringify = (obj: any) => {
    if (obj === null || obj === undefined) {
        return '';
    }
    if (typeof obj === 'string') {
        return obj
    }
    if (typeof obj === 'number') {
        return obj + ''
    }
    if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false'
    }
    if (typeof obj === 'object') {
        return stringifyObject(obj)
    }
    if (typeof obj === 'function') {
        return obj.toString()
    }
    if (typeof obj === 'symbol') {
        return obj.toString()
    }
    if (typeof obj === 'bigint') {
        return obj.toString()
    }
    return '';
}
