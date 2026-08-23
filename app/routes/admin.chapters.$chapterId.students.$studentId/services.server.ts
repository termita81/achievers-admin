import { prisma } from "~/db.server";
import { getLoggedUserInfoAsync } from "~/services/.server";

export async function getMentorsInChapterAsync(
  chapterId: number,
  studentId: number,
) {
  return prisma.volunteer.findMany({
    where: {
      endDate: null,
      chapterId,
      volunteerToStudentAssignement: {
        none: {
          studentId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getStudentWithMentorsAsync(studentId: number) {
  return prisma.student.findFirstOrThrow({
    where: {
      endDate: null,
      id: studentId,
    },
    select: {
      id: true,
      fullName: true,
      volunteerToStudentAssignement: {
        select: {
          volunteer: {
            select: {
              id: true,
              fullName: true,
              frequencyInDays: true,
            },
          },
        },
      },
    },
  });
}

export async function assignStudentToMentorAsync(
  request: Request,
  mentorId: number,
  studentId: number,
) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  await prisma.volunteerToStudentAssignement.create({
    data: {
      volunteerId: mentorId,
      studentId,
      assignedBy: loggedUser.oid,
    },
  });
}

export async function removeMentorStudentAssignement(
  mentorId: number,
  studentId: number,
) {
  await prisma.volunteerToStudentAssignement.delete({
    where: {
      volunteerId_studentId: {
        volunteerId: mentorId,
        studentId,
      },
    },
  });
}
