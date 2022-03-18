import { Axios, Canceler } from '../../../core/axios';
import * as actions from '../../actions';
import { useNFTBalances } from "react-moralis";

export const fetchNftBalancesBreakdown = (authorId, isMusic = false) => async (dispatch, getState) => {
  
  //access the state
  const state = getState();
  console.log(state);

  dispatch(actions.getNftBalancesBreakdown.request(Canceler.cancel));

  try {
    let filter = authorId ? 'author='+authorId : '';
    let music = isMusic ? 'category=music' : '';

    // const { data } = await Axios.get(`${api.baseUrl}${isMusic ? '/nfts_music.json' : api.nfts}?${filter}&${music}`, {
    //   cancelToken: Canceler.token,
    //   params: {}
    // });
    const {data: NFTBalances} = useNFTBalances();    

    dispatch(actions.getNftBalancesBreakdown.success(NFTBalances));
  } catch (err) {
    dispatch(actions.getNftBalancesBreakdown.failure(err));
  }
};

export const fetchNftBalancesShowcase = () => async (dispatch) => {

  dispatch(actions.getNftBalancesShowcase.request(Canceler.cancel));

  try {
    // const { data } = await Axios.get(`${api.baseUrl}${api.nftShowcases}`, {
    //   cancelToken: Canceler.token,
    //   params: {}
    // });
    const {data: NFTBalances} = useNFTBalances(); 

    dispatch(actions.getNftBalancesShowcase.success(NFTBalances));
  } catch (err) {
    dispatch(actions.getNftBalancesShowcase.failure(err));
  }
};

export const fetchNftBalanceDetail = (nftId) => async (dispatch) => {

  dispatch(actions.getNftBalanceDetail.request(Canceler.cancel));

  try {
    const {data: NFTBalances} = useNFTBalances(); 

    dispatch(actions.getNftBalanceDetail.success(NFTBalances));
  } catch (err) {
    dispatch(actions.getNftBalanceDetail.failure(err));
  }
};

export const setNFTBalances = (nfts) => async (dispatch) => {

  dispatch(actions.setNftBalances(nfts));

};
