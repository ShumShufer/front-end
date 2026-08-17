import './theme/globals.css';
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
