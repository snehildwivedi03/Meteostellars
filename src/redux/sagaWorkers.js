import axios from "axios";
import { call, put } from "redux-saga/effects";
import {
  isFetchingNEOsTrue,
  isFetchingNEOsFalse,
  updateDate,
  updateNEOsDetail,
  errorFetchNEOsTrue,
  errorFetchNEOsFalse,
} from "./actionCreators.js";

// Read key from env
const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || "DEMO_KEY";

// Axios call for NEO data
const fetchNEOsAxios = (date) => {
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${NASA_API_KEY}&detailed=true`;
  return axios.get(url).then((res) => res.data);
};

// Worker saga
export function* fetchNEOsAsync(action) {
  try {
    yield put(isFetchingNEOsTrue());
    const data = yield call(fetchNEOsAxios, action.newDate);

    yield put(updateDate(action.newDate));
    yield put(updateNEOsDetail(data));

    yield put(errorFetchNEOsFalse());
    yield put(isFetchingNEOsFalse());
  } catch (err) {
    console.error("NEO fetch error:", err);

    // optional: detect 429
    if (err.response?.status === 429) {
      alert("NASA API limit reached! Please wait or use a different key.");
    }

    yield put(isFetchingNEOsFalse());
    yield put(errorFetchNEOsTrue());
  }
}
