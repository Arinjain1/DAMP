import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [
    {
      id: '1',
      title: 'Collect NOC & Title Deed from Scheme 78 Owner',
      dueTime: 'Due: 11:30 AM',
      completed: false,
      priority: 'High',
    },
    {
      id: '2',
      title: 'Follow up with Aman Jain for Co-Broke split terms',
      dueTime: 'Due: 03:00 PM',
      completed: false,
      priority: null,
    },
    {
      id: '3',
      title: 'Upload updated floor plan for Silicon City Villa',
      dueTime: 'Due: 06:00 PM',
      completed: true,
      priority: 'Done',
    },
    {
      id: '4',
      title: 'Token agreement signing with Rajesh Sharma',
      dueTime: 'Due: 07:30 PM',
      completed: false,
      priority: 'High',
    },
  ],
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    toggleTaskComplete: (state, action) => {
      const task = state.tasks.find((t) => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toggleTaskComplete, addTask, deleteTask } = tasksSlice.actions;
export default tasksSlice.reducer;
