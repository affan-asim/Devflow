
import { AppError } from "@/utils/AppError";
import { cacheInvalidate, getCacheKey } from "@/utils/helper";
import { skillDetail, skillList } from "@/utils/redisKeyNames";
import prisma from "@/utils/prisma";
import Redis from "ioredis";

const redis = new Redis();

const MAX_PAGE_SIZE = 100;

const SKILL_SORT_FIELDS = new Set([
  "name",
  "category",
  "createdAt",
  "updatedAt",
]);

const normalizePage = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeSort = (sortBy, sortOrder) => ({
  sortBy: SKILL_SORT_FIELDS.has(sortBy) ? sortBy : "updatedAt",
  sortOrder: ["asc", "desc"].includes(String(sortOrder).toLowerCase())
    ? String(sortOrder).toLowerCase()
    : "desc",
});

const normalizeSkillName = (name) =>
  typeof name === "string" ? name.trim() : "";

const invalidateSkillCaches = async (id) => {
  await Promise.allSettled([
    cacheInvalidate(skillList),
    id ? redis.del(`${skillDetail}:${id}`) : Promise.resolve(),
  ]);
};

/**
 * Admin: paginated skills directory.
 * Supports search, category, status, sortBy, sortOrder, page, limit.
 */
export const getAdminSkills = async (queryParams = {}) => {
  const params =
    typeof queryParams?.get === "function"
      ? Object.fromEntries(queryParams.entries())
      : queryParams;

  const {
    page = 1,
    limit = 12,
    search,
    category,
    status = "active",
    sortBy = "updatedAt",
    sortOrder = "desc",
  } = params;

  const currentPage = normalizePage(page, 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    normalizePage(limit, 12)
  );

  const { sortBy: safeSortBy, sortOrder: safeSortOrder } =
    normalizeSort(sortBy, sortOrder);

  const where = {};

  const normalizedStatus = String(status || "").toLowerCase().trim();
  if (normalizedStatus === "active") {
    where.isActive = true;
  } else if (normalizedStatus === "inactive") {
    where.isActive = false;
  }
  // An empty or "all" status means both active and inactive skills.

  if (category && String(category).trim()) {
    const rawCategory = String(category).trim().toUpperCase();
    where.category = rawCategory;
  }

  const normalizedSearch =
    typeof search === "string" ? search.trim() : "";

  if (normalizedSearch) {
    where.name = {
      contains: normalizedSearch,
      mode: "insensitive",
    };
  }

  const skip = (currentPage - 1) * pageSize;

  const [skills, totalCount] = await prisma.$transaction([
    prisma.skill.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [
        { [safeSortBy]: safeSortOrder },
        { id: "asc" },
      ],
      select: {
        id: true,
        name: true,
        category: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.skill.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    skills,
    metadata: {
      currentPage,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1 && totalCount > 0,
    },
  };
};

/**
 * Admin: fetch any skill, including inactive skills.
 * Does not cache admin details, avoiding stale records after mutations.
 */
export const getAdminSkillById = async (id) => {
  const skill = await prisma.skill.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      category: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!skill) {
    throw new AppError("Skill not found", 404);
  }

  return skill;
};

/**
 * Public: list only active skills.
 * Retains the existing public API behavior while bounding pagination.
 */
export const getSkills = async (searchParams) => {
  const params = Object.fromEntries(searchParams.entries());
  const name = searchParams.get("name")?.trim();
  const category = searchParams.get("category")?.trim();
  const sort = searchParams.get("sort");

  const currentPage = normalizePage(searchParams.get("page"), 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    normalizePage(searchParams.get("limit"), 10)
  );

  const where = { isActive: true };

  if (name) {
    where.name = { contains: name, mode: "insensitive" };
  }

  if (category) {
    where.category = { equals: category, mode: "insensitive" };
  }

  const publicOrderBy = sort === "name"
    ? { name: "asc" }
    : sort === "category"
      ? { category: "asc" }
      : { name: "asc" };

  const cacheKey = await getCacheKey(skillList, {
    ...params,
    page: String(currentPage),
    limit: String(pageSize),
  });

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed?.skills) && parsed?.metadata) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Skill list cache read failed:", error);
  }

  const [skills, totalCount] = await prisma.$transaction([
    prisma.skill.findMany({
      where,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: [publicOrderBy, { id: "asc" }],
    }),
    prisma.skill.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const result = {
    skills,
    metadata: {
      currentPage,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1 && totalCount > 0,
    },
  };

  try {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 600);
  } catch (error) {
    console.error("Skill list cache write failed:", error);
  }

  return result;
};

