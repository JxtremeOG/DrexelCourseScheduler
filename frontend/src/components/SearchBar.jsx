import React from 'react'
import { SearchContext } from '../contexts/searchContext'
import { useContext } from 'react'
import { IoSearchCircle } from "react-icons/io5";
import { IoSearchCircleOutline } from "react-icons/io5";
//<IoSearchCircle />
//<IoSearchCircleOutline />

const SearchBar = ({ }) => {
    const { query, handleSearch, setFullNameSearch, fullNameSearch, executeSearch } = useContext(SearchContext);
    return (
        <div className='flex flex-row'>
            <input type="search" placeholder='Search for a course...'  value={query} onChange={handleSearch}
            className='w-[14rem] h-16 p-2 text-lg rounded-tl-lg rounded-bl-lg border-none bg-zinc-750'/>
            <button className='w-10 h-full bg-sky-800 rounded-tr-lg rounded-br-lg border-none flex justify-center items-center hover:bg-sky-700' 
            onClick={() => {const updatedFullNameSearch = !fullNameSearch; setFullNameSearch(updatedFullNameSearch); executeSearch(query, updatedFullNameSearch); }}> 
                {fullNameSearch ? <IoSearchCircle className='text-4xl text-zinc-300'/> : <IoSearchCircleOutline className='text-4xl text-zinc-300'/>}
            </button>
        </div>
    )
}

export default SearchBar