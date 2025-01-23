import React, { useState } from 'react'
import ReactModal from 'react-modal'

const StartSettings = ({ isStartModalOpen, setIsStartModalOpen, setTerms }) => {

    const schedules = [{
        id: 1,
        name: "Schedule 1",
    },
    {
        id: 2,
        name: "Schedule 2",
    },
    {
        id: 3,
        name: "Schedule 3",
    }]

    const termDict = {
        0: "Fall",
        1: "Winter",
        2: "Spring",
        3: "Summer"
    }

    const handleCreateSchedule = () => {
        var tempTerms = []
        var currentTerm = 0;
        var trueTermIndex = 0;
        tempTerms.push({
                id: `term-pre`,
                termName: `Pre-College`,
                year: `<${startYear}`,
                termCredits: "0.0",
                courses: [],
        })
        for (let termIndex = 0; termIndex < numberOfTerms; termIndex++) {
            trueTermIndex = parseInt(startTerm)+termIndex;
            currentTerm = termDict[(parseInt(startTerm)+termIndex)%4];

            tempTerms.push({
                id: `term-${termIndex + 1}`,
                termName: `${currentTerm}`,
                year: `${parseInt(startYear) + parseInt(trueTermIndex / 4)}/${parseInt(startYear) + parseInt(trueTermIndex / 4) + 1}`,
                termCredits: "0.0",
                courses: [],
            })
        }
        setTerms(tempTerms)
        setIsStartModalOpen(false)
    }

    const [numberOfTerms, setNumberOfTerms] = useState("20")
    const [startTerm, setStartTerm] = useState("0")
    const [startYear, setStartYear] = useState(new Date().getFullYear());

    return (
        <ReactModal isOpen={isStartModalOpen} onRequestClose={() => handleCreateSchedule()} 
            overlayClassName='fixed inset-0 flex justify-center items-center bg-opacity-50 bg-black'
            className='h-[60vh] w-[30vw] bg-zinc-900 p-4 grid grid-cols-[1fr_200px] min-w-[25rem] min-h-[28rem] text-white rounded-lg'
        >
            <div className='col-start-1 bg-zinc-900 p-2 flex flex-col border-r-4 border-zinc-900 rounded-lg'>
                <p className='text-2xl font-semibold mx-auto mb-4'> New Schedule </p>
                <p className='font-semibold'> Select a Program: </p>
                <select className='mt-2 bg-zinc-300 text-black p-2 rounded-md w-full mb-2' value={numberOfTerms} onChange={(e) => setNumberOfTerms(e.target.value)}>
                    <option value="20"> 5-Year </option>
                    <option value="16"> 4-Year </option>
                </select>
                <p className='font-semibold'> Select a Start Term: </p>
                <select className='mt-2 bg-zinc-300 text-black p-2 rounded-md w-full mb-2' value={startTerm} onChange={(e) => setStartTerm(e.target.value)}>
                    <option value="0"> Fall </option>
                    <option value="1"> Winter </option>
                    <option value="2"> Spring </option>
                    <option value="3"> Summer </option>
                </select>
                <label> Select Start Date:</label>
                <input className='mt-2 bg-zinc-300 text-black p-2 rounded-md w-full mb-2' type="number" min="0000" max="9999" value={startYear} onChange={(e) => setStartYear(e.target.value)}/>
                <button className='bg-sky-800 p-2 rounded-md w-full h-12 mt-auto' onClick={() => handleCreateSchedule()}>
                    Create Schedule
                </button>
            </div>
            <div className='col-start-2 bg-zinc-900 p-2 flex flex-col justify-start border-l-4 border-zinc-900 rounded-lg'>
                <p className='text-2xl font-semibold mx-auto'> Load a Schedule </p>
                <div className='flex flex-col gap-2 mt-4'>
                    {schedules.map((schedule) => (
                        <button key={schedule.id} className='bg-sky-800 p-2 rounded-md'>
                            {schedule.name}
                        </button>
                    ))}
                </div>
                <button className='bg-sky-800 p-2 rounded-md w-full h-12 mt-auto'>
                    Load
                </button>
            </div>
        </ReactModal>
    )
}

export default StartSettings