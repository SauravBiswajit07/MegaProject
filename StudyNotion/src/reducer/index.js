import {combineReducers} from "@reduxjs/toolkit";

import authReducer from "../slices/authSlice"
import profileReducer from "../slices/profileSlice";
import cartReducer from "../slices/cartSlice"

// import courseReducer from "../slices/courseSlice"
// import viewCourseReducer from "../slices/viewCourseSlice"

const rootReducer  = combineReducers({
    auth: authReducer,
    profile:profileReducer,
    cart:cartReducer,
    // course:courseReducer,
    // viewCourse:viewCourseReducer,
})

export default rootReducer;

// slices bhitare reducers ruhe mane logics of functions
// sei sabu slices gudaku integrate karibaku combineReducers use hauchi
// tapare integrated wala ta store ku bheja heba index re taki sabu component access kariparibe
// reducers mananku implement kariba paeen useDispatch use kara jaye 







