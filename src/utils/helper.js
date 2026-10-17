import { createHash } from 'crypto';
import Redis from 'ioredis';

const redis = new Redis();

export const getVersion = async (entity) => {
    const version = await redis.get(`version:${entity}`);

    if (!version) {
        await redis.set(`version:${entity}`, 1);
        return 1;
    };

    return version;
};

export const getCanonicalQueryString = (searchParams) => {
    const sortedKeys = Object.keys(searchParams).sort();
    const searchUrlBuilder = new URLSearchParams();

    for (const key of sortedKeys) {
        const value = searchParams[key];

        if (value === undefined || value === '') continue;

        if (Array.isArray(value)) {
            [...value].sort().forEach((v) => searchUrlBuilder.append(key, v))
        }
        else {
            searchUrlBuilder.append(key, value)
        }
    };

    console.log(searchUrlBuilder)

    return searchUrlBuilder.toString()
};

export const getCacheKey = async (prefix, searchParamsObject) => {
    const canonicalString = getCanonicalQueryString(searchParamsObject);
    const version = await getVersion(prefix);
    console.log(version)
    const hash = createHash('sha-256').update(canonicalString).digest('hex');

    return `${prefix}:v${version}:${hash}`;
};

export const cacheInvalidate = async (entity) => {
    const newVersion = await redis.incr(`version:${entity}`);
    return newVersion;
};