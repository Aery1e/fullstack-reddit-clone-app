// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import Phreddit from './components/phreddit.js'
import TestAPI from './components/test-api';

function App() {
  return (
    <section className="phreddit">
      {/* <TestAPI /> */}
      <Phreddit />
    </section>
  );
}

export default App;
