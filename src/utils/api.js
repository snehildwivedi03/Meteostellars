import axios from "axios";

const API_KEY = "DEMO_KEY"; // replace with your NASA API key if needed

export const fetchNEOs = async (date) => {
  const response = await axios.get(
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${API_KEY}&detailed=true`
  );
  return response.data.near_earth_objects[date] || [];
};
