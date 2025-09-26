// src/redux/sagaWatchers.js
import { takeEvery } from "redux-saga/effects";
import { fetchNEOsAsync } from "./sagaWorkers.js";

export function* watchNEOs() {
  yield takeEvery("FETCH_NEOS_SAGA", fetchNEOsAsync);
}
