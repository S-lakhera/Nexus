import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './app/store.js'
import { UIProvider } from './context/UIContext.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <UIProvider>
      <App />
    </UIProvider>
  </Provider>
)
