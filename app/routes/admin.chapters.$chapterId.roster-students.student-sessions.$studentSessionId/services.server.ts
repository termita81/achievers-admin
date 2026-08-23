import type { $Enums } from "~/prisma/client";

import { prisma } from "~/db.server";

export interface SessionCommandCreate {
  studentSessionId: number;
  mentorId: number;
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

export async function getStudentSessionByIdAsync(studentSessionId: number) {
  return await prisma.studentSession.findUniqueOrThrow({
    where: {
      id: studentSessionId,
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      status: true,
      reason: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
      session: {
        select: {
          id: true,
          hasReport: true,
          completedOn: true,
          signedOffOn: true,
          isCancelled: true,
          volunteerSession: {
            select: {
              id: true,
              volunteer: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getMentorsForStudentAsync(
  chapterId: number,
  studentId: number,
  attendedOn: Date,
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
      attendedOn,
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

export async function restoreAvailabilityAsync(
  studentSessionId: number,
  status: string,
) {
  const sessionCount = await prisma.session.count({
    where: {
      studentSessionId,
    },
  });

  if (sessionCount > 0) {
    return await prisma.studentSession.update({
      where: {
        id: studentSessionId,
      },
      data: {
        status: status as $Enums.SessionStatus,
      },
      select: {
        id: true,
        studentId: true,
        attendedOn: true,
      },
    });
  }

  return await prisma.studentSession.delete({
    where: {
      id: studentSessionId,
    },
    select: {
      id: true,
      studentId: true,
      attendedOn: true,
    },
  });
}

export async function addMentorToSessionAsync({
  studentSessionId,
  mentorId,
}: SessionCommandCreate) {
  return await prisma.$transaction(async (tx) => {
    const studentSession = await tx.studentSession.findUniqueOrThrow({
      where: {
        id: studentSessionId,
      },
      select: {
        id: true,
        chapterId: true,
        attendedOn: true,
      },
    });

    let volunteerSession = await tx.volunteerSession.findUnique({
      where: {
        chapterId_volunteerId_attendedOn: {
          chapterId: studentSession.chapterId,
          attendedOn: studentSession.attendedOn,
          volunteerId: mentorId,
        },
      },
      select: {
        id: true,
      },
    });

    volunteerSession ??= await tx.volunteerSession.create({
      data: {
        chapterId: studentSession.chapterId,
        attendedOn: studentSession.attendedOn,
        volunteerId: mentorId,
      },
      select: {
        id: true,
      },
    });

    return await tx.session.create({
      data: {
        chapterId: studentSession.chapterId,
        attendedOn: studentSession.attendedOn,
        volunteerSessionId: volunteerSession.id,
        studentSessionId: studentSession.id,
      },
    });
  });
}

export async function removeSessionAsync(sessionId: number) {
  const session = await prisma.session.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      volunteerSessionId: true,
      studentSessionId: true,
      isCancelled: true,
      studentSession: {
        select: {
          studentId: true,
        },
      },
    },
  });

  if (session.isCancelled) {
    throw new Error();
  }

  await prisma.$transaction(async (tx) => {
    await tx.session.delete({
      where: {
        id: session.id,
      },
    });

    const sessionsForMentorCount = await tx.session.count({
      where: {
        volunteerSessionId: session.volunteerSessionId,
      },
    });

    if (sessionsForMentorCount === 0) {
      await tx.volunteerSession.delete({
        where: {
          id: session.volunteerSessionId,
        },
      });
    }

    const sessionsForStudentCount = await tx.session.count({
      where: {
        studentSessionId: session.studentSessionId,
      },
    });

    if (sessionsForStudentCount === 0) {
      await tx.studentSession.delete({
        where: {
          id: session.studentSessionId,
        },
      });
    }
  });

  return session;
}
