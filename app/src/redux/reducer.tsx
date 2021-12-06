import _ from 'lodash';

// types
export const SET_CREATOR_OBJ = 'SET_CREATOR_OBJ';

// actions
export const setCreatorObj = (payload: any) => (dispatch: any) => {
  dispatch({
    type: SET_CREATOR_OBJ,
    payload,
  });
};

// init state
export const initState = {
  action: "Deposit",
};

/**
 * main
 */
 const GeneralReducer = (state = _.cloneDeep(initState), action: any) => {
  switch (action.type) {
    case SET_CREATOR_OBJ:
      return {
        ...state,
        creatorObj: action.payload,
      }
    default:
      return state;
    }
};

export default GeneralReducer;