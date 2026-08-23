import type { Term } from "~/models";

import { prisma } from "~/db.server";

export async function getUserAsync(azureADId: string) {
  return await prisma.volunteer.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      chapterId: true,
    },
  });
}

export async function getStudentsAsync(
  chapterId: number,
  loggedUserId: number,
  selectedVolunteerId: number | undefined,
) {
  const assignedStudents = await prisma.volunteerToStudentAssignement.findMany({
    where: {
      volunteerId: loggedUserId,
      student: {
        endDate: null,
      },
    },
    select: {
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      volunteer: {
        fullName: "asc",
      },
    },
  });

  if (selectedVolunteerId !== undefined) {
    const assignedStudentsLookup = assignedStudents.reduce<
      Record<string, boolean>
    >((res, value) => {
      res[value.student.id] = true;

      return res;
    }, {});

    const students = await prisma.$queryRaw<{ id: number; fullName: string }[]>`
      SELECT 
        s.id, s.fullName
      FROM Session sa
      INNER JOIN VolunteerSession vs ON vs.id = sa.volunteerSessionId
      INNER JOIN StudentSession ss ON ss.id = sa.studentSessionId
      INNER JOIN Student s ON s.id = ss.studentId
      WHERE sa.chapterId = ${chapterId} AND vs.volunteerId = ${selectedVolunteerId} AND completedOn IS NOT NULL
      GROUP BY s.id, s.fullName
      ORDER BY s.fullName ASC`;

    return students.map(({ id, fullName }) => ({
      id,
      fullName: assignedStudentsLookup[id.toString()]
        ? `** ${fullName} (Assigned) **`
        : fullName,
    }));
  }

  const allStudents = await prisma.student.findMany({
    where: {
      chapterId,
      endDate: null,
      id: {
        notIn: assignedStudents.map(({ student: { id } }) => id),
      },
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return assignedStudents
    .map(({ student: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allStudents);
}

export async function getMentorsAsync(
  chapterId: number,
  loggedUserId: number,
  selectedStudentId: number | undefined,
) {
  const myStudents = await prisma.volunteerToStudentAssignement.findMany({
    where: {
      volunteerId: loggedUserId,
      student: {
        endDate: null,
      },
    },
    select: {
      studentId: true,
    },
  });

  const myPartners = await prisma.volunteerToStudentAssignement.findMany({
    distinct: "volunteerId",
    where: {
      volunteer: {
        endDate: null,
      },
      studentId: {
        in: myStudents.map(({ studentId }) => studentId),
      },
    },
    select: {
      volunteer: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      volunteer: {
        fullName: "asc",
      },
    },
  });

  if (selectedStudentId !== undefined) {
    const myPartnersLookup = myPartners.reduce<Record<string, boolean>>(
      (res, value) => {
        res[value.volunteer.id] = true;

        return res;
      },
      {},
    );

    const mentors = await prisma.$queryRaw<{ id: number; fullName: string }[]>`
      SELECT 
        u.id, u.fullName
      FROM Session sa
      INNER JOIN VolunteerSession vs ON vs.id = sa.volunteerSessionId
      INNER JOIN StudentSession ss ON ss.id = sa.studentSessionId
      INNER JOIN Volunteer u ON u.id = vs.volunteerId
      WHERE sa.chapterId = ${chapterId} AND ss.studentId = ${selectedStudentId} AND completedOn IS NOT NULL
      GROUP BY u.id, u.fullName
      ORDER BY u.fullName ASC`;

    return mentors.map(({ id, fullName }) => ({
      id,
      fullName:
        id === loggedUserId
          ? `** ${fullName} (Me) **`
          : myPartnersLookup[id.toString()]
            ? `** ${fullName} (Partner) **`
            : fullName,
    }));
  }

  const allMentors = await prisma.volunteer.findMany({
    where: {
      chapterId,
      endDate: null,
      id: {
        notIn: myPartners.map(({ volunteer: { id } }) => id),
      },
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return myPartners
    .map(({ volunteer: { id, fullName } }) => ({
      id,
      fullName:
        id === loggedUserId
          ? `** ${fullName} (Me) **`
          : `** ${fullName} (Partner) **`,
    }))
    .concat(allMentors);
}

export async function getCountAsync(
  chapterId: number,
  selectedTerm: Term,
  studentId: number | undefined,
  mentorId: number | undefined,
) {
  return await prisma.session.count({
    where: whereClause(chapterId, selectedTerm, studentId, mentorId),
  });
}

export async function getSessionsAsync(
  chapterId: number,
  selectedTerm: Term,
  studentId: number | undefined,
  mentorId: number | undefined,
  pageNumber: number,
  numberItems = 10,
) {
  const sessions = await prisma.session.findMany({
    where: whereClause(chapterId, selectedTerm, studentId, mentorId),
    select: {
      id: true,
      attendedOn: true,
      completedOn: true,
      signedOffOn: true,
      isCancelled: true,
      studentSession: {
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      volunteerSession: {
        select: {
          volunteer: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: {
      attendedOn: "desc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });

  return sessions;
}

function whereClause(
  chapterId: number,
  term: Term,
  studentId: number | undefined,
  mentorId: number | undefined,
) {
  return {
    chapterId,
    completedOn: {
      not: null,
    },
    volunteerSession: {
      volunteerId: mentorId,
    },
    studentSession: {
      studentId,
    },
    attendedOn: {
      gte: term.start.toDate(),
      lte: term.end.toDate(),
    },
  };
}
