// Term.jsx
import React from 'react';
import CoursePlaced from './CoursePlaced';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

const Term = ({ term }) => {
  const { id, termName, year, termCredits, courses } = term;

  // Make this droppable represent a "term"
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { type: 'term' }, // <-- Important: identify it as a 'term'
  });

  return (
    <div
      className="min-h-36 max-h-36 w-[98%] grid grid-cols-[150px_1fr]"
      ref={setNodeRef}
    >
      <div className="bg-sky-800 col-start-1 flex flex-col text-2xl p-1 rounded-l-lg">
        <span className='flex flex-col my-auto items-center'>
          <p className='font-semibold'>{termName}</p>
          <p className='text-lg'>{year}</p>
        </span>
        { termName.includes("Pre-College") ? <p className='flex justify-end text-sm text-gray-300'></p> : 
        <p className={`flex justify-end text-sm text-gray-300 ${termCredits > 20 ? 'text-red-500' : ''}`}>{parseFloat(termCredits).toFixed(1)} / 20.0</p> }
      </div>

      <div className="bg-zinc-750 col-start-2 max-h-36 flex flex-row items-center gap-2 px-2 py-3 rounded-r-lg">
        <SortableContext
          items={courses.map((course) => course.id.toString())}
          strategy={horizontalListSortingStrategy}
        >
          {courses.map((course, index) => (
            <CoursePlaced key={course.id} course={course} index={index} termId={id} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default Term;
