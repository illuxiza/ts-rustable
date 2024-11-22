/**
 * Iterator utilities inspired by Rust's Iterator trait
 */

/**
 * Type representing a predicate function
 */
type Predicate<T> = (value: T) => boolean;

/**
 * Creates an iterator that yields elements while the predicate returns true
 * @param iter Source iterator
 * @param predicate Predicate function
 */
export function* takeWhile<T>(iter: Iterable<T>, predicate: Predicate<T>): Generator<T> {
    for (const item of iter) {
        if (!predicate(item)) {
            break;
        }
        yield item;
    }
}

/**
 * Creates an iterator that yields elements after the predicate returns false
 * @param iter Source iterator
 * @param predicate Predicate function
 */
export function* skipWhile<T>(iter: Iterable<T>, predicate: Predicate<T>): Generator<T> {
    let skipping = true;
    for (const item of iter) {
        if (skipping && !predicate(item)) {
            skipping = false;
        }
        if (!skipping) {
            yield item;
        }
    }
}

/**
 * Creates an iterator that yields chunks of the source iterator
 * @param iter Source iterator
 * @param size Chunk size
 */
export function* chunks<T>(iter: Iterable<T>, size: number): Generator<T[]> {
    let chunk: T[] = [];
    for (const item of iter) {
        chunk.push(item);
        if (chunk.length === size) {
            yield chunk;
            chunk = [];
        }
    }
    if (chunk.length > 0) {
        yield chunk;
    }
}

/**
 * Creates an iterator that yields windows of the source iterator
 * @param iter Source iterator
 * @param size Window size
 */
export function* windows<T>(iter: Iterable<T>, size: number): Generator<T[]> {
    const window: T[] = [];
    for (const item of iter) {
        window.push(item);
        if (window.length === size) {
            yield [...window];
            window.shift();
        }
    }
}

/**
 * Creates an iterator that yields pairs of consecutive elements
 * @param iter Source iterator
 */
export function* pairwise<T>(iter: Iterable<T>): Generator<[T, T]> {
    let prev: T | undefined;
    let first = true;
    for (const item of iter) {
        if (first) {
            prev = item;
            first = false;
            continue;
        }
        yield [prev!, item];
        prev = item;
    }
}

/**
 * Creates an iterator that yields elements and their indices
 * @param iter Source iterator
 */
export function* enumerate<T>(iter: Iterable<T>): Generator<[number, T]> {
    let index = 0;
    for (const item of iter) {
        yield [index++, item];
    }
}

/**
 * Groups elements by a key function
 * @param iter Iterable to group
 * @param keyFn Function to compute key for each element
 */
export function* groupBy<T, K>(iter: Iterable<T>, keyFn: (item: T) => K): Generator<[K, T[]]> {
    const groups = new Map<K, T[]>();
    
    for (const item of iter) {
        const key = keyFn(item);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(item);
    }

    for (const [key, group] of [...groups.entries()].sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        return 0;
    })) {
        yield [key, group];
    }
}

/**
 * Creates an iterator that yields the cartesian product of iterables
 * @param iters Iterables to compute product of
 */
export function* product<T extends readonly unknown[]>(...iters: { [K in keyof T]: Iterable<T[K]> }): Generator<T extends readonly [] ? [] : [...T]> {
    if (iters.length === 0) {
        yield [] as T extends readonly [] ? [] : [...T];
        return;
    }

    const arrays = iters.map(iter => Array.from(iter));
    const indices = new Array(arrays.length).fill(0);
    
    while (true) {
        yield indices.map((i, j) => arrays[j][i]) as T extends readonly [] ? [] : [...T];
        
        let i = indices.length - 1;
        while (i >= 0) {
            indices[i]++;
            if (indices[i] < arrays[i].length) {
                break;
            }
            indices[i] = 0;
            i--;
        }
        if (i < 0) {
            break;
        }
    }
}

/**
 * Generates all permutations of elements
 * @param iter Iterable to generate permutations from
 * @param r Length of each permutation (default: all elements)
 */
export function* permutations<T>(iter: Iterable<T>, r?: number): Generator<T[]> {
    const arr = Array.from(iter);
    const n = arr.length;
    r = r === undefined ? n : r;

    if (n === 0) {
        return;
    }

    const indices = Array.from({ length: n }, (_, i) => i);
    const cycles = Array.from({ length: r }, (_, i) => n - i);
    
    yield indices.slice(0, r).map(i => arr[i]);

    while (n > 0) {
        let found = false;
        for (let i = r - 1; i >= 0; i--) {
            cycles[i]--;
            if (cycles[i] === 0) {
                indices.push(indices.splice(i, 1)[0]);
                cycles[i] = n - i;
            } else {
                const j = cycles[i];
                [indices[i], indices[n - j]] = [indices[n - j], indices[i]];
                yield indices.slice(0, r).map(i => arr[i]);
                found = true;
                break;
            }
        }
        if (!found) {
            break;
        }
    }
}

/**
 * Creates an iterator that yields combinations of elements
 * @param iter Source iterator
 * @param r Length of each combination
 */
export function* combinations<T>(iter: Iterable<T>, r: number): Generator<T[]> {
    const pool = Array.from(iter);
    const n = pool.length;

    if (r > n) return;

    const indices = Array.from({length: r}, (_, i) => i);
    yield indices.map(i => pool[i]);

    while (true) {
        let i = r - 1;
        while (i >= 0 && indices[i] === i + n - r) {
            i--;
        }

        if (i < 0) return;

        indices[i]++;
        for (let j = i + 1; j < r; j++) {
            indices[j] = indices[j-1] + 1;
        }

        yield indices.map(i => pool[i]);
    }
}
