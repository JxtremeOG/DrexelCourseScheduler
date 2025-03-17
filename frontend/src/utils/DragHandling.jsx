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

    console.log("checkpoint 1")

    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();

    // if (activeIdStr === overIdStr) return; // Dropped onto itself

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

    console.log("checkpoint 2")

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
    if (!over) {
      console.log('Dropped outside any droppable');
      return; // Dropped outside any droppable
    }

    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    setDisplayRemoveCourse(false);

    // Find the source term and the course being dragged
    let course = null;
    let foundCourse;

    terms.forEach((term, index) => {
      foundCourse = term.courses.find((c) => c.id === activeIdStr);
      if (foundCourse) {
        course = foundCourse;
      }
    });

    if (overType === 'searchResults' || overType === 'courseSearched' && activeType === 'course') {
      console.log("Course is being deleted", course);
      console.log(activeType)
      if (activeType === 'course') {
        // Remove the course from the source term
        const updatedTerms = [...terms];
        updatedTerms.forEach((term, index) => { 
          updatedTerms[index].courses = term.courses.filter((c) => c.id !== activeIdStr);
        });

        setFilteredResults((prevFiltered) =>
          prevFiltered.filter((c) => c.id !== activeIdStr)
        );
        
        sendCourseUpdateToBackend(
          "Course is deleted",
          course,
          -1
        )
          .then((coursesPassed) => {
            // coursesPassed is the resolved value
            updateTerms(updatedTerms, coursesPassed.passedCourses);
          })
          .catch((error) => {
            // Handle errors
            console.error('Error updating courses:', error);
            // Optionally, set an error state or show a message to the user
          });
      }
      return;
    }

    if (!course) {
      foundCourse = filteredResults.find((c) => c.id === activeIdStr);
      if (foundCourse) {
        course = foundCourse;
      }
      if (!course) {
        console.error('Course not found:', activeIdStr);
        return;
      }
    }

    const destinationTermIndex = terms.findIndex((term) =>
      term.courses.some((c) => c.id === overIdStr)
    );

    if (activeIdStr === overIdStr) {
      const updatedTerms = [...terms];
      console.log('Dropped onto itself');
      sendCourseUpdateToBackend(
        "Dropped onto itself",
        course,
        destinationTermIndex
      )
        .then((coursesPassed) => {
          // coursesPassed is the resolved value
          updateTerms(updatedTerms, coursesPassed.passedCourses);
        })
        .catch((error) => {
          // Handle errors
          console.error('Error updating courses:', error);
          // Optionally, set an error state or show a message to the user
        });
      return; // Dropped onto itself
    }
    if (activeType === 'courseSearched' && (overType == 'searchResults' || overType == 'courseSearched')) {
      console.log('Dropped onto searchResults and is a courseSearched');
      return;
    }

    // If dropping onto a term container (empty space)
    if (destinationTermIndex === -1) {
      const destinationTermIndexFallback = terms.findIndex(
        (term) => term.id === overIdStr,
      );
      if (destinationTermIndexFallback !== -1) {
        // Move the course to the end of the destination term
        const updatedTerms = [...terms];
        // Remove from source
        if (activeType !== 'courseSearched') {
          console.log("Course is being moved (on term)", course, destinationTermIndexFallback);
          updatedTerms.forEach((term, index) => {
            updatedTerms[index].courses = term.courses.filter((c) => c.id !== activeIdStr);
          });
          
        } else {
          // If the course was in SearchResults, remove it from there
          setFilteredResults((prev) => prev.filter((c) => c.id !== activeIdStr));
        }
        // Add to destination
        updatedTerms[destinationTermIndexFallback].courses.push(course);
        sendCourseUpdateToBackend(
          "Course is being moved (on term)",
          course,
          destinationTermIndexFallback
        )
          .then((coursesPassed) => {
            // coursesPassed is the resolved value
            console.log(coursesPassed.passedCourses)
            updateTerms(updatedTerms, coursesPassed.passedCourses);
          })
          .catch((error) => {
            // Handle errors
            console.error('Error updating courses:', error);
            // Optionally, set an error state or show a message to the user
          });
      }
    }
    else {
      // If dropped on a course within a term
      const destinationCourse = terms[destinationTermIndex].courses.find(
        (c) => c.id === overIdStr
      );
      if (!destinationCourse) {
        console.error('Destination course not found:', overIdStr);
        return;
      }

      // If moving within the same term, reorder
      const term = terms[destinationTermIndex];
      const oldIndex = term.courses.findIndex((c) => c.id === activeIdStr);
      const newIndex = term.courses.findIndex((c) => c.id === overIdStr);

      if (oldIndex !== newIndex) {
        const newCourses = arrayMove(term.courses, oldIndex, newIndex);
        const updatedTerms = [...terms];
        updatedTerms[destinationTermIndex] = { ...term, courses: newCourses };
        updateTerms(updatedTerms);
      }
      // Moving to a different term
      const updatedTerms = [...terms];
      // Remove from source
      if (activeType !== 'courseSearched') {
        updatedTerms.forEach((term, index) => {
          updatedTerms[index].courses = term.courses.filter((c) => c.id !== activeIdStr);
        });
        
      } else {
        // If the course was in SearchResults, remove it from there
        setFilteredResults((prev) => prev.filter((c) => c.id !== activeIdStr));
      }
      // Insert into destination at the position of the over course
      const destinationCourses = [...updatedTerms[destinationTermIndex].courses];
      const overIndex = destinationCourses.findIndex((c) => c.id === overIdStr);
      destinationCourses.splice(overIndex, 0, course);
      updatedTerms[destinationTermIndex].courses = destinationCourses;
      console.log("Course is being moved (on course)", course, destinationTermIndex);
      sendCourseUpdateToBackend(
        "Course is being moved (on course)",
        course,
        destinationTermIndex
      )
        .then((coursesPassed) => {
          // coursesPassed is the resolved value
          updateTerms(updatedTerms, coursesPassed.passedCourses);
        })
        .catch((error) => {
          // Handle errors
          console.error('Error updating courses:', error);
          // Optionally, set an error state or show a message to the user
        });
    }
    console.log("checkpoint 3")
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
