import React, { useState, useCallback } from 'react';
import { TextField, Container, Card, CardContent, Typography, Grid } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

function App() {
  const [stockData, setStockData] = useState(null);
  const [symbol, setSymbol] = useState('AAPL');
  const [error, setError] = useState('');

  const fetchStockData = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`
      );
      
      if (response.data.chart.result) {
        const quotes = response.data.chart.result[0];
        const prices = quotes.indicators.quote[0];
        
        const transformedData = quotes.timestamp.map((timestamp, index) => ({
          date: new Date(timestamp * 1000).toLocaleDateString(),
          price: prices.close[index]?.toFixed(2) || null,
          volume: prices.volume[index] || 0
        })).filter(item => item.price !== null);
        
        setStockData(transformedData);
        setError('');
      } else {
        setError('Invalid symbol');
      }
    } catch (err) {
      setError('Error fetching data');
    }
  }, [symbol]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStockData();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Stock Price Tracker
      </Typography>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <TextField
          label="Stock Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          sx={{ width: '200px' }}
        />
      </form>

      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {stockData && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  {symbol} Stock Price Chart
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={stockData}>
                    <XAxis dataKey="date" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#2196f3" 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Latest Price
                </Typography>
                <Typography variant="h4">
                  ${stockData[stockData.length - 1].price}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Trading Volume
                </Typography>
                <Typography variant="h4">
                  {Number(stockData[stockData.length - 1].volume).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default App;