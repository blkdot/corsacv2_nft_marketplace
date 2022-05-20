import axios from "axios";
import moment from "moment";
// import mm from "music-metadata";
import { makeTokenizer } from "@tokenizer/http";
import { defaultAvatar } from "./components/components/constants";

export function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
}

export function isMobile() {
  if (window) {
    return window.matchMedia(`(max-width: 767px)`).matches;
  }
  return false;
}

export function isMdScreen() {
  if (window) {
    return window.matchMedia(`(max-width: 1199px)`).matches;
  }
  return false;
}

function currentYPosition() {
  if (!window) {
    return;
  }
  // Firefox, Chrome, Opera, Safari
  if (window.pageYOffset) return window.pageYOffset;
  // Internet Explorer 6 - standards mode
  if (document.documentElement && document.documentElement.scrollTop)
    return document.documentElement.scrollTop;
  // Internet Explorer 6, 7 and 8
  if (document.body.scrollTop) return document.body.scrollTop;
  return 0;
}

function elmYPosition(elm) {
  var y = elm.offsetTop;
  var node = elm;
  while (node.offsetParent && node.offsetParent !== document.body) {
    node = node.offsetParent;
    y += node.offsetTop;
  }
  return y;
}

export function scrollTo(scrollableElement, elmID) {
  var elm = document.getElementById(elmID);
  if (!elmID || !elm) {
    return;
  }
  var startY = currentYPosition();
  var stopY = elmYPosition(elm);
  var distance = stopY > startY ? stopY - startY : startY - stopY;
  if (distance < 100) {
    scrollTo(0, stopY);
    return;
  }
  var speed = Math.round(distance / 50);
  if (speed >= 20) speed = 20;
  var step = Math.round(distance / 25);
  var leapY = stopY > startY ? startY + step : startY - step;
  var timer = 0;
  if (stopY > startY) {
    for (var i = startY; i < stopY; i += step) {
      setTimeout(
        (function(leapY) {
          return () => {
            scrollableElement.scrollTo(0, leapY);
          };
        })(leapY),
        timer * speed
      );
      leapY += step;
      if (leapY > stopY) leapY = stopY;
      timer++;
    }
    return;
  }
  for (let i = startY; i > stopY; i -= step) {
    setTimeout(
      (function(leapY) {
        return () => {
          scrollableElement.scrollTo(0, leapY);
        };
      })(leapY),
      timer * speed
    );
    leapY -= step;
    if (leapY < stopY) leapY = stopY;
    timer++;
  }
  return false;
}

export function getTimeDifference(date) {
  let difference =
    moment(new Date(), "DD/MM/YYYY HH:mm:ss").diff(
      moment(date, "DD/MM/YYYY HH:mm:ss")
    ) / 1000;

  if (difference < 60) return `${Math.floor(difference)} seconds`;
  else if (difference < 3600) return `${Math.floor(difference / 60)} minutes`;
  else if (difference < 86400) return `${Math.floor(difference / 3660)} hours`;
  else if (difference < 86400 * 30)
    return `${Math.floor(difference / 86400)} days`;
  else if (difference < 86400 * 30 * 12)
    return `${Math.floor(difference / 86400 / 30)} months`;
  else return `${(difference / 86400 / 30 / 12).toFixed(1)} years`;
}

export function generateRandomId() {
  let tempId = Math.random().toString();
  let uid = tempId.substr(2, tempId.length - 1);
  return uid;
}

export function getQueryParam(prop) {
  var params = {};
  var search = decodeURIComponent(
    window.location.href.slice(window.location.href.indexOf("?") + 1)
  );
  var definitions = search.split("&");
  definitions.forEach(function(val, key) {
    var parts = val.split("=", 2);
    params[parts[0]] = parts[1];
  });
  return prop && prop in params ? params[prop] : params;
}

export function classList(classes) {
  return Object.entries(classes)
    .filter(entry => entry[1])
    .map(entry => entry[0])
    .join(" ");
}

