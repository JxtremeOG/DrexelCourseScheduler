// HomePage.jsx
import React, { useState } from 'react';
import Term from '../components/Term';
import {
  DndContext,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import CourseDraggedPreview from '../components/CourseDraggedPreview'; // new component
import SearchContainer from '../components/SearchContainer';
import ReactModal from "react-modal";
import { CourseDetailsContext } from '../contexts/CourseDetailsContext';
import CourseInfo from '../components/CourseInfo';
import StartSettings from '../components/StartSettings';
import { FaTrashRestore } from "react-icons/fa";
import { useDragAndDrop } from '../utils/DragHandling';
import { useEffect } from 'react';

ReactModal.setAppElement("#root");

const HomePage = () => {
  const [filteredResults, setFilteredResults] = useState([]);
  // Initialize state with terms and assign all courses to the first term
  const [terms, setTerms] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 10,},}), useSensor(KeyboardSensor));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseDetailsDisplay, setCourseDetailsDisplay] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(true);
  const [displayRemoveCourse, setDisplayRemoveCourse] = useState(false);

  const updateTerms = (termsPassed) => {  
    const updatedTerms = termsPassed.map(term => {
      const totalCredits = term.courses.reduce((sum, course) => {
        const credits = parseFloat(course.courseCredits) || 0;
        return sum + credits;
      }, 0);
      return { ...term, termCredits: totalCredits };
    });
    setTerms(updatedTerms);
  };

  const { onDragStart, onDragOver, onDragEnd, activeCourse } = useDragAndDrop({
    terms,
    setTerms,
    filteredResults,
    setFilteredResults,
    setDisplayRemoveCourse,
    updateTerms,
  });

  return (
    <DndContext
      collisionDetection={pointerWithin}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      {/* Main Layout */}
      <div className="grid grid-cols-[1fr_300px] grid-rows-[100px_calc(100%-100px)] h-full font-arial">
        <StartSettings isStartModalOpen={isStartModalOpen} setIsStartModalOpen={setIsStartModalOpen} setTerms={setTerms}/>
        <div className="col-span-2 row-start-1 bg-zinc-800 flex items-center justify-center">
          {/* Header */}
          <h1 className="text-3xl font-bold">Course Planner</h1>
          
        </div>
        <CourseDetailsContext.Provider value={{ setIsModalOpen, isModalOpen, courseDetailsDisplay, setCourseDetailsDisplay }}>
          <CourseInfo />
          <div className="col-start-1 row-start-2 bg-zinc-900 flex flex-col gap-4 items-center py-2 overflow-y-scroll scrollbar scrollbar-thumb-sky-800 scrollbar-track-zinc-700">
            {/* Terms */}
            {terms.map((term) => (
              <Term key={term.id} term={term} />
            ))}
          </div>
          <div className={`col-start-2 row-start-2 bg-zinc-900 flex flex-col items-center gap-4 py-2 px-4 
            ${displayRemoveCourse ? 'filter opacity-0 transition-filter duration-500' : 'filter opacity-100 transition-filter duration-500'}`}>
            {/* Search Results */}
            <SearchContainer filteredResults={filteredResults} setFilteredResults={setFilteredResults} displayRemoveCourse={displayRemoveCourse} />
          </div>
          <FaTrashRestore className={`pointer-events-none absolute size-48 right-14 top-1/2 ${displayRemoveCourse ? 'filter opacity-100 transition-filter duration-500' : 'filter opacity-0 transition-filter duration-500'}`}/>
        </CourseDetailsContext.Provider>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCourse ? <CourseDraggedPreview course={activeCourse} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default HomePage;
