// SearchResults.jsx
import React, { useContext, useEffect, useMemo } from 'react';
import { SearchContext } from '../contexts/searchContext';
import SearchedCourse from './SearchedCourse';
import { useDroppable } from '@dnd-kit/core';

const SearchResults = () => {
  const { filteredResults, displayRemoveCourse } = useContext(SearchContext);

  const { isOver, setNodeRef } = useDroppable({
      id: 'searchResults',
      data: { type: 'searchResults' }, // <-- Important: identify it as a 'term'
  });
  
  // Memoize limitedResults to prevent it from changing on every render
  const limitedResults = useMemo(() => {
    return (filteredResults || []).slice(0, 100); // Limit to 100 results
  }, [filteredResults]);

  return (
    <div className='bg-zinc-750 w-full h-full flex flex-col gap-2 p-2 overflow-y-auto scrollbar scrollbar-thumb-sky-800 scrollbar-track-zinc-700 rounded-lg'
    ref={setNodeRef}>
      {limitedResults.map((course) => (
        <SearchedCourse key={course.id} course={course} />
      ))}
    </div>
  );
};

export default SearchResults;
