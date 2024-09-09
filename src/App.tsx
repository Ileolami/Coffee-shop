import { useState, useEffect } from "react";
import Web3 from "web3";
import ABI from "../contracts/ABI.json";
import ConnectBtn from "./connectWallet";

const App = () => {

  // State variables for amount, totalCoffeesSold, totalEtherReceived, coffeePrice and ethToUsdRate
  const [amount, setAmount] = useState(0);
  const [totalCoffeesSold, setTotalCoffeesSold] = useState<number | null>(null);
  const [totalEtherReceived, setTotalEtherReceived] = useState<number | null>(null);
  const [coffeePrice, setCoffeePrice] = useState(0);
  const [ethToUsdRate, setEthToUsdRate] = useState(0);

  

// Function to load web3 and contract
  const web3 = new Web3(window.ethereum);
  const contractAddress = "0x8ec6b2b9c5bf9f5c0d7f4c1e2b8011656530c3e3";
  const contract = new web3.eth.Contract(ABI, contractAddress);



// Function to fetch the current price of ETH in USD using Coingecko API
  useEffect(() => {
    const fetchEthToUsdRate = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthToUsdRate(data.ethereum.usd);
      } catch (error) {
        console.error('Error fetching ETH to USD rate:', error);
      }
    };
    fetchEthToUsdRate();
  }, []);

  // Function to pay coffee from buyer account
  const buyCoffee = async () => {
    const accounts = await web3.eth.getAccounts();
    await contract.methods.buyCoffee(amount).send({ from: accounts[0] });
  };

  // Function to fetch total coffees sold

  const fetchTotalCoffeesSold = async () => {
    try {
      const total = (await contract.methods.getTotalCoffeesSold().call()) as number;
      console.log("Total coffees sold:", total);
      setTotalCoffeesSold(Number(total));
    } catch (error) {
      console.error('Error fetching total coffees sold:', error);
    }
  };

  useEffect(() => {
    fetchTotalCoffeesSold();
  }, []);


  // Function to fetch total ether received
  const fechTotalEtherReceived = async () => {
    try {
      const total = await contract.methods.getTotalEtherReceived().call();
      const totalInEther = web3.utils.fromWei(Number(total), 'ether');
      setTotalEtherReceived(Number(totalInEther));
    } catch (error) {
      console.error('Error fetching total ether received:', error);
    }
  };

  useEffect(() => {
    fechTotalEtherReceived();
  }, []);


  // Function to fetch coffee price
   useEffect(() => {
    const fetchCoffeePrice = async () => {
      try {
        const price = await contract.methods.COFFEE_PRICE().call();
        const priceInEther = web3.utils.fromWei(Number(price), 'ether');
        setCoffeePrice(Number(priceInEther));
      } catch (error) {
        console.error('Error fetching coffee price:', error);
      }
    };
    fetchCoffeePrice();
  }, []);

  
  // variable` to display coffee price in USD
  const coffeePriceInUsd = (coffeePrice * ethToUsdRate).toFixed(2);

  // variable to display total ether received in USD
  const totalEtherReceivedInUsd = ((totalEtherReceived ?? 0) * Number(ethToUsdRate)).toFixed(2);

  return (
    <div
    className="min-h-screen flex flex-col"
    style={{
      backgroundImage: "url('https://thumbs.dreamstime.com/b/coffee-background-space-text-85121087.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
      <header className=" text-white py-4 shadow-md flex justify-between items-center px-8">
        <h1 className="text-3xl font-bold">Coffee Store</h1>
        <ConnectBtn />
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-50 shadow-lg rounded-lg p-8 max-w-md w-full transform transition duration-500 hover:scale-105">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Welcome to the Coffee Store</h2>
            <p className="text-lg">Pay for your favorite coffee with Ether</p>
          </div>
          <div className="mb-4">
            <p className="text-lg mb-2 flex justify-between">Amount of coffees sold: <span className="font-semibold">{totalCoffeesSold}</span></p>
            <p className="text-lg mb-2 flex justify-between">Total ether received: <span className="font-semibold">{totalEtherReceived} Eth (${totalEtherReceivedInUsd})</span></p>
            <p className="text-lg mb-4 flex justify-between">Coffee price: <span className="font-semibold">{coffeePrice} Eth (${coffeePriceInUsd})</span></p>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="border bg-transparent rounded p-2 mb-4 w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={buyCoffee}
            className="bg-yellow-900 bg-opacity-35 text-white font-bold py-2 px-4 rounded w-full hover:bg-yellow-700 transition duration-300"
          >
            Buy Coffee
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