export function getSymbolByChainId(chainId) {
  const ethNetworks = [0x1, 0x3, 0x4, 0x5, 0x2a];
  const bscNetworks = [0x38, 0x61];
  const polygonNetworks = [0x89, 0x13881];
  const avalancheNetworks = [0xa86a, 0xa869];
  const fantomNetworks = [0xfa];

  if (ethNetworks.includes(parseInt(chainId))) return 'ETH';
  if (bscNetworks.includes(parseInt(chainId))) return 'BSC';
  if (polygonNetworks.includes(parseInt(chainId))) return 'MATIC';
  if (avalancheNetworks.includes(parseInt(chainId))) return 'AVALAN';
  if (fantomNetworks.includes(parseInt(chainId))) return 'FTM';

  return 'Unknown';
}

export function formatUserName(name) {
  if (!name) {
    return 'Unknown';
  }

  if (name.length === 42) {
    return name.substr(0, 5) + "..." + name.substr(name.length - 4, 4);
  } else {
    return name.substr(0, 20) + (name.length > 20 ? "..." : "");
  }
}

export function formatAddress(address, type) {
  if (address.length !== 42) {
    return address;
  }

  switch (type) {
    case 'wallet':
    case 'collection':
      return address.substr(0, 5) + "..." + address.substr(address.length - 4, 4);
    default:
  }

  return address;
}

export const videoTypes = [
  'm4v', 'avi', 'mpg', 'mp4', 'mkv', '3gpp', 'webm', 
  'video/mp4', 'video/mpg', 'video/avi', 'video/m4v', 'video/mkv', 'video/3gpp', 'video/webm'
]

export const audioTypes = ['mp3', 'wav', 'ogg', 'audio/mp3', 'audio/wav', 'audio/ogg']

export async function getFileTypeFromURL(url) {
  const httpTokenizer = await makeTokenizer(url);
  const mimeType = httpTokenizer.fileInfo.mimeType;
  let fileType = null;
  if (videoTypes.includes(httpTokenizer.fileInfo.mimeType)) {
    fileType = 'video';
  } else if (audioTypes.includes(httpTokenizer.fileInfo.mimeType)) {
    fileType = 'audio';
  } else {
    fileType = 'image';
  }

  return {mimeType: mimeType, fileType: fileType};
}

export async function getUserInfo(walletAddr) {
  let user = null;
  
  await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      walletAddr: walletAddr.toLowerCase()
    }
  }).then(res => {
    user = res.data.user;
  }).catch(err => {
    console.log(err);
    user = null;
  });
          
  return user;
};

export async function getPayments() {
  let payments = [];
  try {
    await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/payment/all`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        allowed: 1
      }
    }).then(res => {
      for (let p of res.data.payments) {
        payments.push({
          value: p.id, 
          label: p.title + " (" + p.symbol + ")", 
          addr: p.addr, 
          title: p.title, 
          type: p.type,
          symbol: p.symbol,
          decimals: p.decimals
        });
      }
    });
  } catch {
    console.log('error in fetching payments');
  }

  return payments;
}

export async function getHistory(collectionAddr, tokenId) {
  let hs = [];
  try {
    await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/activity/history`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        collectionAddr: collectionAddr.toLowerCase(),
        tokenId: parseInt(tokenId)
      }
    }).then(async res => {
      for (let h of res.data.history) {
        hs.push({
          actor: (h.actorUsers && h.actorUsers[0]) ? (h.actorUsers[0].name ? h.actorUsers[0].name : formatAddress(h.actorUsers[0].walletAddr, 'wallet')) : h.actor,
          actorAvatar: h.actorUsers && h.actorUsers[0] ? h.actorUsers[0].avatar : defaultAvatar,
          from: (h.fromUsers && h.fromUsers[0]) ? (h.fromUsers[0].name ? h.fromUsers[0].name : formatAddress(h.fromUsers[0].walletAddr, 'wallet')) : h.from,
          actionType: h.actionType,
          description: h.description,
          timeStamp: h.timeStamp * 1000
        });
      }
    });
  } catch {
    console.log('error in fetching history by item');
  }

  return hs;
}

