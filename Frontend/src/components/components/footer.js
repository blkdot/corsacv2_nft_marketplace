import React from 'react';
import { Link } from '@reach/router';

const footer= () => (
  <footer className="footer-light">
    <div className="container">
        <div className="row">
            <div className="col-md-4 col-sm-6 col-xs-1">
                <div className="widget">
                    <h5>Marketplace</h5>
                    <ul>
                        <li><Link to="/explore">Items on sale</Link></li>
                        <li><Link to="/livAuction">Live Auction</Link></li>
                        <li><Link to="/collections">Collections</Link></li>
                    </ul>
                </div>
            </div>
            <div className="col-md-4 col-sm-6 col-xs-1">
                <div className="widget">
                    <h5>Resources</h5>
                    <ul>
                      <li><Link to="/activity">Activity</Link></li>
                      <li><Link to="/about">About Us</Link></li>
                    </ul>
                </div>
            </div>
            <div className="col-md-4 col-sm-6 col-xs-1">
                <div className="widget">
                    <h5>Community</h5>
                    <ul>
                      <li><Link to="/faq">FAQ</Link></li>
                      <li><Link to="/contact">Contact Us</Link></li>
                    </ul>
                </div>
            </div>
            {/* <div className="col-md-3 col-sm-6 col-xs-1">
                <div className="widget">
                    <h5>Newsletter</h5>
                    <p>Signup for our newsletter to get the latest news in your inbox.</p>
                    <form action="#" className="row form-dark" id="form_subscribe" method="post" name="form_subscribe">
                        <div className="col text-center">
                            <input className="form-control" id="txt_subscribe" name="txt_subscribe" placeholder="enter your email" type="text" /> 
                            <Link to="" id="btn-subscribe">
                              <i className="arrow_right bg-color-secondary"></i>
                            </Link>
                            <div className="clearfix"></div>
                        </div>
                    </form>
                    <div className="spacer-10"></div>
                    <small>Your email is safe with us. We don't spam.</small>
                </div>
            </div> */}
        </div>
    </div>
    <div className="subfooter mt-0">
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="de-flex">
                        <div className="de-flex-col mt-4">
                            <span onClick={()=> window.open("", "_self")}>
                                <img alt="" className="f-logo d-1" src="./img/logo.png" />
                                <img alt="" className="f-logo d-3" src="./img/logo-2-light.png" />
                                <img alt="" className="f-logo d-4" src="./img/logo-3.png" />
                                <span className="copy">&copy; Copyright 2021 - 2022 Corsac Development Team</span>
                            </span>
                        </div>
                        <div className="de-flex-col mt-4">
                            <div className="social-icons">
                                <span onClick={()=> window.open("", "_self")}><i className="fa fa-facebook fa-lg"></i></span>
                                <span onClick={()=> window.open("", "_self")}><i className="fa fa-twitter fa-lg"></i></span>
                                <span onClick={()=> window.open("", "_self")}><i className="fa fa-linkedin fa-lg"></i></span>
                                <span onClick={()=> window.open("", "_self")}><i className="fa fa-pinterest fa-lg"></i></span>
                                <span onClick={()=> window.open("", "_self")}><i className="fa fa-rss fa-lg"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </footer>
);
export default footer;