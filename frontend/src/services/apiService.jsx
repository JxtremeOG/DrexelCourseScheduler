// services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5191'; // Ensure this matches your backend's base URL

/**
 * Sends the schedule initialization request to the backend.
 *
 * @param {string} message - A message describing the request.
 * @param {Array} terms - The list of term objects to send.
 * @returns {Promise<Object>} - The response data from the backend.
 */
export const sendTermsToBackend = async (message, terms) => {
  try {
    const scheduleRequest = {
      Message: message,
      Terms: terms,
    };

    console.log('Sending schedule:', scheduleRequest);

    const response = await axios.post(`${API_BASE_URL}/api/scheduler/initializeSchedule`, scheduleRequest, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Success:', response.data);
    return response.data; // Return data for further handling if needed
  } catch (error) {
    console.error('Error sending schedule:', error);
    throw error; // Propagate error to handle it in the component
  }
};

export const sendCourseUpdateToBackend = async (message, course, termIndex) => {
  try {
    const courseRequest = {
      Message: message,
      Course: course,
      TermIndex: termIndex
    };

    ////IF YOU DROP A COURSE ONTO ANOTHER COURSE NOTHING GETS SENT TO THE BACKEND

    console.log('Sending course:', courseRequest);

    const response = await axios.post(`${API_BASE_URL}/api/scheduler/sendCourseUpdate`, courseRequest, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Success:', response.data);

    return response.data; // Return data for further handling if needed
  } catch (error) {
    console.error('Error sending course update:', error);
    throw error; // Propagate error to handle it in the component
  }
}
