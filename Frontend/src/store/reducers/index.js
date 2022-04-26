import { combineReducers } from 'redux';
import nftReducer from './nfts';
import nftBalanesReducer from './nftBalances';
import hotCollectionsReducer from './hotCollections';
import authorListReducer from './authorList';
import filterReducer from './filters';
import blogPostsReducer from './blogs';
import usersReducer from './users';

export const rootReducer = combineReducers({
  NFT: nftReducer,
  NFTBalance: nftBalanesReducer,
  hotCollection: hotCollectionsReducer,
  authors: authorListReducer,
  filters: filterReducer,
  blogs: blogPostsReducer,
  users: usersReducer
});

const reducers = (state, action) => rootReducer(state, action);

export default reducers;