export async function getAllCollection() {
  let collections = [];
  await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/collection/all`, {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {}
  }).then(res => {
    collections = res.data.collections;
  }).catch((e) => {
    console.log(e);
  });

  return collections;
}

export async function getFavoriteCount(collectionAddr, tokenId, walletAddr = null) {
  let count = 0;
  let liked = false;

  try {
    const result = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/like/item`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        collectionAddr: collectionAddr.toLowerCase(),
        tokenId: parseInt(tokenId),
        walletAddr: walletAddr ? walletAddr.toLowerCase() : null
      }
    });

    count = result.data.count;
    liked = result.data.liked;
  } catch (e) {
    console.log(e);
    count = 0;
    liked = false;
  }

  return {count: count, liked: liked};
}

export async function addLike(walletAddr, collectionAddr, tokenId) {
  const res = await axios.post(
    `${process.env.REACT_APP_SERVER_URL}/api/like/add`, 
    {
      'walletAddr': walletAddr.toLowerCase(),
      'collectionAddr': collectionAddr.toLowerCase(),
      'tokenId': parseInt(tokenId),
    },
    {
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

export async function removeLike(walletAddr, collectionAddr, tokenId) {
  const res = await axios.post(
    `${process.env.REACT_APP_SERVER_URL}/api/like/remove`, 
    {
      'walletAddr': walletAddr.toLowerCase(),
      'collectionAddr': collectionAddr.toLowerCase(),
      'tokenId': parseInt(tokenId),
    },
    {
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

export async function getNotifications(walletAddr, type = 0, count = -1) {
  let notifications = [];
  try {
    await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/notification`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        walletAddr: walletAddr.toLowerCase(),
        type: type //0: all, 1: unread
      }
    }).then(async res => {
      let index = 0;
      for (let n of res.data.notifications) {
        index++;
        if (count !== -1 && index > count) {
          break;
        }
        notifications.push({
          actor: (n.actorUsers && n.actorUsers[0]) ? (n.actorUsers[0].name ? n.actorUsers[0].name : formatAddress(n.actorUsers[0].walletAddr, 'wallet')) : n.actor,
          actorAvatar: n.actorUsers && n.actorUsers[0] ? n.actorUsers[0].avatar : defaultAvatar,
          from: (n.fromUsers && n.fromUsers[0]) ? (n.fromUsers[0].name ? n.fromUsers[0].name : formatAddress(n.fromUsers[0].walletAddr, 'wallet')) : n.from,
          actionType: n.actionType,
          description: n.description,
          timeStamp: n.timeStamp * 1000,
          duration: formatTimeDiff(new Date().getTime() / 1000 - n.timeStamp),
          read: n.read
        });
      }
    });
  } catch (e) {
    console.log(e);
    console.log('error in fetching notifications by user');
  }

  return notifications;
}

export function formatTimeDiff(seconds) {
  if (seconds < 60) {
    return Math.floor(seconds).toString() + " secs";
  } else if (seconds >= 60 && seconds < 3600) {
    return Math.floor(seconds / 60).toString() + " mins";
  } else if (seconds >= 60 && seconds < 86400) {
    return Math.floor(seconds / 3600).toString() + " hours";
  } else {
    return Math.floor(seconds / 86400).toString() + " days";
  }
}

export async function markupRead(walletAddr) {
  const res = await axios.post(
    `${process.env.REACT_APP_SERVER_URL}/api/notification/markupRead`, 
    {
      'walletAddr': walletAddr.toLowerCase()
    },
    {
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

export async function getAdminUsers() {
  let users = [];
  await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user/admin`, {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {}
  }).then(res => {
    users = res.data.users;
  }).catch((e) => {
    console.log(e);
  });

  return users;
}

export async function addPayment(payment) {
  const res = await axios.post(
    `${process.env.REACT_APP_SERVER_URL}/api/payment/add`, 
    {
      'id': parseInt(payment.id),
      'type': payment.type === 'Native' ? 0 : 1,
      'addr': payment.addr.toLowerCase(),
      'title': payment.name,
      'symbol': payment.symbol,
      'decimals': parseInt(payment.decimals),
      'allowed': 1
    },
    {
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );

  return res.data;
}

export async function removePayment(addr) {
  const res = await axios.post(
    `${process.env.REACT_APP_SERVER_URL}/api/payment/remove`, 
    {
      'addr': addr.toLowerCase()
    },
    {
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );

  return res.data;
}