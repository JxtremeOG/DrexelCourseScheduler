import React, { useContext } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CourseDetailsContext } from '../contexts/CourseDetailsContext';

const SearchedCourse = ({ course }) => {
    const { shortName, fullName, courseCredits } = course;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: course.id, // Use the existing unique id
        data: { type: 'courseSearched' }, // Consistent type
    });

    const { setIsModalOpen, setCourseDetailsDisplay } = useContext(CourseDetailsContext);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-zinc-800 w-full min-h-24 p-1 flex flex-col rounded-md cursor-move shadow-md"
            role="option"
            aria-selected={isDragging}
            aria-label={`Course: ${shortName}`}
            tabIndex={0}
            onClick = {() => { setIsModalOpen(true); setCourseDetailsDisplay(course); } }
        >
            <p className="font-semibold text-sky-500">{shortName}</p>
            <p className="max-w-[10.5rem] text-sm text-ellipsis overflow-hidden">{fullName}</p>
            <p className="mt-auto text-sm">{courseCredits} Credits</p>
        </div>
    );
};

export default SearchedCourse;
