import { prisma } from "~/db.server";

export interface CategoryOrderCommand {
  id: number;
  order: number;
}

export async function getMentorResourcesAsync() {
  return await prisma.volunteerResourceCategory.findMany({
    select: {
      id: true,
      label: true,
      _count: {
        select: {
          volunteerResource: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });
}

export async function updateCategoryOrder(
  categoryOrders: CategoryOrderCommand[],
) {
  await prisma.$transaction(async (tx) => {
    const updatePromises = categoryOrders.map(({ id, order }) =>
      tx.volunteerResourceCategory.update({
        where: {
          id,
        },
        data: {
          order,
        },
      }),
    );

    await Promise.all(updatePromises);
  });
}
