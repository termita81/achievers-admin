import type { SessionStatus } from "~/prisma/client";
import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";

import { Prisma } from "~/prisma/client";
import { prisma } from "~/db.server";

dayjs.extend(utc);
dayjs.extend(isBetween);

interface VolunteerSession {
  volunteerSessionId: number;
  status: SessionStatus;
  attendedOn: string;
  volunteerId: number;
  sessionId: number | null;
  hasReport: number | null;
  completedOn: string | null;
  isCancelled: number | null;
  studentId: number | null;
  studentFullName: string | null;
}

interface SessionForLookup {
  volunteerSessionId: number;
  status: SessionStatus;
  attendedOn: string;
  volunteerId: number;
  sessionId: number;
  hasReport: boolean;
  completedOn: string | null;
  isCancelled: boolean;
  studentId: number;
  studentFullName: string;
}

type SessionLookup = Record<
  string,
  {
    volunteerSessionId: number;
    status: SessionStatus;
    attendedOn: string;
    volunteerId: number;
    sessions: SessionForLookup[];
  }
>;

export interface SessionViewModel {
  sessionLookup?: SessionLookup;
  id: number;
  fullName: string;
}

export async function getMentorsAsync(
  chapterId: number,
  term: Term,
  sortFullName: Prisma.SortOrder | undefined,
  searchTerm: string | null,
  status: string | null,
  termDate: string | null,
): Promise<SessionViewModel[]> {
  const mentors =
    status === null
      ? await prisma.volunteer.findMany({
          where: {
            endDate: null,
            chapterId,
            fullName: searchTerm
              ? {
                  contains: searchTerm,
                }
              : undefined,
          },
          select: {
            id: true,
            fullName: true,
          },
          orderBy: {
            fullName: sortFullName ?? "asc",
          },
        })
      : await prisma.$queryRaw<{ id: number; fullName: string }[]>`
        SELECT
          DISTINCT
          m.id,
          m.fullName
        FROM Volunteer m
        INNER JOIN VolunteerSession ms ON ms.VolunteerId = m.Id
        WHERE m.endDate IS NULL
          AND m.chapterId = ${chapterId}
          AND ${searchTerm ? Prisma.sql`m.fullName LIKE '%${searchTerm}%'` : "1=1"}
          AND ms.attendedOn ${termDate ? Prisma.sql`= ${dayjs(termDate).format("YYYY-MM-DD")}` : Prisma.sql`BETWEEN ${term.start.utc().format("YYYY-MM-DD")} AND ${term.end.utc().format("YYYY-MM-DD")}`}
          AND ms.status = ${status}
        ORDER BY m.fullName ${sortFullName ? Prisma.sql`${sortFullName}` : Prisma.sql`ASC`}
  `;

  const volunteerSessions = await prisma.$queryRaw<VolunteerSession[]>`
      SELECT
        ms.id AS volunteerSessionId,
        ms.status,
        ms.attendedOn,
        ms.volunteerId,
        sa.id AS sessionId,
        sa.hasReport,
        sa.completedOn,
        sa.isCancelled,
        ss.studentId,
        s.fullName AS studentFullName
      FROM VolunteerSession ms
      LEFT JOIN Session sa ON sa.volunteerSessionId = ms.id
      LEFT JOIN StudentSession ss ON ss.id = sa.studentSessionId
      LEFT JOIN Student s ON s.id = ss.studentId
      WHERE ms.chapterId = ${chapterId}
        AND ms.attendedOn ${termDate ? Prisma.sql`= ${dayjs(termDate).format("YYYY-MM-DD")}` : Prisma.sql`BETWEEN ${term.start.utc().format("YYYY-MM-DD")} AND ${term.end.utc().format("YYYY-MM-DD")}`}
        AND ${status ? Prisma.sql`ms.status = ${status}` : "1=1"}`;

  const volunteerSessionLookup = volunteerSessions.reduce<
    Record<string, SessionLookup>
  >((res, volunteerSession) => {
    const attendedOn = dayjs
      .utc(volunteerSession.attendedOn)
      .format("YYYY-MM-DD");

    const session: SessionForLookup = {
      volunteerSessionId: volunteerSession.volunteerSessionId,
      attendedOn: volunteerSession.attendedOn,
      status: volunteerSession.status,
      volunteerId: volunteerSession.volunteerId,
      studentId: volunteerSession.studentId!,
      sessionId: volunteerSession.sessionId!,
      hasReport: volunteerSession.hasReport === 1,
      completedOn: volunteerSession.completedOn,
      isCancelled: volunteerSession.isCancelled === 1,
      studentFullName: volunteerSession.studentFullName!,
    };

    if (res[volunteerSession.volunteerId]) {
      if (res[volunteerSession.volunteerId][attendedOn]) {
        if (session.sessionId !== null) {
          res[volunteerSession.volunteerId][attendedOn].sessions.push(session);
        }
      } else {
        res[volunteerSession.volunteerId][attendedOn] = {
          volunteerSessionId: volunteerSession.volunteerSessionId,
          attendedOn: volunteerSession.attendedOn,
          status: volunteerSession.status,
          volunteerId: volunteerSession.volunteerId,
          sessions: session.sessionId !== null ? [session] : [],
        };
      }
    } else {
      res[volunteerSession.volunteerId] = {
        [attendedOn]: {
          volunteerSessionId: volunteerSession.volunteerSessionId,
          attendedOn: volunteerSession.attendedOn,
          status: volunteerSession.status,
          volunteerId: volunteerSession.volunteerId,
          sessions: session.sessionId !== null ? [session] : [],
        },
      };
    }

    return res;
  }, {});

  return mentors.map((mentor) => {
    const session = volunteerSessionLookup[mentor.id.toString()];
    if (session === undefined) {
      return mentor;
    }

    return {
      ...mentor,
      sessionLookup: session,
    };
  });
}
