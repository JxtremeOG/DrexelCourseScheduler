// src/components/SaveScheduleButton.jsx
import React, { useState } from 'react';
import { IoSave } from "react-icons/io5";

const SaveScheduleButton = ({ terms }) => {
    const [error, setError] = useState(null);

    const formatTerms = (terms) => {
        if (!terms) {
            throw new Error("Invalid terms data structure.");
        }

        const formattedTerms = terms.map((term) => {
            return {
                ...term,
                courses: term.courses.map((course) => ({
                    id: course.id,
                    shortName: course.shortName,
                    fullName: course.fullName,
                    courseCredits: course.courseCredits,
                    courseDepartment: course.courseDepartment,
                    courseDesc: course.courseDesc,
                    offered: course.offered,
                    prereqs: course.prereqs,
                    coreqs: course.coreqs,
                    repeatStatus: course.repeatStatus,
                    restrictions: course.restrictions,
                    completedPreReqs: course.completedPreReqs,
                    completedCoreqs: course.completedCoReqs,
                    inOfferedTerm: course.inOfferedTerm,
                }))
            };
        });

        const fileData = {
            saveName: "MySchedule",
            icon: "plus",
        }

        return { 
            ...fileData,
            terms: formattedTerms 
        };
    }

    const saveFile = async () => {
        setError(null); // Reset any previous errors

        try {
            // Format the terms data
            const formattedData = formatTerms(terms);

            // Check if electron and saveFile method are available
            if (window.electron && window.electron.fileHandle.saveFile) {
                const result = await window.electron.fileHandle.saveFile(formattedData);
                if (!result.canceled && result.filePath) {
                    alert(`File saved successfully at ${result.filePath}`);
                } else {
                    // Handle if the user canceled the dialog or an error occurred
                    if (result.error) {
                        setError(result.error);
                    }
                }
            } else {
                console.error('electron is not available');
                setError('Internal error: electron not available.');
            }
        } catch (err) {
            console.error('Error during saveFile:', err);
            setError(err.message || 'An unexpected error occurred.');
        }
    };

    return (
        <button onClick={saveFile}>
            <IoSave className='text-white size-10 mx-3' />
        </button>
    )
}

export default SaveScheduleButton;
