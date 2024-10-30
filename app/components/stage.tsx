import { Draggable, Droppable } from '@hello-pangea/dnd';
import { useSearchParams, useSubmit } from '@remix-run/react';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import throttle from 'lodash.throttle'; // Import lodash throttle
import InfiniteScroll from 'react-infinite-scroll-component';

const Stage = ({ stage, totalPages }) => {
  const stageRef = useRef<HTMLElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const submit = useSubmit();
  const [projects, setProjects] = useState([...stage.project]);

  // Scroll handling with throttle for both directions

  // Memoize the projects to prevent unnecessary re-renders

  const fetchData = ()=> {
    console.log("fetchData" , stage.id)
    setPage((prev)=> prev+1)
    let nextPage = page+1
    const params = new URLSearchParams(searchParams);
    params.set('page', nextPage.toString());
    params.set('stageId', stage.id);
    setSearchParams(params);
    submit(params, { method: 'get' });
  }

  useEffect(() => {
    const temp = [...projects];
    const loadedData = [...stage.project];
  
    // Filter out duplicates by checking if the item with the same id already exists in temp
    const newItems = loadedData.filter(
      (loadedItem) => !temp.some((tempItem) => tempItem.id === loadedItem.id)
    );
  
    const appended = [...temp, ...newItems];
    setProjects(appended);
  }, [stage.project]);
 

  return (
    <Droppable droppableId={stage.id} key={stage.id}>
      {(provided) => (
        <div
          className="flex flex-col bg-gray-100 p-4 rounded-lg shadow-md w-80 min-w-[300px] h-[500px]"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center uppercase">
            {stage.name}
          </h2>

      

          <ul id={`scrollableDiv1${stage.id}`} className="space-y-4 overflow-y-auto" style={{ maxHeight: '500px', overflow: "auto" }} ref={stageRef}>
  <InfiniteScroll
    dataLength={
      projects && projects.length > 0 ? projects.length : 20
    } 
    next={fetchData}
    hasMore={true}
    scrollableTarget={`scrollableDiv1${stage.id}`}
    loader={<h4>End</h4>}
  >
   {projects.map((project, index) => (
              <Draggable key={index} draggableId={project.id} index={index}>
                {(provided) => (
                  <li
                    className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <h3 className="text-lg font-medium text-gray-800">{index+1}:{project.name}</h3>
                  </li>
                )}
              </Draggable>
            ))}
             {provided.placeholder}
  </InfiniteScroll>
  </ul>


          {/* <ul className="space-y-4 overflow-y-auto" style={{ maxHeight: '500px' }} ref={stageRef}>
            {projects.map((project, index) => (
              <Draggable key={project.id} draggableId={project.id} index={index}>
                {(provided) => (
                  <li
                    className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <h3 className="text-lg font-medium text-gray-800">{index}:{project.name}</h3>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul> */}
        </div>
      )}
    </Droppable>
  );
};

export default Stage;
