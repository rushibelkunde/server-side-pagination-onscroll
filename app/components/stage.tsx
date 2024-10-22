import { Draggable, Droppable } from '@hello-pangea/dnd';
import { useSearchParams, useSubmit } from '@remix-run/react';
import React, { useRef, useState, useEffect } from 'react';

const Stage = ({ stage, totalPages }) => {
  const stageRef = useRef<HTMLElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const submit = useSubmit();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([...stage.project])

  useEffect(()=> {
    setProjects((prev)=> ([...prev, stage.project]))

  },[page])

  useEffect(() => {
    const handleScroll = () => {
      if (stageRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = stageRef.current;
        console.log(scrollTop, scrollHeight, clientHeight)
        if (scrollTop + clientHeight >= scrollHeight - 7 && !loading) {
          setLoading(true);

          // Increase the page number
          const newPage = page + 1;
          console.log(stage) 
          if(totalPages > page+1){
            
            setPage(newPage);
            const params = new URLSearchParams(searchParams);
            params.set('page', newPage.toString());
            params.set('stageId', stage.id);
            setSearchParams(params);
  
            // Trigger submit to refetch data with new page
            submit(params, { method: 'get', replace: true });
          }
         

          // Set searchParams to include the page and stageId
         

          setLoading(false);
        }
      }
    };

    if (stageRef.current) {
      stageRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (stageRef.current) {
        stageRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [stageRef, page, searchParams, setSearchParams, submit, loading, stage.id]);

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

          <ul className="space-y-4 overflow-y-auto" style={{ maxHeight: '500px' }} ref={stageRef}>
            {projects.map((project, index) => (
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
