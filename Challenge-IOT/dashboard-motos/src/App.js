import React from 'react';
import './App.css';

function App() {
  const motosDetectadas = [
    { id: 1, placa: 'ABC-1234', localizacao: 'Setor A' },
    { id: 2, placa: 'XYZ-5678', localizacao: 'Setor B' },
  ];

  return (
    <div className="App">
      <h1>Monitoramento de Motos - MotoTrackAI</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Placa</th>
            <th>Localização</th>
          </tr>
        </thead>
        <tbody>
          {motosDetectadas.map((moto) => (
            <tr key={moto.id}>
              <td>{moto.id}</td>
              <td>{moto.placa}</td>
              <td>{moto.localizacao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
