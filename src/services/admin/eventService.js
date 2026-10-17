import prisma from "@/utils/prisma";
import { AppError } from "@/utils/AppError";

const ADMIN_EVENT_SORT_FIELDS = new Set([
  "id",
  "createdAt",
  "status",
  "type",
]);

const ADMIN_EVENT_SORT_ORDERS = new Set(["asc", "desc"]);

export const getEmploymentEventFilterOptions = async ({
  kind,
  page = 1,
  limit = 20,
  search = "",
}) => {
  const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const parsedLimit = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 20));
  const normalizedSearch = search.trim();
  const skip = (parsedPage - 1) * parsedLimit;

  if (kind === "companies") {
    const where = normalizedSearch
      ? { name: { contains: normalizedSearch, mode: "insensitive" } }
      : {};
    const [items, total] = await prisma.$transaction([
      prisma.company.findMany({
        where,
        skip,
        take: parsedLimit,
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.company.count({ where }),
    ]);

    return { items, pagination: { page: parsedPage, limit: parsedLimit, total, hasNextPage: skip + items.length < total } };
  }

  const where = normalizedSearch
    ? {
        user: {
          is: {
            OR: [
              { name: { contains: normalizedSearch, mode: "insensitive" } },
              { email: { contains: normalizedSearch, mode: "insensitive" } },
            ],
          },
        },
      }
    : {};
  const [profiles, total] = await prisma.$transaction([
    prisma.developerProfile.findMany({
      where,
      skip,
      take: parsedLimit,
      orderBy: { user: { name: "asc" } },
      select: {
        id: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.developerProfile.count({ where }),
  ]);

  const items = profiles.map(({ id, user }) => ({
    id,
    name: user?.name || "Unknown developer",
    email: user?.email || "",
  }));

  return { items, pagination: { page: parsedPage, limit: parsedLimit, total, hasNextPage: skip + items.length < total } };
};

export const getEmploymentEventsList = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 20,
    status,
    type,
    companyId,
    developerId,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  // Keep pagination safe even when this service is called outside the route.
  const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const parsedLimit = Math.min(
    100,
    Math.max(1, Number.parseInt(limit, 10) || 20)
  );
  const skip = (parsedPage - 1) * parsedLimit;

  // Zod route validation remains your primary input validation.
  // These allowlists also protect Prisma from unsupported sort fields.
  const safeSortBy = ADMIN_EVENT_SORT_FIELDS.has(sortBy)
    ? sortBy
    : "createdAt";

  const safeSortOrder = ADMIN_EVENT_SORT_ORDERS.has(
    String(sortOrder).toLowerCase()
  )
    ? String(sortOrder).toLowerCase()
    : "desc";

  const where = {};

  if (status) {
    where.status = String(status).toUpperCase();
  }

  if (type) {
    where.type = String(type).toUpperCase();
  }

  // Build this relation filter once so the two filters do not overwrite
  // one another.
  if (companyId || developerId) {
    where.employmentHistory = {
      is: {
        ...(companyId ? { companyId } : {}),
        ...(developerId ? { devProfileId: developerId } : {}),
      },
    };
  }

  const normalizedSearch =
    typeof search === "string" ? search.trim() : "";

  if (normalizedSearch) {
    const searchConditions = [
      {
        employmentHistory: {
          is: {
            company: {
              is: {
                name: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      },
      {
        employmentHistory: {
          is: {
            developer: {
              is: {
                user: {
                  is: {
                    name: {
                      contains: normalizedSearch,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        employmentHistory: {
          is: {
            developer: {
              is: {
                user: {
                  is: {
                    email: {
                      contains: normalizedSearch,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          },
        },
      },
    ];

    // Merge search with any existing employmentHistory constraints.
    // Relation filters must be combined using AND when both are present.
    const existingHistoryFilter = where.employmentHistory;

    delete where.employmentHistory;

    where.AND = [
      ...(existingHistoryFilter
        ? [{ employmentHistory: existingHistoryFilter }]
        : []),
      { OR: searchConditions },
    ];
  }

  const [events, total] = await prisma.$transaction([
    prisma.employementEvent.findMany({
      where,
      skip,
      take: parsedLimit,
      orderBy: [
        { [safeSortBy]: safeSortOrder },
        ...(safeSortBy === "id"
          ? []
          : [{ id: "desc" }]),
      ],
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        employmentHistory: {
          select: {
            id: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            developer: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.employementEvent.count({ where }),
  ]);

  const totalPages = Math.ceil(total / parsedLimit);

  return {
    events,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
      hasNextPage: parsedPage < totalPages,
      hasPreviousPage: parsedPage > 1 && total > 0,
    },
  };
};

export const getEmploymentEventById = async (id) => {
  const event = await prisma.employementEvent.findUnique({
    where: { id },
    include: {
      approvedBy: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      employmentHistory: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
              country: true,
              websiteUrl: true,
              isVerified: true,
            },
          },
          developer: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  isVerified: true,
                  isActive: true,
                },
              },
            },
          },
          hiredByRecruiter: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!event) {
    throw new AppError("Employment event not found", 404);
  }

  return event;
};

const EVENT_STATUSES = ["PENDING", "ACCEPTED", "REJECTED"];
const EVENT_TYPES = ["RESIGN", "TERMINATE"];

const SORT_FIELDS = new Set(["createdAt", "status", "type"]);

function parsePositiveInteger(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(String(value ?? ""), 10);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

function normalizeEnum(value, allowedValues, fieldName) {
  if (!value) return undefined;

  const normalized = String(value).toUpperCase();

  if (!allowedValues.includes(normalized)) {
    throw new AppError(`Invalid ${fieldName} filter`, 400);
  }

  return normalized;
}

function buildSearchConditions(search) {
  if (!search) return [];

  return [
    { reason: { contains: search, mode: "insensitive" } },
    {
      recruiterHistory: {
        is: {
          company: {
            is: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
      },
    },
    {
      recruiterHistory: {
        is: {
          recruiter: {
            is: {
              user: {
                is: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            },
          },
        },
      },
    },
    {
      recruiterHistory: {
        is: {
          recruiter: {
            is: {
              user: {
                is: {
                  email: { contains: search, mode: "insensitive" },
                },
              },
            },
          },
        },
      },
    },
  ];
}

export const getRecruiterEventsList = async (queryParams = {}) => {
  const {
    status,
    type,
    companyId,
    recruiterId,
    search,
  } = queryParams;

  const page = parsePositiveInteger(queryParams.page, 1);
  const limit = parsePositiveInteger(queryParams.limit, 20, 100);

  const sortBy = SORT_FIELDS.has(queryParams.sortBy)
    ? queryParams.sortBy
    : "createdAt";

  const sortOrder =
    String(queryParams.sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

  const normalizedStatus = normalizeEnum(
    status,
    EVENT_STATUSES,
    "status"
  );

  const normalizedType = normalizeEnum(type, EVENT_TYPES, "type");

  const searchTerm =
    typeof search === "string" ? search.trim().slice(0, 150) : "";

  const baseWhere = {};

  if (normalizedType) baseWhere.type = normalizedType;
  if (companyId) baseWhere.recruiterHistory = { companyId };
  if (recruiterId) {
    baseWhere.recruiterHistory = {
      ...(baseWhere.recruiterHistory || {}),
      recruiterProfileId: recruiterId,
    };
  }

  const searchConditions = buildSearchConditions(searchTerm);

  if (searchConditions.length) {
    baseWhere.AND = [{ OR: searchConditions }];
  }

  // Keep status out of the base filter so the summary shows all
  // three statuses for the current search/type/company/recruiter scope.
  const where = {
    ...baseWhere,
    ...(normalizedStatus ? { status: normalizedStatus } : {}),
  };

  const skip = (page - 1) * limit;

  const [events, total, pending, accepted, rejected] =
    await prisma.$transaction([
      prisma.recruiterEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ [sortBy]: sortOrder }, { id: "desc" }],
        select: {
          id: true,
          type: true,
          reason: true,
          letterUrl: true,
          status: true,
          approvedByRecruiterId: true,
          createdAt: true,
          recruiterHistory: {
            select: {
              id: true,
              recruiterProfileId: true,
              roleTitle: true,
              employmentType: true,
              startDate: true,
              endDate: true,
              isCurrent: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
              recruiter: {
                select: {
                  id: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.recruiterEvent.count({ where }),
      prisma.recruiterEvent.count({
        where: { ...baseWhere, status: "PENDING" },
      }),
      prisma.recruiterEvent.count({
        where: { ...baseWhere, status: "ACCEPTED" },
      }),
      prisma.recruiterEvent.count({
        where: { ...baseWhere, status: "REJECTED" },
      }),
    ]);

  const totalPages = Math.ceil(total / limit);

  console.log(total,"+++++++++");

  return {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    stats: {
      total: pending + accepted + rejected,
      pending,
      accepted,
      rejected,
    },
  };
};

export const getRecruiterEventById = async (id) => {
  const event = await prisma.recruiterEvent.findUnique({
    where: { id },
    select: {
      id: true,
      recruiterHistoryId: true,
      type: true,
      reason: true,
      letterUrl: true,
      status: true,
      approvedByRecruiterId: true,
      createdAt: true,
      approvedBy: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      recruiterHistory: {
        select: {
          id: true,
          recruiterProfileId: true,
          companyId: true,
          roleTitle: true,
          employmentType: true,
          salary: true,
          currency: true,
          description: true,
          startDate: true,
          endDate: true,
          isCurrent: true,
          isOwner: true,
          company: {
            select: {
              id: true,
              name: true,
              websiteUrl: true,
              industry: true,
              country: true,
              isVerified: true,
            },
          },
          recruiter: {
            select: {
              id: true,
              jobTitle: true,
              locationPreference: true,
              yearsOfExp: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  isVerified: true,
                  isActive: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!event) {
    throw new AppError("Recruiter event not found", 404);
  }

  return event;
};