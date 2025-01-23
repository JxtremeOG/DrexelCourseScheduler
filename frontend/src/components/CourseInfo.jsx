import React from 'react'
import ReactModal from 'react-modal'
import { CourseDetailsContext } from '../contexts/CourseDetailsContext'
import { useContext } from 'react'

const CourseInfo = () => {
  const { isModalOpen, setIsModalOpen, courseDetailsDisplay } = useContext(CourseDetailsContext)
  const { shortName, fullName, courseCredits, courseDesc, courseDepartment, repeatStatus, prereqs, coreqs, restrictions, offered} = courseDetailsDisplay
  return (
    <ReactModal
  isOpen={isModalOpen}
  onRequestClose={() => setIsModalOpen(false)}
  overlayClassName="fixed inset-0 bg-opacity-50 flex justify-center items-center"
  className="h-[28rem] w-[28rem] bg-zinc-800 p-4 rounded-lg text-white"
>
  <div className="h-full grid grid-rows-[auto_auto_1fr_auto] gap-4 p-2">
    {/* Header Section */}
    <div className="gap-2 flex flex-col w-[75%]">
      <p className="text-2xl font-semibold text-sky-500">{fullName || "None"}</p>
      <p className="text-xl font-semibold text-sky-500">{shortName || "None"}</p>
    </div>

    {/* Description Section */}
    <div
      className="flex flex-col gap-2 overflow-y-auto scrollbar scrollbar-thumb-sky-800 
        scrollbar-track-zinc-700 rounded-lg"
    >
      <p className="text-sm">Description: {courseDesc || "None"}</p>
    </div>

    {/* Spacer (this ensures the last div stays at the bottom) */}
    <div className="flex-1"></div>
    <div
      className="flex flex-col gap-1 overflow-y-auto scrollbar scrollbar-thumb-sky-800 
        scrollbar-track-zinc-700 rounded-lg"
    >
      <p className="text-xs">Prerequisites: {prereqs || "None"}</p>
      <p className="text-xs">Corequisites: {coreqs || "None"}</p>
      <p className="text-xs">Restrictions: {restrictions || "None"}</p>
      <div className="flex flex-row justify-between">
        <p>Offered: {offered || "None"}</p>
        <p>{courseCredits || "None"} Credits</p>
      </div>
    </div>
  </div>
</ReactModal>

  )
}

export default CourseInfo