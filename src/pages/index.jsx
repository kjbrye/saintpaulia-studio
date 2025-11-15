import Layout from "./Layout.jsx";

import Collection from "./Collection";

import PlantDetail from "./PlantDetail";

import AddPlant from "./AddPlant";

import EditPlant from "./EditPlant";

import Projects from "./Projects";

import AddProject from "./AddProject";

import EditProject from "./EditProject";

import ProjectDetail from "./ProjectDetail";

import PlantLibrary from "./PlantLibrary";

import CollectionDetail from "./CollectionDetail";

import Wishlist from "./Wishlist";

import AddWishlistItem from "./AddWishlistItem";

import EditWishlistItem from "./EditWishlistItem";

import CommunityFeed from "./CommunityFeed";

import CreatePost from "./CreatePost";

import PostDetail from "./PostDetail";

import ProfileSettings from "./ProfileSettings";

import PublicProfile from "./PublicProfile";

import ModerationDashboard from "./ModerationDashboard";

import CareGuide from "./CareGuide";

import ExportData from "./ExportData";

import ComparePlants from "./ComparePlants";

import AddPropagationProject from "./AddPropagationProject";

import PropagationProjectDetail from "./PropagationProjectDetail";

import EditPropagationProject from "./EditPropagationProject";

import AnalyticsDashboard from "./AnalyticsDashboard";

import PrintLabels from "./PrintLabels";

import LocationDetail from "./LocationDetail";

import EditLocation from "./EditLocation";

import SupplyInventory from "./SupplyInventory";

import AddSupply from "./AddSupply";

import SupplyDetail from "./SupplyDetail";

import EditSupply from "./EditSupply";

import PlantSupplyUsage from "./PlantSupplyUsage";

import CareCalendar from "./CareCalendar";

import Info from "./Info";

import SaintpauliaDatabase from "./SaintpauliaDatabase";

import Forum from "./Forum";

import ForumTopic from "./ForumTopic";

import CreateForumTopic from "./CreateForumTopic";

import TermsOfService from "./TermsOfService";

import PrivacyPolicy from "./PrivacyPolicy";

import ContactUs from "./ContactUs";

import AdminAnalyticsDashboard from "./AdminAnalyticsDashboard";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Collection: Collection,
    
    PlantDetail: PlantDetail,
    
    AddPlant: AddPlant,
    
    EditPlant: EditPlant,
    
    Projects: Projects,
    
    AddProject: AddProject,
    
    EditProject: EditProject,
    
    ProjectDetail: ProjectDetail,
    
    PlantLibrary: PlantLibrary,
    
    CollectionDetail: CollectionDetail,
    
    Wishlist: Wishlist,
    
    AddWishlistItem: AddWishlistItem,
    
    EditWishlistItem: EditWishlistItem,
    
    CommunityFeed: CommunityFeed,
    
    CreatePost: CreatePost,
    
    PostDetail: PostDetail,
    
    ProfileSettings: ProfileSettings,
    
    PublicProfile: PublicProfile,
    
    ModerationDashboard: ModerationDashboard,
    
    CareGuide: CareGuide,
    
    ExportData: ExportData,
    
    ComparePlants: ComparePlants,
    
    AddPropagationProject: AddPropagationProject,
    
    PropagationProjectDetail: PropagationProjectDetail,
    
    EditPropagationProject: EditPropagationProject,
    
    AnalyticsDashboard: AnalyticsDashboard,
    
    PrintLabels: PrintLabels,
    
    LocationDetail: LocationDetail,
    
    EditLocation: EditLocation,
    
    SupplyInventory: SupplyInventory,
    
    AddSupply: AddSupply,
    
    SupplyDetail: SupplyDetail,
    
    EditSupply: EditSupply,
    
    PlantSupplyUsage: PlantSupplyUsage,
    
    CareCalendar: CareCalendar,
    
    Info: Info,
    
    SaintpauliaDatabase: SaintpauliaDatabase,
    
    Forum: Forum,
    
    ForumTopic: ForumTopic,
    
    CreateForumTopic: CreateForumTopic,
    
    TermsOfService: TermsOfService,
    
    PrivacyPolicy: PrivacyPolicy,
    
    ContactUs: ContactUs,
    
    AdminAnalyticsDashboard: AdminAnalyticsDashboard,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Collection />} />
                
                
                <Route path="/Collection" element={<Collection />} />
                
                <Route path="/PlantDetail" element={<PlantDetail />} />
                
                <Route path="/AddPlant" element={<AddPlant />} />
                
                <Route path="/EditPlant" element={<EditPlant />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/AddProject" element={<AddProject />} />
                
                <Route path="/EditProject" element={<EditProject />} />
                
                <Route path="/ProjectDetail" element={<ProjectDetail />} />
                
                <Route path="/PlantLibrary" element={<PlantLibrary />} />
                
                <Route path="/CollectionDetail" element={<CollectionDetail />} />
                
                <Route path="/Wishlist" element={<Wishlist />} />
                
                <Route path="/AddWishlistItem" element={<AddWishlistItem />} />
                
                <Route path="/EditWishlistItem" element={<EditWishlistItem />} />
                
                <Route path="/CommunityFeed" element={<CommunityFeed />} />
                
                <Route path="/CreatePost" element={<CreatePost />} />
                
                <Route path="/PostDetail" element={<PostDetail />} />
                
                <Route path="/ProfileSettings" element={<ProfileSettings />} />
                
                <Route path="/PublicProfile" element={<PublicProfile />} />
                
                <Route path="/ModerationDashboard" element={<ModerationDashboard />} />
                
                <Route path="/CareGuide" element={<CareGuide />} />
                
                <Route path="/ExportData" element={<ExportData />} />
                
                <Route path="/ComparePlants" element={<ComparePlants />} />
                
                <Route path="/AddPropagationProject" element={<AddPropagationProject />} />
                
                <Route path="/PropagationProjectDetail" element={<PropagationProjectDetail />} />
                
                <Route path="/EditPropagationProject" element={<EditPropagationProject />} />
                
                <Route path="/AnalyticsDashboard" element={<AnalyticsDashboard />} />
                
                <Route path="/PrintLabels" element={<PrintLabels />} />
                
                <Route path="/LocationDetail" element={<LocationDetail />} />
                
                <Route path="/EditLocation" element={<EditLocation />} />
                
                <Route path="/SupplyInventory" element={<SupplyInventory />} />
                
                <Route path="/AddSupply" element={<AddSupply />} />
                
                <Route path="/SupplyDetail" element={<SupplyDetail />} />
                
                <Route path="/EditSupply" element={<EditSupply />} />
                
                <Route path="/PlantSupplyUsage" element={<PlantSupplyUsage />} />
                
                <Route path="/CareCalendar" element={<CareCalendar />} />
                
                <Route path="/Info" element={<Info />} />
                
                <Route path="/SaintpauliaDatabase" element={<SaintpauliaDatabase />} />
                
                <Route path="/Forum" element={<Forum />} />
                
                <Route path="/ForumTopic" element={<ForumTopic />} />
                
                <Route path="/CreateForumTopic" element={<CreateForumTopic />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/ContactUs" element={<ContactUs />} />
                
                <Route path="/AdminAnalyticsDashboard" element={<AdminAnalyticsDashboard />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}