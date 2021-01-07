import logo from './logo.svg';
import './App.css';
import TinderCard from './components/tinder-card/TinderCard';

function App() {
  const cards = [
    { imgUrl: logo, name: 'Thaibm' },
    { imgUrl: logo, name: 'Anhtl' },
    { imgUrl: logo, name: 'Doctor Strange' },
    { imgUrl: logo, name: 'Captain' },
    { imgUrl: logo, name: 'Thor' },
  ];
  return (
    <div className="App">
      <header className="App-header">
        {cards.map((card, index) => (
          <TinderCard key={index} className="App-card">
            <img src={card.imgUrl} className="App-logo" alt="logo" />
            <p>{card.name}</p>
          </TinderCard>
        ))}
      </header>
    </div>
  );
}

export default App;
