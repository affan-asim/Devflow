import { AppError } from "@/utils/AppError";
import { cacheInvalidate, getCacheKey } from "@/utils/helper";
import { skillDetail, skillList } from "@/utils/redisKeyNames";
import { PrismaClient } from "@/generated/prisma/client";
import Redis from "ioredis";

import prisma from "@/utils/prisma";
const redis = new Redis();

const normalizeSkills = (skills) => [
  ...new Map(
    skills.map((skill) => {
      const name = skill.name.trim().toUpperCase();
      return [name, { name, category: skill.category }];
    })
  ).values(),
];

export const getSkills = async (searchParams) => {
  const searchParamsObject = Object.fromEntries(searchParams.entries());
  const name = searchParams.get("name");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("limit") || 10);

  const currentPage = Math.max(1, page);
  const limit = Math.max(1, pageSize);

  let where = {
    isActive: true
  };

  if (name) where.name = name;
  if (category) where.category = category;

  let orderBy = {};

  if (sort) {
    if (sort === "name") {
      orderBy = {
        name: "asc"
      }
    }
    else if (sort === "category") {
      orderBy = {
        category: "asc"
      }
    }
  }

  const cacheKey = await getCacheKey(skillList, searchParamsObject);

  let cachedData = null;

  try {
    const rawData = await redis.get(cacheKey);
    cachedData = rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.error("Redis parsing failed, falling back to DB:", error);
  }

  if (cachedData && cachedData.skills && cachedData.metadata) {
    return {
      skills: cachedData.skills,
      metadata: cachedData.metadata
    };
  }

  const [skills, totalCount] = await prisma.$transaction([
    prisma.skill.findMany({
      where,
      take: limit,
      skip: (currentPage - 1) * limit,
      orderBy
    }),
    prisma.skill.count({
      where
    })
  ])

  const totalPages = Math.ceil(totalCount / limit);

  const metadata = {
    currentPage,
    pageSize: limit,
    totalCount,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }

  const responseData = { skills, metadata };

  try {
    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 600, 'NX');

  } catch (error) {
    console.error("Failed to save to Redis cache:", error);
  }

  return responseData;

}

export const createSkill = async ({ name, category }) => {
  const existingSkill = await prisma.skill.findUnique({ where: { name } });
  if (existingSkill) throw new AppError("A skill with this name already exists.", 409);

  await cacheInvalidate(skillList);

  return prisma.skill.create({ data: { name, category } });
};

export const getSkill = async (id) => {
  let cachedData = null;

  try {
    const rawData = await redis.get(`${skillDetail}:${id}`);
    cachedData = rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.error("Redis parsing failed, falling back to DB:", error);
  }

  if (cachedData && Object.keys(cachedData).length > 0) {
    return cachedData;
  };

  const skill = await prisma.skill.findFirst({
    where: {
      id,
      isActive: true
    }
  });

  try {
    await redis.set(`${skillDetail}:${id}`, JSON.stringify(company), 'EX', 600, 'NX');

  } catch (error) {
    console.error("Failed to save to Redis cache:", error);
  }

  return skill;
}

export const updateSkill = async ({ name, category }, id) => {

  const updateSkill = await prisma.$transaction(async (tx) => {
    const skillExist = await tx.skill.findUnique({
      where: {
        id
      }
    });

    if (!skillExist) {
      throw new AppError('Skill with this id does not exist', 404)
    };

    const alreadyExistName = await tx.skill.findUnique({
      where: {
        name,
        NOT: {
          id
        }
      }
    });

    if (alreadyExistName) {
      throw new AppError('Skill with this name is already exist', 409)
    };

    return skills = await tx.skill.update({
      where: {
        id
      },
      data: {
        name,
        category
      }
    })
  });

  await cacheInvalidate(skillList);
  await redis.del(`${skillDetail}:${id}`);

  return updateSkill;
}

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

export const delSkill = async (id) => {
  try {
    return await prisma.skill.update({
      where: {
        id
      },
      data: {
        isActive: false
      }
    })
  } catch (error) {
    if (error?.code === 'P2025') {
      throw new AppError("Skill is not exist", 404)
    }
  }
}