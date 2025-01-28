import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

export const useDragAndDrop = ({ terms, filteredResults, setFilteredResults, setDisplayRemoveCourse, updateTerms, sendCourseUpdateToBackend }) => {
  const [activeId, setActiveId] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);

  const findCourseById = (id) => {
    for (const term of terms) {
      const course = term.courses.find((c) => c.id === id);
      if (course) return course;
    }
    return filteredResults.find((c) => c.id === id) || null;
  };

  const onDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    // Optional: store the entire course object for the overlay
    // so we can display name/shortName/etc. in the overlay
    const foundCourse = findCourseById(active.id);
    if (foundCourse) {
      setActiveCourse(foundCourse);
    }
  };

  // Handle drag over for real-time term switching
  const onDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();

    if (activeIdStr === overIdStr) return; // Dropped onto itself

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType == 'course' && (overType == 'searchResults' || overType == 'courseSearched')) setDisplayRemoveCourse(true);
    else setDisplayRemoveCourse(false);

    if (activeType !== 'course') return; // We only handle courses

    // Find the source term index and the course
    let sourceTermIndex = -1;
    let course = null;

    terms.forEach((term, index) => {
      const foundCourse = term.courses.find((c) => c.id === activeIdStr);
      if (foundCourse) {
        sourceTermIndex = index;
        course = foundCourse;
      }
    });

    if (!course) return; // Course not found

    // Determine the destination term
    let destinationTermIndex = -1;

    if (overType === 'term') {
      destinationTermIndex = terms.findIndex((term) => term.id === overIdStr);
    } else if (overType === 'course') {
      // Find which term contains the over course
      destinationTermIndex = terms.findIndex((term) =>
        term.courses.some((c) => c.id === overIdStr)
      );
    }

    if (destinationTermIndex === -1) return; // Over is not a valid droppable

    // If the destination is the same as source, do nothing
    if (destinationTermIndex === sourceTermIndex) return;

    // Move the course to the destination term
    const updatedTerms = [...terms];

    // Remove from source
    if (sourceTermIndex !== -1) {
      updatedTerms[sourceTermIndex].courses = updatedTerms[sourceTermIndex].courses.filter(
        (c) => c.id !== activeIdStr
      );
    }

    // Determine the position to insert
    if (overType === 'course') {
      const destinationCourse = terms[destinationTermIndex].courses.find(
        (c) => c.id === overIdStr
      );
      const overIndex = updatedTerms[destinationTermIndex].courses.findIndex(
        (c) => c.id === overIdStr
      );
      updatedTerms[destinationTermIndex].courses.splice(overIndex, 0, course);
    } else if (overType === 'term') {
      // Append to the end if dropped directly on the term
      updatedTerms[destinationTermIndex].courses.push(course);
    }

    updateTerms(updatedTerms);
  };

  // Handle drag end
  const onDragEnd = (event) => {
    const { active, over } = event;

    setActiveId(null); // Reset the activeId
    if (!over) return; // Dropped outside any droppable

    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    setDisplayRemoveCourse(false);
    if (activeIdStr === overIdStr) return; // Dropped onto itself
    if (activeType === 'courseSearched' && (overType == 'searchResults' || overType == 'courseSearched')) return;

    // Find the source term and the course being dragged
    let sourceTermIndex = -1;
    let course = null;
    let foundCourse;

    terms.forEach((term, index) => {
      foundCourse = term.courses.find((c) => c.id === activeIdStr);
      if (foundCourse) {
        sourceTermIndex = index;
        course = foundCourse;
      }
    });

    if (overType == 'searchResults' || overType == 'courseSearched') {
      if (sourceTermIndex !== -1) {
        // Remove the course from the source term
        const updatedTerms = [...terms];
        updatedTerms[sourceTermIndex].courses = updatedTerms[sourceTermIndex].courses.filter(
          (c) => c.id !== activeIdStr
        );
        sendCourseUpdateToBackend("Course is deleted", course, -1, sourceTermIndex);
        updateTerms(updatedTerms);
      } else {
        // Remove the course from filteredResults if it's already in SearchResults
        setFilteredResults((prevFiltered) =>
          prevFiltered.filter((c) => c.id !== activeIdStr)
        );
      }
      return;
    }

    if (!course) {
      foundCourse = filteredResults.find((c) => c.id === activeIdStr);
      if (foundCourse) {
        sourceTermIndex = -1;
        course = foundCourse;
      }
      if (!course) return;
    }

    const destinationTermIndex = terms.findIndex((term) =>
      term.courses.some((c) => c.id === overIdStr)
    );

    // If dropping onto a term container (empty space)
    if (destinationTermIndex === -1) {
      const destinationTermIndexFallback = terms.findIndex(
        (term) => term.id === overIdStr
      );
      if (destinationTermIndexFallback !== -1) {
        // Move the course to the end of the destination term
        const updatedTerms = [...terms];
        // Remove from source
        if (sourceTermIndex !== -1) {
          updatedTerms[sourceTermIndex].courses = updatedTerms[sourceTermIndex].courses.filter(
            (c) => c.id !== activeIdStr
          );
        } else {
          // If the course was in SearchResults, remove it from there
          setFilteredResults((prev) => prev.filter((c) => c.id !== activeIdStr));
        }
        // Add to destination
        updatedTerms[destinationTermIndexFallback].courses.push(course);
        sendCourseUpdateToBackend("Course is being moved (on course)", course, destinationTermIndexFallback, sourceTermIndex);
        updateTerms(updatedTerms);
      }
    }
    else {
      // If dropped on a course within a term
      const destinationCourse = terms[destinationTermIndex].courses.find(
        (c) => c.id === overIdStr
      );
      if (!destinationCourse) return;

      // If moving within the same term, reorder
      if (sourceTermIndex === destinationTermIndex) {
        const term = terms[sourceTermIndex];
        const oldIndex = term.courses.findIndex((c) => c.id === activeIdStr);
        const newIndex = term.courses.findIndex((c) => c.id === overIdStr);

        if (oldIndex !== newIndex) {
          const newCourses = arrayMove(term.courses, oldIndex, newIndex);
          const updatedTerms = [...terms];
          updatedTerms[sourceTermIndex] = { ...term, courses: newCourses };
          updateTerms(updatedTerms);
        }
      } else {
        // Moving to a different term
        const updatedTerms = [...terms];
        // Remove from source
        if (sourceTermIndex !== -1) {
          updatedTerms[sourceTermIndex].courses = updatedTerms[sourceTermIndex].courses.filter(
            (c) => c.id !== activeIdStr
          );
        } else {
          // If the course was in SearchResults, remove it from there
          setFilteredResults((prev) => prev.filter((c) => c.id !== activeIdStr));
        }
        // Insert into destination at the position of the over course
        const destinationCourses = [...updatedTerms[destinationTermIndex].courses];
        const overIndex = destinationCourses.findIndex((c) => c.id === overIdStr);
        destinationCourses.splice(overIndex, 0, course);
        updatedTerms[destinationTermIndex].courses = destinationCourses;
        sendCourseUpdateToBackend("Course is being moved (on term)", course, destinationTermIndex, sourceTermIndex);
        updateTerms(updatedTerms);
      }
    }
    return
  };

  return {
    activeId,
    activeCourse,
    onDragStart,
    onDragOver,
    onDragEnd,
  };
};
