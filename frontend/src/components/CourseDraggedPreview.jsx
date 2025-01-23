// CourseDraggedPreview.jsx
import React from 'react';

const CourseDraggedPreview = ({ course }) => {
  return (
    <div className="bg-zinc-800 text-sky-500 h-full max-w-40 flex flex-grow items-center justify-center rounded-md cursor-move">
      {/* pointer-events-none so it doesn’t interfere with collisions */}
      {course.shortName}
    </div>
  );
};

export default CourseDraggedPreview;
