import React from 'react'
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import { SearchContext } from '../contexts/searchContext';
import SearchResults from './SearchResults';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableContext } from '@dnd-kit/sortable';
import { generateUniqueId } from '../utils/generateUniqueId';
import { transformCourse } from '../utils/CourseTransform';

const SearchContainer = ({filteredResults, setFilteredResults, displayRemoveCourse}) => {

    const [query, setQuery] = useState('');
    const [coursesData, setCoursesData] = useState([]);
    const [fullNameSearch, setFullNameSearch] = useState(false);

    const handleSearch = (event) => {
        const value = event.target.value;
        setQuery(value);
        executeSearch(value, fullNameSearch)
    };

    const executeSearch = (value, updatedFullNameSearch) => {
        if (value.trim() === '') {
            setFilteredResults([]);
            return;
        }
    
        var results;

        if (updatedFullNameSearch) {
            results = coursesData.filter((course) =>
                course.fullName.toLowerCase().includes(value.toLowerCase())
            ).map((course) => ({
                ...course,
                id: generateUniqueId(), // Assign a new unique ID for each search
            }));
        }
        else {
            results = coursesData.filter((course) =>
                new RegExp(`^${value.toLowerCase()}.*`).test(course.shortName.toLowerCase()) || parseInt(value) ? course.shortName.includes(value) : false
            ).map((course) => ({
                ...course,
                id: generateUniqueId(), // Assign a new unique ID for each search
            }));
        }
        setFilteredResults(results);
    }

    useEffect(() => {
        fetch('/courseJsons/masterJsons.json') // Replace with the correct file path
        .then((response) => {
            if (!response.ok) {
            throw new Error('Failed to load courses data');
            }
            return response.json();
        })
        .then((data) => {
            const coursesArray = Object.values(data).map(transformCourse);
            setCoursesData(coursesArray);
        })
        .catch((error) => {
            console.error('Error fetching courses data:', error);
        });
    }, []);

    return (
        <SearchContext.Provider value={{query, setQuery, handleSearch, filteredResults, displayRemoveCourse, fullNameSearch, setFullNameSearch, executeSearch}}>
            <SearchBar/>
            <SortableContext
                items={filteredResults.map((course) => course.id)}
                strategy={verticalListSortingStrategy}
            >
                <SearchResults/>
            </SortableContext>
        </SearchContext.Provider>
    )
}

export default SearchContainer