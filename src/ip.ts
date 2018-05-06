import * as os from 'os';

export default class IP {

    private static _normalizeFamily(family) {
        return family ? family.toLowerCase() : 'ipv4';
    }

    public isLoopback(addr) {
        return /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/
            .test(addr) ||
            /^fe80::1$/.test(addr) ||
            /^::1$/.test(addr) ||
            /^::$/.test(addr);
    }

    public isPrivate(addr) {
        return /^(::f{4}:)?10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
            /^(::f{4}:)?192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
            /^(::f{4}:)?172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
            /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
            /^(::f{4}:)?169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
            /^f[cd][0-9a-f]{2}:/i.test(addr) ||
            /^fe80:/i.test(addr) ||
            /^::1$/.test(addr) ||
            /^::$/.test(addr);
    }

    public isPublic(addr) {
        return !this.isPrivate(addr);
    }

    private _loopback(family) {
        //
        // Default to `ipv4`
        //
        family = IP._normalizeFamily(family);

        if (family !== 'ipv4' && family !== 'ipv6') {
            throw new Error('family must be ipv4 or ipv6');
        }

        return family === 'ipv4' ? '127.0.0.1' : 'fe80::1';
    }

    public address(name?: string, family?: string) {
        const interfaces = os.networkInterfaces();
        family = IP._normalizeFamily(family);

        const all = Object.keys(interfaces).map(function (nic) {
            //
            // Note: name will only be `public` or `private`
            // when IP is called.
            //
            const addresses = interfaces[nic].filter(function (details) {
                details.family = details.family.toLowerCase();

                if (details.family !== family) {
                    return false;
                } else if (!name) {
                    return true;
                } else {
                    return name === 'public' ? this.isPrivate(details.address) :
                        this.isPublic(details.address);
                }
            });
            return addresses.length ? addresses[0].address : undefined;
        }).filter(Boolean); // filter null

        return !all.length ? this._loopback(family) : all;
    }
}