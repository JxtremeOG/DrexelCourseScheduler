export function generateUniqueId() {
    return `course-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}