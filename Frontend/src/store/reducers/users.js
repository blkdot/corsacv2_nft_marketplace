import { getType } from 'typesafe-actions';
import * as actions from '../actions';
import { initEntityState, entityLoadingStarted, entityLoadingSucceeded, entityLoadingFailed } from '../utils';

export const defaultState = {
  users: initEntityState(null),
  currentUser: initEntityState(null),
};

const states = (state = defaultState, action) => {
  switch (action.type) {
    
    case getType(actions.getUsers.request):
      return { ...state, users: entityLoadingStarted(state.users, action.payload) };
    case getType(actions.getUsers.success):
      return { ...state, users: entityLoadingSucceeded(state.users, action.payload) };
    case getType(actions.getUsers.failure):
      return { ...state, users: entityLoadingFailed(state.users) };
    
    case getType(actions.clearUsers):
      return { ...state, users: initEntityState(null)};

    case getType(actions.setCurrentUser):
      return { ...state, currentUser: entityLoadingSucceeded(state.currentUser, action.payload) };
    
    default:
      return state;
  }
};

export default states;
