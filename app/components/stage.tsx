import { Draggable, Droppable } from '@hello-pangea/dnd';
import { useSearchParams, useSubmit } from '@remix-run/react';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import throttle from 'lodash.throttle'; // Import lodash throttle

const Stage = ({ stage, totalPages }) => {
  const stageRef = useRef<HTMLElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const submit = useSubmit();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([...stage.project]);

  // Fetch projects when page changes
  useEffect(() => {
    if (page >= 0 && page < totalPages) {
      setLoading(true);
      // Append projects for downward scroll or prepend for upward scroll
      setProjects((prev) =>
        page > 0 && stage.project.length ? [...prev, ...stage.project] : [...stage.project, ...prev]
      );
      setLoading(false);
    }
  }, [page, stage.project]);

  // Scroll handling with throttle for both directions
  useEffect(() => {
    const handleScroll = () => {
      if (stageRef.current && !loading) {
        const { scrollTop, scrollHeight, clientHeight } = stageRef.current;

        // Detect downward scrolling and fetch new projects
        if (scrollTop + clientHeight >= scrollHeight - 7 && page < totalPages - 1) {
          setLoading(true);
          const nextPage = page + 1;
          setPage(nextPage);

          const params = new URLSearchParams(searchParams);
          params.set('page', nextPage.toString());
          params.set('stageId', stage.id);
          setSearchParams(params);
          submit(params, { method: 'get', replace: true });

          setLoading(false);
        }

        // Detect upward scrolling and fetch previous projects
        if (scrollTop <= 7 && page > 0) {
          setLoading(true);
          const prevPage = page - 1;
          setPage(prevPage);

          const params = new URLSearchParams(searchParams);
          params.set('page', prevPage.toString());
          params.set('stageId', stage.id);
          setSearchParams(params);
          submit(params, { method: 'get', replace: true });

          setLoading(false);
        }
      }
    };

    // Throttle the scroll event
    const throttledHandleScroll = throttle(handleScroll, 200);

    if (stageRef.current) {
      stageRef.current.addEventListener('scroll', throttledHandleScroll);
    }

    return () => {
      if (stageRef.current) {
        stageRef.current.removeEventListener('scroll', throttledHandleScroll);
      }
    };
  }, [stageRef, page, searchParams, setSearchParams, submit, loading, stage.id, totalPages]);

  // Memoize the projects to prevent unnecessary re-renders
  const memoizedProjects = useMemo(() => projects, [projects]);

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
            {memoizedProjects.map((project, index) => (
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
