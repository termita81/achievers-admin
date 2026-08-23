import type { $Enums } from "~/prisma/client";

import { prisma } from "~/db.server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface SessionCommand {
  chapterId: number;
  mentorId: number;
  studentId: number | null;
  attendedOn: string;
  status: string;
}

export async function getMentorSessionForDateAsync(
  chapterId: number,
  mentorId: number,
  attendedOn: string,
) {
  return await prisma.volunteerSession.findUnique({
    where: {
      chapterId_volunteerId_attendedOn: {
        chapterId,
        volunteerId: mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
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

export async function getMentorByIdAsync(mentorId: number) {
  return await prisma.volunteer.findFirstOrThrow({
    where: {
      id: mentorId,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getStudentsForMentorAsync(
  chapterId: number,
  mentorId: number,
  attendedOn: string,
) {
  const allStudents = await prisma.$queryRaw<
    { id: number; fullName: string }[]
  >`
    SELECT id, fullName
    FROM Student
    WHERE chapterId = ${chapterId} AND endDate IS NULL
      AND id NOT IN (SELECT studentId FROM VolunteerToStudentAssignement WHERE volunteerId = ${mentorId})
    ORDER BY fullName ASC`;

  const assignedStudents = await prisma.volunteerToStudentAssignement.findMany({
    where: {
      volunteerId: mentorId,
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
      student: {
        fullName: "asc",
      },
    },
  });

  const unavailableStudents = await prisma.studentSession.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      status: "UNAVAILABLE",
    },
    select: {
      studentId: true,
    },
  });

  const unavailableStudentsLookup = unavailableStudents.reduce<
    Record<string, boolean>
  >((res, { studentId }) => {
    res[studentId.toString()] = true;

    return res;
  }, {});

  return assignedStudents
    .map(({ student: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allStudents)
    .map(({ id, fullName }) => {
      const isUnavailable = unavailableStudentsLookup[id] ?? false;

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

  if (studentId === null) {
    return await prisma.volunteerSession.create({
      data: {
        chapterId,
        volunteerId: mentorId,
        attendedOn: attendedOnConverted,
        status: status as $Enums.SessionStatus,
      },
      select: {
        id: true,
      },
    });
  }

  const studenSession = await prisma.studentSession.findUnique({
    where: {
      chapterId_studentId_attendedOn: {
        chapterId,
        studentId,
        attendedOn: attendedOnConverted,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (studenSession !== null) {
    if (studenSession.status !== "AVAILABLE") {
      throw new Error(`Student with id: ${studentId} is not available.`);
    }

    return await prisma.volunteerSession.create({
      data: {
        chapterId,
        volunteerId: mentorId,
        attendedOn: attendedOnConverted,
        status: status as $Enums.SessionStatus,
        session: {
          create: {
            chapterId,
            attendedOn: attendedOnConverted,
            studentSessionId: studenSession.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  return await prisma.$transaction(async (tx) => {
    const studenSession = await tx.studentSession.create({
      data: {
        chapterId,
        studentId,
        attendedOn: attendedOnConverted,
      },
    });

    return await tx.volunteerSession.create({
      data: {
        chapterId,
        volunteerId: mentorId,
        attendedOn: attendedOnConverted,
        status: status as $Enums.SessionStatus,
        session: {
          create: {
            chapterId,
            attendedOn: attendedOnConverted,
            studentSessionId: studenSession.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
  });
}
