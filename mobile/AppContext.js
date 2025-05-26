import { createContext } from 'react';

export const AppContext = createContext({

  allTasks: [], setAllTasks: () => { },
  allFavTasks: [],setAllFavTasks: () => { },
  tasks: [], setTasks: () => { },

  markedDates: {}, setMarkedDates: () => { },
  selectedDate: [], setSelectedDate: () => { },
  selectedTaskIndex: [], setSelectedTaskIndex: () => { },

  isShowFav: false,  setShowFav: () => { },
  isShowAllList: false, setShowAllList: () => { },
  isLiked: false, setIsLiked: () => { },
  isShowFavTask: false, setShowFavTask: () => { },

  isFromCalendar: false, setFromCalendar: () => { },

  likedByDate:[], setLikedByDate:() => { },

});