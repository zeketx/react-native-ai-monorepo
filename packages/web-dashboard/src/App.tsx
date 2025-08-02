import { Outlet } from 'react-router-dom';
import Header from './components/layout/Header';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
