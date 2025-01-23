// CoursePlaced.jsx
import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { CourseDetailsContext } from '../contexts/CourseDetailsContext';
import { useContext } from 'react';

const CoursePlaced = ({ course }) => {
  const { shortName, fullName, courseCredits } = course;
  // Make this sortable represent a "course"
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: course.id.toString(),
    data: { type: 'course' }, // <-- Important: identify it as a 'course'
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { setIsModalOpen, setCourseDetailsDisplay } = useContext(CourseDetailsContext);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-zinc-800 h-full min-w-0 max-w-40 flex flex-col flex-1 p-2 rounded-md cursor-move shadow-md border-yellow-500"
      onClick = {() => { setIsModalOpen(true); setCourseDetailsDisplay(course); } }
    >
      <p className="font-semibold text-sky-500">{shortName}</p>
      <p className='text-sm text-ellipsis overflow-hidden'>{fullName}</p>
      <p className='mt-auto text-sm'>{courseCredits} Credits</p>
    </div>
  );
};

export default CoursePlaced;
