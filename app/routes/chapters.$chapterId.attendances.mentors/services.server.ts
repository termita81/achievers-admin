import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { prisma } from "~/db.server";
import { isStringNullOrEmpty } from "~/services";

dayjs.extend(utc);

export interface Attendance {
  id: number;
  volunteer: {
    id: number;
    fullName: string;
  };
}

export async function getMentorsForSession(
  chapterId: number,
  searchTerm: string | null,
) {
  return await prisma.volunteer.findMany({
    where: {
      endDate: null,
      chapterId,
      fullName: isStringNullOrEmpty(searchTerm)
        ? undefined
        : {
            contains: searchTerm.trim(),
          },
    },
    orderBy: {
      fullName: "asc",
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getMentorAttendancesLookup(
  chapterId: number,
  sessionDate: string,
) {
  const attendaces = await prisma.volunteerAttendance.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(sessionDate, "YYYY-MM-DD").toDate(),
    },
    select: {
      id: true,
      volunteer: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return attendaces.reduce<Record<number, Attendance>>((result, attendace) => {
    result[attendace.volunteer.id] = attendace;

    return result;
  }, {});
}

export async function attendSession(
  chapterId: number,
  mentorId: number,
  attendedOn: string,
) {
  return await prisma.volunteerAttendance.create({
    data: {
      chapterId,
      volunteerId: mentorId,
      attendedOn,
    },
  });
}

export async function removeAttendace(attendanceId: number) {
  return await prisma.volunteerAttendance.delete({
    where: {
      id: attendanceId,
    },
  });
}
