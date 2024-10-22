import React from 'react'
import { json, useLoaderData, useSubmit } from '@remix-run/react'
import { PrismaClient } from '@prisma/client'
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import { ActionFunction } from '@remix-run/node'

const prisma = new PrismaClient()

export const loader = async () => {
  // Fetch stages with associated projects
  const stages = await prisma.stage.findMany({
    include: {
      project: true, // Include projects inside each stage
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
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6 overflow-x-auto" style={{ height: '600px' }}> {/* Fixed height */}
          {stages.map((stage) => (
            <Droppable droppableId={stage.id} key={stage.id}>
              {(provided) => (
                <div
                  className="flex flex-col bg-gray-100 p-4 rounded-lg shadow-md w-80 min-w-[300px] h-[500px]"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {/* Stage title */}
                  <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center uppercase">{stage.name}</h2>

                  {/* Scrollable list of projects */}
                  <ul className="space-y-4 overflow-y-auto" style={{ maxHeight: '500px' }}> {/* Scrollable */}
                    {stage.project.map((project, index) => (
                      <Draggable key={project.id} draggableId={project.id} index={index}>
                        {(provided) => (
                          <li
                            className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:bg-gray-50 cursor-pointer"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <h3 className="text-lg font-medium text-gray-800">{project.name}</h3>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </DragDropContext>
  )
}

export default Kanban
