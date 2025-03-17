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
import { sendTermsToBackend } from '../services/apiService';
import { sendCourseUpdateToBackend } from '../services/apiService';
import SaveScheduleButton from '../components/SaveScheduleButton';

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

  const updateTerms = async (termsPassed, coursesPassed = "Nothing") => {  
    if (Array.isArray(coursesPassed)) {
      for (let i = 0; i < coursesPassed.length; i++) {
        for (let j = 0; j < termsPassed.length; j++) {
          for (let k = 0; k < termsPassed[j].courses.length; k++) {
            if (coursesPassed[i].id === termsPassed[j].courses[k].id) {
              termsPassed[j].courses[k].id = coursesPassed[i].id;
              termsPassed[j].courses[k].shortName = coursesPassed[i].shortName;
              termsPassed[j].courses[k].fullName = coursesPassed[i].fullName;
              termsPassed[j].courses[k].courseCredits = coursesPassed[i].credits;
              termsPassed[j].courses[k].courseDepartment = coursesPassed[i].department;
              termsPassed[j].courses[k].courseDesc = coursesPassed[i].description;
              termsPassed[j].courses[k].offered = coursesPassed[i].offeredTerms;
              termsPassed[j].courses[k].prereqs = coursesPassed[i].prerequisites;
              termsPassed[j].courses[k].coreqs = coursesPassed[i].corequisites;
              termsPassed[j].courses[k].repeatStatus = coursesPassed[i].repeatStatus;
              termsPassed[j].courses[k].restrictions = coursesPassed[i].restrictions;
              termsPassed[j].courses[k].completedPreReqs = coursesPassed[i].completedPreReqs;
              termsPassed[j].courses[k].completedCoReqs = coursesPassed[i].completedCoreqs;
              termsPassed[j].courses[k].inOfferedTerm = coursesPassed[i].inOfferedTerm;
              console.log(coursesPassed[i].InOfferedTerm);
            }
          }
        }
      }
    } else {
      if (coursesPassed !== "Nothing")
        console.error('passedCourses is not an array:', coursesPassed);
    }


    // Update the terms with the new course list
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
    sendCourseUpdateToBackend
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
      <div className="grid grid-cols-[1fr_300px] grid-rows-[50px_calc(100%-50px)] h-full font-arial">
        <StartSettings isStartModalOpen={isStartModalOpen} setIsStartModalOpen={setIsStartModalOpen} setTerms={setTerms} sendTermsToBackend={sendTermsToBackend} terms={terms}/>
        <div className="col-span-2 row-start-1 bg-zinc-800 flex items-center justify-start">
          {/* Header */}
          <SaveScheduleButton terms={terms} />
          <h1 className="text-3xl font-bold mx-auto">Course Planner</h1>
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
