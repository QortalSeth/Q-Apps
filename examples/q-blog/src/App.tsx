import { Routes, Route} from "react-router-dom";
import { Home } from './pages/Home/Home';
import { BlogIndividualPost } from './pages/BlogIndividualPost/BlogIndividualPost';
import { BlogIndividualProfile } from './pages/BlogIndividualProfile/BlogIndividualProfile';
import { BlogList } from './pages/BlogList/BlogList';
import { CreatePost } from './pages/CreatePost/CreatePost';
import { CreatEditProfile } from './pages/CreateEditProfile/CreatEditProfile';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './styles/theme';
import { store } from "./state/store";
import { Provider } from "react-redux";
import GlobalWrapper from "./wrappers/GlobalWrapper";
import { EditPost } from "./pages/EditPost/EditPost";
import Notification from "./components/common/Notification/Notification";

function App() {

  return (
    <Provider store={store}>
             

    <ThemeProvider theme={theme}>
    <Notification />
      <GlobalWrapper>
       <CssBaseline />

       <Routes>
  <Route path="/:user/:blog/:postId" element={<BlogIndividualPost />} />
  <Route path="/:user/:blog/:postId/edit" element={<EditPost />} />
  <Route path="/:user/:blog" element={<BlogIndividualProfile />} />
  <Route path="/post/new" element={<CreatePost />} />
  <Route path="/profile/new" element={<CreatEditProfile />} />
  <Route path="/" element={<BlogList />} />
</Routes>
</GlobalWrapper>
    </ThemeProvider>
    </Provider>
  )
}

export default App
