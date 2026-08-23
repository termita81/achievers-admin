import type { SessionStatus } from "~/prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";

import { prisma } from "~/db.server";

dayjs.extend(utc);
dayjs.extend(isBetween);

interface MentorSessionCommand {
  chapterId: number;
  status: string;
  mentorId: number;
  attendedOn: string;
}

interface SessionCommand {
  chapterId: number;
  studentId: number;
  mentorId: number;
  attendedOn: string;
}

export interface SessioViewModel {
  id: number;
  chapterId: number;
  attendedOn: Date;
  status: SessionStatus;
  session: {
    id: number;
    studentSession: { student: { id: number; fullName: string } };
    hasReport: boolean;
    completedOn: Date | null;
    signedOffOn: Date | null;
    isCancelled: boolean;
  }[];
  volunteer: { id: number; fullName: string };
}

export interface StudentSessioViewModel {
  id: number;
  hasReport: boolean;
  completedOn: Date | null;
  signedOffOn: Date | null;
  student: {
    id: number;
    fullName: string;
  };
  session: {
    id: number;
    chapterId: number;
    attendedOn: Date;
    volunteer: {
      id: number;
      fullName: string;
    };
  };
}

export type SessionLookup = Record<string, SessioViewModel | undefined>;

export interface SessionCommandRequest {
  action: "create" | "update" | "remove";
  sessionId: string | undefined;
  chapterId: number;
  studentId: number;
  mentorId: number;
  attendedOn: string;
}

export async function getAvailableStudentsForSessionAsync(
  chapterId: number,
  mentorId: number,
  attendedOn: string,
) {
  const attendedOnConverted = dayjs.utc(attendedOn, "YYYY-MM-DD");

  const studentsInSession = await prisma.$queryRaw<{ id: number }[]>`
    SELECT
      s.id
    FROM StudentSession ss
    INNER JOIN Session sa ON sa.StudentSessionId = ss.id
    INNER JOIN Student s ON s.id = ss.studentId
    WHERE ss.chapterId = ${chapterId}
      AND ss.attendedOn = ${attendedOnConverted}
      AND s.endDate IS NULL
    GROUP BY s.id`;

  const unavailableStudents = await prisma.studentSession.findMany({
    where: {
      chapterId,
      attendedOn: attendedOnConverted.toDate(),
      status: "UNAVAILABLE",
    },
    select: {
      student: {
        select: {
          id: true,
        },
      },
    },
  });

  const availableStudentsForSession =
    await prisma.volunteerToStudentAssignement.findMany({
      where: {
        volunteerId: mentorId,
        studentId: {
          notIn: studentsInSession
            .map(({ id }) => id)
            .concat(unavailableStudents.map(({ student }) => student.id)),
        },
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
    });

  return [
    {
      label: "Select a student",
      value: "",
    },
  ].concat(
    availableStudentsForSession.map(({ student }) => ({
      label: student.fullName,
      value: student.id.toString(),
    })),
  );
}

export async function getMentorSessionsLookupAsync(
  chapterId: number,
  mentorId: number,
  term: Term,
) {
  const myMentorSessions = await prisma.volunteerSession.findMany({
    where: {
      chapterId,
      volunteerId: mentorId,
      attendedOn: {
        gte: term.start.toDate(),
        lte: term.end.toDate(),
      },
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      status: true,
      volunteer: {
        select: {
          id: true,
          fullName: true,
        },
      },
      session: {
        select: {
          id: true,
          signedOffOn: true,
          completedOn: true,
          hasReport: true,
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
        },
      },
    },
  });

  const myPartners = await prisma.$queryRaw<{ volunteerId: number }[]>`
    SELECT
      b.volunteerId
    FROM VolunteerToStudentAssignement a
    INNER JOIN VolunteerToStudentAssignement b ON b.studentId = a.studentId
    WHERE a.volunteerId = ${mentorId}`;

  const myPartnersMentorSessions = await prisma.volunteerSession.findMany({
    where: {
      chapterId,
      volunteerId: {
        in: myPartners
          .filter((partner) => partner.volunteerId !== mentorId)
          .map(({ volunteerId }) => volunteerId),
      },
      attendedOn: {
        gte: term.start.toDate(),
        lte: term.end.toDate(),
      },
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      status: true,
      volunteer: {
        select: {
          id: true,
          fullName: true,
        },
      },
      session: {
        select: {
          id: true,
          signedOffOn: true,
          completedOn: true,
          hasReport: true,
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
        },
      },
    },
  });

  const myMentorSessionsLookup = myMentorSessions.reduce<SessionLookup>(
    (res, volunteerSession) => {
      res[dayjs.utc(volunteerSession.attendedOn).format("YYYY-MM-DD")] =
        volunteerSession;

      return res;
    },
    {},
  );

  const myPartnersSessionsLookup =
    myPartnersMentorSessions.reduce<SessionLookup>((res, volunteerSession) => {
      res[dayjs.utc(volunteerSession.attendedOn).format("YYYY-MM-DD")] =
        volunteerSession;

      return res;
    }, {});

  return {
    myMentorSessionsLookup,
    myPartnersSessionsLookup,
  };
}

export async function createMentorSession({
  chapterId,
  mentorId,
  status,
  attendedOn,
}: MentorSessionCommand) {
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
    throw new Error();
  }

  return await prisma.volunteerSession.create({
    data: {
      chapterId,
      volunteerId: mentorId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      status: status as SessionStatus,
    },
  });
}

