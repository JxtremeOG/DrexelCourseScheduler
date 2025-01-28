// src/utils/courseTransform.js

// Adjust the import path based on your project structure
import { generateUniqueId } from './generateUniqueId';

/**
 * Transforms a course object by adding or modifying specific properties.
 *
 * @param {Object} course - The original course object.
 * @returns {Object} The transformed course object.
 */
export const transformCourse = (course) => ({
  ...course,
  id: course.id || generateUniqueId(), // Use existing id or generate a new one
  completedPreReqs: false,
  completedCoReqs: false,
});
