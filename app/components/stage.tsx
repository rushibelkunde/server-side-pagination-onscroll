import { Draggable, Droppable } from '@hello-pangea/dnd';
import { useSearchParams } from '@remix-run/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useRef, useState, useEffect } from 'react';

const Stage = ({ stage }) => {
  const stageRef = useRef<HTMLElement>(null);

  const [searchParams, setSearchParams] = useSearchParams()


    useEffect(()=> {

      if(stageRef.current){
        stageRef.current.addEventListener("scroll", (e)=> {
          console.log("scrolling")
          const params = new URLSearchParams()
          params.append("page", "1")
          setSearchParams(params)
        })
      }

      return ()=> {

      }
 }, [])


  return (
    <Droppable droppableId={stage.id} key={stage.id} >
      {(provided) => (
        <div
          className="flex flex-col bg-gray-100 p-4 rounded-lg shadow-md w-80 min-w-[300px] h-[500px]"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {/* Stage title */}
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center uppercase">
            {stage.name}
          </h2>

          {/* Scrollable list of projects */}
          <ul className="space-y-4 overflow-y-auto" style={{ maxHeight: '500px' }}  ref={stageRef}>
           

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
  );
};

export default Stage;
