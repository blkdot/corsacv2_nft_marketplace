import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import {useMoralis} from "react-moralis";
import Breakpoint, { BreakpointProvider, setDefaultBreakpoints } from "react-socks";
//import { header } from 'react-bootstrap';
import { Link, navigate } from '@reach/router';
import useOnclickOutside from "react-cool-onclickoutside";
import {CopyToClipboard} from 'react-copy-to-clipboard';

import BalanceTokens from '../components/BalanceTokens';
import { formatAddress, formatUserName, getAdminUsers, getNotifications } from "../../utils";

setDefaultBreakpoints([
  { xs: 0 },
  { l: 1199 },
  { xl: 1200 }
]);

const NavLink = props => (
  <Link 
    {...props}
    getProps={({ isCurrent }) => {
      // the object returned here is passed to the
      // anchor element's props
      return {
        className: isCurrent ? 'active' : 'non-active',
      };
    }}
  />
);

const Header = function({ className }) {
  const { isAuthenticated, account, logout } = useMoralis();
  const currentUserState = useSelector(selectors.currentUserState);
  const [currentUser, setCurrentUser] = useState(null);
  const dispatch = useDispatch();

  const [openMenu, setOpenMenu] = React.useState(false);
  const [openMenu1, setOpenMenu1] = React.useState(false);
  const [openMenu2, setOpenMenu2] = React.useState(false);
  const [openMenu3, setOpenMenu3] = React.useState(false);
  const handleBtnClick = () => {
    setOpenMenu(!openMenu);
  };
  const handleBtnClick1 = () => {
    setOpenMenu1(!openMenu1);
  };
  const handleBtnClick2 = () => {
    setOpenMenu2(!openMenu2);
  };
  const handleBtnClick3 = () => {
    setOpenMenu3(!openMenu3);
  };
  const closeMenu = () => {
    setOpenMenu(false);
  };
  const closeMenu1 = () => {
    setOpenMenu1(false);
  };
  const closeMenu2 = () => {
    setOpenMenu2(false);
  };
  const closeMenu3 = () => {
    setOpenMenu3(false);
  };

  const ref = useOnclickOutside(() => {
    closeMenu();
  });
  const ref1 = useOnclickOutside(() => {
    closeMenu1();
  });
  const ref2 = useOnclickOutside(() => {
    closeMenu2();
  });
  const ref3 = useOnclickOutside(() => {
    closeMenu3();
  });
  
  const [showmenu, btn_icon] = useState(false);
  const [showpop, btn_icon_pop] = useState(false);
  const [shownot, btn_icon_not] = useState(false);
  const closePop = () => {
    btn_icon_pop(false);
  };
  const closeNot = () => {
    btn_icon_not(false);
  };
  const refpop = useOnclickOutside(() => {
    closePop();
  });
  const refpopnot = useOnclickOutside(() => {
    closeNot();
  });

  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [myTimer, setMyTimer] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState(null);

  useEffect(() => {
    if (currentUserState.data) {
      setCurrentUser(currentUserState.data);
    } else {
      setCurrentUser(null);
    }
  }, [currentUserState]);

  useEffect(() => {
    const header = document.getElementById("myHeader");
    const totop = document.getElementById("scroll-to-top");
    const sticky = header.offsetTop;
    const scrollCallBack = window.addEventListener("scroll", () => {
      btn_icon(false);
      if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
        totop.classList.add("show");
        
      } else {
        header.classList.remove("sticky");
        totop.classList.remove("show");
      } if (window.pageYOffset > sticky) {
        closeMenu();
      }
    });
    return () => {
      window.removeEventListener("scroll", scrollCallBack);
    };
  }, []);

  useEffect(() => {
    async function getNotificationsForUser(walletAddr) {
      setNotifications(await getNotifications(walletAddr, 1, -1));
      clearInterval(myTimer);
      const tId = setInterval(async function() {
        setNotifications(await getNotifications(walletAddr, 1, -1));
      }, 60000);

      setMyTimer(tId);
    }
    async function checkIsAdmin(walletAddr) {
      let users = await getAdminUsers();
      const admins = users.filter((user, index) => {
        return user.walletAddr.toLowerCase() === walletAddr.toLowerCase();
      });

      if (admins.length === 1) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }

    if (account && isAuthenticated) {
      getNotificationsForUser(account.toLowerCase());
      checkIsAdmin(account.toLowerCase());
    }
  }, [account, isAuthenticated]);

  const disconnect = async () => {
    dispatch(actions.setCurrentUser(null));
    setIsAdmin(false);
    await logout();
    window.localStorage.removeItem("connectorId");
    
    navigate('/');
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (!search) {
        navigate('/search');
      } else {
        navigate(`/search/${search}`);
      }
    }
  }

  return (
    <header className={`navbar white ${className}`} id="myHeader">
      <div className='container'>
        <div className='row w-100-nav'>
          <div className='logo px-0'>
              <div className='navbar-title navbar-item'>
                <NavLink to="/">
                  <img
                    src="/img/logo.png"
                    className="img-fluid d-block"
                    alt="#"
                  />
                  <img
                    src="/img/logo-2.png"
                    className="img-fluid d-3"
                    alt="#"
                  />
                  <img
                    src="/img/logo-3.png"
                    className="img-fluid d-4"
                    alt="#"
                  />
                  <img
                    src="/img/logo-light.png"
                    className="img-fluid d-none"
                    alt="#"
                  />
                </NavLink>
              </div>
          </div>

          <div className='search'>
            <input id="quick_search" 
              className="xs-hide" 
              name="quick_search" 
              placeholder="search item here..." 
              type="text" 
              onKeyDown={(e) => handleSearch(e)}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <BreakpointProvider>
            <Breakpoint l down>
              {showmenu && 
              <div className='menu'>
                <div className='navbar-item'>
                  <NavLink to="/" onClick={() => btn_icon(!showmenu)}>
                    Home
                  </NavLink>
                </div>
                <div className='navbar-item'>
                  <div ref={ref1}>
                    <div className="dropdown-custom dropdown-toggle btn" 
                      onClick={handleBtnClick1}
                      >
                      Explore
                    </div>
                    {openMenu1 && (
                      <div className='item-dropdown'>
                        <div className="dropdown" onClick={closeMenu1}>
                          <NavLink to="/explore" onClick={() => btn_icon(!showmenu)}>Items On Sale</NavLink>
                          <NavLink to="/auctions" onClick={() => btn_icon(!showmenu)}>Live Auction</NavLink>
                          <NavLink to="/collections" onClick={() => btn_icon(!showmenu)}>Collections</NavLink>
                          {/* <NavLink to="/ranking" onClick={() => btn_icon(!showmenu)}>Ranking</NavLink> */}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className='navbar-item'>
                  <div ref={ref2}>
                    <div className="dropdown-custom dropdown-toggle btn" 
                      onClick={handleBtnClick2}
                      >
                      Pages
                    </div>
                    {openMenu2 && (
                      <div className='item-dropdown'>
                        <div className="dropdown" onClick={closeMenu2}>
                          <NavLink to="/about" onClick={() => btn_icon(!showmenu)}>About Us</NavLink>
                          <NavLink to="/faq" onClick={() => btn_icon(!showmenu)}>FAQ</NavLink>
                          <NavLink to="/contact" onClick={() => btn_icon(!showmenu)}>Contact Us</NavLink>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {isAdmin && 
                <div className='navbar-item'>
                  <div ref={ref3}>
                    <div className="dropdown-custom dropdown-toggle btn" 
                      onClick={handleBtnClick3}
                      >
                      Admin
                    </div>
                    {openMenu3 && (
                      <div className='item-dropdown'>
                        <div className="dropdown" onClick={closeMenu3}>
                          <NavLink to="/admin/payments" onClick={() => btn_icon(!showmenu)}>Payments</NavLink>
                          <NavLink to="/admin/blacklist" onClick={() => btn_icon(!showmenu)}>Blacklist</NavLink>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                }
                <div className='navbar-item'>
                  <NavLink to="/activity" onClick={() => btn_icon(!showmenu)}>
                    Activity
                  </NavLink>
                </div>
              </div>
              }
            </Breakpoint>

            <Breakpoint xl>
              <div className='menu'>
                <div className='navbar-item'>
                  <NavLink to="/">
                    Home
                    <span className='lines'></span>
                  </NavLink>
                </div>
                <div className='navbar-item'>
                  <div ref={ref1}>
                      <div className="dropdown-custom dropdown-toggle btn" 
                          onMouseEnter={handleBtnClick1} onMouseLeave={closeMenu1}>
                        Explore
                        <span className='lines'></span>
                        {openMenu1 && (
                        <div className='item-dropdown'>
                          <div className="dropdown" onClick={closeMenu1}>
                            <NavLink to="/explore">Items On Sale</NavLink>
                            <NavLink to="/auctions">Live Auctions</NavLink>
                            <NavLink to="/collections">Collections</NavLink>
                            {/* <NavLink to="/ranking">Ranking</NavLink> */}
                          </div>
                        </div>
                      )}
                      </div>
                      
                    </div>
                </div>
                <div className='navbar-item'>
                  <div ref={ref2}>
                      <div className="dropdown-custom dropdown-toggle btn" 
                          onMouseEnter={handleBtnClick2} onMouseLeave={closeMenu2}>
                        Pages
                        <span className='lines'></span>
                        {openMenu2 && (
                        <div className='item-dropdown'>
                          <div className="dropdown" onClick={closeMenu2}>
                            <NavLink to="/about">About Us</NavLink>
                            <NavLink to="/faq">FAQ</NavLink>
                            <NavLink to="/contact">Contact Us</NavLink>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                </div>
                {isAdmin && 
                <div className='navbar-item'>
                  <div ref={ref3}>
                      <div className="dropdown-custom dropdown-toggle btn" 
                          onMouseEnter={handleBtnClick3} onMouseLeave={closeMenu3}>
                        Admin
                        <span className='lines'></span>
                        {openMenu3 && (
                        <div className='item-dropdown'>
                          <div className="dropdown" onClick={closeMenu3}>
                            <NavLink to="/admin/payments">Payments</NavLink>
                            <NavLink to="/admin/blacklist">Blacklist</NavLink>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                </div>
                }
                <div className='navbar-item'>
                  <NavLink to="/activity">
                    Activity
                    <span className='lines'></span>
                  </NavLink>
                </div>
              </div>
            </Breakpoint>
          </BreakpointProvider>

          <div className='mainside'>
            { (!isAuthenticated || !account) ? (
              <div className='connect-wal'>
                <NavLink to="/wallet">Connect Wallet</NavLink>
              </div>
            ):(
              <div className="logout">
                {/* <NavLink to="/createItem">Create</NavLink> */}
                <div id="de-click-menu-notification" className="de-menu-notification" onClick={() => btn_icon_not(!shownot)} ref={refpopnot}>
                  {notifications.length > 0 &&
                    <div className="d-count">{notifications.length}</div>
                  }
                  <i className="fa fa-bell"></i>
                  {shownot && 
                    <div className="popshow">
                      <div className="de-flex">
                        <h4>Notifications</h4>
                        <span className="viewaall" onClick={() => navigate(`/notification`)} style={{cursor: "pointer"}}>Show all</span>
                      </div>
                      <ul>
                        {notifications && notifications.map((n, index) => (
                          (index < 3 &&
                            <li key={index}>
                              <div className="mainnot">
                                <img className="lazy" src={n.actorAvatar} alt=""/>
                                <div className="d-desc">
                                  <span className="d-name" style={{wordBreak: "break-all"}}>
                                    <b>{n.actor}</b> <br/>{n.description}</span>
                                  <span className="d-time">{n.duration} ago</span>
                                </div>
                              </div>
                            </li>
                          )
                        ))}
                        {notifications.length == 0 &&
                          <li>
                            <div className="mainnot">
                              <div style={{textAlign: "center"}}>
                                <span className="d-name">No new notifications</span>
                              </div>
                            </div>
                          </li>
                        }
                      </ul>
                    </div>
                  }
                </div>
                <div id="de-click-menu-profile" className="de-menu-profile" onClick={() => btn_icon_pop(!showpop)} ref={refpop}>                           
                    <img src={ currentUser && currentUser.avatar ? currentUser.avatar : "../../img/author/author-4.jpg"} alt=""/>
                    {showpop && 
                      <div className="popshow">
                        <div className="d-name">
                            <h4>Your name</h4>
                            <span className="name" onClick={()=> navigate(`/profile/${account.toLowerCase()}`)} style={{color: "#FF343F"}}>
                              { currentUser && currentUser.name ? formatUserName(currentUser.name) : 'Set your name'}
                            </span>
                        </div>
                        <BalanceTokens />
                        <div className="d-wallet">
                            <h4>My wallet</h4>
                            <span id="wallet" className="d-wallet-address">{formatAddress(account, 'wallet')}</span>
                            <CopyToClipboard text={account} onCopy={() => setCopied(true)}>
                              <button id="btn_copy" title="Copy Address">Copy</button>
                            </CopyToClipboard>
                        </div>
                        <div className="d-line"></div>
                        <ul className="de-submenu-profile">
                          <li onClick={() => navigate(`/profile/${account.toLowerCase()}`)}>
                            <span>
                              <i className="fa fa-user"></i> My profile
                            </span>
                          </li>
                          <li onClick={() => navigate("/myCollections")}>
                            <span>
                              <i className="fa fa-table"></i> My collections
                            </span>
                          </li>
                          <li onClick={() => navigate("/mynft")}>
                            <span>
                              <i className="fa fa-image"></i> My NFTs
                            </span>
                          </li>
                          <li onClick={disconnect}>
                            <span>
                              <i className="fa fa-sign-out"></i> Sign out
                            </span>
                          </li>
                        </ul>
                      </div>
                    }
                </div>
              </div>
            )} 
            
          </div>
                  
        </div>

        <button className="nav-icon" onClick={() => btn_icon(!showmenu)}>
          <div className="menu-line white"></div>
          <div className="menu-line1 white"></div>
          <div className="menu-line2 white"></div>
        </button>

      </div>     
    </header>
  );
}

export default Header;