import 'bootstrap/dist/css/bootstrap.min.css'; 
import TablaClientes from './components/TablaClientes';

function App() {
  return (
    <div className="App">
      {/* Barra de navegación sencilla */}
      <nav className="navbar navbar-dark bg-dark mb-4">
        <div className="container">
          <span className="navbar-brand mb-0 h1">🚀 Sistema Clientes Tak</span>
        </div>
      </nav>

      {/* Aquí renderizamos nuestro componente */}
      <TablaClientes />
    </div>
  );
}

export default App;