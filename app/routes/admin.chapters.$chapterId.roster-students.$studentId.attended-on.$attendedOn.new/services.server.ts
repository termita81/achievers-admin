import type { $Enums, SessionStatus } from "~/prisma/client";

import { prisma } from "~/db.server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface SessionCommand {
  chapterId: number;
  mentorId: number | null;
  studentId: number;
  attendedOn: string;
  status: string;
}

export interface SessionForDate {
  mentorId: number;
  status: SessionStatus;
  studentSession: {
    sessionId: number;
  }[];
}

export async function getStudentSessionByDateAsync(
  chapterId: number,
  studentId: number,
  attendedOn: string,
) {
  return await prisma.studentSession.findUnique({
    where: {
      chapterId_studentId_attendedOn: {
        chapterId,
        studentId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
      status: true,
      session: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function getChapterByIdAsync(id: number) {
  return await prisma.chapter.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getStudentByIdAsync(studentId: number) {
  return await prisma.student.findFirstOrThrow({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getMentorsForStudentAsync(
  chapterId: number,
  studentId: number,
  attendedOn: string,
) {
  const allMentors = await prisma.$queryRaw<{ id: number; fullName: string }[]>`
    SELECT id, fullName
    FROM Volunteer
    WHERE chapterId = ${chapterId} AND endDate IS NULL
      AND id NOT IN (SELECT volunteerId FROM VolunteerToStudentAssignement WHERE studentId = ${studentId})
    ORDER BY fullName ASC`;

  const assignedMentors = await prisma.volunteerToStudentAssignement.findMany({
    where: {
      studentId,
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

  const unavailableMentors = await prisma.volunteerSession.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      status: "UNAVAILABLE",
    },
    select: {
      volunteerId: true,
    },
  });

  const unavailableMentorsLookup = unavailableMentors.reduce<
    Record<string, boolean>
  >((res, { volunteerId }) => {
    res[volunteerId.toString()] = true;

    return res;
  }, {});

  return assignedMentors
    .map(({ volunteer: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allMentors)
    .map(({ id, fullName }) => {
      const isUnavailable = unavailableMentorsLookup[id] ?? false;

      return {
        label: fullName + (isUnavailable ? " (Unavailable)" : ""),
        value: id.toString(),
        isDisabled: isUnavailable,
      };
    });
}

export async function createSessionAsync({
  chapterId,
  mentorId,
  studentId,
  attendedOn,
  status,
}: SessionCommand) {
  const attendedOnConverted = dayjs.utc(attendedOn, "YYYY-MM-DD").toDate();

  if (mentorId === null) {
    return await prisma.studentSession.create({
      data: {
        chapterId,
        studentId,
        attendedOn: attendedOnConverted,
        status: status as $Enums.SessionStatus,
      },
      select: {
        id: true,
      },
    });
  }

  const volunteerSession = await prisma.volunteerSession.findUnique({
    where: {
      chapterId_volunteerId_attendedOn: {
        chapterId,
        volunteerId: mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (volunteerSession !== null) {
    if (volunteerSession.status !== "AVAILABLE") {
      throw new Error(`Mentor with id: ${mentorId} is not available.`);
    }

    return await prisma.studentSession.create({
      data: {
        chapterId,
        studentId,
        attendedOn: attendedOnConverted,
        status: status as $Enums.SessionStatus,
        session: {
          create: {
            chapterId,
            attendedOn: attendedOnConverted,
            volunteerSessionId: volunteerSession.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  return await prisma.$transaction(async (tx) => {
    const volunteerSession = await tx.volunteerSession.create({
      data: {
        chapterId,
        volunteerId: mentorId,
        attendedOn: attendedOnConverted,
      },
    });

    return await tx.studentSession.create({
      data: {
        chapterId,
        studentId,
        attendedOn: attendedOnConverted,
        status: status as $Enums.SessionStatus,
        session: {
          create: {
            chapterId,
            attendedOn: attendedOnConverted,
            volunteerSessionId: volunteerSession.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
  });
}
