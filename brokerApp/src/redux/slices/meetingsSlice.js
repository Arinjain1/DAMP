import { createSlice } from '@reduxjs/toolkit';
import { todayMeetingsMockData } from '../../mockdata/meetingData.js';

const initialState = {
  todayMeetings: todayMeetingsMockData,
  selectedMeeting: null,
};

const meetingsSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    addMeeting: (state, action) => {
      state.todayMeetings.unshift(action.payload);
    },
    updateMeetingStatus: (state, action) => {
      const { id, status } = action.payload;
      const meeting = state.todayMeetings.find((m) => m.id === id);
      if (meeting) {
        meeting.status = status;
      }
    },
    rescheduleMeeting: (state, action) => {
      const { id, time } = action.payload;
      const meeting = state.todayMeetings.find((m) => m.id === id);
      if (meeting) {
        meeting.time = time;
      }
    },
    deleteMeeting: (state, action) => {
      state.todayMeetings = state.todayMeetings.filter((m) => m.id !== action.payload);
    },
    setSelectedMeeting: (state, action) => {
      state.selectedMeeting = action.payload;
    },
  },
});

export const {
  addMeeting,
  updateMeetingStatus,
  rescheduleMeeting,
  deleteMeeting,
  setSelectedMeeting,
} = meetingsSlice.actions;

export default meetingsSlice.reducer;