export async function createSessionWithStudentAsync({
  chapterId,
  mentorId,
  studentId,
  attendedOn,
}: SessionCommand) {
  let volunteerSession = await prisma.volunteerSession.findUnique({
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

  if (volunteerSession !== null && volunteerSession.status !== "AVAILABLE") {
    throw new Error();
  }

  let studentSession = await prisma.studentSession.findUnique({
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
    },
  });

  if (studentSession !== null && studentSession.status !== "AVAILABLE") {
    throw new Error();
  }

  return await prisma.$transaction(async (tx) => {
    volunteerSession ??= await tx.volunteerSession.create({
      data: {
        chapterId,
        volunteerId: mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
      select: {
        id: true,
        status: true,
      },
    });

    studentSession ??= await tx.studentSession.create({
      data: {
        chapterId,
        studentId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
      select: {
        id: true,
        status: true,
      },
    });

    return await tx.session.create({
      data: {
        chapterId,
        volunteerSessionId: volunteerSession.id,
        studentSessionId: studentSession.id,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    });
  });
}

export async function takeSessionFromParterAsync(
  sessionId: number,
  mentorId: number,
) {
  const partnerStudentSession = await prisma.session.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      completedOn: true,
      studentSession: {
        select: {
          id: true,
        },
      },
    },
  });

  if (partnerStudentSession.completedOn !== null) {
    throw new Error("Report is already completed.");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.session.delete({
      where: {
        id: sessionId,
      },
    });

    let volunteerSession = await tx.volunteerSession.findUnique({
      where: {
        chapterId_volunteerId_attendedOn: {
          chapterId: partnerStudentSession.chapterId,
          volunteerId: mentorId,
          attendedOn: partnerStudentSession.attendedOn,
        },
      },
    });

    if (volunteerSession !== null) {
      return await tx.session.create({
        data: {
          chapterId: partnerStudentSession.chapterId,
          attendedOn: partnerStudentSession.attendedOn,
          volunteerSessionId: volunteerSession.id,
          studentSessionId: partnerStudentSession.studentSession.id,
        },
        select: {
          id: true,
        },
      });
    }

    volunteerSession = await tx.volunteerSession.create({
      data: {
        chapterId: partnerStudentSession.chapterId,
        volunteerId: mentorId,
        attendedOn: partnerStudentSession.attendedOn,
      },
    });

    return await tx.session.create({
      data: {
        chapterId: partnerStudentSession.chapterId,
        attendedOn: partnerStudentSession.attendedOn,
        volunteerSessionId: volunteerSession.id,
        studentSessionId: partnerStudentSession.studentSession.id,
      },
      select: {
        id: true,
      },
    });
  });
}

export async function deleteMentorSessionByIdAsync(mentorSessionId: number) {
  return await prisma.volunteerSession.delete({
    where: {
      id: mentorSessionId,
    },
  });
}

export async function confirmMentorSessionByIdAsync(mentorSessionId: number) {
  return await prisma.volunteerSession.update({
    where: {
      id: mentorSessionId,
    },
    data: {
      status: "AVAILABLE",
    },
  });
}

export async function deleteSessionByIdAsync(sessionId: number) {
  return await prisma.$transaction(async (tx) => {
    const session = await tx.session.findUniqueOrThrow({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        chapterId: true,
        attendedOn: true,
        volunteerSessionId: true,
        studentSessionId: true,
      },
    });

    await tx.session.delete({
      where: {
        id: session.id,
      },
    });

    await tx.volunteerSession.delete({
      where: {
        id: session.volunteerSessionId,
      },
    });

    const sessionsForStudentCount = await tx.session.count({
      where: {
        chapterId: session.chapterId,
        attendedOn: session.attendedOn,
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
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.volunteer.findUniqueOrThrow({
    where: {
      azureADId,
      endDate: null,
    },
    select: {
      id: true,
      chapterId: true,
    },
  });
}
