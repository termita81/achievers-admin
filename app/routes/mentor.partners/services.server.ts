import { prisma } from "~/db.server";

export async function getPartnersAync(azureADId: string) {
  const volunteer = await prisma.volunteer.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      volunteerSharedTo: {
        select: {
          volunteerSharingId: true,
          volunteerSharedToId: true,
        },
      },
      volunteerSharing: {
        select: {
          volunteerSharingId: true,
          volunteerSharedToId: true,
        },
      },
    },
  });

  const volunteerShareToLookup = volunteer.volunteerSharedTo.reduce<
    Record<string, boolean>
  >((res, { volunteerSharingId }) => {
    res[volunteerSharingId.toString()] = true;
    return res;
  }, {});

  const sharingVolunteerInfoWithLookup = volunteer.volunteerSharing.reduce<
    Record<string, boolean>
  >((res, { volunteerSharedToId }) => {
    res[volunteerSharedToId.toString()] = true;
    return res;
  }, {});

  const studentAssignements =
    await prisma.volunteerToStudentAssignement.findMany({
      where: {
        volunteerId: volunteer.id,
      },
      select: {
        studentId: true,
      },
    });

  const partners = await prisma.volunteerToStudentAssignement.findMany({
    distinct: "volunteerId",
    where: {
      studentId: {
        in: studentAssignements.map(({ studentId }) => studentId),
      },
    },
    select: {
      volunteer: {
        select: {
          id: true,
          fullName: true,
          mobile: true,
          email: true,
        },
      },
    },
  });

  return partners
    .filter(({ volunteer: { id } }) => volunteer.id !== id)
    .map((partner) => {
      const isSharingWithVolunteer =
        volunteerShareToLookup[partner.volunteer.id.toString()];
      const isInfoShared =
        sharingVolunteerInfoWithLookup[partner.volunteer.id.toString()];

      return {
        ...partner.volunteer,
        isInfoShared,
        email: isSharingWithVolunteer ? partner.volunteer.email : null,
        mobile: isSharingWithVolunteer ? partner.volunteer.mobile : null,
      };
    });
}

export async function shareInfoWithPartner(
  volunteerAzureId: string,
  volunteerSharedToId: number,
) {
  const volunteer = await prisma.volunteer.findUniqueOrThrow({
    where: {
      azureADId: volunteerAzureId,
    },
    select: {
      id: true,
    },
  });

  return await prisma.volunteerShareInfo.create({
    data: {
      volunteerSharingId: volunteer.id,
      volunteerSharedToId,
    },
  });
}

export async function removeShareInfo(
  volunteerAzureId: string,
  volunteerSharedToId: number,
) {
  const volunteer = await prisma.volunteer.findUniqueOrThrow({
    where: {
      azureADId: volunteerAzureId,
    },
    select: {
      id: true,
    },
  });

  return await prisma.volunteerShareInfo.delete({
    where: {
      volunteerSharingId_volunteerSharedToId: {
        volunteerSharingId: volunteer.id,
        volunteerSharedToId,
      },
    },
  });
}
