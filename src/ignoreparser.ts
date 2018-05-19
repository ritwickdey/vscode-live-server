import * as fs from 'fs';

export type Stats = {
    first: string,
    last: string,
    isNegated: boolean,
};

export type Parsed = {
    stats: any,
    patterns: Array<string>
};

export type Options = {
    cache: boolean,
    isGlob: boolean
};

export class IgnoreParser {

    cache: Object;
    options: Options;

    constructor() {
        this.cache = {};
    }

    public ignore(fp: any, options?: Options): Array<String> {
        if (!fp || !fs.existsSync(fp)) return [];

        if (this.cache.hasOwnProperty(fp)) {
            return this.cache[fp];
        }
        
        this.options = options;

        const str = fs.readFileSync(fp, 'utf8');
        const lines = str.split(/\r\n|\n/);

        const arr = this.unique(this.parse(lines, this.options));

        if (this.options && this.options['cache'] !== false) {
            this.cache[fp] = arr;
        }

        return arr;
    }

    public parse(arr: Array<any>, opts: Options): Array<String> {
        arr = this.arrayify(arr);
        const len = arr.length
        let i = -1;
        let res = [];

        while (++i < len) {
            let str = arr[i];
            str = (str || '').trim();

            if (!str || str.charAt(0) === '#') {
                continue;
            }

            const parsed: Parsed = this.toGlob(str);
            this.addPattern(res, parsed.patterns, parsed.stats, opts);
        }
        return res;
    }

    private addPattern(res: Array<any>, arr, stats: Stats, options: Options): Array<String> {
        arr = this.arrayify(arr);
        const len = arr.length;
        let i = -1;
        while (++i < len) {
            let str = arr[i];
            if (stats.isNegated) {
                str = '!' + str;
            }

            if (res.indexOf(str) === -1) {
                res.push(str);
            }
        }
        return res;
    }

    private toGlob(str: string): Parsed {
        let parsed: Parsed = {
            stats: {},
            patterns: []
        }, stats: Stats = {
            first: '',
            last: '',
            isNegated: false,
        };

        stats.first = str.charAt(0);
        stats.last = str.slice(-1);

        stats.isNegated = stats.first === '!';

        if (stats.isNegated) {
            str = str.slice(1);
            stats.first = str.charAt(0);
        }

        if (stats.first === '/') {
            str = str.slice(1);
        }

        if (/\w\/[*]{2}\/\w/.test(str)) {
            str += '|' + str.split('/**/').join('/');
        }

        if (/^[\w.]/.test(str) && /\w$/.test(str) && this.options.isGlob) {
            str += '|' + str + '/**';
        } else if (/\/$/.test(str)) {
            str += '**';
        }

        parsed.stats = stats;
        parsed.patterns = str.split('|');

        return parsed;
    }

    private arrayify(val: Array<any>): Array<any> {
        return Array.isArray(val) ? val : [val];
    }

    private unique(arr: Array<any>): Array<any> {
        if (!Array.isArray(arr)) {
            throw new TypeError('array-unique expects an array.');
        }

        var arrLen = arr.length;
        var newArr = new Array(arrLen);

        for (var i = 0; i < arrLen; i++) {
            newArr[i] = arr[i];
        }

        return newArr;
    }
}