/**
 * Public: fetch an active skill by ID.
 */
export const getSkill = async (id) => {
  const cacheKey = `${skillDetail}:${id}`;

  try {
    const raw = await redis.get(cacheKey);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached?.id && cached?.isActive === true) return cached;
    }
  } catch (error) {
    console.error("Skill detail cache read failed:", error);
  }

  const skill = await prisma.skill.findFirst({
    where: { id, isActive: true },
    select: {
      id: true,
      name: true,
      category: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!skill) {
    throw new AppError("Skill not found", 404);
  }

  try {
    await redis.set(cacheKey, JSON.stringify(skill), "EX", 600);
  } catch (error) {
    console.error("Skill detail cache write failed:", error);
  }

  return skill;
};

export const createSkill = async ({ name, category }) => {
  const normalizedName = normalizeSkillName(name);
  const normalizedCategory = typeof category === "string"
    ? category.trim()
    : "";

  if (!normalizedName || !normalizedCategory) {
    throw new AppError("Skill name and category are required.", 400);
  }

  // The database unique constraint remains the final concurrency safeguard.
  try {
    const skill = await prisma.skill.create({
      data: {
        name: normalizedName,
        category: normalizedCategory,
      },
      select: {
        id: true,
        name: true,
        category: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await invalidateSkillCaches();
    return skill;
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError("A skill with this name already exists.", 409);
    }
    throw error;
  }
};

export const updateSkill = async ({ name, category }, id) => {
  const normalizedName = normalizeSkillName(name);
  const normalizedCategory = typeof category === "string"
    ? category.trim()
    : "";

  if (!normalizedName || !normalizedCategory) {
    throw new AppError("Skill name and category are required.", 400);
  }

  try {
    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: {
        name: normalizedName,
        category: normalizedCategory,
      },
      select: {
        id: true,
        name: true,
        category: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await invalidateSkillCaches(id);
    return updatedSkill;
  } catch (error) {
    if (error?.code === "P2025") {
      throw new AppError("Skill not found", 404);
    }

    if (error?.code === "P2002") {
      throw new AppError("A skill with this name already exists.", 409);
    }

    throw error;
  }
};

/**
 * Admin: soft-delete by deactivating the catalog entry.
 */
export const delSkill = async (id) => {
  try {
    const deactivatedSkill = await prisma.skill.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        category: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await invalidateSkillCaches(id);
    return deactivatedSkill;
  } catch (error) {
    if (error?.code === "P2025") {
      throw new AppError("Skill not found", 404);
    }
    throw error;
  }
};

const normalizeSkills = (skills) => [
  ...new Map(
    skills.map((skill) => {
      const name = skill.name.trim().toUpperCase();
      return [name, { name, category: skill.category }];
    })
  ).values(),
];

export const getExistingSkillConnections = async (skills) => {
  const normalizedSkills = normalizeSkills(skills);
  const catalogSkills = await prisma.skill.findMany({
    where: { name: { in: normalizedSkills.map((skill) => skill.name) } },
  });
  const catalogByName = new Map(catalogSkills.map((skill) => [skill.name, skill]));

  const invalidSkill = normalizedSkills.filter((skill) => {
    const catalogSkill = catalogByName.get(skill.name);
    return !catalogSkill || catalogSkill.category !== skill.category;
  });

  if (invalidSkill.length > 0) {
    throw new AppError(
      `Skills "${invalidSkill.map((skill) => skill.name).join(', ')}" does not exist in the catalog with the selected category.`,
      400
    );
  }

  return normalizedSkills.map((skill) => ({ id: catalogByName.get(skill.name).id }));
};