import { createContext } from 'react';

export const AppContext = createContext({
  ShowFav: () => {},
  handleShowAllTasks: () => {},
  markedDates: {},
  setMarkedDates: () => {},

  isShowFav: false,
  isShowAllList: false,
  isShowListTask:false,
  isShowHome:false,
  isShowAdd:false,
  isLiked:false,

  setIsLiked: () => {},
  setShowFav: () => {},
  setShowListTask: () => {},

  allTasks:[],
  allFavTasks:[],
  tasks:[],
  setTasks: () => {},

  selectedDate:[],
  setDate: () => {},
  selectedTaskIndex:[],
  setSelectedTaskIndex:() => {},
});