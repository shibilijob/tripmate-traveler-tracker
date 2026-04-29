import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="136605753133-0sg502huiudlbmq6vdi5p3cr075l47i4.apps.googleusercontent.com">
      <Provider store={store}>
        <BrowserRouter>
          <ErrorBoundary>
            <App />
            <ToastContainer />
          </ErrorBoundary>
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
