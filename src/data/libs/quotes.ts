import axios from 'axios';

const API_KEY = '66e6fa56-8bad-4050-8ca7-11406f524515'; // Replace with your API key

// Function to get token price in ETH using CoinMarketCap API
export async function getCMCPriceInETH(symbols: string[]): Promise<any> {
    try {
        const symbolQuery = symbols.join(',');
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=LINK,USDT&convert=ETH`;
        const response = await axios.get(url, {
          
            headers: {
                'X-CMC_PRO_API_KEY': API_KEY,
            },
            
        });

        if (response.data) {
            return response.data.data;
        } else {
            throw new Error('Failed to get token price from CoinMarketCap');
        }
    } catch (error) {
        console.error('Error getting token price from CoinMarketCap:', error);
        throw error;
    }
}
