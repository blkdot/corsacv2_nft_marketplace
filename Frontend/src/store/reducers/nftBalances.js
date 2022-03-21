import { getType } from 'typesafe-actions';
import * as actions from '../actions';
import { initEntityState, entityLoadingStarted, entityLoadingSucceeded, entityLoadingFailed } from '../utils';

export const defaultState = {
  nftBalancesBreakdown: initEntityState(null),
  nftBalanceDetail: initEntityState(null),
  nftBalancesShowcase: initEntityState(null)
};

const states = (state = defaultState, action) => {
  let payload;
  switch (action.type) {
    
    case getType(actions.getNftBalancesBreakdown.request):
      return { ...state, nftBalancesBreakdown: entityLoadingStarted(state.nftBalancesBreakdown, action.payload) };
    case getType(actions.getNftBalancesBreakdown.success):
      //append existing data with new data
      payload = state.nftBalancesBreakdown.data ? [...state.nftBalancesBreakdown.data, ...action.payload] : action.payload;
      console.log("getNFTBalancesBreakdown payload:", payload);
      return { ...state, nftBalancesBreakdown: entityLoadingSucceeded(state.nftBalancesBreakdown, payload) };
    case getType(actions.getNftBalancesBreakdown.failure):
      return { ...state, nftBalancesBreakdown: entityLoadingFailed(state.nftBalancesBreakdown) };
    
    case getType(actions.getNftBalanceDetail.request):
      return { ...state, nftBalanceDetail: entityLoadingStarted(state.nftBalanceDetail, action.payload) };
    case getType(actions.getNftBalanceDetail.success):
      return { ...state, nftBalanceDetail: entityLoadingSucceeded(state.nftBalanceDetail, action.payload) };
    case getType(actions.getNftBalanceDetail.failure):
      return { ...state, nftBalanceDetail: entityLoadingFailed(state.nftBalanceDetail) };
    
    case getType(actions.getNftBalancesShowcase.request):
      return { ...state, nftBalancesShowcase: entityLoadingStarted(state.nftBalancesShowcase, action.payload) };
    case getType(actions.getNftBalancesShowcase.success):
      return { ...state, nftBalancesShowcase: entityLoadingSucceeded(state.nftBalancesShowcase, action.payload) };
    case getType(actions.getNftBalancesShowcase.failure):
      return { ...state, nftBalancesShowcase: entityLoadingFailed(state.nftBalancesShowcase) };

    case getType(actions.setNftBalances):
      payload = state.nftBalancesBreakdown.data ? [...state.nftBalancesBreakdown.data, ...action.payload] : action.payload;
      console.log("payload:", payload);
      return { ...state, nftBalancesBreakdown: entityLoadingSucceeded(state.nftBalancesBreakdown, payload) };

    case getType(actions.clearNfts):
      return { ...state, nftBalancesBreakdown: initEntityState(null)};
    
    default:
      return state;
  }
};

export default states;
