---@diagnostic disable: undefined-global
---@class Redis
---@field call function


-- bucket size & refil rate  specifies and get values from redis of tokens and last refil and if there is no tokens then set tokens to bucket size & refil to last refil

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refilRatePerSec = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local data = redis.call("HMGET", key, "tokens", "lastRefill")
local tokens = tonumber(data[1])
local lastRefill = tonumber(data[2])

if not tokens or not lastRefill then
    tokens = capacity
    lastRefill = now
end

local timePassed = (now - lastRefill) / 1000
local tokensToAdd = timePassed * refilRatePerSec
local updatedToken = math.min(capacity, tokens + tokensToAdd)

local tokensNeeded = capacity - updatedToken
local timeToFill = math.ceil(tokensNeeded / refilRatePerSec)
local ttl = timeToFill + 60

if updatedToken < 1 then
    redis.call('HSET', key, 'tokens', updatedToken, 'lastRefill', now)
    redis.call('EXPIRE', key, ttl)
    return 0
end

updatedToken = updatedToken - 1

redis.call('HMSET', key, 'tokens', updatedToken, 'lastRefill', now)
redis.call('EXPIRE', key, ttl)

return 1

-- local workerId = tonumber(ARGV[1])
-- local currentTime = tonumber(ARGV[2])
-- local interval = tonumber(ARGV[3])

-- local sheduleTime = tonumber(redis.call('GET', "nextAllowedTime") or 0)

-- if currentTime < sheduleTime then
--     local waitMs = currentTime - sheduleTime;
--     return { "WAITING_FOR_SCHEDULE", tostring(waitMs) }
-- end

-- local element = redis.call('RPOP', 'leaky:waiting')

-- if not element then
--     return { "NO_JOB", 0 }
-- end

-- local jobData = redis.call('HGET', 'job:data', element)

-- local baseTime = math.max(currentTime, sheduleTime)
-- local nextAllowed = baseTime + interval

-- local processingData = '{"workerId":"' .. workerId .. '","claimAt":' .. currentTime .. ',"processAt":' .. baseTime .. '}'
-- redis.call('HSET', 'leaky:processing', element, processingData)

-- redis.call('SET', "nextAllowedTime", nextAllowed)

-- return {
--     "SUCCESS",
--     jobData
-- }
