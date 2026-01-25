import React from 'react';
import './footerstyling.css';
import useSettings from '../../../../hooks/useSettings';
import { useAuth } from '../../../../component/Auth/AuthContext';
    import { Link } from 'react-router-dom';
const Footer = () => {
    const { settings, isLoading: settingsLoading } = useSettings();
    const { isAuthenticated, user, logout } = useAuth();
    return (
        <>
            <section className="footer_one home10">
                <div className="verticalLimit pb60">
                    <div class="row mt60">
                        <div class="col-sm-6 col-md-5 col-lg-3 col-xl-4">
                            <div class="footer_contact_widget home2_style">
                                <h4>Contact Us</h4>
                                {settings && <div class="footer_contact_iconbox home2_style d-flex mb-4">
                                    <div class="icon"><span class="flaticon-phone-call"></span></div>
                                    <div class="details ms-4">
                                        <h5 class="title">Monday-Friday: 08am-9pm</h5>
                                        <Link to="#">{settings.store_phone}</Link>
                                    </div>
                                </div>}
                                {settings && <div class="footer_contact_iconbox home2_style d-flex">
                                    <div class="icon"><span class="flaticon-email"></span></div>
                                    <div class="details ms-4">
                                        <h5 class="title">Need help with your order?</h5>
                                        <Link to="#">{settings.store_email}</Link>
                                    </div>
                                </div>}
                            </div>
                        </div>
                        <div class="col-sm-6 col-md-3 col-lg-2 col-xl-4">
                            <div class="footer_qlink_widget home2_style">
                                <h4>About {settings && settings.site_name}</h4>
                                <ul class="list-unstyled">
                                    {isAuthenticated && <>
                                        <li><Link to="/account/orders">Track Your Order</Link></li>
                                        <li><Link to="/wishlist">Wishlists</Link></li>
                                    </>}
                                    <li><Link to="/about-us">About Us</Link></li>
                                    <li><Link to="/faq">Faqs</Link></li>
                                </ul>
                            </div>
                        </div>


                        <div class="col-sm-8 col-md-5 col-lg-3 col-xl-4">
                            <div class="footer_social_widget home2_style">
                                <h4 class="title">Follow us</h4>
                                <div class="social_icon_list home2_style mt30">
                                    {settings && <ul class="mb20">
                                        <li class="list-inline-item">  {settings.facebook && <Link to={settings.facebook} className="text-light  top-bar-link">
                                            <i className="text-light  fab fa-facebook"></i>
                                        </Link>}</li>
                                        <li class="list-inline-item"> {settings.instagram && <Link to={settings.instagram} className="text-light  top-bar-link">
                                            <i className="text-light  fab fa-instagram"></i>
                                        </Link>}</li>
                                        <li class="list-inline-item">{settings.twitter && <Link to={settings.twitter} className="text-light  top-bar-link">
                                            <i className="text-light  fab fa-x"></i>
                                        </Link>}</li>
                                        <li class="list-inline-item"> <Link to="/" className="text-light  top-bar-link">
                                            <i className="text-light  fab fa-linkedin"></i>
                                        </Link></li>
                                    </ul>}
                                </div>
                            </div>

                           
                        </div>
                    </div>
                </div>
                <div class="verticalLimit bdrt1 pt20 pb20">
                    <div class="row">
                        <div class="col-lg-6">
                            <div class="copyright-widget home2_style text-center text-lg-start d-block d-lg-flex mb15-md text-center">
                                <p class="me-4">© {new Date().getFullYear()} {settings && settings.site_name} All Rights Reserved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Link className="scrollToHome" to="#"><i className="fas fa-angle-up"></i></Link>
        </>
    );
};

export default Footer;