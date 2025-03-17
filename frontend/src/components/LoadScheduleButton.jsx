import { useState } from 'react';

const LoadScheduleButton = ( {handleCreateSchedule} ) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [jsonData, setJsonData] = useState(null);
    const [error, setError] = useState(null);

    const parseJson = (json) => {
        const originalTerms = json.terms.map((term) => {
            return {
                id: term.id,
                termName: term.termName,
                year: term.year,
                termCredits: term.termCredits.toString(), // Default value; adjust as needed
                courses: term.courses.map((course) => ({
                    ...course
                })),
            };
        });

        handleCreateSchedule(originalTerms)
        return originalTerms
    }

    const loadFile = async () => {
        if (window.electron && window.electron.fileHandle.openFile) {
            const result = await window.electron.fileHandle.openFile();
            if (!result.canceled && result.filePath) {
                setSelectedFile(result.filePath);
            // Now, read the file content
            const readResult = await window.electron.fileHandle.readFile(result.filePath);
            if (readResult.success) {
                setJsonData(readResult.data);
                parseJson(readResult.data);
            } else {
                setError(readResult.error);
            }
            } else {
                // Handle if the user canceled the dialog or an error occurred
                if (result.error) {
                    setError(result.error);
                }
            }
        } else {
            console.error('electron is not available');
            setError('Internal error: electronAPI not available.');
        }
    };
    return (
        <button className='bg-sky-800 p-2 rounded-md w-full h-12 mt-auto' onClick={() => loadFile()}>
            Load
        </button>
    )
}

export default LoadScheduleButton