import React from 'react';
import { json, useLoaderData, useSubmit } from '@remix-run/react';

import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ActionFunction, LoaderFunction } from '@remix-run/node';
import Stage from '~/components/stage';
import { db } from '~/services/db.server';

export const loader: LoaderFunction = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const page = parseInt(searchParams.get("page") as string) || 0;
  const stageId = searchParams.get("stageId");

  const limit = 6; // Number of projects per page

  // Fetch stages with paginated projects
  const stages = await db.stage.findMany({
    include: {
      project: {
        skip: limit * page,
        take: limit,
        where: stageId ? { stageId: stageId } : {},
      },
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Get the total page count for each stage
  const pageCounts = await Promise.all(
    stages.map(async (stage) => {
      const totalProjects = await db.project.count({
        where: { stageId: stage.id },
      });
      const totalPages = Math.ceil(totalProjects / limit);
      return { stageId: stage.id, totalPages };
    })
  );

  // Convert the array into an object for easier access by stageId
  const pageCountsObject = pageCounts.reduce((acc, { stageId, totalPages }) => {
    acc[stageId] = { totalPages };
    return acc;
  }, {});

  console.log("pageCountsObject", pageCountsObject); // Debugging log

  return json({ stages, pageCounts: pageCountsObject });
};


export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const projectId = formData.get('projectId') as string;
  const newStageId = formData.get('newStageId') as string;

  if (projectId && newStageId) {
    await db.project.update({
      where: { id: projectId },
      data: { stageId: newStageId },
    });
  }

  return json({ success: true });
};

const Kanban = () => {
  const { stages, pageCounts } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleOnDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    submit(
      { projectId: draggableId, newStageId: destination.droppableId },
      { method: 'post' }
    );
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6 overflow-x-auto" style={{ height: '600px' }}>
          {stages.map((stage) => (
            <Stage key={stage.id} stage={stage} totalPages={pageCounts[stage.id].totalPages} />
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default Kanban;
