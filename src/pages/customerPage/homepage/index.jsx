import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../customer-Assets/navbar';
import Footer from '../customer-Assets/footer';
import './HomePagestyling.css';
// Import CSS
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import HomeSLider from './Homeslider';
import HomepageCategorySection from './HomepageCategories';
import AdsTypeBlock from '../../../component/customer-components/campaigns';
import InContentAds from './InContentAds';
import HomeBestSeller from './bestSeller';
import ViewedItemProduct from './viewedItemProduct';

const Homepage = () => {
    return (
        <>
            <HomeSLider />
            <InContentAds />
            <HomepageCategorySection />
            <HomeBestSeller />
            {/* <AdsTypeBlock /> */}
            <ViewedItemProduct />
            <Footer />
        </>
    );a
};
export default Homepage;