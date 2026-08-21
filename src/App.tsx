import './theme/globals.css';
import 'leaflet/dist/leaflet.css';
import { AppProviders } from './context/AppProviders.tsx';
import { AppRouter } from './router/AppRouter.tsx';

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
