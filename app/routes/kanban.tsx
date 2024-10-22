import React, { Suspense } from 'react'
import { json, useLoaderData, useSubmit } from '@remix-run/react'
import { PrismaClient } from '@prisma/client'
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import { ActionFunction, LoaderFunction } from '@remix-run/node'
import { useVirtualizer } from '@tanstack/react-virtual'
import Stage from '~/components/stage'

const prisma = new PrismaClient()

export const loader : LoaderFunction= async ({request, params}) => {
  // Fetch stages with associated projects

  const limit = 10

  const searchParams = new URL(request.url).searchParams
  const page = parseInt(searchParams.get("page") as string) || 0
  const stages = await prisma.stage.findMany({
   
    include: {
      project: {
        skip: limit * page,
        take: limit
      }
    },
    orderBy: {
      order: 'asc', // Sort stages by the order field
    },
  })

  return json({ stages })
}

export const action : ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const projectId = formData.get('projectId') as string
  const newStageId = formData.get('newStageId') as string

  // Update the project's stage in the database
  if(projectId && newStageId){
    await prisma.project.update({
      where: { id: projectId },
      data: { stageId: newStageId },
    })
  }
 

  return json({ success: true })
}


const Kanban = () => {
  const { stages } = useLoaderData<typeof loader>()
  const submit = useSubmit()





  // Handle the drag end event
  const handleOnDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result

    // If there's no destination (dropped outside), do nothing
    if (!destination) return

    // If the source and destination are the same, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    // Submit to the action with projectId (draggableId) and the new stageId (destination.droppableId)
    submit(
      { projectId: draggableId, newStageId: destination.droppableId },
      { method: 'post' }
    )
  }

  return (
    // <Suspense>
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6 overflow-x-auto" style={{ height: '600px' }}> {/* Fixed height */}
          {stages.map((stage) => (
            <Stage key={stage.id} stage={stage}/>
          ))}
        </div>
      </div>
    </DragDropContext>
    // </Suspense>
  )
}

export default Kanban