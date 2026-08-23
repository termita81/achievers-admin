import type { Prisma } from "~/prisma/client";

import { prisma } from "~/db.server";

export async function getMentorsCountAsync(
  chapterId: number,
  searchTerm: string | null,
) {
  return prisma.volunteer.count({
    where: {
      endDate: null,
      chapterId,
      OR: getOR(searchTerm),
    },
  });
}

export async function getMentorsWithStudentsAsync(
  chapterId: number,
  searchTerm: string | null,
  pageNumber: number,
  sortFullName: Prisma.SortOrder | undefined,
  sortCountStudents: Prisma.SortOrder | undefined,
  numberItems = 10,
) {
  return prisma.volunteer.findMany({
    where: {
      endDate: null,
      chapterId,
      OR: getOR(searchTerm),
    },
    select: {
      id: true,
      fullName: true,
      frequencyInDays: true,
      volunteerToStudentAssignement: {
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: {
      fullName: sortCountStudents ? undefined : (sortFullName ?? "asc"),
      volunteerToStudentAssignement: sortCountStudents
        ? {
            _count: sortCountStudents,
          }
        : undefined,
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

function getOR(searchTerm: string | null) {
  return searchTerm
    ? [
        {
          fullName: {
            contains: searchTerm,
          },
        },
      ]
    : undefined;
}
